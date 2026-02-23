/**
 * Script para cargar datos iniciales en la base de datos
 * Usar cuando tengas MongoDB Atlas configurado
 * 
 * Ejecutar con: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/config');

// Importar modelos después de conectar
let Usuario, Producto;

const { productosEjemplo } = require('../data/productosSeed');

async function seed() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    if (!config.mongoUri || config.mongoUri.includes('TU_USUARIO')) {
      console.error('❌ Error: Configura MONGODB_URI en tu archivo .env');
      console.log('   Este script es para cargar datos en MongoDB Atlas');
      console.log('   Para desarrollo local, solo ejecuta "npm run dev"');
      process.exit(1);
    }

    await mongoose.connect(config.mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Importar modelos después de conectar
    const models = require('../models');    
    Usuario = models.Usuario;
    Producto = models.Producto;

    // Preguntar antes de limpiar datos existentes
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('⚠️  ¿Quieres limpiar los datos existentes? (s/N): ', async (respuesta) => {
      if (respuesta.toLowerCase() === 's') {
        await Usuario.deleteMany({});
        await Producto.deleteMany({});
        console.log('🗑️  Datos anteriores eliminados');
      }

      // Crear admin
      const adminExistente = await Usuario.findOne({ email: 'admin@rollingmotors.com' });
      if (!adminExistente) {
        // Contraseña en texto plano: el modelo Usuario la hashea en pre('save')
        await Usuario.create({
          nombreDeUsuario: 'admin',
          email: 'admin@rollingmotors.com',
          password: 'Admin123!',
          pais: 'Argentina',
          fechaNacimiento: new Date('1990-01-01'),
          role: 'admin'
        });
        console.log('👤 Admin creado');
      } else {
        console.log('👤 Admin ya existe');
      }

      // Crear usuario de prueba
      const userExistente = await Usuario.findOne({ email: 'usuario@test.com' });
      if (!userExistente) {
        await Usuario.create({
          nombreDeUsuario: 'usuario_test',
          email: 'usuario@test.com',
          password: 'Usuario123!',
          pais: 'Argentina',
          fechaNacimiento: new Date('1995-05-15'),
          role: 'usuario'
        });
        console.log('👤 Usuario de prueba creado');
      }

      // Crear productos
      const productosExistentes = await Producto.countDocuments();
      if (productosExistentes === 0) {
        await Producto.insertMany(productosEjemplo);
        console.log(`📦 ${productosEjemplo.length} productos creados`);
      } else {
        console.log(`📦 Ya hay ${productosExistentes} productos en la base de datos`);
      }

      console.log('');
      console.log('✅ Seed completado!');
      console.log('');
      console.log('📋 Credenciales de prueba:');
      console.log('   Admin: admin@rollingmotors.com / Admin123!');
      console.log('   Usuario: usuario@test.com / Usuario123!');
      console.log('');

      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  }
}

seed();
