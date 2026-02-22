const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  registro,
  login,
  logout,
  obtenerPerfil,
  actualizarPerfil,
  solicitarRecuperacionPassword,
  restablecerPasswordConCodigo
} = require('../controllers/authController');

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', logout);
router.post('/recuperar-password', solicitarRecuperacionPassword);
router.post('/restablecer-password', restablecerPasswordConCodigo);

// Rutas protegidas
router.get('/perfil', authMiddleware, obtenerPerfil);
router.put('/perfil', authMiddleware, actualizarPerfil);

module.exports = router;
