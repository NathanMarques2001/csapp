const ContratoRepository = require('./contrato.repository');
const classificarClientes = require('../../utils/classificacaoClientes');
const AppError = require('../../utils/AppError');
const XLSX = require('xlsx');
const removeAccents = require('remove-accents');
const NotificacaoService = require('../../services/NotificacaoService');

class ContratoService {
  async tratarQuantidade(id_produto, quantidade) {
    let quantidadeFinal = quantidade;
    let aviso = null;

    if (quantidade === undefined || quantidade === null || !id_produto) {
      return { quantidadeFinal: quantidade, aviso: null };
    }

    const produto = await ContratoRepository.findProdutoById(id_produto);
    if (!produto) {
      return { quantidadeFinal: quantidade, aviso: null };
    }

    const nomeNormalizado = removeAccents(produto.nome.trim().toLowerCase());
    const permiteQuantidade = nomeNormalizado.includes('backup') || nomeNormalizado.includes('antivirus');

    if (!permiteQuantidade) {
      aviso = `A quantidade '${quantidade}' foi removida (definida como nula), pois o produto '${produto.nome}' não utiliza este campo.`;
      quantidadeFinal = null;
    }

    return { quantidadeFinal, aviso };
  }

  normalizarValor(valor) {
    if (valor instanceof Date) {
      return valor.toISOString().split('T')[0];
    }
    if (typeof valor === 'number') {
      return valor.toString();
    }
    if (typeof valor === 'string' && !isNaN(valor)) {
      return parseFloat(valor).toString();
    }
    return valor;
  }

  parseDecimalCell(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === 'number') return raw;
    if (typeof raw !== 'string') raw = String(raw);

    let s = raw.replace(/\u00A0/g, ' ').replace(/[\r\n]+/g, ' ').trim();
    if (s === '') return null;

    const m = s.match(/-?\d[\d.,]*/);
    if (!m) return null;
    s = m[0];

    const hasDot = s.indexOf('.') !== -1;
    const hasComma = s.indexOf(',') !== -1;

