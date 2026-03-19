const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { crearPago, verificarPago } = require('../controllers/pagosController');

router.use(authMiddleware);

router.post('/crear', crearPago);
router.get('/verificar/:transaccionId', verificarPago);

module.exports = router;
