const products = [
  { id: 1, name: 'Producto 1', price: 100 },
  { id: 2, name: 'Producto 2', price: 200 }
];

const getProducts = (req, res, next) => {
  try {
    res.json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts
};
