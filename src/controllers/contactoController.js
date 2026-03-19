const { enviarMensajeContacto } = require('../utils/email');

const enviarContacto = async (req, res) => {
  try {
    const { nombre, apellido, telefono, email, mensaje } = req.body;

    if (!nombre || !apellido || !email || !mensaje) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Faltan campos requeridos (nombre, apellido, email, mensaje)'
      });
    }

    await enviarMensajeContacto({
      nombre: String(nombre).trim(),
      apellido: String(apellido).trim(),
      telefono: telefono ? String(telefono).trim() : '',
      email: String(email).trim(),
      mensaje: String(mensaje).trim()
    });

    res.status(200).json({
      exito: true,
      mensaje: 'Mensaje enviado correctamente'
    });
  } catch (error) {
    console.error('[contacto] Error al enviar mensaje:', error?.message || error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al enviar el mensaje'
    });
  }
};

module.exports = { enviarContacto };
