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