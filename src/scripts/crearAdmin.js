/** * Script para crear el primer usuario administrador 
 * Ejecutar con: npm run crear-admin 
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

// Modelo de Usuario (simplificado para el script)
const usuarioSchema = new mongoose.Schema({
    nombreDeUsuario: { type: String, require: true, unique: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    pais: String,
    fechaNacimiento: Date,
    role: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
    suspendido: { type: Boolean, default: false }
}, { timestamps: true });