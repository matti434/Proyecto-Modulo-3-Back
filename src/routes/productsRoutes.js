const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
    obtenerPedidos,
    obtenerPedidoPorId,
    crearPedido,
    actualizarEstado
} = require('../controllers/pedidoController');

// Todas las rutas requieren autenticacion
router.use(authMiddleware);

router.get('/', obtenerPedidos);
router.get('/:id', obtenerPedidoPorId);
router.post('/', crearPedido);

// Solo admin puede actualizar estado
router.put('/:id/estado', adminMiddleware, actualizarEstado);

module.exports = router