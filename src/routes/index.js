const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuariosRoutes');
const productosRoutes = require('./productosRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const carritoRoutes = require('./carritoRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/productos', productosRoutes);
router.use('/pedidos', pedidosRoutes);
router.use('/carrito', carritoRoutes);

module.exports = router;