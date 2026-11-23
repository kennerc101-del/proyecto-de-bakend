import avionesModels from '../models/aviones.models.js';

class AvionesController {
  listar() {
    return avionesModels.getAll();
  }
  obtenerPorId(id) {
    return avionesModels.getById(id);
  }
  crear(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!body.matricula || !body.modelo || !body.capacidad_pasajeros || !body.id_aerolinea) {
          return reject(new Error('Faltan datos del avión o aerolínea'));
        }
        const creado = await avionesModels.add(body);
        return resolve(creado);
      } catch (error) {
        return reject(error);
      }
    });
  }
  actualizar(id, body) {
    return avionesModels.update(id, body);
  }
  eliminar(id) {
    return avionesModels.delete(id);
  }
}

export default new AvionesController();