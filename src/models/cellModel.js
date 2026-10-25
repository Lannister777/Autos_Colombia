const db = require('../config/database');

const cellModel = {
  async getAllCells(tipo = null) {
    let sql = `
      SELECT c.*, 
             r.folio_ticket, r.fecha_hora_entrada,
             v.placa, v.tipo_vehiculo AS tipo_vehiculo_ocupante
      FROM celdas c
      LEFT JOIN registros_acceso r ON c.id_celda = r.id_celda AND r.estado = 'EN_CURSO'
      LEFT JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
    `;
    const params = [];
    if (tipo && tipo !== 'TODOS') {
      sql += ' WHERE c.tipo_permitido = ?';
      params.push(tipo);
    }
    sql += ' ORDER BY c.codigo_celda ASC';
    return await db.query(sql, params);
  },

  async getAvailableCells(tipoVehiculo) {
    const sql = `
      SELECT * FROM celdas 
      WHERE tipo_permitido = ? AND estado = 'LIBRE' 
      ORDER BY codigo_celda ASC
    `;
    return await db.query(sql, [tipoVehiculo]);
  },

  async getCellById(idCelda) {
    return await db.getOne('SELECT * FROM celdas WHERE id_celda = ?', [idCelda]);
  },

  async updateCellState(idCelda, nuevoEstado) {
    return await db.execute(
      'UPDATE celdas SET estado = ? WHERE id_celda = ?',
      [nuevoEstado, idCelda]
    );
  },

  async getCellStats() {
    const total = await db.getOne('SELECT COUNT(*) AS total FROM celdas');
    const libres = await db.getOne("SELECT COUNT(*) AS libres FROM celdas WHERE estado = 'LIBRE'");
    const ocupadas = await db.getOne("SELECT COUNT(*) AS ocupadas FROM celdas WHERE estado = 'OCUPADA'");
    const porTipo = await db.query(`
      SELECT tipo_permitido,
             COUNT(*) AS total,
             SUM(CASE WHEN estado = 'LIBRE' THEN 1 ELSE 0 END) AS libres,
             SUM(CASE WHEN estado = 'OCUPADA' THEN 1 ELSE 0 END) AS ocupadas
      FROM celdas
      GROUP BY tipo_permitido
    `);

    return {
      total: total.total,
      libres: libres.libres,
      ocupadas: ocupadas.ocupadas,
      porTipo
    };
  }
};

module.exports = cellModel;
