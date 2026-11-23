import { pool } from '../config/connection.js';

class TorresControlModels {
  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `torres_control` ORDER BY id DESC');
        return resolve(rows);
      } catch (error) {
        return reject(error);
      }
    });
  }

  getById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `torres_control` WHERE id = ?', [id]);
        return resolve(rows[0] || null);
      } catch (error) {
        return reject(error);
      }
    });
  }

  add({ nombre_torre, frecuencia_mhz, jefe_turno }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO `torres_control` (`nombre_torre`, `frecuencia_mhz`, `jefe_turno`) VALUES (?, ?, ?)',
          [nombre_torre, frecuencia_mhz, jefe_turno]
        );
        return resolve({ id: result.insertId, nombre_torre, frecuencia_mhz, jefe_turno });
      } catch (error) {
        return reject(error);
      }
    });
  }

  update(id, { nombre_torre, frecuencia_mhz, jefe_turno }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'UPDATE `torres_control` SET `nombre_torre` = ?, `frecuencia_mhz` = ?, `jefe_turno` = ? WHERE id = ?',
          [nombre_torre, frecuencia_mhz, jefe_turno, id]
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
        const [result] = await pool.query('DELETE FROM `torres_control` WHERE id = ?', [id]);
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default new TorresControlModels();