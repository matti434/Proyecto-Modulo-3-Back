const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  registro,
  login,
  obtenerPerfil,
  actualizarPerfil
} = require('../controllers/authController');

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);

// Rutas protegidas
router.get('/perfil', authMiddleware, obtenerPerfil);
router.put('/perfil', authMiddleware, actualizarPerfil);

module.exports = router;
