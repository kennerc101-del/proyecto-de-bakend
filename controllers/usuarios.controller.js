import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/connection.js';

const ROLES_VALIDOS = ['root', 'admind', 'user'];

class UsuariosController {
  listar() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query(
          'SELECT id, username, role FROM `usuarios` ORDER BY id DESC'
        );
        return resolve(rows);
      } catch (error) {
        return reject(error);
      }
    });
  }

  crear({ username, password, role }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!username || !password) {
          return reject(new Error('Debe indicar usuario y contraseña'));
        }
        const rolFinal = ROLES_VALIDOS.includes(role) ? role : 'user';
        const [existe] = await pool.query(
          'SELECT id FROM `usuarios` WHERE username = ? LIMIT 1',
          [username.trim()]
        );
        if (existe.length > 0) {
          return reject(new Error('Ese nombre de usuario ya existe'));
        }
        const hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
          'INSERT INTO `usuarios` (`username`, `password`, `role`) VALUES (?, ?, ?)',
          [username.trim(), hash, rolFinal]
        );
        return resolve({ id: result.insertId, username: username.trim(), role: rolFinal });
      } catch (error) {
        return reject(error);
      }
    });
  }

  actualizar(id, { username, password, role }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [actuales] = await pool.query(
          'SELECT id, username, role FROM `usuarios` WHERE id = ? LIMIT 1',
          [id]
        );
        if (actuales.length === 0) {
          return reject(new Error('Usuario no encontrado'));
        }
        const actual = actuales[0];
        const nuevoUsername = username ? username.trim() : actual.username;
        const nuevoRole = ROLES_VALIDOS.includes(role) ? role : actual.role;

        if (password && password.trim().length > 0) {
          const hash = await bcrypt.hash(password.trim(), 10);
          await pool.query(
            'UPDATE `usuarios` SET `username` = ?, `password` = ?, `role` = ? WHERE id = ?',
            [nuevoUsername, hash, nuevoRole, id]
          );
        } else {
          await pool.query(
            'UPDATE `usuarios` SET `username` = ?, `role` = ? WHERE id = ?',
            [nuevoUsername, nuevoRole, id]
          );
        }
        return resolve({ id: Number(id), username: nuevoUsername, role: nuevoRole });
      } catch (error) {
        return reject(error);
      }
    });
  }

  eliminar(id, usuarioActual) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query(
          'SELECT id, username, role FROM `usuarios` WHERE id = ? LIMIT 1',
          [id]
        );
        if (rows.length === 0) {
          return reject(new Error('Usuario no encontrado'));
        }
        if (rows[0].username === 'root') {
          return reject(new Error('No se puede eliminar la cuenta root'));
        }
        if (usuarioActual && Number(usuarioActual.id) === Number(id)) {
          return reject(new Error('No puedes eliminar tu propio usuario mientras tienes sesión activa'));
        }
        const [result] = await pool.query('DELETE FROM `usuarios` WHERE id = ?', [id]);
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }

  login({ username, password }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!username || !password) {
          return reject(new Error('Ingrese usuario y contraseña'));
        }

        // Acceso root mediante ROOT_KEY en .env
        if (username === 'root' && process.env.ROOT_KEY && password === process.env.ROOT_KEY) {
          const payload = { id: 0, username: 'root', role: 'root' };
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
          return resolve({ token, user: payload });
        }

        const [rows] = await pool.query(
          'SELECT id, username, password, role FROM `usuarios` WHERE username = ? LIMIT 1',
          [username.trim()]
        );
        if (rows.length === 0) {
          return reject(new Error('Credenciales inválidas'));
        }

        const userRow = rows[0];
        const valida = await bcrypt.compare(password, userRow.password);
        if (!valida) {
          return reject(new Error('Credenciales inválidas'));
        }

        const payload = { id: userRow.id, username: userRow.username, role: userRow.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
        return resolve({ token, user: payload });
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default new UsuariosController();