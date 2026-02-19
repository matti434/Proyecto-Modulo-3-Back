const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
  obtenerProducto,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productoController');

// Rutas públicas
router.get('/', obtenerProducto);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, crearProducto);
router.put('/:id', authMiddleware, adminMiddleware, actualizarProducto);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarProducto);

module.exports = router;
