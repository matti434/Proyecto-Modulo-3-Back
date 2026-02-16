const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { Usuario } = require('../models');


const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    if (usuario.suspendido) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Usuario suspendido. Contacte al administrador.'
      });
    }

    req.usuario = usuario;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token expirado'
      });
    }

    return res.status(401).json({
      exito: false,
      mensaje: 'Token inválido'
    });
  }
};


const adminMiddleware = (req, res, next) => {
  if (!req.usuario || req.usuario.role !== 'admin') {
    return res.status(403).json({
      exito: false,
      mensaje: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }
  next();
};


const authOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      const usuario = await Usuario.findById(decoded.id);

      if (usuario && !usuario.suspendido) {
        req.usuario = usuario;
      }
    }
  } catch (error) {

  }

  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  authOptional
};

