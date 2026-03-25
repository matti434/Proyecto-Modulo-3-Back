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

    required: true,
    min: 0
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
    required: true,
    min: 0
  },
  envio: {
    type: Number,
    default: 0,
    min: 0
  },
  impuestos: {
    type: Number,
    default: 0,
    min: 0
  },
  transaccionId: {
    type: String,
    unique: true,
    sparse: true
  },
  estado: {

    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  /** IDs de pago MP que ya descontaron stock (evita doble descuento: webhook + confirmar + verificar). */
  pagosMercadoPagoProcesados: {
    type: [String],
    default: []
  },
  fechaCompra: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


pedidoSchema.pre('save', async function () {
  if (this.isNew && !this.transaccionId) {
    this.transaccionId = this._id.toString();
  }
});

module.exports = mongoose.model('Pedido', pedidoSchema);

