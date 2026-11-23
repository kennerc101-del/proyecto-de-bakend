import { pool } from '../config/connection.js';

class AsignacionesVueloModels {
  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query(`
          SELECT asig.id, asig.id_vuelo, v.codigo_vuelo, av.matricula AS avion_matricula,
                 asig.id_tripulacion, tr.nombre_completo AS tripulante, tr.licencia,
                 asig.funcion_asignada
          FROM \`asignaciones_vuelo\` asig
          JOIN \`vuelos\` v ON asig.id_vuelo = v.id
          JOIN \`aviones\` av ON v.id_avion = av.id
          JOIN \`tripulaciones\` tr ON asig.id_tripulacion = tr.id
          ORDER BY asig.id DESC
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
        const [rows] = await pool.query('SELECT * FROM `asignaciones_vuelo` WHERE id = ?', [id]);
        return resolve(rows[0] || null);
      } catch (error) {
        return reject(error);
      }
    });
  }

  add({ id_vuelo, id_tripulacion, funcion_asignada }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO `asignaciones_vuelo` (`id_vuelo`, `id_tripulacion`, `funcion_asignada`) VALUES (?, ?, ?)',
          [id_vuelo, id_tripulacion, funcion_asignada]
        );
        return resolve({ id: result.insertId, id_vuelo, id_tripulacion, funcion_asignada });
      } catch (error) {
        return reject(error);
      }
    });
  }

  update(id, { id_vuelo, id_tripulacion, funcion_asignada }) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'UPDATE `asignaciones_vuelo` SET `id_vuelo` = ?, `id_tripulacion` = ?, `funcion_asignada` = ? WHERE id = ?',
          [id_vuelo, id_tripulacion, funcion_asignada, id]
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
        const [result] = await pool.query('DELETE FROM `asignaciones_vuelo` WHERE id = ?', [id]);
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default new AsignacionesVueloModels();