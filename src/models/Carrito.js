const mongoose = require('mongoose');

const carritoItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: [1, 'La cantidad mínima es 1'],
    default: 1
  },
  precioUnitario: {
    type: Number,
    required: true
  }
}, { _id: true });

const carritoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  items: [carritoItemSchema]
}, {
  timestamps: true
});


carritoSchema.virtual('total').get(function() {
  return this.items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
});


carritoSchema.virtual('cantidadTotal').get(function() {
  return this.items.reduce((sum, item) => sum + item.cantidad, 0);
});


carritoSchema.set('toJSON', { virtuals: true });
carritoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Carrito', carritoSchema);
