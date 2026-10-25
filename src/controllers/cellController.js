const cellModel = require('../models/cellModel');

const cellController = {
  async getCells(req, res) {
    try {
      const { tipo } = req.query;
      const cells = await cellModel.getAllCells(tipo);
      return res.json({ success: true, count: cells.length, data: cells });
    } catch (err) {
      console.error('Error al obtener celdas:', err);
      return res.status(500).json({ success: false, message: 'Error consultando celdas' });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await cellModel.getCellStats();
      return res.json({ success: true, data: stats });
    } catch (err) {
      console.error('Error al obtener estadísticas de celdas:', err);
      return res.status(500).json({ success: false, message: 'Error consultando estadísticas' });
    }
  },

  async getAvailable(req, res) {
    try {
      const { tipo } = req.params;
      const available = await cellModel.getAvailableCells(tipo.toUpperCase());
      return res.json({ success: true, count: available.length, data: available });
    } catch (err) {
      console.error('Error al obtener celdas libres:', err);
      return res.status(500).json({ success: false, message: 'Error consultando disponibilidad' });
    }
  }
};

module.exports = cellController;
