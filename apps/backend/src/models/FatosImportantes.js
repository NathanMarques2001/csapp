const { Model, DataTypes } = require('sequelize');

class FatosImportantes extends Model {
  static init(sequelize) {
    super.init({
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      conteudo: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'fatos_importantes'
    });
  }

  static associate(models) {
    this.belongsTo(models.Cliente, { foreignKey: 'id_cliente', as: 'clientes' });
  }

}

module.exports = FatosImportantes;