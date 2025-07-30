const express = require('express');
const usuarioController = require('../controllers/usuarioController.js');

const router = express.Router();


router.get('/', usuarioController.consultarProveedores);
router.post('/', usuarioController.insertarProveedor);
router.put('/:empresa', usuarioController.actualizarProveedor);
router.delete('/:empresa', usuarioController.eliminarProveedor);

module.exports.router = router;