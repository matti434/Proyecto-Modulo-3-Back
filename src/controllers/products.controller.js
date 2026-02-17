const { Producto } = require('../Models');

const getProducts = async (req, res, next) => {
  try {
    const { categoria, destacado, limite } = req.query;
    const query = {};
    if (categoria) query.categoria = new RegExp(categoria, 'i');
    if (destacado === 'true') query.destacado = true;

    let builder = Producto.find(query);
    if (limite) builder = builder.limit(Number(limite));
    const products = await builder.lean();

    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Producto.findById(req.params.id).lean();
    if (!product) {
      const err = new Error('Producto no encontrado');
      err.statusCode = 404;
      return next(err);
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Producto.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};
