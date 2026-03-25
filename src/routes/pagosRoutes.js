const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  crearPreferencia,
  webhookPago,
  confirmarPagoMercadoPago,
  crearPago,
  verificarPago
} = require('../controllers/pagosController');

router.get('/webhook', (req, res) => res.status(200).send('OK'));
router.post('/webhook', webhookPago);

router.use(authMiddleware);

router.post('/crear-preferencia', crearPreferencia);
router.post('/confirmar', confirmarPagoMercadoPago);
router.post('/crear', crearPago);
router.get('/verificar/:transaccionId', verificarPago);

module.exports = router;
