const mongoose = require('mongoose');

const homePortadaSchema = new mongoose.Schema({
  clave: {
    type: String,
    default: 'portada',
    unique: true
  },
  imagenUrl: {
    type: String,
    default: null,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('HomePortada', homePortadaSchema);
