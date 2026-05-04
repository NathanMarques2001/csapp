const cron = require("node-cron");
const ReajusteService = require("../services/ReajusteService");

// Horário de execução: todos os dias às 03:00 da manhã
cron.schedule("59 * * * *", async () => {
  console.log("[CRON] Iniciando rotina de reajuste de contratos...");

  try {
    await ReajusteService.ajustaValorMensal();
    await ReajusteService.ajustaIndice();
    await ReajusteService.reprocessaContratosErro();
    await ReajusteService.ajustaNovaData();

    console.log("[CRON] Reajuste de contratos concluído com sucesso.");
  } catch (err) {
    console.error(`[CRON] Erro ao reajustar contratos: ${err.message}`);
  }
});
