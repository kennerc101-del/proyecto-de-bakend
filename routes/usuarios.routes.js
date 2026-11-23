import { Router } from 'express';
import usuariosController from '../controllers/usuarios.controller.js';
import { verificarAutenticacion, autorizarRoles } from '../middlewares/auth.js';

const router = Router();

function esHtml(req) {
  return req.headers['content-type']?.includes('application/x-www-form-urlencoded') ||
    (req.accepts('html') && !req.xhr && !req.is('json'));
}

router.post('/login', async (req, res) => {
  try {
    const { token, user } = await usuariosController.login(req.body);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: 'lax'
    });
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.redirect('/dashboard');
    }
    return res.status(200).json({ token, user, message: 'Sesión iniciada' });
  } catch (err) {
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.redirect('/login?error=' + encodeURIComponent(err.message));
    }
    return res.status(401).json({ message: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
    return res.redirect('/login');
  }
  return res.status(200).json({ message: 'Sesión cerrada' });
});

router.get('/todos', verificarAutenticacion, autorizarRoles('root', 'admind'), async (req, res) => {
  try {
    const data = await usuariosController.listar();
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/crear', verificarAutenticacion, autorizarRoles('root'), async (req, res) => {
  try {
    const data = await usuariosController.crear(req.body);
    if (esHtml(req)) {
      return res.redirect('/usuarios-panel?mensaje=' + encodeURIComponent('Usuario creado correctamente'));
    }
    return res.status(201).json({ data, message: 'Usuario creado' });
  } catch (err) {
    if (esHtml(req)) {
      return res.redirect('/usuarios-panel?error=' + encodeURIComponent(err.message));
    }
    return res.status(400).json({ message: err.message });
  }
});

router.post('/actualizar/:id', verificarAutenticacion, autorizarRoles('root'), async (req, res) => {
  try {
    const data = await usuariosController.actualizar(req.params.id, req.body);
    if (esHtml(req)) {
      return res.redirect('/usuarios-panel?mensaje=' + encodeURIComponent('Usuario actualizado correctamente'));
    }
    return res.status(200).json({ data, message: 'Usuario actualizado' });
  } catch (err) {
    if (esHtml(req)) {
      return res.redirect('/usuarios-panel?error=' + encodeURIComponent(err.message));
    }
    return res.status(400).json({ message: err.message });
  }
});

router.put('/actualizar/:id', verificarAutenticacion, autorizarRoles('root'), async (req, res) => {
  try {
    const data = await usuariosController.actualizar(req.params.id, req.body);
    return res.status(200).json({ data, message: 'Usuario actualizado' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.post('/eliminar/:id', verificarAutenticacion, autorizarRoles('root'), async (req, res) => {
  try {
    await usuariosController.eliminar(req.params.id, req.user);
    if (esHtml(req)) {
      return res.redirect('/usuarios-panel?mensaje=' + encodeURIComponent('Usuario eliminado'));
    }
    return res.status(200).json({ message: 'Usuario eliminado' });
  } catch (err) {
    if (esHtml(req)) {
      return res.redirect('/usuarios-panel?error=' + encodeURIComponent(err.message));
    }
    return res.status(400).json({ message: err.message });
  }
});

router.delete('/eliminar/:id', verificarAutenticacion, autorizarRoles('root'), async (req, res) => {
  try {
    await usuariosController.eliminar(req.params.id, req.user);
    return res.status(200).json({ message: 'Usuario eliminado' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

export default router;