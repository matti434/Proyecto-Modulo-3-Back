const { Pedido, Carrito } = require('../models');
const { crearPreferencia: crearPreferenciaMP, obtenerPago } = require('../services/mercadopagoService');
const { precioParaDesarrollo } = require('../utils/precioDesarrollo');

/**
 * Crea un pedido pendiente y una preferencia de MercadoPago para Checkout Pro.
 * Devuelve init_point para redirigir al usuario al checkout de MP.
 */
const crearPreferencia = async (req, res, next) => {
  try {
    const { items, subtotal, envio } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No hay items para procesar'
      });
    }

    const itemsValidados = items.map((item) => ({
      productoId: item.productoId,
      nombre: item.nombre || `Producto ${item.productoId}`,
      cantidad: Number(item.cantidad) || 1,
      precioUnitario: Number(item.precioUnitario) || 0
    }));

    const sub = Number(subtotal) ?? 0;
    const env = Number(envio) ?? 0;

    const pedido = await Pedido.create({
      usuario: req.usuario._id,
      items: itemsValidados.map(({ productoId, cantidad, precioUnitario }) => ({
        productoId,
        cantidad,
        precioUnitario
      })),
      subtotal: sub,
      envio: env,
      impuestos: 0,
      estado: 'pendiente'
    });

    const mpItems = itemsValidados.map(({ productoId, nombre, cantidad, precioUnitario }) => ({
      productoId: String(productoId),
      nombre,
      cantidad,
      precioUnitario
    }));

    const mpPreference = await crearPreferenciaMP(
      mpItems,
      pedido._id.toString(),
      req.usuario.email
    );

    const initPoint = mpPreference.sandbox_init_point || mpPreference.init_point;

    res.status(200).json({
      exito: true,
      transaccionId: pedido.transaccionId || pedido._id.toString(),
      preferenciaId: mpPreference.id,
      initPoint
    });
  } catch (error) {
    console.error('[pagos/crear-preferencia] Error:', error?.message || error);
    next(error);
  }
};

/**
 * Webhook de MercadoPago: recibe notificaciones cuando cambia el estado del pago.
 * NO usa authMiddleware - MP hace POST sin token.
 * Soporta formato nuevo (type/data) y antiguo (topic/id).
 */
const webhookPago = async (req, res) => {
  try {
    const body = req.body || {};
    const paymentId = body.data?.id || body.id;

    const tipo = body.type || body.topic;
    if (tipo === 'payment' && paymentId) {
      const pagoInfo = await obtenerPago(paymentId);
      const { status, external_reference: pedidoId } = pagoInfo;

      if (status === 'approved' && pedidoId) {
        await Pedido.findByIdAndUpdate(pedidoId, { estado: 'procesando' });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[pagos/webhook] Error:', error?.message || error);
    res.status(500).send('Error');
  }
};

const crearPago = async (req, res, next) => {
  try {
    const { items, subtotal, envio } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No hay items para procesar'
      });
    }

    const itemsValidados = items.map((item) => ({
      productoId: item.productoId,
      cantidad: Number(item.cantidad) || 1,
      precioUnitario: Number(item.precioUnitario) || 0
    }));

    const sub = Number(subtotal) ?? 0;
    const env = Number(envio) ?? 0;

    const pedido = await Pedido.create({
      usuario: req.usuario._id,
      items: itemsValidados,
      subtotal: sub,
      envio: env,
      impuestos: 0
    });

    await Carrito.findOneAndUpdate(
      { usuario: req.usuario._id },
      { $set: { items: [] } }
    );

    res.status(200).json({
      exito: true,
      transaccionId: pedido.transaccionId || pedido._id.toString()
    });
  } catch (error) {
    console.error('[pagos/crear] Error:', error?.message || error);
    next(error);
  }
};

const verificarPago = async (req, res, next) => {
  try {
    const { transaccionId } = req.params;

    const pedido = await Pedido.findOne({
      $or: [
        { transaccionId },
        { _id: transaccionId }
      ]
    }).lean();

    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Transacción no encontrada'
      });
    }

    const esPropietario = pedido.usuario?.toString() === req.usuario?._id?.toString();
    const esAdmin = req.usuario?.role === 'admin';

    if (!esPropietario && !esAdmin) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para ver esta transacción'
      });
    }

    const transformarPrecios = (p) => {
      if (!p?.items) return p;
      return {
        ...p,
        items: p.items.map((item) => ({
          ...item,
          precioUnitario: precioParaDesarrollo(item.precioUnitario),
          productoId: item.productoId && item.productoId.precio !== undefined
            ? { ...item.productoId, precio: precioParaDesarrollo(item.productoId.precio) }
            : item.productoId
        }))
      };
    };

    res.json({
      exito: true,
      transaccionId: pedido.transaccionId || pedido._id.toString(),
      estado: pedido.estado,
      pedido: transformarPrecios(pedido)
    });
  } catch (error) {
    console.error('[pagos/verificar] Error:', error?.message || error);
    next(error);
  }
};

module.exports = {
  crearPreferencia,
  webhookPago,
  crearPago,
  verificarPago
};
