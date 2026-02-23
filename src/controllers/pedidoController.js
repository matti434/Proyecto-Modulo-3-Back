const { Pedido } = require('../models');

const ESTADOS_VALIDOS = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
const AÑO_MIN = 1930;
const AÑO_MAX = 2025;

// @desc    Crear pedido
// @route   POST /api/pedidos
// @body    { titulo, descripcion, fecha }
const crearPedido = async (req, res, next) => {
  try {
    const { titulo, descripcion, fecha } = req.body;

    if (!titulo || typeof titulo !== 'string') {
      return res.status(400).json({
        exito: false,
        mensaje: 'El título es requerido'
      });
    }
    const tituloTrim = titulo.trim();
    if (tituloTrim.length > 30) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El título no puede superar 30 caracteres'
      });
    }

    if (!descripcion || typeof descripcion !== 'string') {
      return res.status(400).json({
        exito: false,
        mensaje: 'La descripción es requerida'
      });
    }
    const descripcionTrim = descripcion.trim();
    if (descripcionTrim.length > 150) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La descripción no puede superar 150 caracteres'
      });
    }

    if (fecha === undefined || fecha === null) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La fecha es requerida'
      });
    }
    const fechaDate = new Date(fecha);
    if (Number.isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La fecha no es válida'
      });
    }
    const año = fechaDate.getFullYear();
    if (año < AÑO_MIN || año > AÑO_MAX) {
      return res.status(400).json({
        exito: false,
        mensaje: `La fecha debe tener un año entre ${AÑO_MIN} y ${AÑO_MAX}`
      });
    }

    const pedido = await Pedido.create({
      titulo: tituloTrim,
      descripcion: descripcionTrim,
      fecha: fechaDate
    });

    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
};

// @desc    Listado de pedidos
// @route   GET /api/pedidos?todos=true
// @query   todos=true para listar todos
const obtenerPedidos = async (req, res, next) => {
  try {
    const todos = req.query.todos === 'true';
    const query = todos ? {} : {}; // mismo listado; el param todos=true indica que se pide el listado

    const pedidos = await Pedido.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener pedido por ID
// @route   GET /api/pedidos/:id
const obtenerPedidoPorId = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id).lean();

    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }

    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar estado del pedido
// @route   PUT /api/pedidos/:id/estado
// @body    { estado } (pendiente, procesando, enviado, entregado, cancelado)
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
