require('dotenv').config();

module.exports = {
    port: process.env.port || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};