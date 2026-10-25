const db = require('../config/database');

const vehicleModel = {
  async getByPlate(placa) {
    const cleanPlate = placa.trim().toUpperCase();
    return await db.getOne('SELECT * FROM vehiculos WHERE placa = ?', [cleanPlate]);
  },

  async findOrCreate(placa, tipoVehiculo, marca = null, linea = null, color = null) {
    const cleanPlate = placa.trim().toUpperCase();
    let vehicle = await this.getByPlate(cleanPlate);

    if (!vehicle) {
      const res = await db.execute(
        `INSERT INTO vehiculos (placa, tipo_vehiculo, marca, linea_modelo, color)
         VALUES (?, ?, ?, ?, ?)`,
        [cleanPlate, tipoVehiculo, marca || 'No especificada', linea || 'Estándar', color || 'No especificado']
      );
      vehicle = await db.getOne('SELECT * FROM vehiculos WHERE id_vehiculo = ?', [res.lastID]);
    }
    return vehicle;
  },

  async checkActiveSubscription(placa) {
    const cleanPlate = placa.trim().toUpperCase();
    const sql = `
      SELECT m.*, c.nombre_completo AS cliente_nombre, c.documento, c.telefono, v.placa
      FROM mensualidades m
      INNER JOIN vehiculos v ON m.id_vehiculo = v.id_vehiculo
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      WHERE v.placa = ?
        AND m.estado = 'ACTIVA'
        AND date('now', 'localtime') BETWEEN date(m.fecha_inicio) AND date(m.fecha_fin)
    `;
    const sub = await db.getOne(sql, [cleanPlate]);
    return sub || null;
  }
};

module.exports = vehicleModel;
