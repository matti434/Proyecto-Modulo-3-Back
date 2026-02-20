const { uploadToCloudinary } = require('../utils/cloudinary');

const subirImagen = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se envió ninguna imagen',
      });
    }
    const folder = req.body.folder || 'productos';
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, folder);
    res.status(200).json({
      exito: true,
      imagen: url,
      publicId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { subirImagen };