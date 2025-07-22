const { validationResult } = require('express-validator');
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// GET - consultar por filtro (empresa/direccion/descripcion) o todos
function consultarProveedores(req, res, next) {
  const { filtro, campo } = req.query;

  const camposValidos = ['empresa', 'direccion', 'descripcion'];
  const campoBusqueda = camposValidos.includes(campo) ? campo : 'empresa';

  let sql = '';
  let params = [];

  if (filtro) {
    sql = `SELECT * FROM Proveedores WHERE ${campoBusqueda} LIKE ?`;
    params = [`%${filtro}%`];
  } else {
    sql = 'SELECT * FROM Proveedores';
  }

  connection.query(sql, params, (error, results) => {
    if (error) return next(error);
    res.json(results);
  });
}


// POST - insertar proveedor
function insertarProveedor(req, res, next) {
  const {
    empresa, direccion, contacto, correo, telefono,
    sitio_web, facebook, instagram, youtube,
    twitter, linkedin, descripcion
  } = req.body;

  const sql = `INSERT INTO Proveedores 
    (empresa, direccion, contacto, correo, telefono, sitio_web, facebook, instagram, youtube, twitter, linkedin, descripcion) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [
    empresa, direccion, contacto, correo, telefono,
    sitio_web, facebook, instagram, youtube,
    twitter, linkedin, descripcion
  ], (error, results) => {
    if (error) return next(error);
    res.status(201).json({ mensaje: "Proveedor insertado correctamente", id: results.insertId });
  });
}

// PUT - actualizar por nombre
function actualizarProveedor(req, res, next) {
  const nombre = req.params.empresa;

  const {
    empresa, direccion, contacto, correo, telefono,
    sitio_web, facebook, instagram, youtube,
    twitter, linkedin, descripcion
  } = req.body;

  const sql = `UPDATE Proveedores SET
    empresa = ?, direccion = ?, contacto = ?, correo = ?, telefono = ?, sitio_web = ?, 
    facebook = ?, instagram = ?, youtube = ?, twitter = ?, linkedin = ?, descripcion = ?
    WHERE empresa = ?`;

  connection.query(sql, [
    empresa, direccion, contacto, correo, telefono,
    sitio_web, facebook, instagram, youtube,
    twitter, linkedin, descripcion, nombre
  ], (error, results) => {
    if (error) return next(error);
    if (results.affectedRows > 0) {
      res.json({ mensaje: "Proveedor actualizado correctamente" });
    } else {
      res.status(404).json({ error: "Proveedor no encontrado" });
    }
  });
}

// DELETE - eliminar por nombre
function eliminarProveedor(req, res, next) {
  const nombre = req.params.empresa;

  const sql = 'DELETE FROM Proveedores WHERE empresa = ?';
  connection.query(sql, [nombre], (error, results) => {
    if (error) return next(error);
    if (results.affectedRows > 0) {
      res.json({ mensaje: "Proveedor eliminado correctamente" });
    } else {
      res.status(404).json({ error: "Proveedor no encontrado" });
    }
  });
}

module.exports = {
  consultarProveedores,
  insertarProveedor,
  actualizarProveedor,
  eliminarProveedor
};
