const { Carrito, Producto } = require('../Models');


const obtenerCarrito = async (req, res, next) => {
  try {
    let carrito = await Carrito.findOne({ usuario: req.usuario._id })
      .populate('items.producto', 'nombre precio imagen marca modelo stock');

    if (!carrito) {
      carrito = await Carrito.create({
        usuario: req.usuario._id,
        items: []
      });
    }

    const itemsFormateados = carrito.items.map(item => ({
      _id: item._id,
      id: item._id,
      producto: item.producto,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.cantidad * item.precioUnitario
    }));

    res.json({
      _id: carrito._id,
      items: itemsFormateados,
      total: carrito.total,
      cantidadTotal: carrito.cantidadTotal
    });

  } catch (error) {
    next(error);
  }
};


const agregarItem = async (req, res, next) => {
  try {
    const { productoId, cantidad = 1 } = req.body;

    const producto = await Producto.findById(productoId);

    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Producto no encontrado'
      });
    }

    if (!producto.stock) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Producto sin stock disponible'
      });
    }

    let carrito = await Carrito.findOne({ usuario: req.usuario._id });

    if (!carrito) {
      carrito = await Carrito.create({
        usuario: req.usuario._id,
        items: []
      });
    }

    const itemIndex = carrito.items.findIndex(
      item => item.producto.toString() === productoId
    );

    if (itemIndex > -1) {
      carrito.items[itemIndex].cantidad += cantidad;
    } else {
      carrito.items.push({
        producto: productoId,
        cantidad,
        precioUnitario: producto.precio
      });
    }

    await carrito.save();

    res.json({
      exito: true,
      mensaje: 'Producto agregado al carrito'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar cantidad de item
 * @route   PUT /api/carrito/:itemId
 * @access  Private
 */
const actualizarCantidad = async (req, res, next) => {
  try {
    const { cantidad } = req.body;
    const { itemId } = req.params;

    if (cantidad < 1) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La cantidad mínima es 1'
      });
    }

    const carrito = await Carrito.findOne({ usuario: req.usuario._id });

    if (!carrito) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Carrito no encontrado'
      });
    }

    const item = carrito.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Item no encontrado en el carrito'
      });
    }

    item.cantidad = cantidad;
    await carrito.save();

    res.json({
      exito: true,
      mensaje: 'Cantidad actualizada'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerCarrito,
  agregarItem,
  actualizarCantidad
};

