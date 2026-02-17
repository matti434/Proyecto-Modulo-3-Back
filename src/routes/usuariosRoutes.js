const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
    obtenerUsuarios,
    obtenerUsuariosPorId,
    actualizarUsuario,
    eliminarUsuario,
    suspenderUsuario,
    reactivarUsuario
} = require('../controllers/usuarioController');

// Todas las rutas requieren auth + admin
router.use(authMiddleware, adminMiddleware);

router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuariosPorId);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);
router.post('/:id/suspender', suspenderUsuario);
router.post('/:id/reactivar', reactivarUsuario);

module.exports = router;