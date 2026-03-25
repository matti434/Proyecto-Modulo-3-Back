const mongoose = require('mongoose');
const config = require('./config');

let mongoServer = null;

const connectDB = async () => {
  try {
    let uri = config.mongoUri;
    const sinUriValida = !uri || uri.includes('TU_USUARIO') || uri.includes('TU_PASSWORD');

    if (config.nodeEnv === 'production' && sinUriValida) {
      console.error('❌ En producción debes configurar MONGODB_URI en las variables de entorno (ej. MongoDB Atlas).');
      process.exit(1);
    }

 
    if (sinUriValida) {
      console.log('⚠️  No hay MONGODB_URI configurada, usando MongoDB en memoria...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('📦 MongoDB en memoria iniciado');
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado correctamente');

    // Si no hay admin (DB nueva o vacía), carga usuarios de prueba y productos del seed.
    // En producción (Render + Atlas) evita login 401 por colección usuarios vacía.
    await cargarDatosIniciales();

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};


const cargarDatosIniciales = async () => {
  const { Usuario, Producto } = require('../models');

  try {
   
    const adminExistente = await Usuario.findOne({ role: 'admin' });
    if (adminExistente) {
      console.log('📋 Datos ya cargados');
      return;
    }

    console.log('🌱 Cargando datos iniciales...');


    await Usuario.create({
      nombreDeUsuario: 'admin',
      email: 'admin@rollingmotors.com',
      password: 'Admin123!',
      pais: 'Argentina',
      fechaNacimiento: new Date('1990-01-01'),
      role: 'admin'
    });
    console.log('👤 Admin creado: admin@rollingmotors.com / Admin123!');

   
    await Usuario.create({
      nombreDeUsuario: 'usuario_test',
      email: 'usuario@test.com',
      password: 'Usuario123!',
      pais: 'Argentina',
      fechaNacimiento: new Date('1995-05-15'),
      role: 'usuario'
    });
    console.log('👤 Usuario test creado: usuario@test.com / Usuario123!');


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


const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = connectDB;
module.exports.closeDB = closeDB;