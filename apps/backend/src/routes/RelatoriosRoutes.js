const express = require("express");
const router = express.Router();
const RelatorioController = require("../controllers/RelatorioController");
const authMiddleware = require("../middlewares/autenticacao");

router.get(
    "/geral",
    authMiddleware,
    RelatorioController.getRelatorioGeral
);

module.exports = router;
