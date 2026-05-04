const express = require('express');
const SegmentoController = require('../controllers/SegmentoController.js');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.js');

router.use(authMiddleware);
router.get('/', SegmentoController.indexAll);
router.get('/:id', SegmentoController.index);
router.post('/', SegmentoController.store);
router.put('/:id', SegmentoController.update);
// router.delete('/:id', SegmentoController.delete);

module.exports = router;