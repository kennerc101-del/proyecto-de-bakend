import { Router } from 'express';
import avionesController from '../controllers/aviones.controller.js';
import { verificarAutenticacion, autorizarRoles } from '../middlewares/auth.js';

const router = Router();
const VISTA_URL = '/gestion/aviones';

function esHtml(req) {
  return req.headers['content-type']?.includes('application/x-www-form-urlencoded');
}

router.get('/todos', verificarAutenticacion, async (req, res) => {
  try {
    const data = await avionesController.listar();
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/uno/:id', verificarAutenticacion, async (req, res) => {
  try {
    const data = await avionesController.obtenerPorId(req.params.id);
    if (!data) return res.status(404).json({ message: 'Avión no encontrado' });
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/agregar', verificarAutenticacion, autorizarRoles('root', 'admind'), async (req, res) => {
  try {
    const data = await avionesController.crear(req.body);
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Avión registrado'));
    return res.status(201).json({ data, message: 'Avión registrado' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
});

async function handleUpdate(req, res) {
  try {
    const ok = await avionesController.actualizar(req.params.id, req.body);
    if (!ok) {
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Avión no encontrado'));
      return res.status(404).json({ message: 'Avión no encontrado' });
    }
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Avión actualizado'));
    return res.status(200).json({ message: 'Avión actualizado' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
}

router.post('/actualizar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleUpdate);
router.put('/actualizar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleUpdate);

async function handleDelete(req, res) {
  try {
    const ok = await avionesController.eliminar(req.params.id);
    if (!ok) {
      if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent('Avión no encontrado'));
      return res.status(404).json({ message: 'Avión no encontrado' });
    }
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?mensaje=` + encodeURIComponent('Avión eliminado'));
    return res.status(200).json({ message: 'Avión eliminado' });
  } catch (err) {
    if (esHtml(req)) return res.redirect(`${VISTA_URL}?error=` + encodeURIComponent(err.message));
    return res.status(400).json({ message: err.message });
  }
}

router.post('/eliminar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleDelete);
router.delete('/eliminar/:id', verificarAutenticacion, autorizarRoles('root', 'admind'), handleDelete);

export default router;