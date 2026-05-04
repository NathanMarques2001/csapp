const { Model, DataTypes } = require('sequelize');

class Log extends Model {
  static init(sequelize) {
    super.init({
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_contrato: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      alteracao: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'logs'
    });
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'usuarios' });
    this.belongsTo(models.Contrato, { foreignKey: 'id_contrato', as: 'contratos' });
  }

}

module.exports = Log;
