const billingModel = require('../models/billingModel');

const rateController = {
  async getAllRates(req, res) {
    try {
      const rates = await billingModel.getAllTariffs();
      return res.json({ success: true, count: rates.length, data: rates });
    } catch (err) {
      console.error('Error al obtener tarifas:', err);
      return res.status(500).json({ success: false, message: 'Error consultando tarifas vigentes' });
    }
  }
};

module.exports = rateController;
