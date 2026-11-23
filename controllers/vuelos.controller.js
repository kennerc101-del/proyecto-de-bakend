import vuelosModels from '../models/vuelos.models.js';

class VuelosController {
  listar() {
    return vuelosModels.getAll();
  }
  obtenerPorId(id) {
    return vuelosModels.getById(id);
  }
  crear(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!body.codigo_vuelo || !body.origen || !body.destino || !body.hora_salida || !body.id_avion || !body.id_pista || !body.id_torre) {
          return reject(new Error('Faltan datos obligatorios del vuelo'));
        }
        const creado = await vuelosModels.add(body);
        return resolve(creado);
      } catch (error) {
        return reject(error);
      }
    });
  }
  actualizar(id, body) {
    return vuelosModels.update(id, body);
  }
  actualizarEstado(id, estado_vuelo) {
    return vuelosModels.updateEstado(id, estado_vuelo);
  }
  eliminar(id) {
    return vuelosModels.delete(id);
  }
}

export default new VuelosController();