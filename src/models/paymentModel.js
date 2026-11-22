const db = require('../config/database');

// Asegurar columnas de auditoría y estado para anulación de pagos en SQLite
let columnsInitialized = false;
async function ensurePaymentColumns() {
  if (columnsInitialized) return;
  try {
    const tableInfo = await db.query("PRAGMA table_info(pagos)");
    const columnNames = tableInfo.map(col => col.name);

    if (!columnNames.includes('estado')) {
      await db.execute("ALTER TABLE pagos ADD COLUMN estado VARCHAR(20) DEFAULT 'APROBADO'");
    }
    if (!columnNames.includes('motivo_anulacion')) {
      await db.execute("ALTER TABLE pagos ADD COLUMN motivo_anulacion TEXT NULL");
    }
    if (!columnNames.includes('fecha_anulacion')) {
      await db.execute("ALTER TABLE pagos ADD COLUMN fecha_anulacion DATETIME NULL");
    }
    if (!columnNames.includes('id_usuario_anulacion')) {
      await db.execute("ALTER TABLE pagos ADD COLUMN id_usuario_anulacion INTEGER NULL");
    }
    columnsInitialized = true;
  } catch (err) {
    console.error('Error al verificar/actualizar columnas de pagos:', err.message);
  }
}

const paymentModel = {
  // Inicialización bajo demanda
  async init() {
    await ensurePaymentColumns();
  },

  // Actualiza automáticamente mensualidades vencidas
  async updateExpiredSubscriptions() {
    await db.execute(`
      UPDATE mensualidades 
      SET estado = 'VENCIDA' 
      WHERE estado = 'ACTIVA' AND date(fecha_fin) < date('now')
    `);
  },

  // Listar historial de pagos con filtros completos
  async getAllPayments(filters = {}) {
    await ensurePaymentColumns();

    let sql = `
      SELECT 
        p.id_pago,
        p.numero_comprobante,
        p.id_registro,
        p.id_mensualidad,
        p.monto_pagado,
        p.metodo_pago,
        p.referencia_transaccion,
        p.fecha_hora_pago,
        COALESCE(p.estado, 'APROBADO') AS estado,
        p.motivo_anulacion,
        p.fecha_anulacion,
        u.nombre_completo AS operador_nombre,
        u_anula.nombre_completo AS anulado_por_nombre,
        CASE 
          WHEN p.id_mensualidad IS NOT NULL THEN 'MENSUALIDAD'
          ELSE 'ACCESO'
        END AS tipo_pago,
        COALESCE(v_ra.placa, v_m.placa, 'SIN-PLACA') AS placa_vehiculo,
        COALESCE(v_ra.tipo_vehiculo, v_m.tipo_vehiculo, 'AUTOMOVIL') AS tipo_vehiculo,
        COALESCE(c_m.nombre_completo, 'Cliente Ocasional') AS cliente_nombre,
        ra.folio_ticket
      FROM pagos p
      LEFT JOIN registros_acceso ra ON p.id_registro = ra.id_registro
      LEFT JOIN vehiculos v_ra ON ra.id_vehiculo = v_ra.id_vehiculo
      LEFT JOIN mensualidades m ON p.id_mensualidad = m.id_mensualidad
      LEFT JOIN clientes c_m ON m.id_cliente = c_m.id_cliente
      LEFT JOIN vehiculos v_m ON m.id_vehiculo = v_m.id_vehiculo
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN usuarios u_anula ON p.id_usuario_anulacion = u_anula.id_usuario
      WHERE 1 = 1
    `;
    const params = [];

    if (filters.metodo && filters.metodo !== 'TODOS') {
      sql += ' AND p.metodo_pago = ?';
      params.push(filters.metodo.toUpperCase());
    }

    if (filters.estado && filters.estado !== 'TODOS') {
      sql += " AND COALESCE(p.estado, 'APROBADO') = ?";
      params.push(filters.estado.toUpperCase());
    }

    if (filters.tipo && filters.tipo !== 'TODOS') {
      if (filters.tipo.toUpperCase() === 'MENSUALIDAD') {
        sql += ' AND p.id_mensualidad IS NOT NULL';
      } else if (filters.tipo.toUpperCase() === 'ACCESO') {
        sql += ' AND p.id_registro IS NOT NULL';
      }
    }

    if (filters.fecha_inicio) {
      sql += ' AND date(p.fecha_hora_pago) >= date(?)';
      params.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      sql += ' AND date(p.fecha_hora_pago) <= date(?)';
      params.push(filters.fecha_fin);
    }

    if (filters.placa && filters.placa.trim() !== '') {
      sql += ' AND (v_ra.placa LIKE ? OR v_m.placa LIKE ?)';
      const term = `%${filters.placa.trim().toUpperCase()}%`;
      params.push(term, term);
    }

    if (filters.search && filters.search.trim() !== '') {
      sql += ` AND (
        p.numero_comprobante LIKE ? OR 
        v_ra.placa LIKE ? OR 
        v_m.placa LIKE ? OR 
        c_m.nombre_completo LIKE ? OR
        p.referencia_transaccion LIKE ?
      )`;
      const s = `%${filters.search.trim()}%`;
      params.push(s, s, s, s, s);
    }

    sql += ' ORDER BY p.id_pago DESC';
    return await db.query(sql, params);
  },

  // Obtener detalle de pago por ID
  async getPaymentById(id) {
    await ensurePaymentColumns();

    const sql = `
      SELECT 
        p.id_pago,
        p.numero_comprobante,
        p.id_registro,
        p.id_mensualidad,
        p.monto_pagado,
        p.metodo_pago,
        p.referencia_transaccion,
        p.fecha_hora_pago,
        COALESCE(p.estado, 'APROBADO') AS estado,
        p.motivo_anulacion,
        p.fecha_anulacion,
        p.id_usuario,
        u.nombre_completo AS operador_nombre,
        u_anula.nombre_completo AS anulado_por_nombre,
        CASE 
          WHEN p.id_mensualidad IS NOT NULL THEN 'MENSUALIDAD'
          ELSE 'ACCESO'
        END AS tipo_pago,
        COALESCE(v_ra.placa, v_m.placa, 'SIN-PLACA') AS placa_vehiculo,
        COALESCE(v_ra.tipo_vehiculo, v_m.tipo_vehiculo, 'AUTOMOVIL') AS tipo_vehiculo,
        COALESCE(v_ra.marca, v_m.marca, '') AS marca_vehiculo,
        COALESCE(v_ra.color, v_m.color, '') AS color_vehiculo,
        COALESCE(c_m.nombre_completo, 'Cliente Ocasional') AS cliente_nombre,
        c_m.telefono AS cliente_telefono,
        c_m.email AS cliente_email,
        c_m.documento AS cliente_documento,
        ra.folio_ticket,
        ra.fecha_hora_entrada,
        ra.fecha_hora_salida,
        ra.minutos_estancia,
        ra.estado AS estado_registro_acceso,
        m.fecha_inicio AS mensualidad_inicio,
        m.fecha_fin AS mensualidad_fin,
        m.valor_mensual AS mensualidad_valor,
        ce.codigo_celda
      FROM pagos p
      LEFT JOIN registros_acceso ra ON p.id_registro = ra.id_registro
      LEFT JOIN vehiculos v_ra ON ra.id_vehiculo = v_ra.id_vehiculo
      LEFT JOIN mensualidades m ON p.id_mensualidad = m.id_mensualidad
      LEFT JOIN clientes c_m ON m.id_cliente = c_m.id_cliente
      LEFT JOIN vehiculos v_m ON m.id_vehiculo = v_m.id_vehiculo
      LEFT JOIN celdas ce ON m.id_celda_asignada = ce.id_celda
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN usuarios u_anula ON p.id_usuario_anulacion = u_anula.id_usuario
      WHERE p.id_pago = ?
    `;
    return await db.getOne(sql, [id]);
  },

  // Anular pago
  async voidPayment(id, idUsuario, motivo) {
    await ensurePaymentColumns();

    const pago = await this.getPaymentById(id);
    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    if (pago.estado === 'ANULADO') {
      throw new Error('El pago ya se encuentra anulado');
    }

    const now = new Date().toISOString();
    await db.execute(
      `UPDATE pagos 
       SET estado = 'ANULADO', motivo_anulacion = ?, fecha_anulacion = ?, id_usuario_anulacion = ?
       WHERE id_pago = ?`,
      [motivo, now, idUsuario, id]
    );

    return await this.getPaymentById(id);
  },

  // Listar mensualidades con filtros
  async getAllSubscriptions(filters = {}) {
    await this.updateExpiredSubscriptions();

    let sql = `
      SELECT 
        m.id_mensualidad,
        m.id_cliente,
        m.id_vehiculo,
        m.id_celda_asignada,
        m.fecha_inicio,
        m.fecha_fin,
        m.valor_mensual,
        m.estado,
        c.nombre_completo AS cliente_nombre,
        c.documento AS cliente_documento,
        c.telefono AS cliente_telefono,
        c.email AS cliente_email,
        v.placa AS vehiculo_placa,
        v.tipo_vehiculo,
        v.marca,
        v.linea_modelo,
        ce.codigo_celda,
        ce.sector AS celda_sector,
        ROUND((julianday(m.fecha_fin) - julianday('now'))) AS dias_restantes
      FROM mensualidades m
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      INNER JOIN vehiculos v ON m.id_vehiculo = v.id_vehiculo
      LEFT JOIN celdas ce ON m.id_celda_asignada = ce.id_celda
      WHERE 1 = 1
    `;
    const params = [];

    if (filters.estado && filters.estado !== 'TODOS') {
      sql += ' AND m.estado = ?';
      params.push(filters.estado.toUpperCase());
    }

    if (filters.search && filters.search.trim() !== '') {
      sql += ` AND (
        c.nombre_completo LIKE ? OR
        c.documento LIKE ? OR
        v.placa LIKE ? OR
        ce.codigo_celda LIKE ?
      )`;
      const s = `%${filters.search.trim()}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY m.id_mensualidad DESC';
    return await db.query(sql, params);
  },

  // Obtener mensualidad por ID
  async getSubscriptionById(id) {
    await this.updateExpiredSubscriptions();

    const sql = `
      SELECT 
        m.id_mensualidad,
        m.id_cliente,
        m.id_vehiculo,
        m.id_celda_asignada,
        m.fecha_inicio,
        m.fecha_fin,
        m.valor_mensual,
        m.estado,
        c.nombre_completo AS cliente_nombre,
        c.documento AS cliente_documento,
        c.telefono AS cliente_telefono,
        c.email AS cliente_email,
        c.direccion AS cliente_direccion,
        v.placa AS vehiculo_placa,
        v.tipo_vehiculo,
        v.marca,
        v.linea_modelo,
        v.color,
        ce.codigo_celda,
        ce.sector AS celda_sector,
        ROUND((julianday(m.fecha_fin) - julianday('now'))) AS dias_restantes
      FROM mensualidades m
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      INNER JOIN vehiculos v ON m.id_vehiculo = v.id_vehiculo
      LEFT JOIN celdas ce ON m.id_celda_asignada = ce.id_celda
      WHERE m.id_mensualidad = ?
    `;
    const subscription = await db.getOne(sql, [id]);
    if (!subscription) return null;

    // Obtener historial de pagos de esta mensualidad
    const payments = await db.query(
      `SELECT id_pago, numero_comprobante, monto_pagado, metodo_pago, referencia_transaccion, fecha_hora_pago, COALESCE(estado, 'APROBADO') as estado
       FROM pagos 
       WHERE id_mensualidad = ?
       ORDER BY id_pago DESC`,
      [id]
    );

    return { ...subscription, pagos: payments };
  },

  // Crear nueva mensualidad con su respectivo pago inicial
  async createSubscription({
    id_cliente,
    id_vehiculo,
    id_celda_asignada,
    fecha_inicio,
    fecha_fin,
    valor_mensual,
    metodo_pago = 'EFECTIVO',
    referencia_transaccion = null,
    id_usuario = 1
  }) {
    await ensurePaymentColumns();

    // 1. Validar cliente
    const cliente = await db.getOne('SELECT * FROM clientes WHERE id_cliente = ?', [id_cliente]);
    if (!cliente) throw new Error('El cliente seleccionado no existe');

    // 2. Validar vehículo
    const vehiculo = await db.getOne('SELECT * FROM vehiculos WHERE id_vehiculo = ?', [id_vehiculo]);
    if (!vehiculo) throw new Error('El vehículo seleccionado no existe');

    // 3. Validar celda si se asigna
    if (id_celda_asignada) {
      const celda = await db.getOne('SELECT * FROM celdas WHERE id_celda = ?', [id_celda_asignada]);
      if (!celda) throw new Error('La celda seleccionada no existe');
      if (celda.estado !== 'LIBRE') {
        throw new Error('La celda seleccionada no está disponible');
      }
    }

    // 4. Calcular fecha fin si no se especifica (30 días por defecto)
    let finDate = fecha_fin;
    if (!finDate) {
      const start = new Date(fecha_inicio || new Date());
      start.setDate(start.getDate() + 30);
      finDate = start.toISOString().split('T')[0];
    }
    const iniDate = fecha_inicio || new Date().toISOString().split('T')[0];

    // 5. Insertar mensualidad
    const resMensualidad = await db.execute(
      `INSERT INTO mensualidades 
        (id_cliente, id_vehiculo, id_celda_asignada, fecha_inicio, fecha_fin, valor_mensual, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVA')`,
      [id_cliente, id_vehiculo, id_celda_asignada || null, iniDate, finDate, valor_mensual]
    );
    const idMensualidad = resMensualidad.lastID;

    // 6. Si se asignó celda, marcarla como OCUPADA
    if (id_celda_asignada) {
      await db.execute("UPDATE celdas SET estado = 'OCUPADA' WHERE id_celda = ?", [id_celda_asignada]);
    }

    // 7. Generar comprobante único para el pago de activación
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const comprobante = `CP-${dateStr}-${rand}`;

    const resPago = await db.execute(
      `INSERT INTO pagos 
        (numero_comprobante, id_registro, id_mensualidad, monto_pagado, metodo_pago, referencia_transaccion, id_usuario, estado)
       VALUES (?, NULL, ?, ?, ?, ?, ?, 'APROBADO')`,
      [comprobante, idMensualidad, valor_mensual, metodo_pago, referencia_transaccion, id_usuario]
    );

    const subscription = await this.getSubscriptionById(idMensualidad);
    const payment = await this.getPaymentById(resPago.lastID);

    return { subscription, payment };
  },

  // Renovar mensualidad existente
  async renewSubscription(id_mensualidad, {
    metodo_pago = 'EFECTIVO',
    referencia_transaccion = null,
    valor_mensual = null,
    id_usuario = 1
  }) {
    await ensurePaymentColumns();

    const sub = await db.getOne('SELECT * FROM mensualidades WHERE id_mensualidad = ?', [id_mensualidad]);
    if (!sub) throw new Error('Mensualidad no encontrada');

    if (sub.estado === 'CANCELADA') {
      throw new Error('No se puede renovar una mensualidad cancelada');
    }

    const valorCobro = valor_mensual || sub.valor_mensual;

    // Calcular nueva fecha fin (+30 días desde hoy o desde la fecha fin si aún no vence)
    const hoy = new Date();
    const actualFin = new Date(sub.fecha_fin);
    let baseDate = actualFin > hoy ? actualFin : hoy;
    const nuevaFin = new Date(baseDate);
    nuevaFin.setDate(nuevaFin.getDate() + 30);
    const nuevaFechaFinStr = nuevaFin.toISOString().split('T')[0];

    // Actualizar mensualidad a ACTIVA y extender fecha
    await db.execute(
      "UPDATE mensualidades SET estado = 'ACTIVA', fecha_fin = ?, valor_mensual = ? WHERE id_mensualidad = ?",
      [nuevaFechaFinStr, valorCobro, id_mensualidad]
    );

    // Si tiene celda asignada, asegurar que esté OCUPADA
    if (sub.id_celda_asignada) {
      await db.execute("UPDATE celdas SET estado = 'OCUPADA' WHERE id_celda = ?", [sub.id_celda_asignada]);
    }

    // Registrar pago de renovación
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const comprobante = `CP-${dateStr}-${rand}`;

    const resPago = await db.execute(
      `INSERT INTO pagos 
        (numero_comprobante, id_registro, id_mensualidad, monto_pagado, metodo_pago, referencia_transaccion, id_usuario, estado)
       VALUES (?, NULL, ?, ?, ?, ?, ?, 'APROBADO')`,
      [comprobante, id_mensualidad, valorCobro, metodo_pago, referencia_transaccion, id_usuario]
    );

    const updatedSub = await this.getSubscriptionById(id_mensualidad);
    const payment = await this.getPaymentById(resPago.lastID);

    return { subscription: updatedSub, payment };
  },

  // Cancelar mensualidad activa
  async cancelSubscription(id_mensualidad, id_usuario = 1) {
    const sub = await db.getOne('SELECT * FROM mensualidades WHERE id_mensualidad = ?', [id_mensualidad]);
    if (!sub) throw new Error('Mensualidad no encontrada');

    if (sub.estado === 'CANCELADA') {
      throw new Error('La mensualidad ya se encuentra cancelada');
    }

    // Cambiar estado a CANCELADA
    await db.execute("UPDATE mensualidades SET estado = 'CANCELADA' WHERE id_mensualidad = ?", [id_mensualidad]);

    // Liberar la celda si tenía una asignada
    if (sub.id_celda_asignada) {
      await db.execute("UPDATE celdas SET estado = 'LIBRE' WHERE id_celda = ?", [sub.id_celda_asignada]);
    }

    return await this.getSubscriptionById(id_mensualidad);
  },

  // Reporte de ingresos del día
  async getDailyIncomeReport(fecha) {
    await ensurePaymentColumns();

    const targetDate = fecha || new Date().toISOString().split('T')[0];

    // Resumen general del día (solo pagos no anulados)
    const summary = await db.getOne(
      `SELECT 
        COALESCE(SUM(monto_pagado), 0) AS total_ingresos,
        COUNT(*) AS total_transacciones
       FROM pagos 
       WHERE date(fecha_hora_pago) = date(?) AND COALESCE(estado, 'APROBADO') != 'ANULADO'`,
      [targetDate]
    );

    // Resumen por método de pago
    const byMethod = await db.query(
      `SELECT 
        metodo_pago,
        COUNT(*) AS cantidad,
        COALESCE(SUM(monto_pagado), 0) AS total
       FROM pagos 
       WHERE date(fecha_hora_pago) = date(?) AND COALESCE(estado, 'APROBADO') != 'ANULADO'
       GROUP BY metodo_pago
       ORDER BY total DESC`,
      [targetDate]
    );

    // Resumen por tipo de servicio (Acceso ocasional vs Mensualidad)
    const byType = await db.query(
      `SELECT 
        CASE WHEN id_mensualidad IS NOT NULL THEN 'MENSUALIDAD' ELSE 'ACCESO_OCASIONAL' END AS tipo,
        COUNT(*) AS cantidad,
        COALESCE(SUM(monto_pagado), 0) AS total
       FROM pagos 
       WHERE date(fecha_hora_pago) = date(?) AND COALESCE(estado, 'APROBADO') != 'ANULADO'
       GROUP BY tipo`,
      [targetDate]
    );

    // Listado de transacciones del día
    const transactions = await db.query(
      `SELECT 
        p.id_pago,
        p.numero_comprobante,
        p.monto_pagado,
        p.metodo_pago,
        p.referencia_transaccion,
        p.fecha_hora_pago,
        COALESCE(p.estado, 'APROBADO') AS estado,
        CASE WHEN p.id_mensualidad IS NOT NULL THEN 'MENSUALIDAD' ELSE 'ACCESO' END AS tipo_pago,
        COALESCE(v_ra.placa, v_m.placa, 'N/A') AS placa,
        u.nombre_completo AS operador
       FROM pagos p
       LEFT JOIN registros_acceso ra ON p.id_registro = ra.id_registro
       LEFT JOIN vehiculos v_ra ON ra.id_vehiculo = v_ra.id_vehiculo
       LEFT JOIN mensualidades m ON p.id_mensualidad = m.id_mensualidad
       LEFT JOIN vehiculos v_m ON m.id_vehiculo = v_m.id_vehiculo
       LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
       WHERE date(p.fecha_hora_pago) = date(?)
       ORDER BY p.id_pago DESC`,
      [targetDate]
    );

    return {
      fecha: targetDate,
      total_ingresos: Number(summary.total_ingresos || 0),
      total_transacciones: Number(summary.total_transacciones || 0),
      desglose_metodos: byMethod,
      desglose_tipo: byType,
      transacciones: transactions
    };
  },

  // Reporte de ingresos del mes
  async getMonthlyIncomeReport(year, month) {
    await ensurePaymentColumns();

    const now = new Date();
    const targetYear = String(year || now.getFullYear());
    const targetMonth = String(month || (now.getMonth() + 1)).padStart(2, '0');

    // Total general del mes
    const summary = await db.getOne(
      `SELECT 
        COALESCE(SUM(monto_pagado), 0) AS total_ingresos,
        COUNT(*) AS total_transacciones
       FROM pagos 
       WHERE strftime('%Y', fecha_hora_pago) = ? 
         AND strftime('%m', fecha_hora_pago) = ?
         AND COALESCE(estado, 'APROBADO') != 'ANULADO'`,
      [targetYear, targetMonth]
    );

    // Desglose por día
    const dailyBreakdown = await db.query(
      `SELECT 
        date(fecha_hora_pago) AS fecha,
        strftime('%d', fecha_hora_pago) AS dia,
        COUNT(*) AS transacciones,
        COALESCE(SUM(monto_pagado), 0) AS total
       FROM pagos 
       WHERE strftime('%Y', fecha_hora_pago) = ? 
         AND strftime('%m', fecha_hora_pago) = ?
         AND COALESCE(estado, 'APROBADO') != 'ANULADO'
       GROUP BY date(fecha_hora_pago)
       ORDER BY fecha ASC`,
      [targetYear, targetMonth]
    );

    // Desglose por método de pago en el mes
    const methodBreakdown = await db.query(
      `SELECT 
        metodo_pago,
        COUNT(*) AS cantidad,
        COALESCE(SUM(monto_pagado), 0) AS total
       FROM pagos 
       WHERE strftime('%Y', fecha_hora_pago) = ? 
         AND strftime('%m', fecha_hora_pago) = ?
         AND COALESCE(estado, 'APROBADO') != 'ANULADO'
       GROUP BY metodo_pago
       ORDER BY total DESC`,
      [targetYear, targetMonth]
    );

    return {
      periodo: `${targetYear}-${targetMonth}`,
      anio: targetYear,
      mes: targetMonth,
      total_ingresos: Number(summary.total_ingresos || 0),
      total_transacciones: Number(summary.total_transacciones || 0),
      desglose_diario: dailyBreakdown,
      desglose_metodos: methodBreakdown
    };
  },

  // Alerta de mensualidades próximas a vencer
  async getExpiringSubscriptions(daysAhead = 7) {
    await this.updateExpiredSubscriptions();

    const sql = `
      SELECT 
        m.id_mensualidad,
        m.id_cliente,
        m.fecha_inicio,
        m.fecha_fin,
        m.valor_mensual,
        m.estado,
        c.nombre_completo AS cliente_nombre,
        c.telefono AS cliente_telefono,
        c.email AS cliente_email,
        v.placa AS vehiculo_placa,
        v.tipo_vehiculo,
        ce.codigo_celda,
        CAST(ROUND(julianday(m.fecha_fin) - julianday('now')) AS INTEGER) AS dias_restantes
      FROM mensualidades m
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      INNER JOIN vehiculos v ON m.id_vehiculo = v.id_vehiculo
      LEFT JOIN celdas ce ON m.id_celda_asignada = ce.id_celda
      WHERE m.estado = 'ACTIVA' 
        AND date(m.fecha_fin) <= date('now', '+' || ? || ' days')
      ORDER BY m.fecha_fin ASC
    `;
    return await db.query(sql, [daysAhead]);
  },

  // Datos de apoyo para formularios (clientes, vehículos, celdas disponibles)
  async getFormData() {
    const clientes = await db.query('SELECT id_cliente, documento, nombre_completo, telefono FROM clientes ORDER BY nombre_completo ASC');
    const vehiculos = await db.query('SELECT id_vehiculo, placa, tipo_vehiculo, marca, id_cliente FROM vehiculos ORDER BY placa ASC');
    const celdas = await db.query("SELECT id_celda, codigo_celda, tipo_permitido, sector FROM celdas WHERE estado = 'LIBRE' ORDER BY codigo_celda ASC");
    const tarifas = await db.query('SELECT * FROM tarifas WHERE activo = 1 ORDER BY id_tarifa ASC');

    return { clientes, vehiculos, celdas, tarifas };
  }
};

module.exports = paymentModel;
