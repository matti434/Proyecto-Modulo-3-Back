const multer = require('multer');
const path = require('path');


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetypeOk = allowed.test(file.mimetype);
  const extOk = allowed.test(ext);
  if (mimetypeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error('Solo imágenes (jpeg, jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// Un solo archivo en el campo 'imagen'
const uploadSingleImage = upload.single('imagen');

module.exports = {
  uploadSingleImage,
  upload,
};