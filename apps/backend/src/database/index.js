const sequelize = require('sequelize');
const dbConfig = require('../config/Database.js');
const Usuario = require('../models/Usuario');
const Produto = require('../models/Produto');
const Log = require('../models/Log');
const FatosImportantes = require('../models/FatosImportantes');
const Fabricante = require('../models/Fabricante');
const Contrato = require('../models/Contrato');
const ContatoTecnico = require('../models/ContatoTecnico');
const ContatoComercial = require('../models/ContatoComercial');
const Cliente = require('../models/Cliente');
const Segmento = require('../models/Segmento');
const CategoriaProduto = require('../models/CategoriaProduto');
const Faturado = require('../models/Faturado');
const ContratoErroReajuste = require('../models/ContratoErroReajuste');
const ReprocessamentoContrato = require('../models/ReprocessamentoContrato');
const ResetSenha = require('../models/ResetSenha');
const VencimentoContratos = require('../models/VencimentoContratos');
const ClassificacaoClientes = require('../models/ClassificacaoCliente');
const GrupoEconomico = require('../models/GrupoEconomico');
const HistoricoCliente = require('../models/HistoricoCliente');
const HistoricoContrato = require('../models/HistoricoContrato');
const HistoricoExecucao = require('../models/HistoricoExecucao');
const Notificacao = require('../models/Notificacao');

const connection = new sequelize(dbConfig);

const tables = [Usuario, Produto, Log, FatosImportantes, Fabricante, Contrato, ContatoTecnico, ContatoComercial, Cliente, Segmento, CategoriaProduto, Faturado, ContratoErroReajuste, ReprocessamentoContrato, ResetSenha, VencimentoContratos, ClassificacaoClientes, GrupoEconomico, HistoricoCliente, HistoricoContrato, HistoricoExecucao, Notificacao];

tables.forEach(table => {
  table.init(connection);
});

tables.forEach(table => {
  table.associate(connection.models);
});

module.exports = connection;