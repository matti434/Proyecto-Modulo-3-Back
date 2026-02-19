const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function enviarCodigoRecuperacion(emailDestino, codigo) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailDestino,
        subject: 'Código para recuperar tu contraseña',
        text: `Tu código es: ${codigo}. Válido por 15 minutos.`,
        html: `<p>Tu código de recuperación es: <strong>${codigo}</strong></p><p>Válido por 15 minutos.</p>`
    });
}

module.exports = { enviarCodigoRecuperacion };