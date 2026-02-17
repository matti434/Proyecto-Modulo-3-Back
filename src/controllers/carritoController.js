const { Carrito, Producto } = require('../Models');

/**
 * @desc    Obtener carrito del usuario
 * @route   GET /api/carrito
 * @access  Private
 */
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
      producto: item.producto
        ? {
            _id: item.producto._id,
            id: item.producto._id,
            nombre: item.producto.nombre,
            precio: item.producto.precio,
            imagen: item.producto.imagen,
            marca: item.producto.marca,
            modelo: item.producto.modelo,
            stock: item.producto.stock
          }
        : null,
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

module.exports = {
  obtenerCarrito
};
