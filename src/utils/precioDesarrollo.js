/**
 * Devuelve el precio tal cual (sin override).
 * Para forzar 50k en pruebas de MercadoPago: agregar
 * PRECIO_DEV_50K=true en .env y descomentar la lógica interna.
 */
function precioParaDesarrollo(precio) {
  // if (process.env.PRECIO_DEV_50K === 'true' && typeof precio === 'number') return 50000;
  return precio;
}

module.exports = { precioParaDesarrollo };
