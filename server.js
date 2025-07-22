require('dotenv').config();
const express = require('express');
xmlparser = require('express-xml-bodyparser');
const multer  = require('multer'); 
const path = require('path');
const winston = require('winston');
const pug = require('pug');




const swaggerUI     = require('swagger-ui-express'); 
const swaggerJsDoc  = require('swagger-jsdoc');
const swaggerConfig = require('./swagger-config.json');


const routerProveedor = require('./router/usuarioRouter.js');
const { title } = require('process');
const redoc = require('redoc-express');

const app = express();
const port = process.env.PORT;
app.use(express.static(path.join(__dirname, 'public')));
//middleware
app.use(express.json());
app.use(express.text());
app.use(xmlparser());
  
app.use('/Proveedor', routerProveedor.router);

const logger = winston.createLogger({ 
    level: 'error', 
    format: winston.format.json(), 
    transports: [ 
    new winston.transports.File({ filename: __dirname+'/logs/error.log' }) 
      ] 
    }); 

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(500).json(`¡Algo salió mal! Error: ${err.message}`);
    logger.error(err.message, { stack: err.stack });
});


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/ruta', (req, res, next) => {  
    let opciones = { 
              titulo: "Titulo de la plantilla", 
              subtitulo: "Subtitulo en la plantilla" 
              } 
         res.render('plantilla', opciones) 
    })

    const swaggerOptions = {
        ...swaggerConfig,
        apis: [path.join(__dirname, swaggerConfig.apis[0])]
      };


    const swaggerDocs = swaggerJsDoc(swaggerOptions); 
    app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocs));

    app.get("/api-docs-json", (req, res) => res.json(swaggerDocs));

    app.get("/redoc", redoc({
        title: "API REST",
        specUrl: "/api-docs-json"
    }));

    


app.listen(port, () => {
    console.log(`corriendo servidor http://localhost:${port}`);
});
