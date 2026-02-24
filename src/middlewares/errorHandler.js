const config = require('../config/config');

class AppError extends Error {
  constructor(message, statusCode){
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

 
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err);
  }

  
  if (err.name === 'CastError') {
    error = new AppError('Recurso no encontrado', 404);
  }

  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`El ${field} ya está en uso`, 400);
  }


  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = new AppError(messages.join('. '), 400);
  }

  
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('El archivo es demasiado grande. Máximo 5 MB.', 413);
  }
  if (err.message && err.message.includes('Formato de imagen')) {
    error = new AppError(err.message, 400);
  }


  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token inválido', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expirado', 401);
  }

  res.status(error.statusCode || 500).json({
    exito: false,
    mensaje: error.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  res.status(404).json({
    exito: false,
    mensaje: `Ruta no encontrada: ${req.originalUrl}`
  });
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
};
