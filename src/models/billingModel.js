const db = require('../config/database');

const billingModel = {
  async getTariffByType(tipoVehiculo) {
    return await db.getOne('SELECT * FROM tarifas WHERE tipo_vehiculo = ? AND activo = 1', [tipoVehiculo]);
  },

  async getAllTariffs() {
    return await db.query('SELECT * FROM tarifas WHERE activo = 1 ORDER BY id_tarifa ASC');
  },

  calculateCharge(tariff, durationMinutes, hasSubscription) {
    if (hasSubscription) {
      return {
        total: 0,
        motivo: 'Cubierto por Mensualidad Vigente',
        minutos: durationMinutes,
        fraccionesCobro: 0
      };
    }

    // Tiempo de gracia reglamentario (ej. 10 o 15 minutos)
    const gracia = tariff ? tariff.tiempo_gracia_minutos : 15;
    if (durationMinutes <= gracia) {
      return {
        total: 0,
        motivo: `Dentro del tiempo de gracia (${gracia} min)`,
        minutos: durationMinutes,
        fraccionesCobro: 0
      };
    }

    const valorHora = tariff ? Number(tariff.valor_hora_fraccion) : 4000;
    // Cobro por hora o fracción de hora
    const fracciones = Math.ceil(durationMinutes / 60);
    const total = fracciones * valorHora;

    return {
      total,
      motivo: `${fracciones} hora(s) / fracción a $${valorHora.toLocaleString('es-CO')} c/u`,
      minutos: durationMinutes,
      fraccionesCobro: fracciones
    };
  },

  async registerPayment(idRegistro, idMensualidad, monto, metodoPago, referencia = null, idUsuario = 1) {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const comprobante = `REC-${dateStr}-${rand}`;

    const res = await db.execute(
      `INSERT INTO pagos 
        (numero_comprobante, id_registro, id_mensualidad, monto_pagado, metodo_pago, referencia_transaccion, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [comprobante, idRegistro || null, idMensualidad || null, monto, metodoPago, referencia, idUsuario]
    );

    return await db.getOne('SELECT * FROM pagos WHERE id_pago = ?', [res.lastID]);
  }
};

module.exports = billingModel;
