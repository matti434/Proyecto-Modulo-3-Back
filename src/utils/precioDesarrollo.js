const config = require('../config/config');

/**
 * En desarrollo, devuelve 50000 para facilitar pruebas con MercadoPago.
 * En producción, devuelve el precio real.
 */
function precioParaDesarrollo(precio) {
  if (config.nodeEnv === 'development' && typeof precio === 'number') {
    return 50000;
  }
  return precio;
}

module.exports = { precioParaDesarrollo };
