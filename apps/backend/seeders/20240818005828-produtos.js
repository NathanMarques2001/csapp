"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const produtos = [
      "Notebook Inspiron",
      "Desktop OptiPlex",
      "Monitor UltraSharp",
      "Impressora LaserJet",
      "Workstation ZBook",
      "Tablet ElitePad",
      "ThinkPad X1 Carbon",
      "IdeaPad Slim",
      "Chromebook Duet",
      "ZenBook Duo",
      "ROG Strix",
      "VivoBook Pro",
      "Predator Helios",
      "Aspire 5",
      "Galaxy Book",
      "Smart Monitor M8",
      "MacBook Pro",
      "iMac 24”",
      "LG Gram",
      "Ultrafine Display",
      "Intel Core i9",
      "Intel NUC Mini PC",
      "Ryzen 9 5900X",
      "Radeon RX 6800",
      "FirePro W7100",
      "Apple Vision Pro",
      "HP Omen Laptop",
      "Dell PowerEdge Server",
      "Lenovo Legion 5",
      "Acer Nitro 5",
    ];

    const items = produtos.map((nome, index) => ({
      nome,
      id_fabricante: (index % 10) + 1, // Distribui entre 1 e 10
      status: Math.random() < 0.8 ? "ativo" : "inativo", // 80% ativos
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("produtos", items, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("produtos", null, {});
  },
};
