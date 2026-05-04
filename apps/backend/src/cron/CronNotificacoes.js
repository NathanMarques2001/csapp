// src/cron/notificacoesContratosDiario.js
const cron = require("node-cron");
const { processarNotificacoesContratos } = require("../services/NotificacaoService");

function iniciarCronNotificacoes() {
  const schedule = "2 * * * *"; // roda todo minuto 18 de cada hora
  const timezone = "America/Sao_Paulo";

  console.log(`[CRON] Agendamento de notificações iniciado (${schedule}, TZ=${timezone})`);

  cron.schedule(
    schedule,
    async () => {
      const agora = new Date().toLocaleString("pt-BR", { timeZone: timezone });
      console.log(`[CRON] Executando verificação de contratos em ${agora}...`);

      try {
        await processarNotificacoesContratos({ diasAlvos: [90, 60, 30, 7, 0] });
        console.log("[CRON] Notificações geradas/verificadas com sucesso!");
      } catch (error) {
        console.error("[CRON] Erro ao processar notificações:", error);
      }
    },
    { timezone }
  );
}

module.exports = { iniciarCronNotificacoes };