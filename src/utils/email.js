const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarCodigoRecuperacion(emailDestino, codigo) {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: emailDestino,
        subject: 'Código para recuperar tu contraseña',
        html: `<p>Tu código de recuperación es: <strong>${codigo}</strong></p><p>Válido por 15 minutos.</p>`
    });

    if (error) {
        throw new Error(error.message);
    }
}

module.exports = { enviarCodigoRecuperacion };
