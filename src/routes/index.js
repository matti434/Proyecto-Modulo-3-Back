const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuariosRoutes');
const productoRoutes = require('./productoRoutes')
const carritoRoutes = require('./carritoRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes)
router.use('/productos', productoRoutes);

module.exports = router;