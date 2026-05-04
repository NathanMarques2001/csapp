const express = require('express');
const LogController = require('../controllers/LogController.js');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.js');

router.use(authMiddleware);
router.get('/', LogController.indexAll);
router.get('/:id_contrato', LogController.index);
router.post('/', LogController.store);

module.exports = router;