import aerolineasModels from '../models/aerolineas.models.js';

class AerolineasController {
  listar() {
    return aerolineasModels.getAll();
  }
  obtenerPorId(id) {
    return aerolineasModels.getById(id);
  }
  crear(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!body.nombre || !body.codigo_iata || !body.pais) {
          return reject(new Error('Faltan datos de aerolínea (nombre, codigo_iata, pais)'));
        }
        const creado = await aerolineasModels.add(body);
        return resolve(creado);
      } catch (error) {
        return reject(error);
      }
    });
  }
  actualizar(id, body) {
    return aerolineasModels.update(id, body);
  }
  eliminar(id) {
    return aerolineasModels.delete(id);
  }
}

export default new AerolineasController();