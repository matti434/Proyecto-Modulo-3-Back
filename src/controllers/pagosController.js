const { Pedido, Carrito } = require('../models');

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
    res.status(500).json({
      exito: false,
      mensaje: error?.message || 'Error al crear el pago'
    });
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

    res.json({
      exito: true,
      transaccionId: pedido.transaccionId || pedido._id.toString(),
      estado: pedido.estado,
      pedido
    });
  } catch (error) {
    console.error('[pagos/verificar] Error:', error?.message || error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al verificar la transacción'
    });
  }
};

module.exports = {
  crearPago,
  verificarPago
};
