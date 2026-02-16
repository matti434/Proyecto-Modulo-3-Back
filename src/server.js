const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/config');

const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();

 
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
