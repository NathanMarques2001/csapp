const Contrato = require("../models/Contrato");
const Cliente = require("../models/Cliente");
const Produto = require("../models/Produto");
const Faturado = require("../models/Faturado");
const Log = require("../models/Log");
const Usuario = require("../models/Usuario");
const VencimentoContratos = require("../models/VencimentoContratos");
const classificarClientes = require("../utils/classificacaoClientes");
const XLSX = require("xlsx");
const removeAccents = require("remove-accents");

class ContratoService {
    async tratarQuantidade(id_produto, quantidade) {
        let quantidadeFinal = quantidade;
        let aviso = null;

        if (quantidade === undefined || quantidade === null || !id_produto) {
            return { quantidadeFinal: quantidade, aviso: null };
        }

        const produto = await Produto.findByPk(id_produto, { attributes: ["nome"] });
        if (!produto) {
            return { quantidadeFinal: quantidade, aviso: null };
        }

        const nomeNormalizado = removeAccents(produto.nome.trim().toLowerCase());
        const permiteQuantidade =
            nomeNormalizado.includes("backup") || nomeNormalizado.includes("antivirus");

        if (!permiteQuantidade) {
            aviso = `A quantidade '${quantidade}' foi removida (definida como nula), pois o produto '${produto.nome}' não utiliza este campo.`;
            quantidadeFinal = null;
        }

        return { quantidadeFinal, aviso };
    }

    normalizarValor(valor) {
        if (valor instanceof Date) {
            return valor.toISOString().split("T")[0]; // só a data
        }
        if (typeof valor === "number") {
            return valor.toString();
        }
        if (typeof valor === "string" && !isNaN(valor)) {
            return parseFloat(valor).toString(); // trata decimais tipo "2500.00"
        }
        return valor;
    }

    parseDecimalCell(raw) {
        if (raw === undefined || raw === null) return null;
        if (typeof raw === "number") return raw;
        if (typeof raw !== "string") raw = String(raw);

        // remove espaços invisíveis e normaliza quebras de linha
        let s = raw.replace(/\u00A0/g, " ").replace(/[\r\n]+/g, " ").trim();
        if (s === "") return null;

        // extrai o primeiro token que contenha dígitos/.,-
        const m = s.match(/-?\d[\d.,]*/);
        if (!m) return null;
        s = m[0];

        // se existir tanto '.' quanto ',', decidir qual é o separador decimal
        const hasDot = s.indexOf(".") !== -1;
        const hasComma = s.indexOf(",") !== -1;

        if (hasDot && hasComma) {
            if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
                s = s.replace(/\./g, "").replace(/,/g, ".");
            } else {
                s = s.replace(/,/g, "");
            }
        } else if (hasComma) {
            // formato brasileiro: 1117,56 -> 1117.56
            s = s.replace(/,/g, ".");
        } else {
            // apenas pontos ou nenhum separador
            s = s.replace(/\s+/g, "");
        }

