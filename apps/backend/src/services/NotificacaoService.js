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
    if (contrato.data_inicio && contrato.duracao) {
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

module.exports = { processarNotificacoesContratos };
