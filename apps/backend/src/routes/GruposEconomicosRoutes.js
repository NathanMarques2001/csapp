const express = require("express");
const GrupoEconomicoController = require("../controllers/GrupoEconomicoController.js");
const router = express.Router();
const authMiddleware = require("../middlewares/autenticacao.js");

router.use(authMiddleware);
router.get("/", GrupoEconomicoController.indexAll);
router.get("/:id", GrupoEconomicoController.index);
router.post("/", GrupoEconomicoController.store);
router.put("/:id", GrupoEconomicoController.update);
router.put("/active-inactive/:id", GrupoEconomicoController.inactiveOrActive);
// router.delete('/:id', GrupoEconomicoController.delete);

module.exports = router;
