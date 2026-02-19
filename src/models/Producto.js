const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  marca: {
    type: String,
    trim: true
  },
  modelo: {
    type: String,
    trim: true
  },
  año: {
    type: Number
  },
  descripcion: {
    type: String,
    trim: true
  },
  imagen: {
    type: String,
    trim: true
  },
  kilometros: {
    type: Number,
    min: [0, 'Los kilómetros no pueden ser negativos']
  },
  ubicacion: {
    type: String,
    trim: true
  },
  stock: {
    type: Boolean,
    default: true
  },
  destacado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
productoSchema.index({ categoria: 1 });
productoSchema.index({ marca: 1 });
productoSchema.index({ destacado: 1 });
productoSchema.index({ stock: 1 });
productoSchema.index({ nombre: 'text', descripcion: 'text', marca: 'text', modelo: 'text' });

module.exports = mongoose.model('Producto', productoSchema);
