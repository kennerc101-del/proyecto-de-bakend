import { Router } from 'express';
import pistasController from '../controllers/pistas.controller.js';
import { verificarAutenticacion, autorizarRoles } from '../middlewares/auth.js';

const router = Router();
const VISTA_URL = '/gestion/pistas';

function esHtml(req) {
  return req.headers['content-type']?.includes('application/x-www-form-urlencoded');
}

router.get('/todos', verificarAutenticacion, async (req, res) => {
  try {
    const data = await pistasController.listar();
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/uno/:id', verificarAutenticacion, async (req, res) => {
  try {
    const data = await pistasController.obtenerPorId(req.params.id);
    if (!data) return res.status(404).json({ message: 'Pista no encontrada' });
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/agregar', verificarAutenticacion, autorizarRoles('root', 'admind'), async (req, res) => {
  try {
    const data = await pistasController.crear(req.body);
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Pista creada'));
    return res.status(201).json({ data, message: 'Pista creada' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
});

async function handleUpdate(req, res) {
  try {
    const ok = await pistasController.actualizar(req.params.id, req.body);
    if (!ok) {
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Pista no encontrada'));
      return res.status(404).json({ message: 'Pista no encontrada' });
    }
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Pista actualizada'));
    return res.status(200).json({ message: 'Pista actualizada' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
}

router.post('/actualizar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleUpdate);
router.put('/actualizar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleUpdate);

async function handleDelete(req, res) {
  try {
    const ok = await pistasController.eliminar(req.params.id);
    if (!ok) {
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Pista no encontrada'));
      return res.status(404).json({ message: 'Pista no encontrada' });
    }
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Pista eliminada'));
    return res.status(200).json({ message: 'Pista eliminada' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
}

router.post('/eliminar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleDelete);
router.delete('/eliminar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleDelete);

export default router;