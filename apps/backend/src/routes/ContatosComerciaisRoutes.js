const express = require("express");
const ContatoComercialController = require("../controllers/ContatoComercialController.js");
const router = express.Router();
const authMiddleware = require("../middlewares/autenticacao.js");

router.use(authMiddleware);
router.get("/", ContatoComercialController.indexAll);
router.get("/:id_cliente", ContatoComercialController.index);
router.get("/contato/:id", ContatoComercialController.indexContato);
router.post("/", ContatoComercialController.store);
router.put("/:id", ContatoComercialController.update);
router.delete("/:id", ContatoComercialController.delete);

module.exports = router;
