const cellModel = require('../models/cellModel');
const db = require('../config/database');

const cellAdminController = {
  // POST /api/celdas - Crear nueva celda
  async create(req, res) {
    try {
      const { codigo_celda, tipo_permitido, sector } = req.body;

      if (!codigo_celda || !tipo_permitido) {
        return res.status(400).json({
          success: false,
          message: 'Código de celda y tipo permitido son obligatorios'
        });
      }

      // Validar tipo permitido
      const tiposValidos = ['AUTOMOVIL', 'MOTO', 'CAMIONETA', 'BICICLETA'];
      if (!tiposValidos.includes(tipo_permitido)) {
        return res.status(400).json({
          success: false,
          message: `El tipo permitido debe ser uno de: ${tiposValidos.join(', ')}`
        });
      }

      // Verificar código único
      const existing = await db.getOne(
        'SELECT id_celda FROM celdas WHERE codigo_celda = ?',
        [codigo_celda.trim().toUpperCase()]
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `El código de celda "${codigo_celda}" ya existe en el sistema`
        });
      }

      const result = await db.execute(
        `INSERT INTO celdas (codigo_celda, tipo_permitido, estado, sector)
         VALUES (?, ?, 'LIBRE', ?)`,
        [codigo_celda.trim().toUpperCase(), tipo_permitido, sector || 'General']
      );

      const newCell = await cellModel.getCellById(result.lastID);
      return res.status(201).json({
        success: true,
        message: 'Celda creada exitosamente',
        data: newCell
      });
    } catch (err) {
      console.error('Error al crear celda:', err);
      return res.status(500).json({ success: false, message: 'Error interno al crear celda' });
    }
  },

  // PUT /api/celdas/:id - Actualizar información de la celda
  async update(req, res) {
    try {
      const { id } = req.params;
      const { codigo_celda, tipo_permitido, sector } = req.body;

      const cell = await cellModel.getCellById(id);
      if (!cell) {
        return res.status(404).json({
          success: false,
          message: 'Celda no encontrada'
        });
      }

      // No se puede editar si está ocupada
      if (cell.estado === 'OCUPADA') {
        return res.status(400).json({
          success: false,
          message: 'No se puede modificar una celda que está actualmente OCUPADA'
        });
      }

      if (!codigo_celda || !tipo_permitido) {
        return res.status(400).json({
          success: false,
          message: 'Código de celda y tipo permitido son obligatorios'
        });
      }

      // Verificar que el nuevo código no esté en uso por otra celda
      const existing = await db.getOne(
        'SELECT id_celda FROM celdas WHERE codigo_celda = ? AND id_celda != ?',
        [codigo_celda.trim().toUpperCase(), id]
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `El código de celda "${codigo_celda}" ya está en uso por otra celda`
        });
      }

      await db.execute(
        'UPDATE celdas SET codigo_celda = ?, tipo_permitido = ?, sector = ? WHERE id_celda = ?',
        [codigo_celda.trim().toUpperCase(), tipo_permitido, sector || 'General', id]
      );

      const updated = await cellModel.getCellById(id);
      return res.json({
        success: true,
        message: 'Celda actualizada exitosamente',
        data: updated
      });
    } catch (err) {
      console.error('Error al actualizar celda:', err);
      return res.status(500).json({ success: false, message: 'Error interno al actualizar celda' });
    }
  },

  // DELETE /api/celdas/:id - Eliminar celda (solo si está LIBRE y sin historial)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const cell = await cellModel.getCellById(id);

      if (!cell) {
        return res.status(404).json({
          success: false,
          message: 'Celda no encontrada'
        });
      }

      if (cell.estado !== 'LIBRE') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden eliminar celdas con estado LIBRE'
        });
      }

      // Verificar que no tenga historial de accesos
      const history = await db.getOne(
        'SELECT COUNT(*) AS total FROM registros_acceso WHERE id_celda = ?',
        [id]
      );
      if (history && history.total > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar la celda porque tiene ${history.total} registro(s) de acceso en el historial`
        });
      }

      await db.execute('DELETE FROM celdas WHERE id_celda = ?', [id]);
      return res.json({
        success: true,
        message: `Celda ${cell.codigo_celda} eliminada exitosamente`
      });
    } catch (err) {
      console.error('Error al eliminar celda:', err);
      return res.status(500).json({ success: false, message: 'Error interno al eliminar celda' });
    }
  },

  // PATCH /api/celdas/:id/maintenance - Poner en mantenimiento (solo desde LIBRE)
  async setMaintenance(req, res) {
    try {
      const { id } = req.params;
      const cell = await cellModel.getCellById(id);

      if (!cell) {
        return res.status(404).json({
          success: false,
          message: 'Celda no encontrada'
        });
      }

      if (cell.estado !== 'LIBRE') {
        return res.status(400).json({
          success: false,
          message: 'Solo se puede pasar a MANTENIMIENTO una celda que esté LIBRE'
        });
      }

      await cellModel.updateCellState(id, 'MANTENIMIENTO');
      const updated = await cellModel.getCellById(id);
      return res.json({
        success: true,
        message: `Celda ${cell.codigo_celda} puesta en mantenimiento`,
        data: updated
      });
    } catch (err) {
      console.error('Error al poner celda en mantenimiento:', err);
      return res.status(500).json({ success: false, message: 'Error al cambiar estado de la celda' });
    }
  },

  // PATCH /api/celdas/:id/available - Volver a disponible (solo desde MANTENIMIENTO)
  async setAvailable(req, res) {
    try {
      const { id } = req.params;
      const cell = await cellModel.getCellById(id);

      if (!cell) {
        return res.status(404).json({
          success: false,
          message: 'Celda no encontrada'
        });
      }

      if (cell.estado !== 'MANTENIMIENTO') {
        return res.status(400).json({
          success: false,
          message: 'Solo se puede liberar una celda que esté en MANTENIMIENTO'
        });
      }

      await cellModel.updateCellState(id, 'LIBRE');
      const updated = await cellModel.getCellById(id);
      return res.json({
        success: true,
        message: `Celda ${cell.codigo_celda} disponible nuevamente`,
        data: updated
      });
    } catch (err) {
      console.error('Error al liberar celda de mantenimiento:', err);
      return res.status(500).json({ success: false, message: 'Error al cambiar estado de la celda' });
    }
  },

  // GET /api/celdas/reporte-capacidad - Reporte completo de capacidad
  async getCapacityReport(req, res) {
    try {
      const total = await db.getOne('SELECT COUNT(*) AS total FROM celdas');
      const libres = await db.getOne("SELECT COUNT(*) AS libres FROM celdas WHERE estado = 'LIBRE'");
      const ocupadas = await db.getOne("SELECT COUNT(*) AS ocupadas FROM celdas WHERE estado = 'OCUPADA'");
      const mantenimiento = await db.getOne("SELECT COUNT(*) AS mantenimiento FROM celdas WHERE estado = 'MANTENIMIENTO'");

      const porTipo = await db.query(`
        SELECT tipo_permitido,
               COUNT(*) AS total,
               SUM(CASE WHEN estado = 'LIBRE' THEN 1 ELSE 0 END) AS libres,
               SUM(CASE WHEN estado = 'OCUPADA' THEN 1 ELSE 0 END) AS ocupadas,
               SUM(CASE WHEN estado = 'MANTENIMIENTO' THEN 1 ELSE 0 END) AS mantenimiento
        FROM celdas
        GROUP BY tipo_permitido
      `);

      const sectores = await db.query(`
        SELECT DISTINCT sector FROM celdas ORDER BY sector ASC
      `);

      const totalVal = total.total || 0;
      const ocupadasVal = ocupadas.ocupadas || 0;
      const porcentajeOcupacion = totalVal > 0 ? Math.round((ocupadasVal / totalVal) * 100) : 0;

      return res.json({
        success: true,
        data: {
          total: totalVal,
          libres: libres.libres || 0,
          ocupadas: ocupadasVal,
          mantenimiento: mantenimiento.mantenimiento || 0,
          porcentajeOcupacion,
          porTipo,
          sectores: sectores.map(s => s.sector)
        }
      });
    } catch (err) {
      console.error('Error al generar reporte de capacidad:', err);
      return res.status(500).json({ success: false, message: 'Error generando reporte de capacidad' });
    }
  }
};

module.exports = cellAdminController;
