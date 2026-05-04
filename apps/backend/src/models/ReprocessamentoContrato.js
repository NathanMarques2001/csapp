const { Model, DataTypes } = require('sequelize');

class ReprocessamentoContrato extends Model {
  static init(sequelize) {
    super.init({
      id_contrato: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      erro: {
        type: DataTypes.TEXT,
        allowNull: false
      },
    }, {
      sequelize,
      tableName: 'reprocessamentos_contratos',
    });
  }

  static associate(models) {
    this.belongsTo(models.Contrato, { foreignKey: 'id_contrato', as: 'contrato' });
  }
}

module.exports = ReprocessamentoContrato;