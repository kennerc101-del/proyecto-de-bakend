import jwt from 'jsonwebtoken';

const EXPIRACION_SEGUNDOS = 60 * 60; // 60 minutos

export function generateToken(payload) {
  return jwt.sign(
    {
      id: payload.id ?? 0,
      username: payload.username,
      role: payload.role
    },
    process.env.JWT_SECRET,
    { expiresIn: EXPIRACION_SEGUNDOS }
  );
}

function extraerToken(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function verificarAutenticacion(req, res, next) {
  const token = extraerToken(req);
  if (!token) {
    if (req.accepts('html') && !req.xhr) {
      return res.redirect('/login?error=Debes+iniciar+sesion');
    }
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    res.clearCookie('token');
    if (req.accepts('html') && !req.xhr) {
      return res.redirect('/login?error=Sesion+expirada+o+invalida');
    }
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export function adjuntarUsuarioSiExiste(req, res, next) {
  const token = extraerToken(req);
  req.user = null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
      req.user = null;
    }
  }
  res.locals.currentUser = req.user;
  next();
}

export function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      if (req.accepts('html') && !req.xhr) {
        return res.redirect('/login?error=Debes+iniciar+sesion');
      }
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      const msg = `Acceso denegado: tu rol (${req.user.role}) no tiene permiso para esta sección`;
      if (req.accepts('html') && !req.xhr && !req.is('json')) {
        return res.redirect('/dashboard?error=' + encodeURIComponent(msg));
      }
      return res.status(403).json({ message: msg });
    }

    return next();
  };
}