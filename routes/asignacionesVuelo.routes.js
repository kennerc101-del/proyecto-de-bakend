import { Router } from 'express';
import asignacionesVueloController from '../controllers/asignacionesVuelo.controller.js';
import { verificarAutenticacion, autorizarRoles } from '../middlewares/auth.js';

const router = Router();
const VISTA_URL = '/gestion/asignaciones_vuelo';

function esHtml(req) {
  return req.headers['content-type']?.includes('application/x-www-form-urlencoded');
}

router.get('/todos', verificarAutenticacion, async (req, res) => {
  try {
    const data = await asignacionesVueloController.listar();
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/uno/:id', verificarAutenticacion, async (req, res) => {
  try {
    const data = await asignacionesVueloController.obtenerPorId(req.params.id);
    if (!data) return res.status(404).json({ message: 'Asignación no encontrada' });
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/agregar', verificarAutenticacion, autorizarRoles('root', 'admind'), async (req, res) => {
  try {
    const data = await asignacionesVueloController.crear(req.body);
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Asignación creada'));
    return res.status(201).json({ data, message: 'Asignación creada' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
});

async function handleUpdate(req, res) {
  try {
    const ok = await asignacionesVueloController.actualizar(req.params.id, req.body);
    if (!ok) {
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Asignación no encontrada'));
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Asignación actualizada'));
    return res.status(200).json({ message: 'Asignación actualizada' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
}

router.post('/actualizar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleUpdate);
router.put('/actualizar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleUpdate);

async function handleDelete(req, res) {
  try {
    const ok = await asignacionesVueloController.eliminar(req.params.id);
    if (!ok) {
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Asignación no encontrada'));
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Asignación eliminada'));
    return res.status(200).json({ message: 'Asignación eliminada' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
}

router.post('/eliminar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleDelete);
router.delete('/eliminar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleDelete);

export default router;