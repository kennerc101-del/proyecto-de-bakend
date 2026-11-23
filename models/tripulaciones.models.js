import { pool } from '../config/connection.js';

class TripulacionesModels {
  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `tripulaciones` ORDER BY id DESC');
        return resolve(rows);
      } catch (error) {
        return reject(error);
      }
    });
  }

  getById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `tripulaciones` WHERE id = ?', [id]);
        return resolve(rows[0] || null);
      } catch (error) {
        return reject(error);
      }
    });
  }

  add({ nombre_completo, rol_vuelo, licencia }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO `tripulaciones` (`nombre_completo`, `rol_vuelo`, `licencia`) VALUES (?, ?, ?)',
          [nombre_completo, rol_vuelo, licencia]
        );
        return resolve({ id: result.insertId, nombre_completo, rol_vuelo, licencia });
      } catch (error) {
        return reject(error);
      }
    });
  }

  update(id, { nombre_completo, rol_vuelo, licencia }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'UPDATE `tripulaciones` SET `nombre_completo` = ?, `rol_vuelo` = ?, `licencia` = ? WHERE id = ?',
          [nombre_completo, rol_vuelo, licencia, id]
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
        const [result] = await pool.query('DELETE FROM `tripulaciones` WHERE id = ?', [id]);
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default new TripulacionesModels();