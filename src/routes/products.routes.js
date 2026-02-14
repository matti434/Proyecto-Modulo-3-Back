const express = require('express');
const { getProducts } = require('../controllers/products.controller');

const router = express.Router();

router.get('/', getProducts);

module.exports = router;
