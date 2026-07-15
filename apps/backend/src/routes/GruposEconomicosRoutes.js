const express = require("express");
const GrupoEconomicoController = require("../controllers/GrupoEconomicoController.js");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.js");
const validate = require("../middlewares/validate.js");
const { 
  storeGrupoEconomicoSchema, 
  updateGrupoEconomicoSchema, 
  idParamSchema 
} = require("../schemas/GrupoEconomicoSchema.js");

router.use(authMiddleware);

router.get("/", GrupoEconomicoController.indexAll);
router.get("/:id", validate(idParamSchema), GrupoEconomicoController.index);
router.post("/", validate(storeGrupoEconomicoSchema), GrupoEconomicoController.store);
router.put("/:id", validate(updateGrupoEconomicoSchema), GrupoEconomicoController.update);
router.put("/active-inactive/:id", validate(idParamSchema), GrupoEconomicoController.inactiveOrActive);

module.exports = router;
