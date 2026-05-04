const { Model, DataTypes } = require('sequelize');

class Faturado extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.ENUM,
        values: ['ativo', 'inativo']
      }
    }, {
      sequelize,
      tableName: 'faturados'
    });
  }

  static associate(models) {
    this.hasMany(models.Contrato, { foreignKey: 'id_faturado', as: 'contratos' });
  }

}

module.exports = Faturado;