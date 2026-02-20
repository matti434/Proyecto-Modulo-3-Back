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
const { uploadSingleImage } = require('../middlewares/upload');
const { subirImagen } = require('../controllers/uploadControllers');

// Rutas públicas
router.get('/', obtenerProducto);
router.get('/:id', obtenerProductoPorId);

// Subir imagen (devuelve URL para usar en crear/actualizar producto)
router.post('/upload', authMiddleware, adminMiddleware, uploadSingleImage, subirImagen);

// Rutas protegidas (admin)
router.post('/', authMiddleware, adminMiddleware, crearProducto);
router.put('/:id', authMiddleware, adminMiddleware, actualizarProducto);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarProducto);

module.exports = router;
