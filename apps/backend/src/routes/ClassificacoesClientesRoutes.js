const express = require("express");
const ClassificacaoClienteController = require("../controllers/ClassificacaoClienteController.js");
const router = express.Router();
const authMiddleware = require("../middlewares/autenticacao.js");

router.use(authMiddleware);

router.get("/", ClassificacaoClienteController.index);
router.get("/:id", ClassificacaoClienteController.show);
router.post("/", ClassificacaoClienteController.store);
router.put("/:id", ClassificacaoClienteController.update);
// router.delete("/:id", ClassificacaoClienteController.delete);

module.exports = router;
