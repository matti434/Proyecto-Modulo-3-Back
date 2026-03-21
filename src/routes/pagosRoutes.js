const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  crearPreferencia,
  webhookPago,
  crearPago,
  verificarPago
} = require('../controllers/pagosController');

router.post('/webhook', webhookPago);

router.use(authMiddleware);

router.post('/crear-preferencia', crearPreferencia);
router.post('/crear', crearPago);
router.get('/verificar/:transaccionId', verificarPago);

module.exports = router;
