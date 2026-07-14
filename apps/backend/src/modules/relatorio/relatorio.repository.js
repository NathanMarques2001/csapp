const connection = require('../../database');
const { QueryTypes } = require('sequelize');

class RelatorioRepository {
  async getRelatorioGeral() {
    const query = `
      SELECT
        cli.razao_social,
        cli.nome_fantasia,
        cli.cpf_cnpj,
        sol.nome AS solucao,
        con.valor_mensal AS valor_contrato,
        usu.nome AS vendedor,
        vp_usu.nome AS vp,
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
      INNER JOIN usuarios usu ON cli.id_usuario = usu.id
      LEFT JOIN usuarios vp_usu ON cli.vp = vp_usu.id;
    `;

    return await connection.query(query, {
      type: QueryTypes.SELECT,
    });
  }
}

module.exports = new RelatorioRepository();
