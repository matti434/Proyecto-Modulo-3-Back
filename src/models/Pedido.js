const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [30, 'El título no puede superar 30 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [150, 'La descripción no puede superar 150 caracteres']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    validate: {
      validator: function (v) {
        if (!v) return false;
        const año = v instanceof Date ? v.getFullYear() : new Date(v).getFullYear();
        return año >= 1930 && año <= 2025;
      },
      message: 'La fecha debe tener un año entre 1930 y 2025'
    }
  },
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pedido', pedidoSchema);
