// src/cron/notificacoesContratosDiario.js
const cron = require("node-cron");
const { processarNotificacoesContratos, validarNotificacoesAtivas } = require("../services/NotificacaoService");

function iniciarCronNotificacoes() {
  const schedule = "20 * * * *"; // roda todo minuto 20 de cada hora
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

  const cronValidacao = "0 3 * * *"; // roda às 03:00 de todos os dias
  console.log(`[CRON] Agendamento de validação de notificações ativas iniciado (${cronValidacao}, TZ=${timezone})`);

  cron.schedule(
    cronValidacao,
    async () => {
      const agora = new Date().toLocaleString("pt-BR", { timeZone: timezone });
      console.log(`[CRON] Executando validação de notificações ativas em ${agora}...`);

      try {
        await validarNotificacoesAtivas();
        console.log("[CRON] Validação de notificações ativas concluída!");
      } catch (error) {
        console.error("[CRON] Erro ao validar notificações ativas:", error);
      }
    },
    { timezone }
  );
}

module.exports = { iniciarCronNotificacoes };