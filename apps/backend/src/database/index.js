const sequelize = require("sequelize");
const dbConfig = require("../config/Database.js");
const Usuario = require("../models/Usuario");
const Produto = require("../models/Produto");
const Log = require("../models/Log");
const FatosImportantes = require("../models/FatosImportantes");
const Fabricante = require("../models/Fabricante");
const Contrato = require("../models/Contrato");
const ContatoTecnico = require("../models/ContatoTecnico");
const ContatoComercial = require("../models/ContatoComercial");
const Cliente = require("../models/Cliente");
const Segmento = require("../models/Segmento");
const Faturado = require("../models/Faturado");
const ContratoErroReajuste = require("../models/ContratoErroReajuste");
const ReprocessamentoContrato = require("../models/ReprocessamentoContrato");
const ResetSenha = require("../models/ResetSenha");
const VencimentoContratos = require("../models/VencimentoContratos");
const GrupoEconomico = require("../models/GrupoEconomico.js");
const ClassificacaoCliente = require("../models/ClassificacaoCliente.js");
const CategoriaProduto = require("../models/CategoriaProduto.js");
const Notificacao = require("../models/Notificacao.js");
const HistoricoCliente = require("../models/HistoricoCliente.js");
const HistoricoContrato = require("../models/HistoricoContrato.js");
const HistoricoExecucao = require("../models/HistoricoExecucao.js");

const connection = new sequelize(dbConfig);

const tables = [
  Usuario,
  Produto,
  Log,
  FatosImportantes,
  Fabricante,
  Contrato,
  ContatoTecnico,
  ContatoComercial,
  Cliente,
  Segmento,
  Faturado,
  ContratoErroReajuste,
  ReprocessamentoContrato,
  ResetSenha,
  VencimentoContratos,
  GrupoEconomico,
  ClassificacaoCliente,
  CategoriaProduto,
  Notificacao,
  HistoricoCliente,
  HistoricoContrato,
  HistoricoExecucao,
];

tables.forEach((table) => {
  table.init(connection);
});

tables.forEach((table) => {
  table.associate(connection.models);
});

module.exports = connection;
