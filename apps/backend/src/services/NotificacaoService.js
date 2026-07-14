const Notificacao = require("../models/Notificacao");
const Contrato = require("../models/Contrato");
const Cliente = require("../models/Cliente");
const Produto = require("../models/Produto");
const { Op } = require("sequelize");
const { enqueueEmailNotification } = require("./FilaEmailService");

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Ajuste para meses com menos dias
  if (d.getDate() < day) d.setDate(0);
  return d;
}

// não mutar os objetos originais
function diffDays(a, b) {
  const aMid = new Date(a);
  const bMid = new Date(b);
  aMid.setHours(0, 0, 0, 0);
  bMid.setHours(0, 0, 0, 0);
  const ms = aMid - bMid;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Dado data_inicio, duracao em meses e uma data de referência (hoje),
 * retorna o PRÓXIMO vencimento (sempre >= hoje) considerando todos os ciclos.
 *
 * Ex:
 *  - início: 2020-01-10, duracao: 36
 *  - hoje: 2025-01-10 -> vai retornar 2026-01-10
 *  - hoje: 2023-01-10 -> vai retornar 2023-01-10
 */
function getProximoVencimento(data_inicio, duracaoMeses, referencia = new Date()) {
  if (!data_inicio || !duracaoMeses) return null;

  const start = new Date(data_inicio);
  const ref = new Date(referencia);

  // primeiro vencimento
  let venc = addMonths(start, Number(duracaoMeses));

  // enquanto o vencimento estiver NO PASSADO (antes de hoje), vai pulando ciclo
  while (diffDays(venc, ref) < 0) {
    venc = addMonths(venc, Number(duracaoMeses));
  }

  return venc;
}

async function criarNotificacaoUnica({ id_usuario, id_contrato, descricao, modulo }) {
  // Evita duplicar no mesmo dia a mesma mensagem
  const hojeInicio = new Date();
  hojeInicio.setHours(0, 0, 0, 0);

  const existe = await Notificacao.findOne({
    where: {
      id_usuario,
      id_contrato,
      modulo,
      descricao,
      created_at: { [Op.gte]: hojeInicio },
    },
  });

  if (!existe) {
    await Notificacao.create({ id_usuario, id_contrato, descricao, modulo });

    // Ao criar a notificação, enfileirar envio de email (não bloqueante)
    try {
      enfileirarNotificacaoEmail({ id_usuario, id_contrato, descricao, modulo });
    } catch (err) {
      console.error("[NOTIF_EMAIL] Erro ao enfileirar email de notificação:", err);
    }
  }
}

async function processarNotificacoesContratos(options = {}) {
  const diasAlvos = options.diasAlvos || [90, 60, 30, 7, 0];
  const agora = new Date();

  const contratos = await Contrato.findAll({
    where: {
      status: "ativo",
    },
  });

  for (const contrato of contratos) {
    const cliente = await Cliente.findByPk(contrato.id_cliente);
    const produto = await Produto.findByPk(contrato.id_produto);
    if (!cliente || !produto) continue;

    // --- VENCIMENTO RECORRENTE: ciclos de "duracao" meses a partir de data_inicio
    if (contrato.data_inicio && contrato.duracao && Number(contrato.duracao) !== 12000) {
      const proximoVencimento = getProximoVencimento(
        contrato.data_inicio,
        Number(contrato.duracao),
        agora
      );

      if (proximoVencimento) {
        const diasVenc = diffDays(proximoVencimento, agora);

        if (diasAlvos.includes(diasVenc)) {
          const desc =
            diasVenc === 0
              ? `O contrato de ${produto.nome} do cliente ${cliente.razao_social} vence hoje.`
              : `O contrato de ${produto.nome} do cliente ${cliente.razao_social} vence em ${diasVenc} dia(s).`;

          await criarNotificacaoUnica({
            id_usuario: cliente.id_usuario || 2,
            id_contrato: contrato.id,
            descricao: desc,
            modulo: "Contrato",
          });
        }
      }
    }

    // --- Próximo reajuste (data real, já tá ok do jeito que você fez)
    if (contrato.proximo_reajuste) {
      const diasReaj = diffDays(new Date(contrato.proximo_reajuste), agora);

      if (diasAlvos.includes(diasReaj)) {
        const desc =
          diasReaj === 0
            ? `O contrato de ${produto.nome} do cliente ${cliente.razao_social} tem reajuste hoje.`
            : `O contrato de ${produto.nome} do cliente ${cliente.razao_social} terá reajuste em ${diasReaj} dia(s).`;

        await criarNotificacaoUnica({
          id_usuario: cliente.id_usuario || 2,
          id_contrato: contrato.id,
          descricao: desc,
          modulo: "Reajuste",
        });
      }
    }
  }
}

async function atualizarNotificacoesAtivasDoContrato(id_contrato) {
  const notificacoes = await Notificacao.findAll({
    where: {
      id_contrato,
      confirmado_sn: false,
    },
  });

  if (!notificacoes || notificacoes.length === 0) {
    return;
  }

  const contrato = await Contrato.findByPk(id_contrato, {
    include: [
      { model: Cliente, as: "clientes" },
      { model: Produto, as: "produtos" },
    ],
  });

  if (!contrato) {
    return;
  }

  if (contrato.duracao && Number(contrato.duracao) === 12000) {
    await Notificacao.update(
      { confirmado_sn: true },
      { where: { id_contrato, modulo: "Contrato", confirmado_sn: false } }
    );
  }

  const cliente = contrato.clientes;
  const produto = contrato.produtos;
  if (!cliente || !produto) {
    return;
  }

  const agora = new Date();

  for (const notificacao of notificacoes) {
    if (contrato.duracao && Number(contrato.duracao) === 12000 && notificacao.modulo === "Contrato") {
      continue;
    }
    notificacao.id_usuario = cliente.id_usuario || 2;

    if (notificacao.modulo === "Contrato") {
      if (contrato.data_inicio && contrato.duracao) {
        const proximoVencimento = getProximoVencimento(
          contrato.data_inicio,
          Number(contrato.duracao),
          agora
        );
        if (proximoVencimento) {
          const diasVenc = diffDays(proximoVencimento, agora);
          notificacao.descricao =
            diasVenc === 0
              ? `O contrato de ${produto.nome} do cliente ${cliente.razao_social} vence hoje.`
              : `O contrato de ${produto.nome} do cliente ${cliente.razao_social} vence em ${diasVenc} dia(s).`;
        }
      }
    } else if (notificacao.modulo === "Reajuste") {
      if (contrato.proximo_reajuste) {
        const diasReaj = diffDays(new Date(contrato.proximo_reajuste), agora);
        notificacao.descricao =
          diasReaj === 0
            ? `O contrato de ${produto.nome} do cliente ${cliente.razao_social} tem reajuste hoje.`
            : `O contrato de ${produto.nome} do cliente ${cliente.razao_social} terá reajuste em ${diasReaj} dia(s).`;
      }
    }

    await notificacao.save();
  }
}

async function atualizarNotificacoesAtivasDoCliente(id_cliente) {
  const contratos = await Contrato.findAll({ where: { id_cliente } });
  for (const contrato of contratos) {
    await atualizarNotificacoesAtivasDoContrato(contrato.id);
  }
}

async function validarNotificacoesAtivas() {
  console.log("[VALIDACAO_NOTIF] Iniciando validação de notificações ativas...");
  const activeNotifications = await Notificacao.findAll({
    where: { confirmado_sn: false },
  });

  if (!activeNotifications || activeNotifications.length === 0) {
    console.log("[VALIDACAO_NOTIF] Nenhuma notificação ativa encontrada.");
    return;
  }

  const contratosIds = [...new Set(activeNotifications
    .map(n => n.id_contrato)
    .filter(id => id !== null && id !== undefined)
  )];

  for (const id_contrato of contratosIds) {
    try {
      const contrato = await Contrato.findByPk(id_contrato);
      if (!contrato) {
        console.log(`[VALIDACAO_NOTIF] Contrato ${id_contrato} não encontrado. Confirmando notificações órfãs.`);
        await Notificacao.update(
          { confirmado_sn: true },
          { where: { id_contrato, confirmado_sn: false } }
        );
        continue;
      }

      await atualizarNotificacoesAtivasDoContrato(id_contrato);
    } catch (err) {
      console.error(`[VALIDACAO_NOTIF] Erro ao validar notificações do contrato ${id_contrato}:`, err);
    }
  }

  console.log("[VALIDACAO_NOTIF] Validação de notificações concluída!");
}

module.exports = {
  processarNotificacoesContratos,
  atualizarNotificacoesAtivasDoContrato,
  atualizarNotificacoesAtivasDoCliente,
  validarNotificacoesAtivas
};
