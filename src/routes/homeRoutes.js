const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const { uploadSingleImagen, middlewareTamano } = require('../middlewares/uploadHome');
const {
  obtenerContenidoHome,
  subirPortada,
  agregarItemGaleria,
  actualizarTextoGaleria,
  reemplazarImagenGaleria,
  eliminarItemGaleria
} = require('../controllers/homeController');

// Público
router.get('/', obtenerContenidoHome);

// Admin: portada
router.post(
  '/portada/upload',
  authMiddleware,
  adminMiddleware,
  uploadSingleImagen('imagen'),
  subirPortada
);

// Admin: galería
router.post(
  '/galeria',
  authMiddleware,
  adminMiddleware,
  uploadSingleImagen('imagen'),
  agregarItemGaleria
);
router.put('/galeria/:id', authMiddleware, adminMiddleware, actualizarTextoGaleria);
router.post(
  '/galeria/:id/imagen',
  authMiddleware,
  adminMiddleware,
  uploadSingleImagen('imagen'),
  reemplazarImagenGaleria
);
router.delete('/galeria/:id', authMiddleware, adminMiddleware, eliminarItemGaleria);

// Errores de multer (tamaño/formato) en rutas de esta router
router.use(middlewareTamano);

module.exports = router;
