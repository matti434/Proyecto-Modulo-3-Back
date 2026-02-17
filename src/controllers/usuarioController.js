const { Usuario } = require('../Models');

// @desc Listar usuario
// @route GET / api/usuarios
// @access Admin
const obtenerUsuarios = async (req, res, next) => {
    try {
        const { buscar, suspendidos } = req.query;
        let query = {};

        if (suspendidos === 'true') query.suspendido = true;
        else if (suspendidos === 'false') query.suspendido = false;

        if (buscar) {
            query.$or = [
                { nombreDeUsuario: { $regex: buscar, $options: 'i' } },
                { email: { $regex: buscar, $options: 'i' } },
                { pais: { $regex: buscar, $options: 'i' } }
            ];
        }

        const usuarios = await Usuario.find(query).sort({ createdAt: -1 });

        // Mapeamos para no enviar el password
        const datos = usuarios.map(u => ({
            _id: u._id,
            id: u._id,
            nombreDeUsuario: u.nombreDeUsuario,
            email: u.email,
            pais: u.pais,
            fechaNacimineto: u.fechaNacimineto,
            role: u.role,
            suspendido: u.suspendido,
            fechaSuspension: u.fechaSuspension,
            createdAt: u.createdAt
        }));

        res.json({
            exito: true,
            mensaje: 'Listado de usuarios',
            datos
        });
    } catch (error) {
        next(error);
    }
};

// @desc Obtener usuario por ID
// @route GET /api/usuarios/:id
// @access admin
const obtenerUsuarioPorId = async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        const datos = {
            _id: usuario._id,
            id: usuario._id,
            nombreDeUsuario: usuario.nombreDeUsuario,
            email: usuario.email,
            pais: usuario.pais,
            fechaNacimineto: usuario.fechaNacimineto,
            role: usuario.role,
            suspendido: usuario.suspendido,
            fechaSuspension: usuario.fechaSuspension,
            createdAt: usuario.createdAt
        };

        res.json({
            exito: true,
            mensaje: 'Usuario encontrado',
            datos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar usuario
// @route   PUT /api/usuarios/:id
// @access  Admin
const actualizarUsuario = async (req, res, next) => {
    try {
        const { nombreDeUsuario, email, pais, fechaNacimineto, role } = req.body;
        const usuarioId = req.params.id;

        const usuario = await Usuario.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        // Validar si el email ya existe en otro usuario
        if (email && email !== usuario.email) {
            const emailExiste = await Usuario.findOne({ email: email.toLowerCase() });
            if (emailExiste) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El email ya esta en uso'
                });
            }
        } 

        // Validar si el nombre de usuario ya existe
        if (nombreDeUsuario && nombreDeUsuario !== usuario.nombreDeUsuario) {
            const nombreExiste = await Usuario.findOne({
                nombreDeUsuario: { $regex: new RegExp(`^${nombreDeUsuario}$`, 'i') }
            });
            if (nombreExiste) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El nombre de usuario ya esta en uso'
                });
            }
        }

        const usuarioActualizado = await Usuario.findByIdUpdate(
            usuarioId,
            { nombreDeUsuario, email, pais, fechaNacimineto, role },
            { new: true, runValidators: true }
        );

        const datos = {
            _id: usuarioActualizado._id,
            id: usuarioActualizado._id,
            nombreDeUsuario: usuarioActualizado.nombreDeUsuario,
            email: usuarioActualizado.email,
            pais: usuarioActualizado.pais,
            fechaNacimineto: usuarioActualizado.fechaNacimineto,
            role: usuarioActualizado.role,
            suspendido: usuarioActualizado.suspendido,
            fechaSuspension: usuarioActualizado.fechaSuspension
        };

        res.json({
            exito: true,
            mensaje: 'Usuario actualizado',
            datos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar usuario
// @route   DELETE /api/usuarios/:id
// @access  Admin
const eliminarUsuario = async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if(!usuario) {
            return res.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        // Seguridad: No permitir borrar otros admins
        if (usuario.role === 'admin') {
            return res.status(403).json({
                exito: false,
                mensaje: 'No se puede eliminar un administrador'
            });
        }

        await Usuario.findByIdAndDelete(req.params.id);

        res.json({
            exito: true,
            mensaje: 'Usuario eliminado'
        });
    } catch (error) {
        next(error);
    }
};