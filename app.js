import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { migrar } from './config/connection.js';
import { adjuntarUsuarioSiExiste } from './middlewares/auth.js';
import indexRouter from './routes/index.js';
import usuariosRouter from './routes/usuarios.routes.js';
import aerolineasRouter from './routes/aerolineas.routes.js';
import pistasRouter from './routes/pistas.routes.js';
import torresControlRouter from './routes/torresControl.routes.js';
import avionesRouter from './routes/aviones.routes.js';
import tripulacionesRouter from './routes/tripulaciones.routes.js';
import vuelosRouter from './routes/vuelos.routes.js';
import asignacionesVueloRouter from './routes/asignacionesVuelo.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await migrar();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(adjuntarUsuarioSiExiste);

app.use('/', indexRouter);
app.use('/usuarios', usuariosRouter);
app.use('/aerolineas', aerolineasRouter);
app.use('/pistas', pistasRouter);
app.use('/torres-control', torresControlRouter);
app.use('/aviones', avionesRouter);
app.use('/tripulaciones', tripulacionesRouter);
app.use('/vuelos', vuelosRouter);
app.use('/asignaciones-vuelo', asignacionesVueloRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  if (req.accepts('html') && !req.xhr) {
    return res.status(err.status || 500).render('dashboard', {
      title: 'Error',
      counts: null,
      error: err.message || 'Error interno del servidor'
    });
  }
  return res.status(err.status || 500).json({ message: err.message });
});

export default app;