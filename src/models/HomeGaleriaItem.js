const mongoose = require('mongoose');

const homeGaleriaItemSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'La URL de la imagen es requerida'],
    trim: true
  },
  texto: {
    type: String,
    default: '',
    trim: true
  },
  orden: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('HomeGaleriaItem', homeGaleriaItemSchema);
