import { Router } from 'express';
import vuelosController from '../controllers/vuelos.controller.js';
import { verificarAutenticacion, autorizarRoles } from '../middlewares/auth.js';

const router = Router();
const VISTA_URL = '/gestion/vuelos';

function esHtml(req) {
  return req.headers['content-type']?.includes('application/x-www-form-urlencoded');
}

router.get('/todos', verificarAutenticacion, async (req, res) => {
  try {
    const data = await vuelosController.listar();
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/uno/:id', verificarAutenticacion, async (req, res) => {
  try {
    const data = await vuelosController.obtenerPorId(req.params.id);
    if (!data) return res.status(404).json({ message: 'Vuelo no encontrado' });
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/agregar', verificarAutenticacion, autorizarRoles('root', 'admind'), async (req, res) => {
  try {
    const data = await vuelosController.crear(req.body);
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Vuelo programado'));
    return res.status(201).json({ data, message: 'Vuelo programado' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
});

async function handleUpdateVuelo(req, res) {
  try {
    if (req.user.role === 'user') {
      const ok = await vuelosController.actualizarEstado(req.params.id, req.body.estado_vuelo);
      if (!ok) {
        if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Vuelo no encontrado'));
        return res.status(404).json({ message: 'Vuelo no encontrado' });
      }
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Estado de vuelo actualizado'));
      return res.status(200).json({ message: 'Estado de vuelo actualizado' });
    }

    const ok = await vuelosController.actualizar(req.params.id, req.body);
    if (!ok) {
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Vuelo no encontrado'));
      return res.status(404).json({ message: 'Vuelo no encontrado' });
    }
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Vuelo actualizado'));
    return res.status(200).json({ message: 'Vuelo actualizado' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
}

router.post('/actualizar/:id', verificarAutenticacion, autorizarRoles('root', 'admind', 'user'), handleUpdateVuelo);
router.put('/actualizar/:id', verificarAutenticacion, autorizarRoles('root', 'admind', 'user'), handleUpdateVuelo);

async function handleDeleteVuelo(req, res) {
  try {
    const ok = await vuelosController.eliminar(req.params.id);
    if (!ok) {
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Vuelo no encontrado'));
      return res.status(404).json({ message: 'Vuelo no encontrado' });
    }
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Vuelo eliminado'));
    return res.status(200).json({ message: 'Vuelo eliminado' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
}

router.post('/eliminar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleDeleteVuelo);
router.delete('/eliminar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleDeleteVuelo);

export default router;