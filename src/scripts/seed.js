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

const productosEjemplo = [
  {
    nombre: 'Royal Enfield Hunter 350',
    precio: 4500000,
    categoria: 'Motos',
    marca: 'Royal Enfield',
    modelo: 'Hunter 350',
    año: 2024,
    descripcion: 'La Hunter 350 combina estilo retro con tecnología moderna. Motor de 349cc refrigerado por aire.',
    imagen: '/Galeria/RE-HNTR-350-2-1024x682.jpeg',
    kilometros: 0,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: true
  },
  {
    nombre: 'Royal Enfield Classic 350',
    precio: 5200000,
    categoria: 'Motos',
    marca: 'Royal Enfield',
    modelo: 'Classic 350',
    año: 2024,
    descripcion: 'El modelo icónico de Royal Enfield. Estilo clásico británico con motor J-Series.',
    imagen: '/Galeria/Royal_Enfield_1177.jpg',
    kilometros: 0,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: true
  },
  {
    nombre: 'Royal Enfield Meteor 350',
    precio: 5800000,
    categoria: 'Motos',
    marca: 'Royal Enfield',
    modelo: 'Meteor 350',
    año: 2023,
    descripcion: 'Cruiser accesible con motor de 349cc. Perfecta para viajes largos.',
    imagen: '/Productos/imgCard.jpg',
    kilometros: 0,
    ubicacion: 'Córdoba',
    stock: true,
    destacado: false
  },
  {
    nombre: 'Royal Enfield Scram 411',
    precio: 6500000,
    categoria: 'Motos',
    marca: 'Royal Enfield',
    modelo: 'Scram 411',
    año: 2024,
    descripcion: 'ADV urbana basada en la Himalayan. Motor de 411cc para aventuras.',
    imagen: '/Royal_Enfield_Scra.jpg',
    kilometros: 0,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: true
  },
  {
    nombre: 'Casco Royal Enfield Original',
    precio: 180000,
    categoria: 'Cascos',
    marca: 'Royal Enfield',
    modelo: 'Open Face',
    año: 2024,
    descripcion: 'Casco oficial Royal Enfield. Certificación DOT. Estilo vintage.',
    imagen: '/Productos/ImgCascos.jpg',
    kilometros: null,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: true
  },
  {
    nombre: 'Casco Integral RE',
    precio: 250000,
    categoria: 'Cascos',
    marca: 'Royal Enfield',
    modelo: 'Full Face',
    año: 2024,
    descripcion: 'Casco integral con visor antirayaduras. Máxima protección.',
    imagen: '/Productos/ImgCascos.jpg',
    kilometros: null,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: false
  },
  {
    nombre: 'Campera de Cuero RE',
    precio: 350000,
    categoria: 'Indumentaria',
    marca: 'Royal Enfield',
    modelo: 'Leather Jacket',
    año: 2024,
    descripcion: 'Campera de cuero genuino con protecciones. Estilo clásico motociclista.',
    imagen: '/Productos/ImgIndumentaria.jpg',
    kilometros: null,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: false
  },
  {
    nombre: 'Guantes de Cuero',
    precio: 85000,
    categoria: 'Indumentaria',
    marca: 'Royal Enfield',
    modelo: 'Classic Gloves',
    año: 2024,
    descripcion: 'Guantes de cuero premium. Protección en nudillos.',
    imagen: '/Productos/ImgIndumentaria.jpg',
    kilometros: null,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: false
  },
  {
    nombre: 'Kit de Herramientas',
    precio: 45000,
    categoria: 'Accesorios',
    marca: 'Royal Enfield',
    modelo: 'Tool Kit',
    año: 2024,
    descripcion: 'Kit de herramientas esencial para tu Royal Enfield.',
    imagen: '/Productos/ImgTaller.jpg',
    kilometros: null,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: false
  },
  {
    nombre: 'Alforjas de Cuero',
    precio: 220000,
    categoria: 'Accesorios',
    marca: 'Royal Enfield',
    modelo: 'Leather Bags',
    año: 2024,
    descripcion: 'Par de alforjas de cuero genuino. Perfectas para viajes.',
    imagen: '/Productos/imgCard2.jpg',
    kilometros: null,
    ubicacion: 'Buenos Aires',
    stock: true,
    destacado: true
  }
];

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
          email: 'admin2@rollingmotors.com',
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
