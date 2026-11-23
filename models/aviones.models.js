import { pool } from '../config/connection.js';

class AvionesModels {
  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query(`
          SELECT a.id, a.matricula, a.modelo, a.capacidad_pasajeros, a.id_aerolinea,
                 al.nombre AS aerolinea_nombre, al.codigo_iata
          FROM \`aviones\` a
          JOIN \`aerolineas\` al ON a.id_aerolinea = al.id
          ORDER BY a.id DESC
        `);
        return resolve(rows);
      } catch (error) {
        return reject(error);
      }
    });
  }

  getById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query('SELECT * FROM `aviones` WHERE id = ?', [id]);
        return resolve(rows[0] || null);
      } catch (error) {
        return reject(error);
      }
    });
  }

  add({ matricula, modelo, capacidad_pasajeros, id_aerolinea }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO `aviones` (`matricula`, `modelo`, `capacidad_pasajeros`, `id_aerolinea`) VALUES (?, ?, ?, ?)',
          [matricula, modelo, capacidad_pasajeros, id_aerolinea]
        );
        return resolve({ id: result.insertId, matricula, modelo, capacidad_pasajeros, id_aerolinea });
      } catch (error) {
        return reject(error);
      }
    });
  }

  update(id, { matricula, modelo, capacidad_pasajeros, id_aerolinea }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'UPDATE `aviones` SET `matricula` = ?, `modelo` = ?, `capacidad_pasajeros` = ?, `id_aerolinea` = ? WHERE id = ?',
          [matricula, modelo, capacidad_pasajeros, id_aerolinea, id]
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
        const [result] = await pool.query('DELETE FROM `aviones` WHERE id = ?', [id]);
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default new AvionesModels();