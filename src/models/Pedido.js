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

const pedidoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  items: [pedidoItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  envio: {
    type: Number,
    default: 0,
    min: 0
  },
  transaccionId: {
    type: String,
    default: () => `TXN-${Date.now()}`
  },
  impuestos: {
    type: Number,
    default: 0
  },
  estadoEnvio: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  fechaCompra: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Pedido', pedidoSchema);