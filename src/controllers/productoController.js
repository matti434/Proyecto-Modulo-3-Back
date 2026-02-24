const { Producto } = require("../models");


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

  
    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = Number(precioMin);
      if (precioMax) query.precio.$lte = Number(precioMax);
    }

   
    if (buscar) {
      query.$or = [
        { nombre: { $regex: buscar, $options: "i" } },
        { marca: { $regex: buscar, $options: "i" } },
        { modelo: { $regex: buscar, $options: "i" } },
        { descripcion: { $regex: buscar, $options: "i" } },
      ];
    }

    let queryBuilder = Producto.find(query);

   
    if (reciente === "true") {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    } else {
      queryBuilder = queryBuilder.sort({ destacado: -1, createdAt: -1 });
    }

    
    if (limite) {
      queryBuilder = queryBuilder.limit(Number(limite));
    }

    const productos = await queryBuilder;

   
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


const crearProducto = async (req, res, next) => {
  try {
    const {
      nombre,
      precio,
      categoria,
      marca,
      modelo,
      año,
      descripcion,
      imagen,
      kilometros,
      ubicacion,
      stock,
      destacado,
    } = req.body;

    const km = Number(kilometros);
    const kilometrosValido = kilometros !== '' && kilometros !== undefined && kilometros !== null && !Number.isNaN(km) && km >= 0;

    const producto = await Producto.create({
      nombre,
      precio: Number(precio),
      categoria,
      marca,
      modelo,
      año: año ? Number(año) : undefined,
      descripcion,
      imagen,
      kilometros: kilometrosValido ? km : undefined,
      ubicacion,
      stock: stock !== undefined ? stock : true,
      destacado: destacado !== undefined ? destacado : false,
    });

    res.status(201).json({
      exito: true,
      mensaje: "Producto creado exitosamente",
      producto: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};


const actualizarProducto = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: "Producto no encontrado",
      });
    }

    const datosActualizar = { ...req.body };
    if (datosActualizar.precio !== undefined && datosActualizar.precio !== '') {
      datosActualizar.precio = Number(datosActualizar.precio);
    }
    if (datosActualizar.año !== undefined && datosActualizar.año !== '') {
      datosActualizar.año = Number(datosActualizar.año);
    }
    if ('kilometros' in datosActualizar) {
      const km = Number(datosActualizar.kilometros);
      if (datosActualizar.kilometros === '' || datosActualizar.kilometros == null || Number.isNaN(km) || km < 0) {
        delete datosActualizar.kilometros;
      } else {
        datosActualizar.kilometros = km;
      }
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      datosActualizar,
      { new: true, runValidators: true },
    );

    res.json({
      exito: true,
      mensaje: "Producto actualizado",
      producto: {
        _id: productoActualizado._id,
        id: productoActualizado._id,
        nombre: productoActualizado.nombre,
        precio: productoActualizado.precio,
        categoria: productoActualizado.categoria,
        marca: productoActualizado.marca,
        modelo: productoActualizado.modelo,
        año: productoActualizado.año,
        descripcion: productoActualizado.descripcion,
        imagen: productoActualizado.imagen,
        kilometros: productoActualizado.kilometros,
        ubicacion: productoActualizado.ubicacion,
        stock: productoActualizado.stock,
        destacado: productoActualizado.destacado,
        fechaModificacion: productoActualizado.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const eliminarProducto = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: "Producto no encontrado",
      });
    }

    await Producto.findByIdAndDelete(req.params.id);

    res.json({
      exito: true,
      mensaje: "Producto eliminado",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerProducto,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
