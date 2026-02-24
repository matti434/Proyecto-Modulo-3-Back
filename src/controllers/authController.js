const { Usuario } = require('../models');
const { generarToken } = require('../utils/jwt');
const { AppError } = require('../middlewares/errorHandler');
const { enviarCodigoRecuperacion } = require('../utils/email');
const config = require('../config/config');

/** Opciones de la cookie JWT (7 días, httpOnly, sameSite). */
const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/** En producción con front en otro dominio (ej. Netlify + Render), la cookie debe ser sameSite: 'none' para que el navegador la envíe en peticiones cross-origin. */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: COOKIE_MAX_AGE_MS,
  path: '/',
});


const MINUTOS_EXPIRACION_CODIGO = 15;

function generarCodigoDe6Digitos() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


const solicitarRecuperacionPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ exito: false, mensaje: 'Email es requerido' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+codigoRecuperacion +codigoRecuperacionExpira');
    if (!usuario) {
      // No revelar si el email existe o no (seguridad)
      return res.status(200).json({
        exito: true,
        mensaje: 'Si el email está registrado, recibirás un código por correo.'
      });
    }

    const codigo = generarCodigoDe6Digitos();
    usuario.codigoRecuperacion = codigo;
    usuario.codigoRecuperacionExpira = new Date(Date.now() + MINUTOS_EXPIRACION_CODIGO * 60 * 1000);
    await usuario.save({ validateBeforeSave: false });

    await enviarCodigoRecuperacion(usuario.email, codigo);

    res.status(200).json({
      exito: true,
      mensaje: 'Si el email está registrado, recibirás un código por correo.'
    });
  } catch (error) {
    console.error('[recuperar-password] Error al enviar código:', error?.message || error);
    next(error);
  }
};

const restablecerPasswordConCodigo = async (req, res, next) => {
  try {
    const { email, codigo, nuevaPassword } = req.body;
    if (!email || !codigo || !nuevaPassword) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Email, código y nueva contraseña son requeridos'
      });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() })
      .select('+password +codigoRecuperacion +codigoRecuperacionExpira');
    if (!usuario || !usuario.codigoRecuperacion) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Código inválido o expirado'
      });
    }

    if (usuario.codigoRecuperacion !== codigo) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Código incorrecto'
      });
    }
    if (new Date() > usuario.codigoRecuperacionExpira) {
      usuario.codigoRecuperacion = null;
      usuario.codigoRecuperacionExpira = null;
      await usuario.save({ validateBeforeSave: false });
      return res.status(400).json({
        exito: false,
        mensaje: 'El código ha expirado. Solicita uno nuevo.'
      });
    }

    usuario.password = nuevaPassword;
    usuario.codigoRecuperacion = null;
    usuario.codigoRecuperacionExpira = null;
    await usuario.save();

    res.status(200).json({
      exito: true,
      mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.'
    });
  } catch (error) {
    console.error('[restablecer-password] Error:', error?.message || error);
    next(error);
  }
};


const registro = async (req, res, next) => {
  try {
    const { nombreDeUsuario, email, password, pais, fechaNacimiento } = req.body;

    // Verificar si el email ya existe
    const emailExiste = await Usuario.findOne({ email: email.toLowerCase() });
    if (emailExiste) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El email ya está registrado'
      });
    }

    // Verificar si el nombre de usuario ya existe
    const nombreExiste = await Usuario.findOne({
      nombreDeUsuario: { $regex: new RegExp(`^${nombreDeUsuario}$`, 'i') }
    });
    if (nombreExiste) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre de usuario ya existe'
      });
    }

    // Crear usuario
    const usuario = await Usuario.create({
      nombreDeUsuario,
      email,
      password,
      pais,
      fechaNacimiento
    });

    const token = generarToken(usuario);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    const usuarioResponse = {
      _id: usuario._id,
      id: usuario._id,
      nombreDeUsuario: usuario.nombreDeUsuario,
      email: usuario.email,
      pais: usuario.pais,
      fechaNacimiento: usuario.fechaNacimiento,
      role: usuario.role,
      suspendido: usuario.suspendido,
      createdAt: usuario.createdAt
    };

    res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado exitosamente',
      usuario: usuarioResponse
    });
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const { credencial, contrasena } = req.body;

    if (!credencial || !contrasena) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Por favor proporcione credenciales'
      })
    }

    const usuario = await Usuario.findOne({
      $or: [
        { email: credencial.toLowerCase() },
        { nombreDeUsuario: { $regex: new RegExp(`^${credencial}$`, 'i') } }
      ]
    }).select('+password');

    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales incorrectas'
      });
    }

    const passwordCorrecta = await usuario.compararPassword(contrasena);
    if (!passwordCorrecta) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales incorrectas'
      });
    }

    if (usuario.suspendido) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario suspendido contacte a soporte'
      });
    }

    const token = generarToken(usuario);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    const usuarioResponse = {
      _id: usuario._id,
      id: usuario._id,
      nombreDeUsuario: usuario.nombreDeUsuario,
      email: usuario.email,
      pais: usuario.pais,
      fechaNacimiento: usuario.fechaNacimiento,
      role: usuario.role,
      suspendido: usuario.suspendido,
      createdAt: usuario.createdAt
    };

    res.status(200).json({
      exito: true,
      mensaje: 'Inicio de sesion exitoso',
      usuario: usuarioResponse
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/', httpOnly: true, secure: config.nodeEnv === 'production', sameSite: config.nodeEnv === 'production' ? 'none' : 'lax' });
  res.json({ exito: true, mensaje: 'Sesión cerrada' });
};

const obtenerPerfil = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id);

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      exito: true,
      usuario: {
        _id: usuario._id,
        id: usuario._id,
        nombreDeUsuario: usuario.nombreDeUsuario,
        email: usuario.email,
        pais: usuario.pais,
        fechaNacimiento: usuario.fechaNacimiento,
        role: usuario.role,
        suspendido: usuario.suspendido,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};


const actualizarPerfil = async (req, res, next) => {
  try {
    const { nombreDeUsuario, email, pais, fechaNacimiento } = req.body;

    // Verificar duplicados si cambian
    if (email && email !== req.usuario.email) {
      const emailExiste = await Usuario.findOne({ email: email.toLowerCase() });
      if (emailExiste) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El email ya está en uso'
        });
      }
    }

    if (nombreDeUsuario && nombreDeUsuario !== req.usuario.nombreDeUsuario) {
      const nombreExiste = await Usuario.findOne({
        nombreDeUsuario: { $regex: new RegExp(`^${nombreDeUsuario}$`, 'i') }
      });
      if (nombreExiste) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El nombre de usuario ya está en uso'
        });
      }
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      { nombreDeUsuario, email, pais, fechaNacimiento },
      { new: true, runValidators: true }
    );

    res.json({
      exito: true,
      mensaje: 'Perfil actualizado',
      usuario: {
        _id: usuario._id,
        id: usuario._id,
        nombreDeUsuario: usuario.nombreDeUsuario,
        email: usuario.email,
        pais: usuario.pais,
        fechaNacimiento: usuario.fechaNacimiento,
        role: usuario.role,
        suspendido: usuario.suspendido
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registro,
  login,
  logout,
  obtenerPerfil,
  actualizarPerfil,
  solicitarRecuperacionPassword,
  restablecerPasswordConCodigo
};