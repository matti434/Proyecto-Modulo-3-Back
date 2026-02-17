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
}