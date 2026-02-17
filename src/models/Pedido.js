const mongoose = require('mongoose');

const pedidoItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto'
  },
  nombre: String,
  marca: String,
  modelo: String,
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true
  }
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  items: [pedidoItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  envio: {
    type: Number,
    default: 0
  },
  descuento: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  direccionEnvio: {
    calle: String,
    ciudad: String,
    codigoPostal: String,
    pais: String
  },
  metodoPago: {
    type: String,
    default: 'pendiente'
  }
}, {
  timestamps: true
});

// Índice por usuario para búsquedas eficientes
pedidoSchema.index({ usuario: 1, createdAt: -1 });

module.exports = mongoose.model('Pedido', pedidoSchema);
