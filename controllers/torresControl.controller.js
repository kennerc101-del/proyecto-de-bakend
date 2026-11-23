import torresControlModels from '../models/torresControl.models.js';

class TorresControlController {
  listar() {
    return torresControlModels.getAll();
  }
  obtenerPorId(id) {
    return torresControlModels.getById(id);
  }
  crear(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!body.nombre_torre || !body.frecuencia_mhz || !body.jefe_turno) {
          return reject(new Error('Faltan datos de torre de control'));
        }
        const creado = await torresControlModels.add(body);
        return resolve(creado);
      } catch (error) {
        return reject(error);
      }
    });
  }
  actualizar(id, body) {
    return torresControlModels.update(id, body);
  }
  eliminar(id) {
    return torresControlModels.delete(id);
  }
}

export default new TorresControlController();