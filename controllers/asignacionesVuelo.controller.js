import asignacionesVueloModels from '../models/asignacionesVuelo.models.js';

class AsignacionesVueloController {
  listar() {
    return asignacionesVueloModels.getAll();
  }
  obtenerPorId(id) {
    return asignacionesVueloModels.getById(id);
  }
  crear(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!body.id_vuelo || !body.id_tripulacion || !body.funcion_asignada) {
          return reject(new Error('Faltan datos de asignación (id_vuelo, id_tripulacion, funcion_asignada)'));
        }
        const creado = await asignacionesVueloModels.add(body);
        return resolve(creado);
      } catch (error) {
        return reject(error);
      }
    });
  }
  actualizar(id, body) {
    return asignacionesVueloModels.update(id, body);
  }
  eliminar(id) {
    return asignacionesVueloModels.delete(id);
  }
}

export default new AsignacionesVueloController();