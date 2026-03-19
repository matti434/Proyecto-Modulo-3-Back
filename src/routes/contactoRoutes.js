const express = require('express');
const router = express.Router();

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
  const { nombre, apellido, email, telefono, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ exito: false, mensaje: 'Faltan campos requeridos' });
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.CONTACTO_EMAIL || process.env.EMAIL_FROM,
      subject: `Contacto Rolling Motors - ${nombre} ${apellido || ''}`,
      html: `
        <p><strong>Nombre:</strong> ${nombre} ${apellido || ''}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono || 'No indicado'}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `
    });

    res.json({ exito: true, mensaje: 'Mensaje enviado correctamente' });
  } catch (err) {
    res.status(500).json({ exito: false, mensaje: err.message || 'Error al enviar' });
  }
});

module.exports = router;

const { enviarContacto } = require('../controllers/contactoController');

router.post('/', enviarContacto);

module.exports = router;
