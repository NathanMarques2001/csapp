const express = require("express");
const FatosImportantesController = require("../controllers/FatosImportantesController.js");
const router = express.Router();
const authMiddleware = require("../middlewares/autenticacao.js");

router.use(authMiddleware);
router.get("/", FatosImportantesController.indexAll);
router.get("/:id_cliente", FatosImportantesController.index);
router.get("/fato/:id", FatosImportantesController.indexFato);
router.post("/", FatosImportantesController.store);
router.put("/:id", FatosImportantesController.update);
router.delete("/:id", FatosImportantesController.delete);

module.exports = router;
