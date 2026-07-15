// src/routes/notificacoes.js
const express = require("express");
const router = express.Router();
const notificacaoController = require("../controllers/NotificacaoController.js");
const authMiddleware = require("../middlewares/auth.js");

router.use(authMiddleware);
router.get("/", notificacaoController.listar);
router.get("/ativas", notificacaoController.listarAtivas);
router.get("/usuario/:id_usuario", notificacaoController.listarPorUsuario);
router.post("/", notificacaoController.criar);
router.put("/:id/confirmar", notificacaoController.confirmar);

module.exports = router;
