const historicoService = require("../services/HistoricoService");

class HistoricoController {
    async indexClientes(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: "Data de início e fim são obrigatórias." });
            }

            const historico = await historicoService.buscarHistoricoClientes(dataInicio, dataFim);
            return res.json(historico);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao buscar histórico de clientes." });
        }
    }

    async indexContratos(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: "Data de início e fim são obrigatórias." });
            }

            const historico = await historicoService.buscarHistoricoContratos(dataInicio, dataFim);
            return res.json(historico);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao buscar histórico de contratos." });
        }
    }

    // Endpoint para forçar snapshot manual (útil para testes ou execução imediata)
    async gerarSnapshotManual(req, res) {
        try {
            await historicoService.gerarSnapshotDiario();
            return res.json({ message: "Snapshot gerado com sucesso." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao gerar snapshot." });
        }
    }
}

module.exports = new HistoricoController();