        const n = parseFloat(s);
        return Number.isFinite(n) ? n : null;
    }

    async update(id, data) {
        const contrato = await Contrato.findByPk(id);
        if (!contrato) throw new Error("Contrato não encontrado!");

        const dadosAntigos = contrato.toJSON();

        // 1. Trata quantidade (agora usando o metodo da classe)
        const { quantidadeFinal, aviso } = await this.tratarQuantidade(
            data.id_produto,
            data.quantidade
        );

        // 2. Lógica do valor mensal/antigo
        let valor_antigo = contrato.valor_antigo;
        if (this.normalizarValor(contrato.valor_mensal) !== this.normalizarValor(data.valor_mensal)) {
            valor_antigo = contrato.valor_mensal;
        }

        await contrato.update({
            ...data,
            quantidade: quantidadeFinal,
            valor_antigo
        });

        const dadosNovos = contrato.toJSON();

        // 3. Logs de alteração
        const alteracoes = [];
        for (let campo in dadosNovos) {
            if (["createdAt", "updatedAt"].includes(campo)) continue;

            const antes = this.normalizarValor(dadosAntigos[campo]);
            const depois = this.normalizarValor(dadosNovos[campo]);

            if (antes !== depois) {
                alteracoes.push(`${campo}: '${antes}' → '${depois}'`);
            }
        }

        if (alteracoes.length > 0) {
            let nomeDoUsuario = data.nome_usuario;
            if (!nomeDoUsuario && data.id_usuario) {
                const usuario = await Usuario.findByPk(data.id_usuario, { attributes: ["nome"] });
                nomeDoUsuario = usuario ? usuario.nome : null;
            }
            if (!nomeDoUsuario) nomeDoUsuario = "Sistema";

            await Log.create({
                nome_usuario: nomeDoUsuario,
                id_contrato: contrato.id,
                alteracao: alteracoes.join("; "),
            });
        }

        await classificarClientes();

        // 4. Atualiza Vencimentos
        if (data.data_inicio || data.status || data.duracao) {
            const inicio = data.data_inicio
                ? new Date(data.data_inicio)
                : new Date(contrato.data_inicio);
            const duracaoContrato = data.duracao ? data.duracao : contrato.duracao;
            const vencimento = new Date(
                inicio.setMonth(inicio.getMonth() + Number(duracaoContrato))
            );
            const statusContrato = data.status ? data.status : contrato.status;
            await VencimentoContratos.update(
                {
                    id_contrato: contrato.id,
                    status: statusContrato,
                    data_vencimento: vencimento,
                },
                { where: { id_contrato: contrato.id } }
            );
        }

        return { message: "Contrato atualizado com sucesso!", aviso, alteracoes };
    }

    async processarExcel(buffer) {
        const erros = [], sucessos = [], avisos = [];
        const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const dados = XLSX.utils.sheet_to_json(sheet);

        for (const [index, row] of dados.entries()) {
            const linhaExcel = index + 2;

            try {
                let { quantidade, ...demaisCampos } = row;
                const { cpf_cnpj, nome_produto, nome_faturado, ...outrosCampos } = demaisCampos;

                // Normaliza o valor da celula usando 'this'
                const valorCelulaRaw = row.valor_mensal ?? outrosCampos.valor_mensal;
                const valor_mensal_parsed = this.parseDecimalCell(valorCelulaRaw);
                if (valor_mensal_parsed !== null) {
                    outrosCampos.valor_mensal = valor_mensal_parsed;
                }

                if (!cpf_cnpj || !nome_produto) {
                    erros.push({ linha: linhaExcel, motivo: "CPF/CNPJ ou Nome do Produto não preenchidos." });
                    continue;
                }

                const cliente = await Cliente.findOne({ where: { cpf_cnpj } });
                if (!cliente) {
                    erros.push({ linha: linhaExcel, motivo: `Cliente com CPF/CNPJ '${cpf_cnpj}' não encontrado.` });
                    continue;
                }

                const produto = await Produto.findOne({ where: { nome: nome_produto } });
                if (!produto) {
                    erros.push({ linha: linhaExcel, motivo: `Produto '${nome_produto}' não encontrado.` });
                    continue;
                }

                const nomeNormalizado = produto.nome.toLowerCase();
                const permiteQuantidade = nomeNormalizado.includes("backup") || nomeNormalizado.includes("antivirus");

                if (quantidade !== undefined && quantidade !== null && !permiteQuantidade) {
                    avisos.push({
                        linha: linhaExcel,
                        motivo: `A quantidade '${quantidade}' foi removida (nula), pois o produto '${produto.nome}' não utiliza este campo.`,
                    });
                    quantidade = null;
                }

                const contratoExistente = await Contrato.findOne({
                    where: { id_cliente: cliente.id, id_produto: produto.id },
                });

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
                        const entidadeFaturada = await Faturado.findOne({ where: { nome: nome_faturado } });
                        if (entidadeFaturada) dadosParaAtualizar.id_faturado = entidadeFaturada.id;
                        else avisos.push({ linha: linhaExcel, motivo: `(UPDATE) Faturado '${nome_faturado}' não encontrado, faturado original mantido.` });
                    }

                    if (Object.keys(dadosParaAtualizar).length > 0) {
                        await contratoExistente.update(dadosParaAtualizar);
                        sucessos.push({ linha: linhaExcel, acao: `Contrato ID ${contratoExistente.id} atualizado.` });
                    } else {
                        sucessos.push({ linha: linhaExcel, acao: "Nenhum dado novo para atualizar." });
                    }
                } else {
                    const camposObrigatorios = { nome_faturado, ...outrosCampos };
                    const camposFaltantes = Object.entries(camposObrigatorios)
                        .filter(([, value]) => value === undefined || value === null || value === "")
                        .map(([key]) => key);

                    if (camposFaltantes.length > 0) {
                        erros.push({ linha: linhaExcel, motivo: `Campos obrigatórios não preenchidos: ${camposFaltantes.join(", ")}.` });
                        continue;
                    }

                    const entidadeFaturada = await Faturado.findOne({ where: { nome: nome_faturado } });
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
                    const contratoCriado = await Contrato.create(dadosParaCriar);

                    const vencimento = new Date(dadosParaCriar.data_inicio);
                    vencimento.setMonth(vencimento.getMonth() + dadosParaCriar.duracao);
                    await VencimentoContratos.create({
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
