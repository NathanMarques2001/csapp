const { Op } = require('sequelize');
const Cliente = require('../../models/Cliente');
const Contrato = require('../../models/Contrato');

class ClienteRepository {
  async findById(id) {
    return await Cliente.findByPk(id);
  }

  async findByGrupoEconomico(id_grupo_economico) {
    return await Cliente.findAll({ where: { id_grupo_economico } });
  }

  async findAll() {
    return await Cliente.findAll({ order: [['nome_fantasia', 'ASC']] });
  }

  async create(data) {
    return await Cliente.create(data);
  }

  async migrate(antigo_vendedor, novo_vendedor) {
    return await Cliente.update(
      { id_usuario: novo_vendedor },
      { where: { id_usuario: antigo_vendedor } }
    );
  }

  async updateStatus(id, status) {
    return await Cliente.update({ status }, { where: { id } });
  }

  async inativarContratos(id_cliente) {
    return await Contrato.update({ status: 'inativo' }, { where: { id_cliente } });
  }

  async update(id, data) {
    return await Cliente.update(data, { where: { id } });
  }

  async findGestoresComNascimento() {
    return await Cliente.findAll({
      where: {
        [Op.or]: [
          { gestor_chamados_nascimento: { [Op.ne]: null } },
          { gestor_contratos_nascimento: { [Op.ne]: null } },
          { gestor_financeiro_nascimento: { [Op.ne]: null } },
        ],
      },
      order: [['nome_fantasia', 'ASC']],
    });
  }
}

module.exports = new ClienteRepository();
