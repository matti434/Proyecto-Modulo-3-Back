const { Pedido, Carrito } = require('../models');

// @desc    Obtener pedidos del usuario
// @route   GET /api/pedidos
// @access  Private
const obtenerPedidos = async (req, res, next) => {
  try {
    let query = { usuario: req.usuario._id };

    // Si es admin y pide todos
    if (req.usuario.role === 'admin' && req.query.todos === 'true') {
      query = {};
    }

    const pedidos = await Pedido.find(query)
      .populate('usuario', 'nombreDeUsuario email')
      .sort({ createdAt: -1 });

    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener pedido por ID
// @route   GET /api/pedidos/:id
// @access  Private
const obtenerPedidoPorId = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('usuario', 'nombreDeUsuario email')
      .populate('items.producto', 'nombre imagen');

    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }

    // Verificar que el pedido pertenece al usuario o es admin
    if (pedido.usuario._id.toString() !== req.usuario._id.toString() && req.usuario.role !== 'admin') {
      return res.status(403).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

// @desc    Crear pedido desde carrito
// @route   POST /api/pedidos
// @access  Private
const crearPedido = async (req, res, next) => {
  try {
    const { direccionEnvio, metodoPago, descuento = 0 } = req.body;

    if (typeof descuento !== 'number' || descuento < 0 || desceunto > 100) {
      return res.status(400).json({
        exito : false,
        mensaje: 'El descuento debe ser un porcentaje entre 0 y 100'
      });
    }

    // Obtener carrito
    const carrito = await Carrito.findOne({ usuario: req.usuario._id })
      .populate('items.producto', 'nombre marca modelo precio imagen');

    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El carrito está vacío'
      });
    }

    const itemsValidos = carrito.items.filter(item => item.producto != null);
    if (itemsValidos.length === 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No hay productos validos en el carrito. Algunos pueden haber sido eliminiados.'
      });
    }
    if (itemsValidos.length < carrito.items.length) {
      carrito.items = itemsValidos;
      await carrito.save();
    }

    // Calcular totales
    const subtotal = carrito.items.reduce(
      (sum, item) => sum + (item.precioUnitario * item.cantidad),
      0
    );
    const envio = subtotal > 0 ? 1500 : 0; // Costo de envío fijo
    const descuentoMonto = (subtotal * descuento) / 100;
    const total = subtotal + envio - descuentoMonto;

    // Crear items del pedido
    const itemsPedido = carrito.items.map(item => ({
      producto: item.producto._id,
      nombre: item.producto.nombre,
      marca: item.producto.marca,
      modelo: item.producto.modelo,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario
    }));

    // Crear pedido
    const pedido = await Pedido.create({
      usuario: req.usuario._id,
      items: itemsPedido,
      subtotal,
      envio,
      descuento: descuentoMonto,
      total,
      direccionEnvio,
      metodoPago
    });

    // Vaciar carrito
    carrito.items = [];
    await carrito.save();

    res.status(201).json({
      exito: true,
      mensaje: 'Pedido creado exitosamente',
      pedido
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar estado del pedido
// @route   PUT /api/pedidos/:id/estado
// @access  Admin
const actualizarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Estado inválido'
      });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

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
