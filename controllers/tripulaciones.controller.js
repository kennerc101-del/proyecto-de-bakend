import tripulacionesModels from '../models/tripulaciones.models.js';

class TripulacionesController {
  listar() {
    return tripulacionesModels.getAll();
  }
  obtenerPorId(id) {
    return tripulacionesModels.getById(id);
  }
  crear(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!body.nombre_completo || !body.rol_vuelo || !body.licencia) {
          return reject(new Error('Faltan datos de tripulación'));
        }
        const creado = await tripulacionesModels.add(body);
        return resolve(creado);
      } catch (error) {
        return reject(error);
      }
    });
  }
  actualizar(id, body) {
    return tripulacionesModels.update(id, body);
  }
  eliminar(id) {
    return tripulacionesModels.delete(id);
  }
}

export default new TripulacionesController();