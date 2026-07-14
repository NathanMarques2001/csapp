"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("produtos", "id_categoria_produto", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "categorias_produtos",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("produtos", "id_categoria_produto");
  },
};
