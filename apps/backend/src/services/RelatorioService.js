const connection = require("../database");
const { QueryTypes } = require("sequelize");

class RelatorioService {
    async getRelatorioGeral() {
        const query = `
        SELECT
          cli.razao_social,
          cli.nome_fantasia,
          cli.cpf_cnpj,
          sol.nome AS solucao,
          con.valor_mensal AS valor_contrato,
          usu.nome AS vendedor,
          cli.status,
          cli.gestor_chamados_nome,
          cli.gestor_chamados_email,
          cli.gestor_chamados_telefone_1,
          cli.gestor_chamados_telefone_2,
          cli.gestor_financeiro_nome,
          cli.gestor_financeiro_email,
          cli.gestor_financeiro_telefone_1,
          cli.gestor_financeiro_telefone_2,
          cli.gestor_contratos_nome,
          cli.gestor_contratos_email,
          cli.gestor_contratos_telefone_1,
          cli.gestor_contratos_telefone_2,
          cli.id as id_cliente,
          sol.id as id_produto,
          usu.id as id_vendedor,
          con.status as status_contrato,
          con.data_inicio,
          con.duracao,
          con.tipo_faturamento,
          con.proximo_reajuste,
          cli.created_at as data_criacao_cliente
        FROM contratos con
        INNER JOIN clientes cli ON con.id_cliente = cli.id
        INNER JOIN produtos sol ON con.id_produto = sol.id
        INNER JOIN usuarios usu ON cli.id_usuario = usu.id;
      `;

        const resultados = await connection.query(query, {
            type: QueryTypes.SELECT,
        });

        return resultados.map(item => {
            return {
                ...item,
                vencimento_calculado: this.calculateNextVencimento(item.data_inicio, item.duracao)
            };
        });
    }

    calculateNextVencimento(dataInicio, duracao) {
        if (!dataInicio) return null;
        const duracaoMeses = parseInt(duracao);
        if (!duracaoMeses || duracaoMeses <= 0) return null;
        if (duracaoMeses === 12000) return "Indeterminado";

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let data = new Date(dataInicio);
        if (isNaN(data.getTime())) return null;

        // Primeiro vencimento teórico
        data.setMonth(data.getMonth() + duracaoMeses);

        if (data < hoje) {
            let safeCounter = 0;
            while (data < hoje && safeCounter < 1000) {
                data.setMonth(data.getMonth() + duracaoMeses);
                safeCounter++;
            }
        }
        return data;
    }
}

module.exports = new RelatorioService();
