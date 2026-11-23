import { pool } from '../config/connection.js';

class AerolineasModels {
  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `aerolineas` ORDER BY id DESC');
        return resolve(rows);
      } catch (error) {
        return reject(error);
      }
    });
  }

  getById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `aerolineas` WHERE id = ?', [id]);
        return resolve(rows[0] || null);
      } catch (error) {
        return reject(error);
      }
    });
  }

  add({ nombre, codigo_iata, pais }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO `aerolineas` (`nombre`, `codigo_iata`, `pais`) VALUES (?, ?, ?)',
          [nombre, codigo_iata, pais]
        );
        return resolve({ id: result.insertId, nombre, codigo_iata, pais });
      } catch (error) {
        return reject(error);
      }
    });
  }

  update(id, { nombre, codigo_iata, pais }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'UPDATE `aerolineas` SET `nombre` = ?, `codigo_iata` = ?, `pais` = ? WHERE id = ?',
          [nombre, codigo_iata, pais, id]
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
        const [result] = await pool.query('DELETE FROM `aerolineas` WHERE id = ?', [id]);
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default new AerolineasModels();