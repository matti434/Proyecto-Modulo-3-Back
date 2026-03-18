const { Pedido, Carrito } = require('../models');


const crearPedido = async (req, res, next) => {
  try {
    const { items, subtotal, envio } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El carrito está vacío'
      });
    }

    const itemsValidados = items.map(item => ({
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

    res.status(201).json({
      exito: true,
      transaccionId: pedido.transaccionId,
      mensaje: 'Pedido creado correctamente'
    });
  } catch (error) {
    next(error);
  }
};


const obtenerPedidos = async (req, res, next) => {
  try {
    const todos = req.query.todos === 'true';
    const query = todos ? {} : { usuario: req.usuario._id };

    const pedidos = await Pedido.find(query)
      .populate('items.productoId', 'nombre precio imagen')
      .sort({ createdAt: -1 })
      .lean();

    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};


const obtenerPedidoPorId = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('items.productoId', 'nombre precio imagen')
      .lean();

    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }

    const esAdmin = req.usuario?.rol === 'admin';
    if (!esAdmin && pedido.usuario?.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para ver este pedido'
      });
    }

    res.json(pedido);
  } catch (error) {
    next(error);
  }
};


const actualizarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        exito: false,
        mensaje: `Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`
      });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    ).lean();

    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }

    res.json({
      exito: true,
      mensaje: 'Estado actualizado',
      pedido
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerPedidos,
  obtenerPedidoPorId,
  crearPedido,
  actualizarEstado
};
