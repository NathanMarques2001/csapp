const Contrato = require('../models/Contrato');

class ContratoRepository {
  async updateStatusByClienteId(clienteId, status) {
    return await Contrato.update({ status }, { where: { id_cliente: clienteId } });
  }
}

module.exports = new ContratoRepository();
