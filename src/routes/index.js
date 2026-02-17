const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuariosRoutes');
<<<<<<< feat/MB-12-gestion-catalogo-productos
const productoRoutes = require('./productoRoutes')
=======
const productoRoutes = require('./productoRoutes');
>>>>>>> develop
const pedidoRoutes = require('./pedidoRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/productos', productoRoutes);
router.use('/pedidos', pedidoRoutes);

module.exports = router;