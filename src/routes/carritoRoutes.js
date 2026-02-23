const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  obtenerCarrito,
  agregarItem,
  actualizarCantidad,
  eliminarItem
} = require('../controllers/carritoController');

router.use(authMiddleware);

router.get('/', obtenerCarrito);
router.post('/', agregarItem);
router.put('/:itemId', actualizarCantidad);
router.delete('/:itemId', eliminarItem);

module.exports = router;
