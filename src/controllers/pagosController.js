const mongoose = require('mongoose');
const { Pedido, Carrito, Producto } = require('../models');
const { crearPreferencia: crearPreferenciaMP, obtenerPago } = require('../services/mercadopagoService');
const { precioParaDesarrollo } = require('../utils/precioDesarrollo');

async function descontarItemsPedido(pedido, session) {
  const opts = session ? { session } : {};
  for (const item of pedido.items) {
    const cantidad = Number(item.cantidad) || 1;
    const prod = await Producto.findOneAndUpdate(
      { _id: item.productoId, stockDisponible: { $gte: cantidad } },
      { $inc: { stockDisponible: -cantidad } },
      { new: true, ...opts },
    );

    if (!prod) {
      throw new Error(
        `[pagos/stock] Stock insuficiente para producto ${item.productoId} (pedido ${pedido._id})`,
      );
    }

    if (prod.stockDisponible <= 0) {
      await Producto.updateOne(
        { _id: prod._id },
        { $set: { stock: false, stockDisponible: 0 } },
        opts,
      );
    }
  }
}

/**
 * Pago aprobado: pendiente → procesando y descuenta stock (idempotente).
 * Intenta transacción (Atlas / replica set); si Mongo no soporta transacciones, aplica sin sesión.
 */
async function aplicarStockPorPagoAprobadoConTransaccion(pedidoId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const pedido = await Pedido.findOneAndUpdate(
      { _id: pedidoId, estado: 'pendiente' },
      { $set: { estado: 'procesando' } },
      { new: true, session },
    );

    if (!pedido) {
      await session.abortTransaction();
      return;
    }

    await descontarItemsPedido(pedido, session);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function aplicarStockPorPagoAprobadoSinTransaccion(pedidoId) {
  const pedido = await Pedido.findOneAndUpdate(
    { _id: pedidoId, estado: 'pendiente' },
    { $set: { estado: 'procesando' } },
    { new: true },
  );

  if (!pedido) return;

  try {
    await descontarItemsPedido(pedido, null);
  } catch (err) {
    await Pedido.findByIdAndUpdate(pedidoId, { $set: { estado: 'pendiente' } });
    throw err;
  }
}

async function aplicarStockPorPagoAprobado(pedidoId) {
  try {
    await aplicarStockPorPagoAprobadoConTransaccion(pedidoId);
  } catch (err) {
    const msg = String(err?.message || err);
    const code = err?.code;
    const sinTransacciones =
      code === 20 ||
      /Transaction numbers are only allowed|multi-document|replica set|IllegalOperation|not supported.*transaction/i.test(
        msg,
      );
    if (sinTransacciones) {
      console.warn('[pagos] Stock sin transacción Mongo:', msg);
      await aplicarStockPorPagoAprobadoSinTransaccion(pedidoId);
      return;
    }
    console.error(err?.message || err);
    throw err;
  }
}

function esNotificacionTipoPago(req, body) {
  const b = body && typeof body === 'object' ? body : {};
  const q = req.query || {};
  if (b.type === 'payment' || b.topic === 'payment') return true;
  if (typeof b.action === 'string' && b.action.startsWith('payment.')) return true;
  if (q.topic === 'payment' || q.type === 'payment') return true;
  return false;
}

function extraerPaymentIdNotificacion(req) {
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  const q = req.query || {};
  let id = b.data?.id ?? b.id ?? (q.topic === 'payment' ? q.id : null) ?? (q.type === 'payment' ? q.id : null);
  if (id == null && typeof b.action === 'string' && b.action.startsWith('payment.') && b.data?.id != null) {
    id = b.data.id;
  }
  if (id == null) return null;
  const s = String(id).trim();
  return s.length ? s : null;
}

async function procesarPagoAprobadoPorId(paymentId) {
  const pagoInfo = await obtenerPago(paymentId);
  const { status, external_reference: pedidoId } = pagoInfo;
  if (status !== 'approved' || !pedidoId) return;
  await aplicarStockPorPagoAprobado(pedidoId);
}

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

    // Priorizar init_point para evitar fallos del sandbox (cookies/recargas).
    // Usar MP_USAR_SANDBOX=true en .env si quieres forzar sandbox.
    const usarSandbox = process.env.MP_USAR_SANDBOX === 'true';
    const initPoint = usarSandbox
      ? (mpPreference.sandbox_init_point || mpPreference.init_point)
      : (mpPreference.init_point || mpPreference.sandbox_init_point);

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
 * Soporta type/topic, action payment.*, e IPN antiguo por query.
 */
const webhookPago = async (req, res) => {
  try {
    const paymentId = extraerPaymentIdNotificacion(req);
    if (paymentId && esNotificacionTipoPago(req, req.body)) {
      try {
        await procesarPagoAprobadoPorId(paymentId);
      } catch (stockErr) {
        console.error('[pagos/webhook] Error al descontar stock:', stockErr?.message || stockErr);
        return res.status(500).send('Error');
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[pagos/webhook] Error:', error?.message || error);
    res.status(500).send('Error');
  }
};

/**
 * Llamar desde el front al volver del checkout (query payment_id de MP) con JWT del comprador.
 * Refuerzo si el webhook no llega o falla.
 */
const confirmarPagoMercadoPago = async (req, res, next) => {
  try {
    const paymentId =
      req.body?.paymentId ?? req.body?.payment_id ?? req.query?.payment_id ?? req.query?.paymentId;
    if (!paymentId) {
      return res.status(400).json({
        exito: false,
        mensaje:
          'Falta paymentId (id del pago en Mercado Pago, ej. payment_id en la URL de retorno)',
      });
    }
    const pagoInfo = await obtenerPago(String(paymentId));
    if (pagoInfo.status !== 'approved' || !pagoInfo.external_reference) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Pago no aprobado o sin external_reference',
      });
    }
    const pedido = await Pedido.findById(pagoInfo.external_reference).lean();
    if (!pedido) {
      return res.status(404).json({ exito: false, mensaje: 'Pedido no encontrado' });
    }
    if (pedido.usuario.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ exito: false, mensaje: 'No autorizado' });
    }
    await aplicarStockPorPagoAprobado(pagoInfo.external_reference);
    res.json({ exito: true, mensaje: 'Stock actualizado' });
  } catch (err) {
    if (String(err?.message || '').includes('[pagos/stock]')) {
      return res.status(409).json({ exito: false, mensaje: err.message });
    }
    next(err);
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
  confirmarPagoMercadoPago,
  crearPago,
  verificarPago
};
