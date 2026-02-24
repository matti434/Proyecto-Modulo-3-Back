const multer = require('multer');
const path = require('path');

const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mimetypeOk = TIPOS_PERMITIDOS.includes(file.mimetype);
  const ext = path.extname(file.originalname || '').toLowerCase();
  const extOk = EXTENSIONES.includes(ext);
  if (mimetypeOk && extOk) {
    return cb(null, true);
  }
  cb(new Error('Formato de imagen no válido. Use JPEG, PNG, GIF o WebP.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: TAMANO_MAXIMO }
});

const uploadSingleImagen = (fieldName = 'imagen') => upload.single(fieldName);

const middlewareTamano = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ mensaje: 'El archivo es demasiado grande. Máximo 5 MB.' });
    }
  }
  if (err && err.message && err.message.includes('Formato de imagen')) {
    return res.status(400).json({ mensaje: err.message });
  }
  next(err);
};

module.exports = {
  uploadSingleImagen,
  middlewareTamano,
  TAMANO_MAXIMO,
  TIPOS_PERMITIDOS
};
