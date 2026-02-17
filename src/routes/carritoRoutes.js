const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {  
     obtenerCarrito,  
     agregarItem,  
     actualizarCantidad,  
     quitarItem,  
     vaciarCarrito
   }=require('../controllers/carritoController');
router.use(authMiddleware);
router.get('/', obtenerCarrito);router.post('/', agregarItem);
router.put('/:itemId', actualizarCantidad);
router.delete('/:itemId', quitarItem);
router.delete('/', vaciarCarrito);
module.exports = router;