import { pool } from '../config/connection.js';

class VuelosModels {
  async validarPistaOperativa(id_pista) {
    const [rows] = await pool.query(
      'SELECT id, codigo_pista, estado FROM `pistas` WHERE id = ? LIMIT 1',
      [id_pista]
    );

    if (rows.length === 0) {
      throw new Error('La pista seleccionada no existe');
    }

    if (rows[0].estado !== 'Operativa') {
      throw new Error(
        `No se puede asignar el vuelo a la pista ${rows[0].codigo_pista} porque su estado es "${rows[0].estado}" (debe estar "Operativa")`
      );
    }

    return rows[0];
  }

  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await pool.query(`
          SELECT v.id, v.codigo_vuelo, v.origen, v.destino, v.hora_salida, v.estado_vuelo,
                 v.id_avion, av.matricula AS avion_matricula, av.modelo AS avion_modelo,
                 v.id_pista, p.codigo_pista, p.estado AS estado_pista,
                 v.id_torre, t.nombre_torre
          FROM \`vuelos\` v
          JOIN \`aviones\` av ON v.id_avion = av.id
          JOIN \`pistas\` p ON v.id_pista = p.id
          JOIN \`torres_control\` t ON v.id_torre = t.id
          ORDER BY v.hora_salida DESC
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
        const [rows] = await pool.query('SELECT * FROM `vuelos` WHERE id = ?', [id]);
        return resolve(rows[0] || null);
      } catch (error) {
        return reject(error);
      }
    });
  }

  add({ codigo_vuelo, origen, destino, hora_salida, estado_vuelo, id_avion, id_pista, id_torre }) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.validarPistaOperativa(id_pista);

        const [result] = await pool.query(
          `INSERT INTO \`vuelos\`
           (\`codigo_vuelo\`, \`origen\`, \`destino\`, \`hora_salida\`, \`estado_vuelo\`, \`id_avion\`, \`id_pista\`, \`id_torre\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [codigo_vuelo, origen, destino, hora_salida, estado_vuelo || 'Programado', id_avion, id_pista, id_torre]
        );

        return resolve({
          id: result.insertId,
          codigo_vuelo,
          origen,
          destino,
          hora_salida,
          estado_vuelo: estado_vuelo || 'Programado',
          id_avion,
          id_pista,
          id_torre
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  update(id, { codigo_vuelo, origen, destino, hora_salida, estado_vuelo, id_avion, id_pista, id_torre }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (id_pista !== undefined) {
          await this.validarPistaOperativa(id_pista);
        }

        const [result] = await pool.query(
          `UPDATE \`vuelos\`
           SET \`codigo_vuelo\` = ?, \`origen\` = ?, \`destino\` = ?, \`hora_salida\` = ?,
               \`estado_vuelo\` = ?, \`id_avion\` = ?, \`id_pista\` = ?, \`id_torre\` = ?
           WHERE id = ?`,
          [codigo_vuelo, origen, destino, hora_salida, estado_vuelo, id_avion, id_pista, id_torre, id]
        );

        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }

  updateEstado(id, estado_vuelo) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await pool.query(
          'UPDATE `vuelos` SET `estado_vuelo` = ? WHERE id = ?',
          [estado_vuelo, id]
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
        const [result] = await pool.query('DELETE FROM `vuelos` WHERE id = ?', [id]);
        return resolve(result.affectedRows > 0);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default new VuelosModels();