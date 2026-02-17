const { Producto } = require("../Models");

// @desc    Obtener todos los productos
// @route   GET /api/productos
// @access  Public
const obtenerProducto = async (req, res, next) => {
  try {
    const {
      categoria,
      marca,
      destacado,
      stock,
      buscar,
      reciente,
      limite,
      precioMin,
      precioMax,
    } = req.query;

    let query = {};

    // filtros
    if (categoria) {
      query.categoria = { $regex: categoria, $options: "i" };
    }

    if (marca) {
    query.marca = { $regex: marca, $options: "i" };
  }

  if (destacado === "true") {
    query.destacado = true;
  }

  if (stock === "true") {
    query.stock = true;
  } else if (stock === "false") {
    query.stock = false;
  }

  // Rango de precio
  if (precioMin || precioMax) {
    query.precio = {};
    if (precioMin) query.precio.$gte = Number(precioMin);
    if (precioMax) query.precio.$lte = Number(precioMax);
  }

  // Busqueda por texto
  if (buscar) {
    query.$or = [
      { nombre: { $regex: buscar, $options: "i" } },
       { marca: { $regex: buscar, $options: "i" } },
        { modelo: { $regex: buscar, $options: "i" } },
        { descripcion: { $regex: buscar, $options: "i" } },
    ];
  }

  let queryBuilder = Producto.find(query);

  // Ordenar por recientes
  if (recientes === "true") {
    queryBuilder = queryBuilder.sort({ createAt: -1 });
  } else {
    queryBuilder = queryBuilder.sort({ destacado: -1, createdAt: -1 });
  }
  
   // Limitar resultados
    if (limite) {
      queryBuilder = queryBuilder.limit(Number(limite));
    }

    const productos = await queryBuilder;

    // Formatear respuesta para compatibilidad con frontend
    const productosResponse = productos.map((p) => ({
      _id: p._id,
      id: p._id,
      nombre: p.nombre,
      precio: p.precio,
      categoria: p.categoria,
      marca: p.marca,
      modelo: p.modelo,
      año: p.año,
      descripcion: p.descripcion,
      imagen: p.imagen,
      kilometros: p.kilometros,
      ubicacion: p.ubicacion,
      stock: p.stock,
      destacado: p.destacado,
      fechaCreacion: p.createdAt,
      fechaModificacion: p.updatedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.json(productosResponse);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener producto por ID
// @route   GET /api/productos/:id
// @access  Public
const obtenerProductoPorId = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: "Producto no encontrado",
      });
    }

    res.json({
      _id: producto._id,
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      marca: producto.marca,
      modelo: producto.modelo,
      año: producto.año,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      kilometros: producto.kilometros,
      ubicacion: producto.ubicacion,
      stock: producto.stock,
      destacado: producto.destacado,
      fechaCreacion: producto.createdAt,
      fechaModificacion: producto.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
