import pistasModels from '../models/pistas.models.js';

class PistasController {
  listar() {
    return pistasModels.getAll();
  }
  obtenerPorId(id) {
    return pistasModels.getById(id);
  }
  crear(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!body.codigo_pista || !body.longitud_metros) {
          return reject(new Error('Faltan datos de pista (codigo_pista, longitud_metros)'));
        }
        const creado = await pistasModels.add(body);
        return resolve(creado);
      } catch (error) {
        return reject(error);
      }
    });
  }
  actualizar(id, body) {
    return pistasModels.update(id, body);
  }
  eliminar(id) {
    return pistasModels.delete(id);
  }
}

export default new PistasController();