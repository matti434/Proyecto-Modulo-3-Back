const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { precioParaDesarrollo } = require('../utils/precioDesarrollo');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const preference = new Preference(client);
const payment = new Payment(client);

/**
 * Crea una preferencia de pago en MercadoPago (Checkout Pro)
 * @param {Array} items - Items del carrito [{ productoId, nombre, cantidad, precioUnitario }]
 * @param {string} pedidoId - ID del pedido (external_reference)
 * @param {string} email - Email del comprador
 * @returns {Promise<{id, init_point, sandbox_init_point}>}
 */
async function crearPreferencia(items, pedidoId, email) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

  const preferenceData = {
    items: items.map((item) => ({
      id: String(item.productoId),
      title: item.nombre || `Producto ${item.productoId}`,
      quantity: Number(item.cantidad) || 1,
      unit_price: precioParaDesarrollo(Number(item.precioUnitario) || 0),
      currency_id: process.env.MERCADOPAGO_CURRENCY || 'ARS'
    })),
    payer: {
      email: email || 'test_user@test.com'
    },
    back_urls: {
      success: `${frontendUrl}/pago-exitoso`,
      failure: `${frontendUrl}/pago-fallo`,
      pending: `${frontendUrl}/pago-pendiente`
    },
    auto_return: 'approved',
    external_reference: String(pedidoId),
    notification_url: `${backendUrl}/api/pagos/webhook`
  };

  const response = await preference.create({ body: preferenceData });
  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point
  };
}

/**
 * Obtiene el estado de un pago desde MercadoPago (para validar en webhook)
 * @param {string} paymentId - ID del pago en MercadoPago
 * @returns {Promise<{status, external_reference}>}
 */
async function obtenerPago(paymentId) {
  const pagoInfo = await payment.get({ id: paymentId });
  return {
    status: pagoInfo.status,
    external_reference: pagoInfo.external_reference
  };
}

module.exports = {
  crearPreferencia,
  obtenerPago
};
