const db = require('../config/database');

const noveltyModel = {
  async createNovelty(idRegistro, idVehiculo, momento, tipoNovedad, descripcion, severidad = 'BAJA', idUsuario = 1) {
    const res = await db.execute(
      `INSERT INTO novedades 
        (id_registro, id_vehiculo, momento, tipo_novedad, descripcion, severidad, fecha_hora, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)`,
      [idRegistro || null, idVehiculo, momento, tipoNovedad, descripcion, severidad, idUsuario]
    );

    return await db.getOne('SELECT * FROM novedades WHERE id_novedad = ?', [res.lastID]);
  },

  async getByPlate(placa) {
    const cleanPlate = placa.trim().toUpperCase();
    const sql = `
      SELECT n.*, v.placa, v.tipo_vehiculo, u.nombre_completo AS operador_nombre
      FROM novedades n
      INNER JOIN vehiculos v ON n.id_vehiculo = v.id_vehiculo
      INNER JOIN usuarios u ON n.id_usuario = u.id_usuario
      WHERE v.placa = ?
      ORDER BY n.fecha_hora DESC
    `;
    return await db.query(sql, [cleanPlate]);
  },

  async getRecent(limit = 15) {
    const sql = `
      SELECT n.*, v.placa, v.tipo_vehiculo, u.nombre_completo AS operador_nombre,
             r.folio_ticket
      FROM novedades n
      INNER JOIN vehiculos v ON n.id_vehiculo = v.id_vehiculo
      INNER JOIN usuarios u ON n.id_usuario = u.id_usuario
      LEFT JOIN registros_acceso r ON n.id_registro = r.id_registro
      ORDER BY n.fecha_hora DESC
      LIMIT ?
    `;
    return await db.query(sql, [limit]);
  }
};

module.exports = noveltyModel;
