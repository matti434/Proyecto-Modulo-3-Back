const cloudinary = require('../config/cloudinary');
const { HomePortada, HomeGaleriaItem } = require('../models');

const subirImagenCloudinary = (buffer, mimetype) => {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(dataUri, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};

// GET /api/home - Público
const obtenerContenidoHome = async (req, res, next) => {
  try {
    const [portadaDoc, galeriaItems] = await Promise.all([
      HomePortada.findOne({ clave: 'portada' }).lean(),
      HomeGaleriaItem.find({}).sort({ orden: 1, createdAt: 1 }).lean()
    ]);

    const imagenUrl = (portadaDoc && portadaDoc.imagenUrl) ? String(portadaDoc.imagenUrl) : '';
    const galeria = galeriaItems.map((item) => ({
      id: item._id.toString(),
      url: item.url,
      texto: item.texto || ''
    }));

    res.status(200).json({
      galeria,
      portada: { imagenUrl }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/home/portada/upload - Admin
const subirPortada = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ mensaje: 'No se envió ninguna imagen.' });
    }
    const result = await subirImagenCloudinary(req.file.buffer, req.file.mimetype);
    const imagenUrl = result.secure_url;

    await HomePortada.findOneAndUpdate(
      { clave: 'portada' },
      { imagenUrl },
      { upsert: true, new: true }
    );

    res.status(200).json({ imagenUrl });
  } catch (error) {
    if (error.http_code) {
      return res.status(error.http_code >= 400 ? error.http_code : 500).json({
        mensaje: error.message || 'Error al subir la imagen a Cloudinary.'
      });
    }
    next(error);
  }
};

// POST /api/home/galeria - Admin
const agregarItemGaleria = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ mensaje: 'No se envió ninguna imagen.' });
    }
    const texto = (req.body && req.body.texto) ? String(req.body.texto).trim() : '';
    const result = await subirImagenCloudinary(req.file.buffer, req.file.mimetype);
    const url = result.secure_url;

    const maxOrden = await HomeGaleriaItem.findOne({}).sort({ orden: -1 }).select('orden').lean();
    const orden = (maxOrden && maxOrden.orden != null) ? maxOrden.orden + 1 : 0;

    const item = await HomeGaleriaItem.create({ url, texto, orden });

    res.status(201).json({
      item: {
        id: item._id.toString(),
        url: item.url,
        texto: item.texto || ''
      }
    });
  } catch (error) {
    if (error.http_code) {
      return res.status(error.http_code >= 400 ? error.http_code : 500).json({
        mensaje: error.message || 'Error al subir la imagen a Cloudinary.'
      });
    }
    next(error);
  }
};

// PUT /api/home/galeria/:id - Admin
const actualizarTextoGaleria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;
    const item = await HomeGaleriaItem.findByIdAndUpdate(
      id,
      { texto: texto != null ? String(texto).trim() : '' },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ mensaje: 'Ítem de galería no encontrado.' });
    }
    res.status(200).json({
      item: {
        id: item._id.toString(),
        url: item.url,
        texto: item.texto || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/home/galeria/:id/imagen - Admin
const reemplazarImagenGaleria = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ mensaje: 'No se envió ninguna imagen.' });
    }
    const item = await HomeGaleriaItem.findById(id);
    if (!item) {
      return res.status(404).json({ mensaje: 'Ítem de galería no encontrado.' });
    }
    const result = await subirImagenCloudinary(req.file.buffer, req.file.mimetype);
    item.url = result.secure_url;
    await item.save();

    res.status(200).json({
      item: {
        id: item._id.toString(),
        url: item.url,
        texto: item.texto || ''
      }
    });
  } catch (error) {
    if (error.http_code) {
      return res.status(error.http_code >= 400 ? error.http_code : 500).json({
        mensaje: error.message || 'Error al subir la imagen a Cloudinary.'
      });
    }
    next(error);
  }
};

// DELETE /api/home/galeria/:id - Admin
const eliminarItemGaleria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await HomeGaleriaItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ mensaje: 'Ítem de galería no encontrado.' });
    }
    res.status(200).json({ mensaje: 'Ítem eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerContenidoHome,
  subirPortada,
  agregarItemGaleria,
  actualizarTextoGaleria,
  reemplazarImagenGaleria,
  eliminarItemGaleria
};
