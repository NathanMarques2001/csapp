const express = require('express');
const ClienteController = require('../controllers/ClienteController.js');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.js');

router.use(authMiddleware);
router.get('/', ClienteController.indexAll);
router.get('/:id', ClienteController.index);
router.get('/vendedor/:id', ClienteController.indexVendedor);
router.post('/', ClienteController.store);
router.put('/migrate', ClienteController.migrate);
router.put('/active-inactive/:id', ClienteController.inactiveOrActive);
router.put('/:id', ClienteController.update);
// router.delete('/:id', ClienteController.delete);

module.exports = router;