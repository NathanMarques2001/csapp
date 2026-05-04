"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const segmentos = [
      { nome: "Tecnologia da Informação", status: "ativo" },
      { nome: "Serviços Financeiros", status: "ativo" },
      { nome: "Educação", status: "ativo" },
      { nome: "Saúde", status: "ativo" },
      { nome: "Comércio Varejista", status: "inativo" },
      { nome: "Indústria Alimentícia", status: "ativo" },
      { nome: "Construção Civil", status: "ativo" },
      { nome: "Transportes e Logística", status: "inativo" },
      { nome: "Agronegócio", status: "ativo" },
      { nome: "Energia e Saneamento", status: "ativo" },
    ].map((segmento) => ({
      ...segmento,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("segmentos", segmentos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("segmentos", null, {});
  },
};
