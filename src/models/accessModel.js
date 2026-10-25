const db = require('../config/database');

const accessModel = {
  async getActiveByPlate(placa) {
    const cleanPlate = placa.trim().toUpperCase();
    const sql = `
      SELECT r.*, v.placa, v.tipo_vehiculo, v.marca, v.color,
             c.codigo_celda, c.sector,
             u.nombre_completo AS operador_entrada
      FROM registros_acceso r
      INNER JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
      INNER JOIN celdas c ON r.id_celda = c.id_celda
      INNER JOIN usuarios u ON r.id_usuario_entrada = u.id_usuario
      WHERE v.placa = ? AND r.estado = 'EN_CURSO'
    `;
    return await db.getOne(sql, [cleanPlate]);
  },

  async getActiveByTicket(folioTicket) {
    const sql = `
      SELECT r.*, v.placa, v.tipo_vehiculo, v.marca, v.color,
             c.codigo_celda, c.sector,
             u.nombre_completo AS operador_entrada
      FROM registros_acceso r
      INNER JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
      INNER JOIN celdas c ON r.id_celda = c.id_celda
      INNER JOIN usuarios u ON r.id_usuario_entrada = u.id_usuario
      WHERE r.folio_ticket = ? AND r.estado = 'EN_CURSO'
    `;
    return await db.getOne(sql, [folioTicket.trim()]);
  },

  async getActiveList() {
    const sql = `
      SELECT r.*, v.placa, v.tipo_vehiculo, v.marca, v.color,
             c.codigo_celda, c.sector,
             u.nombre_completo AS operador_entrada,
             ROUND((JULIANDAY('now', 'localtime') - JULIANDAY(r.fecha_hora_entrada)) * 24 * 60) AS minutos_acumulados
      FROM registros_acceso r
      INNER JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
      INNER JOIN celdas c ON r.id_celda = c.id_celda
      INNER JOIN usuarios u ON r.id_usuario_entrada = u.id_usuario
      WHERE r.estado = 'EN_CURSO'
      ORDER BY r.fecha_hora_entrada DESC
    `;
    return await db.query(sql);
  },

  async createEntry(idVehiculo, idCelda, modalidad, idUsuario = 1) {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const folioTicket = `TCK-${dateStr}-${rand}`;

    const fechaHoraEntrada = timestamp.toISOString().replace('T', ' ').slice(0, 19);

    const res = await db.execute(
      `INSERT INTO registros_acceso 
        (folio_ticket, id_vehiculo, id_celda, fecha_hora_entrada, modalidad, estado, id_usuario_entrada)
       VALUES (?, ?, ?, datetime('now', 'localtime'), ?, 'EN_CURSO', ?)`,
      [folioTicket, idVehiculo, idCelda, modalidad, idUsuario]
    );

    return await db.getOne(`
      SELECT r.*, v.placa, v.tipo_vehiculo, c.codigo_celda, c.sector
      FROM registros_acceso r
      INNER JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
      INNER JOIN celdas c ON r.id_celda = c.id_celda
      WHERE r.id_registro = ?
    `, [res.lastID]);
  },

  async registerExit(idRegistro, minutos, totalCobro, idUsuario = 1) {
    await db.execute(
      `UPDATE registros_acceso
       SET fecha_hora_salida = datetime('now', 'localtime'),
           minutos_estancia = ?,
           valor_total = ?,
           estado = 'FINALIZADO',
           id_usuario_salida = ?
       WHERE id_registro = ?`,
      [minutos, totalCobro, idUsuario, idRegistro]
    );

    return await db.getOne(`
      SELECT r.*, v.placa, v.tipo_vehiculo, c.codigo_celda, c.id_celda
      FROM registros_acceso r
      INNER JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
      INNER JOIN celdas c ON r.id_celda = c.id_celda
      WHERE r.id_registro = ?
    `, [idRegistro]);
  }
};

module.exports = accessModel;
