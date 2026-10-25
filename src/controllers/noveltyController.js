const noveltyModel = require('../models/noveltyModel');
const vehicleModel = require('../models/vehicleModel');

const noveltyController = {
  async create(req, res) {
    try {
      const { placa, tipoVehiculo, idRegistro, momento, tipoNovedad, descripcion, severidad } = req.body;

      if (!placa || !descripcion || !tipoNovedad) {
        return res.status(400).json({
          success: false,
          message: 'Placa, tipo de novedad y descripción son obligatorios'
        });
      }

      const vehicle = await vehicleModel.findOrCreate(placa, tipoVehiculo || 'AUTOMOVIL');
      const novelty = await noveltyModel.createNovelty(
        idRegistro || null,
        vehicle.id_vehiculo,
        momento || 'ESTANCIA',
        tipoNovedad,
        descripcion,
        severidad || 'BAJA',
        1
      );

      return res.status(201).json({
        success: true,
        message: 'Novedad registrada exitosamente en la bitácora',
        data: novelty
      });
    } catch (err) {
      console.error('Error al registrar novedad:', err);
      return res.status(500).json({ success: false, message: 'Error interno al registrar novedad' });
    }
  },

  async getByPlate(req, res) {
    try {
      const { placa } = req.params;
      const novelties = await noveltyModel.getByPlate(placa);
      return res.json({ success: true, count: novelties.length, data: novelties });
    } catch (err) {
      console.error('Error consultando novedades por placa:', err);
      return res.status(500).json({ success: false, message: 'Error consultando novedades' });
    }
  },

  async getRecent(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 15;
      const list = await noveltyModel.getRecent(limit);
      return res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      console.error('Error consultando novedades recientes:', err);
      return res.status(500).json({ success: false, message: 'Error consultando novedades recientes' });
    }
  }
};

module.exports = noveltyController;
