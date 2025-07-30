require('dotenv').config();
const express = require('express');
xmlparser = require('express-xml-bodyparser');
const path = require('path');


const routerProveedor = require('./router/usuarioRouter.js');

const app = express();
const port = process.env.PORT;
app.use(express.static(path.join(__dirname, 'public')));
//middleware
app.use(express.json());
app.use(express.text());
app.use(xmlparser());
  

app.use('/Proveedor', routerProveedor.router);
// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(500).json(`¡Algo salió mal! Error: ${err.message}`);
    logger.error(err.message, { stack: err.stack });
});

app.listen(port, () => {
    console.log(`corriendo servidor http://localhost:${port}`);
});
