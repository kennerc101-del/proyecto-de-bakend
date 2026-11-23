import { Router } from 'express';
import { pool } from '../config/connection.js';
import { verificarAutenticacion, autorizarRoles } from '../middlewares/auth.js';
import usuariosController from '../controllers/usuarios.controller.js';
import aerolineasController from '../controllers/aerolineas.controller.js';
import pistasController from '../controllers/pistas.controller.js';
import torresControlController from '../controllers/torresControl.controller.js';
import avionesController from '../controllers/aviones.controller.js';
import tripulacionesController from '../controllers/tripulaciones.controller.js';
import vuelosController from '../controllers/vuelos.controller.js';
import asignacionesVueloController from '../controllers/asignacionesVuelo.controller.js';

const router = Router();

router.get('/', (req, res) => {
  return res.redirect('/dashboard');
});

router.get('/login', (req, res) => {
  return res.render('login', {
    title: 'Iniciar Sesión - Aeropuerto',
    error: req.query.error || null
  });
});

router.get('/dashboard', verificarAutenticacion, async (req, res) => {
  try {
    const [
      [aerolineas],
      [pistas],
      [torres],
      [aviones],
      [tripulaciones],
      [vuelos],
      [asignaciones]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM `aerolineas`'),
      pool.query('SELECT COUNT(*) AS total FROM `pistas`'),
      pool.query('SELECT COUNT(*) AS total FROM `torres_control`'),
      pool.query('SELECT COUNT(*) AS total FROM `aviones`'),
      pool.query('SELECT COUNT(*) AS total FROM `tripulaciones`'),
      pool.query('SELECT COUNT(*) AS total FROM `vuelos`'),
      pool.query('SELECT COUNT(*) AS total FROM `asignaciones_vuelo`')
    ]);

    const counts = {
      aerolineas: aerolineas[0].total,
      pistas: pistas[0].total,
      torres_control: torres[0].total,
      aviones: aviones[0].total,
      tripulaciones: tripulaciones[0].total,
      vuelos: vuelos[0].total,
      asignaciones_vuelo: asignaciones[0].total
    };

    return res.render('dashboard', {
      title: 'Panel Operativo del Aeropuerto',
      user: req.user,
      currentUser: req.user,
      error: req.query.error || null,
      counts,
      contadores: counts
    });
  } catch (err) {
    return res.status(500).render('dashboard', {
      title: 'Panel Operativo del Aeropuerto',
      user: req.user,
      currentUser: req.user,
      error: err.message,
      counts: null,
      contadores: null
    });
  }
});

router.get('/usuarios-panel', verificarAutenticacion, autorizarRoles('root', 'admind'), async (req, res) => {
  try {
    const usuarios = await usuariosController.listar();
    return res.render('usuarios_panel', {
      title: 'Gestión de Usuarios',
      currentUser: req.user,
      esRoot: req.user.role === 'root',
      usuarios,
      mensaje: req.query.mensaje || null,
      error: req.query.error || null
    });
  } catch (err) {
    return res.status(500).render('usuarios_panel', {
      title: 'Gestión de Usuarios',
      currentUser: req.user,
      esRoot: req.user.role === 'root',
      usuarios: [],
      mensaje: null,
      error: err.message
    });
  }
});

router.get('/gestion/:entidad', verificarAutenticacion, async (req, res) => {
  const { entidad } = req.params;
  const rol = req.user.role;
  const esAdminORoot = rol === 'root' || rol === 'admind';
  const esUser = rol === 'user';

  try {
    let registros = [];
    let titulo = '';
    let apiBase = '';
    let extras = {};

    switch (entidad) {
      case 'aerolineas':
        titulo = 'Gestión de Aerolíneas';
        apiBase = '/aerolineas';
        registros = await aerolineasController.listar();
        break;

      case 'pistas':
        titulo = 'Gestión de Pistas de Vuelo';
        apiBase = '/pistas';
        registros = await pistasController.listar();
        break;

      case 'torres_control':
        titulo = 'Gestión de Torres de Control';
        apiBase = '/torres-control';
        registros = await torresControlController.listar();
        break;

      case 'aviones': {
        titulo = 'Gestión de Aviones';
        apiBase = '/aviones';
        registros = await avionesController.listar();
        const [aerolineas] = await pool.query('SELECT id, nombre, codigo_iata FROM `aerolineas` ORDER BY nombre');
        extras.aerolineas = aerolineas;
        break;
      }

      case 'tripulaciones':
        titulo = 'Gestión de Tripulación';
        apiBase = '/tripulaciones';
        registros = await tripulacionesController.listar();
        break;

      case 'vuelos': {
        titulo = 'Gestión y Operación de Vuelos';
        apiBase = '/vuelos';
        registros = await vuelosController.listar();
        const [aviones] = await pool.query('SELECT id, matricula, modelo FROM `aviones` ORDER BY matricula');
        // Solo pistas operativas para asignar vuelos
        const [pistasOperativas] = await pool.query(
          "SELECT id, codigo_pista, longitud_metros FROM `pistas` WHERE estado = 'Operativa' ORDER BY codigo_pista"
        );
        const [torres] = await pool.query('SELECT id, nombre_torre, frecuencia_mhz FROM `torres_control` ORDER BY nombre_torre');
        extras = { aviones, pistasOperativas, torres };
        break;
      }

      case 'asignaciones_vuelo': {
        titulo = 'Asignación de Tripulación a Vuelos';
        apiBase = '/asignaciones-vuelo';
        registros = await asignacionesVueloController.listar();
        const [vuelos] = await pool.query('SELECT id, codigo_vuelo, origen, destino FROM `vuelos` ORDER BY id DESC');
        const [tripulaciones] = await pool.query('SELECT id, nombre_completo, rol_vuelo, licencia FROM `tripulaciones` ORDER BY nombre_completo');
        extras = { vuelos, tripulaciones };
        break;
      }

      default:
        return res.status(404).redirect('/dashboard?error=' + encodeURIComponent('Entidad no encontrada'));
    }

    return res.render('entidad_gestion', {
      title: titulo,
      entidad,
      titulo,
      apiBase,
      registros,
      currentUser: req.user,
      puedeCrear: esAdminORoot,
      puedeEditarTodo: esAdminORoot,
      puedeCambiarEstadoVuelo: esAdminORoot || (esUser && entidad === 'vuelos'),
      puedeEliminar: esAdminORoot,
      mensaje: req.query.mensaje || null,
      error: req.query.error || null,
      ...extras
    });
  } catch (err) {
    return res.redirect('/dashboard?error=' + encodeURIComponent(err.message));
  }
});

export default router;