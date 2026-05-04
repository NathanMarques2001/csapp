const { Model, DataTypes } = require('sequelize');

class ContatoTecnico extends Model {
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
      tableName: 'contatos_tecnicos'
    });
  }

  static associate(models) {
    this.belongsTo(models.Cliente, { foreignKey: 'id_cliente', as: 'clientes' });
  }

}

module.exports = ContatoTecnico;
