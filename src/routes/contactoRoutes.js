const express = require('express');
const router = express.Router();
const { enviarContacto } = require('../controllers/contactoController');

router.post('/', enviarContacto);

module.exports = router;
