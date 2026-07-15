const { Model, DataTypes } = require('sequelize');

class Log extends Model {
  static init(sequelize) {
    super.init({
      nome_usuario: {
        type: DataTypes.STRING,
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
    // No foreign key to Usuario since we store nome_usuario directly
    this.belongsTo(models.Contrato, { foreignKey: 'id_contrato', as: 'contratos' });
  }

}

module.exports = Log;
