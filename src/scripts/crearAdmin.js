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

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Datos del administrado (puedes modificarlos)
const adminData = {
    nombreDeUsuario: 'admin',
    email: 'admin@rollingmotors.com',
    password: 'Admin123!', // Cambia esta contraseña 
    pais: 'Argentina',
    fechaNacimiento: new Date('1990-01-01'),
    role: 'admin'
};

async function crearAdmin() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existe un admin
        const adminExistente = await Usuario.findOne({ role: 'admin' });
        if (adminExistente) {
             console.log('⚠️  Ya existe un administrador:');
            console.log(`   Email: ${adminExistente.email}`);
            console.log(`   Usuario: ${adminExistente.nombreDeUsuario}`);
            process.exit(0);
        }
        
        // Verificar si el email o usuario ya existen
        const emailExistente = await Usuario.findOne({ email: adminData.email });
        if (emailExistente) {
             console.log(`⚠️  El email ${adminData.email} ya está en uso`);
            process.exit(1);
        }

        const usuarioExistente = await Usuario.findOne({ nombreDeUsuario: adminData.nombreDeUsuario });
        if (usuarioExistente) {
            console.log(`⚠️  El nombre de usuario ${adminData.nombreDeUsuario} ya está en uso`);
            process.exit(1);
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Crear admin 
        const nuevoAdmin = new Usuario({
            ...adminData,
            password: hashedPassword
        });

        await nuevoAdmin.save();

        console.log('');
        console.log('✅ Administrador creado exitosamente!');
        console.log('');
        console.log('📋 Credenciales:');
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Usuario: ${adminData.nombreDeUsuario}`);
        console.log(`   Contraseña: ${adminData.password}`);
        console.log('');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

crearAdmin();