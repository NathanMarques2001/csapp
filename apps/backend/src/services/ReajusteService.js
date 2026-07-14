const { Op, Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const Contrato = require("../models/Contrato");
const ContratoErroReajuste = require("../models/ContratoErroReajuste");
const ReprocessamentoContrato = require("../models/ReprocessamentoContrato");

class ReajusteService {
    constructor() {
        this.logFilePath = path.join(__dirname, "../logs/reajustaContratos.log");
        this.contratosAtualizadosComSucesso = [];
    }

    logError(message) {
        const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
        const logMessage = `[${timestamp}] ${message}\n`;
        // Ensure logs directory exists
        const dir = path.dirname(this.logFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.appendFileSync(this.logFilePath, logMessage, "utf8");
    }

    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async filaContratos() {
        try {
            return await Contrato.findAll({
                where: {
                    status: "ativo",
                    proximo_reajuste: { [Op.lte]: new Date() },
                    nome_indice: { [Op.and]: [{ [Op.not]: null }, { [Op.ne]: "" }] },
                    id: {
                        [Op.notIn]: Sequelize.literal("(SELECT cer.id_contrato FROM contratos_erros_reajuste cer)"),
                        [Op.notIn]: Sequelize.literal("(SELECT rc.id_contrato FROM reprocessamentos_contratos rc)"),
                    },
                },
            });
        } catch (err) {
            console.error(`Erro ao buscar contratos na fila: ${err.message}`);
            return [];
        }
    }

    async filaContratosErro() {
        try {
            return await ContratoErroReajuste.findAll({});
        } catch (err) {
            this.logError(`Erro ao buscar contratos com erro: ${err.message}`);
            return [];
        }
    }

    async registraErroContrato(idContrato, erro) {
        try {
            await ContratoErroReajuste.create({
                id_contrato: idContrato,
                erro: erro,
                tentativas_reajuste: 1,
            });
        } catch (err) {
            this.logError(`Erro ao registrar erro de reajuste no contrato ${idContrato}: ${err.message}`);
        }
    }

    async buscarIndiceBCB(codigo, dataInicial, dataFinal) {
        const startDate = `${dataInicial.getDate().toString().padStart(2, "0")}/${(dataInicial.getMonth() + 1).toString().padStart(2, "0")}/${dataInicial.getFullYear()}`;
        const endDate = `${dataFinal.getDate().toString().padStart(2, "0")}/${(dataFinal.getMonth() + 1).toString().padStart(2, "0")}/${dataFinal.getFullYear()}`;

        const response = await fetch(
            `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados?dataInicial=${startDate}&dataFinal=${endDate}&formato=json`
        );

        if (response.status !== 200) {
            throw new Error(`Erro na API BCB: ${response.statusText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error(`Resposta inesperada da API para índice ${codigo}: ${JSON.stringify(data)}`);
        }

        return data.reduce((acc, item) => acc + parseFloat(item.valor), 0);
    }

    async ajustaIndice() {
        const fila = await this.filaContratos();
        if (fila.length === 0) return;

        const indices = { inpc: "188", igpm: "189", "ipc-fipe": "193", ipca: "433" };

        for (const contrato of fila) {
            const code = indices[contrato.nome_indice];
            const today = new Date(contrato.proximo_reajuste);
            const lastYear = new Date(today);
            lastYear.setFullYear(today.getFullYear() - 1);

            try {
                const total = await this.buscarIndiceBCB(code, lastYear, today);
                await contrato.update({ indice_reajuste: total });
                this.contratosAtualizadosComSucesso.push(contrato.id);
                await this.sleep(1500);
            } catch (err) {
                this.logError(`Erro ao buscar índice para contrato ${contrato.id}: ${err.message}`);
                await this.registraErroContrato(contrato.id, err.message);
            }
        }
    }

    async reprocessaContratosErro() {
        const filaErro = await this.filaContratosErro();
        if (filaErro.length === 0) return;

        const indices = { inpc: "188", igpm: "189", "ipc-fipe": "193", ipca: "433" };

        for (const erroContrato of filaErro) {
            const contrato = await Contrato.findByPk(erroContrato.id_contrato);
            if (!contrato) continue;

            const code = indices[contrato.nome_indice];
            const today = new Date(contrato.proximo_reajuste);
            const lastYear = new Date(today);
            lastYear.setFullYear(today.getFullYear() - 1);

            try {
                const total = await this.buscarIndiceBCB(code, lastYear, today);
                await contrato.update({ indice_reajuste: total });
                await erroContrato.destroy();
            } catch (err) {
                this.logError(`Erro ao reprocessar índice para contrato ${contrato.id}: ${err.message}`);
                await erroContrato.update({ tentativas_reajuste: erroContrato.tentativas_reajuste + 1 });

                if (erroContrato.tentativas_reajuste >= 10) {
                    await ReprocessamentoContrato.create({
                        id_contrato: erroContrato.id_contrato,
                        erro: erroContrato.erro,
                    });
                    await erroContrato.destroy();
                }
            }
        }
    }

    async ajustaNovaData() {
        // Precisa re-buscar a fila pois `filaContratos` retorna os objetos, mas precisamos garantir que estamos trabalhando com os mesmos IDs processados
        // Melhor abordagem: usar a lista de IDs de sucesso
        if (this.contratosAtualizadosComSucesso.length === 0) return;

        for (const id of this.contratosAtualizadosComSucesso) {
            const contrato = await Contrato.findByPk(id);
            if (contrato) {
                try {
                    const novaData = new Date(contrato.proximo_reajuste);
                    novaData.setFullYear(novaData.getFullYear() + 1);
                    await contrato.update({ proximo_reajuste: novaData });
                } catch (err) {
                    this.logError(`Erro ao atualizar proximo_reajuste do contrato ${contrato.id}: ${err.message}`);
                }
            }
        }
        // Limpar lista após processar
        this.contratosAtualizadosComSucesso = [];
    }

    async ajustaValorMensal() {
        // Buscar novamente fila de contratos aptos (cuidado: se indice_reajuste já foi atualizado, eles podem não aparecer na query original se a query dependesse de indice zerado, mas a query original depende de data <= hoje)
        // A lógica original chamava filaContratos() novamente.
        const fila = await this.filaContratos();

        if (fila.length > 0) {
            for (const contrato of fila) {
                if (contrato.indice_reajuste !== 0 && contrato.valor_mensal != null) {
                    try {
                        const novoValor = Number(contrato.valor_mensal) + Number(contrato.valor_mensal) * (Number(contrato.indice_reajuste) / 100);
                        await contrato.update({ valor_mensal: novoValor });
                    } catch (err) {
                        this.logError(`Erro ao reajustar valor_mensal do contrato ${contrato.id}: ${err.message}`);
                    }
                }
            }
        }
    }

    async executarReajusteCompleto() {
        await this.ajustaValorMensal();
        await this.ajustaIndice();
        await this.reprocessaContratosErro();
        await this.ajustaNovaData();
    }
}

module.exports = new ReajusteService();
