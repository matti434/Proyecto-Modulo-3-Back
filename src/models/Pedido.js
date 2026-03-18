const mongoose = require('mongoose');

const pedidoItemSchema = new mongoose.Schema({
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true
  }
}, { _id: true });

const pedidoSchema = new mongoose.Schema({}, {
  timestamps: true
});

module.exports = mongoose.model('Pedido', pedidoSchema);