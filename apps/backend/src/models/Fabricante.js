const { Model, DataTypes } = require('sequelize');

class Fabricante extends Model {
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
      tableName: 'fabricantes'
    });
  }

  static associate(models) {
    this.hasMany(models.Produto, { foreignKey: 'id_fabricante', as: 'produtos' });
  }

}

module.exports = Fabricante;