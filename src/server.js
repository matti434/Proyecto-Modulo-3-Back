const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/config');

const startServer = async () => {
    try {
   
        await connectDB();

       
        app.listen(config.port, () => {
            console.log('=========================================');
            console.log(`🚀 Servidor corriendo en puerto ${config.port}`);
            console.log(`📦 Ambiente: ${config.nodeEnv}`);
            console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
            console.log('=========================================');
            console.log('Endpoints disponibles:');
            console.log('  POST   /api/auth/registro');
            console.log('  POST   /api/auth/login');
            console.log('  GET    /api/auth/perfil');
            console.log('  GET    /api/productos');
            console.log('  GET    /api/productos/:id');
            console.log('  POST   /api/productos (admin)');
            console.log('  PUT    /api/productos/:id (admin)');
            console.log('  DELETE /api/productos/:id (admin)');
            console.log('  GET    /api/carrito');
            console.log('  POST   /api/carrito');
            console.log('  GET    /api/usuarios (admin)');
            console.log('  GET    /api/pedidos');
            console.log('  GET    /api/home');
            console.log('  POST   /api/home/portada/upload (admin)');
            console.log('  POST   /api/home/galeria (admin)');
            console.log('  PUT    /api/home/galeria/:id (admin)');
            console.log('  POST   /api/home/galeria/:id/imagen (admin)');
            console.log('  DELETE /api/home/galeria/:id (admin)');
            console.log('=========================================');
        });
    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

startServer();

