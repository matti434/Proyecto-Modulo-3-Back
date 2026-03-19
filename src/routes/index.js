const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuariosRoutes');
const productosRoutes = require('./productosRoutes');
const pedidosRoutes = require('./pedidosRoutes');
const carritoRoutes = require('./carritoRoutes');
const homeRoutes = require('./homeRoutes');
const contactoRoutes = require('./contactoRoutes');

const pagosRoutes = require('./pagosRoutes');


router.use('/auth', authRoutes);
router.use('/contacto', contactoRoutes);
router.use('/pagos', pagosRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/productos', productosRoutes);
router.use('/pedidos', pedidosRoutes);
router.use('/carrito', carritoRoutes);
router.use('/home', homeRoutes);

module.exports = router;