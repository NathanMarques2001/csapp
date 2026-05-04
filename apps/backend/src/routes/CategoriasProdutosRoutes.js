const express = require("express");
const CategoriaProdutoController = require("../controllers/CategoriaProdutoController.js");
const router = express.Router();
const authMiddleware = require("../middlewares/autenticacao.js");

router.use(authMiddleware);

router.get("/", CategoriaProdutoController.index);
router.get("/:id", CategoriaProdutoController.show);
router.post("/", CategoriaProdutoController.store);
router.put("/:id", CategoriaProdutoController.update);
// router.delete("/:id", CategoriaProdutoController.delete);

module.exports = router;
