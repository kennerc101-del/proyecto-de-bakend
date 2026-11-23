import { pool } from '../config/connection.js';

class UsuariosModels {
  async addUser({ username, password, role }) {
    const [result] = await pool.query(
      'INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
    return { id: result.insertId, username, role };
  }

  async searchUser(username) {
    const [rows] = await pool.query(
      'SELECT id, username, password, role FROM usuarios WHERE username = ? LIMIT 1',
      [username]
    );
    return rows;
  }

  async getAllUsers() {
    // Nunca devolvemos la columna password
    const [rows] = await pool.query('SELECT id, username, role FROM usuarios ORDER BY id ASC');
    return rows;
  }

  async deleteUser(id) {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default new UsuariosModels();