    if (hasDot && hasComma) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        s = s.replace(/\./g, '').replace(/,/g, '.');
      } else {
        s = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      s = s.replace(/,/g, '.');
    } else {
      s = s.replace(/\s+/g, '');
    }

    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
  }

  async findById(id) {
    const contrato = await ContratoRepository.findById(id);
    if (!contrato) {
      throw new AppError(`Nenhum contrato cadastrado com id ${id}!`, 404);
    }
    return contrato;
  }

  async findAll() {
    return await ContratoRepository.findAll();
  }

  async findByClienteId(id_cliente) {
    return await ContratoRepository.findByClienteId(id_cliente);
  }

  async findByUsuarioId(id_usuario) {
    const clientes = await ContratoRepository.findClientesByUsuarioId(id_usuario);
    const clientesIds = clientes.map((c) => c.id);
    if (clientesIds.length === 0) return [];
    
    return await ContratoRepository.findByClientesIds(clientesIds);
  }

  async create(data) {
    const { quantidadeFinal, aviso } = await this.tratarQuantidade(data.id_produto, data.quantidade);

    data.valor_antigo = data.valor_mensal;
    data.quantidade = quantidadeFinal;

    const contrato = await ContratoRepository.create(data);

    await classificarClientes();

    const inicio = new Date(data.data_inicio);
    const vencimento = new Date(inicio.setMonth(inicio.getMonth() + Number(data.duracao)));
    
    await ContratoRepository.createVencimento({
      id_contrato: contrato.id,
      status: data.status,
      data_vencimento: vencimento,
    });

    return { contrato, aviso };
  }

  async update(id, data) {
    const contrato = await ContratoRepository.findById(id);
    if (!contrato) throw new AppError('Contrato não encontrado!', 404);

    const dadosAntigos = contrato.toJSON();

    const { quantidadeFinal, aviso } = await this.tratarQuantidade(data.id_produto, data.quantidade);

    let valor_antigo = contrato.valor_antigo;
    if (this.normalizarValor(contrato.valor_mensal) !== this.normalizarValor(data.valor_mensal)) {
      valor_antigo = contrato.valor_mensal;
    }

    const dataToUpdate = {
        ...data,
        quantidade: quantidadeFinal,
        valor_antigo
    };

    await ContratoRepository.update(contrato, dataToUpdate);
    try {
      await NotificacaoService.atualizarNotificacoesAtivasDoContrato(contrato.id);
    } catch (err) {
      console.error('[NOTIF_SYNC] Erro ao sincronizar notificações ativas do contrato:', err);
    }
    const dadosNovos = contrato.toJSON();

    const alteracoes = [];
    for (let campo in dadosNovos) {
      if (['createdAt', 'updatedAt'].includes(campo)) continue;

      const antes = this.normalizarValor(dadosAntigos[campo]);
      const depois = this.normalizarValor(dadosNovos[campo]);

      if (antes !== depois) {
        alteracoes.push(`${campo}: '${antes}' → '${depois}'`);
      }
    }

    if (alteracoes.length > 0) {
      let nomeDoUsuario = data.nome_usuario;
      if (!nomeDoUsuario && data.id_usuario) {
        const usuario = await ContratoRepository.findUsuarioById(data.id_usuario);
        nomeDoUsuario = usuario ? usuario.nome : null;
      }
      if (!nomeDoUsuario) nomeDoUsuario = 'Sistema';

      await ContratoRepository.createLog({
        nome_usuario: nomeDoUsuario,
        id_contrato: contrato.id,
        alteracao: alteracoes.join('; '),
      });
    }

    await classificarClientes();

    if (data.data_inicio || data.status || data.duracao) {
      const inicio = data.data_inicio ? new Date(data.data_inicio) : new Date(contrato.data_inicio);
      const duracaoContrato = data.duracao ? data.duracao : contrato.duracao;
      const vencimento = new Date(inicio.setMonth(inicio.getMonth() + Number(duracaoContrato)));
      const statusContrato = data.status ? data.status : contrato.status;
      
      await ContratoRepository.updateVencimento(contrato.id, {
        status: statusContrato,
        data_vencimento: vencimento,
      });
    }

    return { message: 'Contrato atualizado com sucesso!', aviso, alteracoes };
  }

  async processarExcel(buffer) {
    const erros = [];
    const sucessos = [];
    const avisos = [];
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dados = XLSX.utils.sheet_to_json(sheet);

    for (const [index, row] of dados.entries()) {
      const linhaExcel = index + 2;

      try {
        let { quantidade, ...demaisCampos } = row;
        const { cpf_cnpj, nome_produto, nome_faturado, ...outrosCampos } = demaisCampos;

        const valorCelulaRaw = row.valor_mensal ?? outrosCampos.valor_mensal;
        const valor_mensal_parsed = this.parseDecimalCell(valorCelulaRaw);
        if (valor_mensal_parsed !== null) {
          outrosCampos.valor_mensal = valor_mensal_parsed;
        }

        if (!cpf_cnpj || !nome_produto) {
          erros.push({ linha: linhaExcel, motivo: 'CPF/CNPJ ou Nome do Produto não preenchidos.' });
          continue;
        }

        const cliente = await ContratoRepository.findClienteByCpfCnpj(cpf_cnpj);
        if (!cliente) {
          erros.push({ linha: linhaExcel, motivo: `Cliente com CPF/CNPJ '${cpf_cnpj}' não encontrado.` });
          continue;
        }

        const produto = await ContratoRepository.findProdutoByNome(nome_produto);
        if (!produto) {
          erros.push({ linha: linhaExcel, motivo: `Produto '${nome_produto}' não encontrado.` });
          continue;
        }

        const nomeNormalizado = produto.nome.toLowerCase();
        const permiteQuantidade = nomeNormalizado.includes('backup') || nomeNormalizado.includes('antivirus');

        if (quantidade !== undefined && quantidade !== null && !permiteQuantidade) {
          avisos.push({
            linha: linhaExcel,
            motivo: `A quantidade '${quantidade}' foi removida (nula), pois o produto '${produto.nome}' não utiliza este campo.`,
          });
          quantidade = null;
        }

        const contratoExistente = await ContratoRepository.findContratoExistente(cliente.id, produto.id);

        if (contratoExistente) {
          const dadosParaAtualizar = { ...outrosCampos };
          if (row.quantidade !== undefined) dadosParaAtualizar.quantidade = quantidade;

          if (valor_mensal_parsed !== null) {
            const valorPlanilha = valor_mensal_parsed;
            const valorAtual = contratoExistente.valor_mensal;

            if (this.normalizarValor(valorPlanilha) !== this.normalizarValor(valorAtual)) {
              dadosParaAtualizar.valor_antigo = valorAtual;
              dadosParaAtualizar.valor_mensal = valorPlanilha;
            }
          }

          if (nome_faturado) {
            const entidadeFaturada = await ContratoRepository.findFaturadoByNome(nome_faturado);
            if (entidadeFaturada) dadosParaAtualizar.id_faturado = entidadeFaturada.id;
            else avisos.push({ linha: linhaExcel, motivo: `(UPDATE) Faturado '${nome_faturado}' não encontrado, faturado original mantido.` });
          }

          if (Object.keys(dadosParaAtualizar).length > 0) {
            await ContratoRepository.update(contratoExistente, dadosParaAtualizar);
            try {
              await NotificacaoService.atualizarNotificacoesAtivasDoContrato(contratoExistente.id);
            } catch (err) {
              console.error('[NOTIF_SYNC] Erro ao sincronizar notificações ativas do contrato:', err);
            }
            sucessos.push({ linha: linhaExcel, acao: `Contrato ID ${contratoExistente.id} atualizado.` });
          } else {
            sucessos.push({ linha: linhaExcel, acao: 'Nenhum dado novo para atualizar.' });
          }
        } else {
          const camposObrigatorios = { nome_faturado, ...outrosCampos };
          const camposFaltantes = Object.entries(camposObrigatorios)
            .filter(([, value]) => value === undefined || value === null || value === '')
            .map(([key]) => key);

          if (camposFaltantes.length > 0) {
            erros.push({ linha: linhaExcel, motivo: `Campos obrigatórios não preenchidos: ${camposFaltantes.join(', ')}.` });
            continue;
          }

          const entidadeFaturada = await ContratoRepository.findFaturadoByNome(nome_faturado);
          if (!entidadeFaturada) {
            erros.push({ linha: linhaExcel, motivo: `(CREATE) Faturado '${nome_faturado}' não encontrado.` });
            continue;
          }

          const dadosParaCriar = {
            id_cliente: cliente.id,
            id_produto: produto.id,
            id_faturado: entidadeFaturada.id,
            quantidade,
            ...outrosCampos,
          };

          dadosParaCriar.valor_antigo = 0;
          const contratoCriado = await ContratoRepository.create(dadosParaCriar);

          const vencimento = new Date(dadosParaCriar.data_inicio);
          vencimento.setMonth(vencimento.getMonth() + dadosParaCriar.duracao);
          await ContratoRepository.createVencimento({
            id_contrato: contratoCriado.id,
            status: dadosParaCriar.status,
            data_vencimento: vencimento,
          });

          sucessos.push({ linha: linhaExcel, acao: `Novo contrato ID ${contratoCriado.id} criado.` });
        }
      } catch (error) {
        erros.push({ linha: linhaExcel, motivo: `Erro inesperado: ${error.message}` });
      }
    }
    
    await classificarClientes();
    return { erros, sucessos, avisos };
  }
}

module.exports = new ContratoService();
