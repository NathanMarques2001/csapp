const RelatorioService = require("../services/RelatorioService");

module.exports = {
    async getRelatorioGeral(req, res) {
        try {
            const resultados = await RelatorioService.getRelatorioGeral();
            res.status(200).json(resultados);
        } catch (error) {
            console.error("Erro ao gerar relatório geral:", error);
            res.status(500).json({ error: "Erro ao gerar relatório geral." });
        }
    },
};
