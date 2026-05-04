const { Model, DataTypes } = require('sequelize');

class VencimentoContratos extends Model {
  static init(sequelize) {
    super.init({
      data_vencimento: {
        type: DataTypes.DATE,
        allowNull: true
      },
      id_contrato: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM,
        values: ['ativo', 'inativo']
      }
    }, {
      sequelize,
      tableName: 'vencimento_contratos'
    });
  }

  static associate(models) {
    this.belongsTo(models.Contrato, { foreignKey: 'id_contrato', as: 'contrato' });
  }
}

module.exports = VencimentoContratos;