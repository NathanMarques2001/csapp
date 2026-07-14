const cron = require("node-cron");
const historicoService = require("../services/HistoricoService");

// Roda todo dia à meia-noite (00:00)
cron.schedule("0 0 * * *", async () => {
    console.log("[CronHistorico] Executando rotina de snapshot diário...");
    await historicoService.gerarSnapshotDiario();
});
