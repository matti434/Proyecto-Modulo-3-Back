const notFound = (req, res, next) => {
  res.status(404).json({
    message: "Recurso no encontrado",
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  res.status(statusCode).json({
    message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
