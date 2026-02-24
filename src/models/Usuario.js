const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombreDeUsuario: {
        type: String,
        required: [true, 'El nombre de usuario es requerido'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false
    },
    pais: {
        type: String,
        trim: true
    },
    fechaNacimiento: {
        type: Date
    },
    role: {
        type: String,
        enum: ['usuario', 'admin'],
        default: 'usuario'
    },
    suspendido: {
        type: Boolean,
        default: false
    },
    fechaSuspension: {
        type: Date,
        default: null
    },
    codigoRecuperacion: {
        type: String,
        default: null,
        select: false
    },
    codigoRecuperacionExpira: {
        type: Date,
        default: null,
        select: false
    }

}, {
    timestamps: true
});


usuarioSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};


usuarioSchema.methods.esAdmin = function () {
    return this.role === 'admin';
};


usuarioSchema.methods.estaSuspendido = function () {
    return this.suspendido === true;
};

module.exports = mongoose.model('Usuario', usuarioSchema);
