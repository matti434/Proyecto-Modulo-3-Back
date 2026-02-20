const cloudinary = require('../config/cloudinary');

/*
 
Sube un archivo (buffer) a Cloudinary.
@param {Buffer} fileBuffer - Contenido del archivo en memoria
@param {string} folder - Carpeta en Cloudinary (ej: 'productos')
@returns {Promise<{url: string, publicId: string}>}
*/
const uploadToCloudinary = async (fileBuffer, folder = 'productos') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Error eliminando de Cloudinary:', err.message);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
