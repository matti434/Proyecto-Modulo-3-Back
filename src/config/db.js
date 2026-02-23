const mongoose = require('mongoose');
const config = require('./config');

let mongoServer = null;

const connectDB = async () => {
  try {
    let uri = config.mongoUri;
    const sinUriValida = !uri || uri.includes('TU_USUARIO') || uri.includes('TU_PASSWORD');

    // En producción (Render, etc.) MONGODB_URI es obligatorio
    if (config.nodeEnv === 'production' && sinUriValida) {
      console.error('❌ En producción debes configurar MONGODB_URI en las variables de entorno (ej. MongoDB Atlas).');
      process.exit(1);
    }

    // Si no hay URI (solo en desarrollo), usar MongoDB en memoria
    if (sinUriValida) {
      console.log('⚠️  No hay MONGODB_URI configurada, usando MongoDB en memoria...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('📦 MongoDB en memoria iniciado');
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado correctamente');

    // Si usamos memoria, cargar datos iniciales
    if (mongoServer) {
      await cargarDatosIniciales();
    }

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Datos iniciales para desarrollo
const cargarDatosIniciales = async () => {
  const { Usuario, Producto } = require('../models');

  try {
    // Verificar si ya hay datos
    const adminExistente = await Usuario.findOne({ role: 'admin' });
    if (adminExistente) {
      console.log('📋 Datos ya cargados');
      return;
    }

    console.log('🌱 Cargando datos iniciales...');

    // Crear admin (el modelo hashea la contraseña automáticamente)
    await Usuario.create({
      nombreDeUsuario: 'admin',
      email: 'admin@rollingmotors.com',
      password: 'Admin123!',
      pais: 'Argentina',
      fechaNacimiento: new Date('1990-01-01'),
      role: 'admin'
    });
    console.log('👤 Admin creado: admin@rollingmotors.com / Admin123!');

    // Crear usuario de prueba
    await Usuario.create({
      nombreDeUsuario: 'usuario_test',
      email: 'usuario@test.com',
      password: 'Usuario123!',
      pais: 'Argentina',
      fechaNacimiento: new Date('1995-05-15'),
      role: 'usuario'
    });
    console.log('👤 Usuario test creado: usuario@test.com / Usuario123!');

    // Crear productos de ejemplo (15+ por categoría para paginación)
    const { productosEjemplo } = require('../data/productosSeed');
    await Producto.insertMany(productosEjemplo);
    console.log(`📦 ${productosEjemplo.length} productos creados`);

    console.log('✅ Datos iniciales cargados correctamente');
    console.log('');
    console.log('📋 Credenciales de prueba:');
    console.log('   Admin: admin@rollingmotors.com / Admin123!');
    console.log('   Usuario: usuario@test.com / Usuario123!');
    console.log('');

  } catch (error) {
    console.error('❌ Error cargando datos iniciales:', error.message);
  }
};

// Cerrar conexión (útil para tests)
const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = connectDB;
module.exports.closeDB = closeDB;