const jwt = require('jsonwebtoken');
const config = require('../config/config');


const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      email: usuario.email,
      role: usuario.role
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
};

// Verificar token JWT
const verificarToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  generarToken,
  verificarToken
};
