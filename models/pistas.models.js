import { pool } from '../config/connection.js';

class PistasModels {
  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `pistas` ORDER BY id DESC');
        return resolve(rows);
      } catch (error) {
        return reject(error);
      }
    });
  }

  getById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `pistas` WHERE id = ?', [id]);
        return resolve(rows[0] || null);
      } catch (error) {
        return reject(error);
      }
    });
  }

  add({ codigo_pista, longitud_metros, estado }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO `pistas` (`codigo_pista`, `longitud_metros`, `estado`) VALUES (?, ?, ?)',
          [codigo_pista, longitud_metros, estado || 'Operativa']
        );
        return resolve({ id: result.insertId, codigo_pista, longitud_metros, estado: estado || 'Operativa' });
      } catch (error) {
        return reject(error);
      }
    });
  }

  update(id, { codigo_pista, longitud_metros, estado }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'UPDATE `pistas` SET `codigo_pista` = ?, `longitud_metros` = ?, `estado` = ? WHERE id = ?',
          [codigo_pista, longitud_metros, estado, id]
        );
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query('DELETE FROM `pistas` WHERE id = ?', [id]);
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default new PistasModels();