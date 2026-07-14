const { Router } = require("express");
const HistoricoController = require("../controllers/HistoricoController");
const authMiddleware = require("../middlewares/autenticacao");

const routes = new Router();

routes.get("/clientes", authMiddleware, HistoricoController.indexClientes);
routes.get("/contratos", authMiddleware, HistoricoController.indexContratos);
routes.post("/snapshot", authMiddleware, HistoricoController.gerarSnapshotManual);

module.exports = routes;
