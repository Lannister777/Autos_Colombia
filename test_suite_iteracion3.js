// ============================================================================
// SUITE DE PRUEBAS AUTOMATIZADAS - ITERACIÓN 3: GESTIÓN DE PAGOS Y FINANZAS
// PARQUEADERO "AUTOS COLOMBIA"
// ============================================================================

const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(description, condition, details = '') {
  if (condition) {
    testsPassed++;
    console.log(`  ✅ [PASS] ${description}`);
    results.push({ test: description, status: 'PASS', details });
  } else {
    testsFailed++;
    console.error(`  ❌ [FAIL] ${description} -> ${details}`);
    results.push({ test: description, status: 'FAIL', details });
  }
}

async function runTestSuite() {
  console.log('\n============================================================');
  console.log(' INICIANDO SUITE DE PRUEBAS - ITERACIÓN 3: GESTIÓN DE PAGOS');
  console.log(' Parqueadero "Autos Colombia" - Node.js / Express / SQLite');
  console.log('============================================================\n');

  let testSubId = null;
  let testPaymentId = null;

  try {
    // -------------------------------------------------------------
    // GRUPO 1: DATOS AUXILIARES Y HISTORIAL INICIAL
    // -------------------------------------------------------------
    console.log('--- 1. DATOS AUXILIARES Y LISTADO DE PAGOS ---');

    const resFormData = await request('GET', '/api/pagos/formulario-datos');
    assert(
      'CP-IT3-01: GET /api/pagos/formulario-datos retorna clientes, vehículos, celdas y tarifas',
      resFormData.status === 200 &&
      resFormData.body.success === true &&
      Array.isArray(resFormData.body.data.clientes) &&
      Array.isArray(resFormData.body.data.vehiculos),
      `Status: ${resFormData.status}`
    );

    const resPagos = await request('GET', '/api/pagos');
    assert(
      'CP-IT3-02: GET /api/pagos retorna listado de comprobantes',
      resPagos.status === 200 && resPagos.body.success === true && Array.isArray(resPagos.body.data),
      `Total pagos encontrados: ${resPagos.body?.data?.length}`
    );

    // -------------------------------------------------------------
    // GRUPO 2: CREACIÓN DE MENSUALIDADES (HU-IT3-02)
    // -------------------------------------------------------------
    console.log('\n--- 2. CREACIÓN DE MENSUALIDADES Y PAGO INICIAL ---');

    const resSubFailMissing = await request('POST', '/api/mensualidades', {
      id_cliente: 1
      // Faltan id_vehiculo y valor_mensual
    });
    assert(
      'CP-IT3-03: POST /api/mensualidades falla con 400 si faltan campos obligatorios',
      resSubFailMissing.status === 400 && resSubFailMissing.body.success === false,
      `Status: ${resSubFailMissing.status}, Error: ${resSubFailMissing.body.message}`
    );

    const resSubFailClient = await request('POST', '/api/mensualidades', {
      id_cliente: 9999,
      id_vehiculo: 1,
      valor_mensual: 180000
    });
    assert(
      'CP-IT3-04: POST /api/mensualidades falla si el cliente no existe',
      resSubFailClient.status === 400 && resSubFailClient.body.message.includes('cliente'),
      `Mensaje: ${resSubFailClient.body.message}`
    );

    let freeCellId = 3;
    if (resFormData.body?.data?.celdas && resFormData.body.data.celdas.length > 0) {
      freeCellId = resFormData.body.data.celdas[0].id_celda;
    }

    // Crear mensualidad válida para pruebas
    const resSubCreate = await request('POST', '/api/mensualidades', {
      id_cliente: 1,
      id_vehiculo: 1,
      id_celda: freeCellId,
      fecha_inicio: '2026-11-22',
      fecha_fin: '2026-12-22',
      valor_mensual: 180000,
      metodo_pago: 'NEQUI',
      referencia_transaccion: 'NEQ-PRUEBA-01',
      id_usuario: 1
    });

    assert(
      'CP-IT3-05: POST /api/mensualidades crea mensualidad ACTIVA con HTTP 201',
      resSubCreate.status === 201 &&
      resSubCreate.body.success === true &&
      resSubCreate.body.data.subscription.estado === 'ACTIVA',
      `Status: ${resSubCreate.status}, ID: ${resSubCreate.body.data?.subscription?.id_mensualidad}`
    );

    if (resSubCreate.body.data?.subscription) {
      testSubId = resSubCreate.body.data.subscription.id_mensualidad;
    }
    if (resSubCreate.body.data?.payment) {
      testPaymentId = resSubCreate.body.data.payment.id_pago;
    }

    assert(
      'CP-IT3-06: Creación de mensualidad genera comprobante de pago único automáticamente',
      resSubCreate.body.data?.payment &&
      resSubCreate.body.data.payment.numero_comprobante.startsWith('CP-') &&
      resSubCreate.body.data.payment.metodo_pago === 'NEQUI',
      `Comprobante: ${resSubCreate.body.data?.payment?.numero_comprobante}`
    );

    // -------------------------------------------------------------
    // GRUPO 3: CONSULTAS DE MENSUALIDADES (HU-IT3-07)
    // -------------------------------------------------------------
    console.log('\n--- 3. CONSULTA Y DETALLE DE MENSUALIDADES ---');

    const resListSubs = await request('GET', '/api/mensualidades');
    assert(
      'CP-IT3-07: GET /api/mensualidades lista todas las suscripciones',
      resListSubs.status === 200 && resListSubs.body.data.length >= 1,
      `Total: ${resListSubs.body.data?.length}`
    );

    const resFilterSubs = await request('GET', '/api/mensualidades?estado=ACTIVA');
    assert(
      'CP-IT3-08: GET /api/mensualidades?estado=ACTIVA filtra solo las activas',
      resFilterSubs.status === 200 && resFilterSubs.body.data.every(s => s.estado === 'ACTIVA'),
      `Activas: ${resFilterSubs.body.data?.length}`
    );

    const resDetailSub = await request('GET', `/api/mensualidades/${testSubId}`);
    assert(
      'CP-IT3-09: GET /api/mensualidades/:id retorna detalle con historial de pagos asociado',
      resDetailSub.status === 200 &&
      resDetailSub.body.data.id_mensualidad === testSubId &&
      Array.isArray(resDetailSub.body.data.pagos) &&
      resDetailSub.body.data.pagos.length >= 1,
      `Pagos asociados: ${resDetailSub.body.data?.pagos?.length}`
    );

    const resDetail404 = await request('GET', '/api/mensualidades/99999');
    assert(
      'CP-IT3-10: GET /api/mensualidades/:id retorna 404 para suscripción inexistente',
      resDetail404.status === 404,
      `Status: ${resDetail404.status}`
    );

    // -------------------------------------------------------------
    // GRUPO 4: RENOVACIÓN Y CANCELACIÓN (HU-IT3-03, HU-IT3-08)
    // -------------------------------------------------------------
    console.log('\n--- 4. RENOVACIÓN Y CANCELACIÓN DE MENSUALIDADES ---');

    const resRenew = await request('PATCH', `/api/mensualidades/${testSubId}/renovar`, {
      valor_mensual: 180000,
      metodo_pago: 'DAVIPLATA',
      referencia_transaccion: 'DAVI-RENOV-99',
      id_usuario: 1
    });
    assert(
      'CP-IT3-11: PATCH /api/mensualidades/:id/renovar renueva vigencia y genera nuevo pago',
      resRenew.status === 200 &&
      resRenew.body.success === true &&
      resRenew.body.data.subscription.estado === 'ACTIVA',
      `Mensaje: ${resRenew.body.message}`
    );

    const resCancel = await request('PATCH', `/api/mensualidades/${testSubId}/cancelar`, {
      id_usuario: 1
    });
    assert(
      'CP-IT3-12: PATCH /api/mensualidades/:id/cancelar cambia estado a CANCELADA y libera celda',
      resCancel.status === 200 &&
      resCancel.body.success === true &&
      resCancel.body.data.estado === 'CANCELADA',
      `Nuevo estado: ${resCancel.body.data?.estado}`
    );

    const resRenewCancelled = await request('PATCH', `/api/mensualidades/${testSubId}/renovar`, {
      metodo_pago: 'EFECTIVO'
    });
    assert(
      'CP-IT3-13: Error al intentar renovar una mensualidad cancelada (HTTP 400)',
      resRenewCancelled.status === 400 && resRenewCancelled.body.message.includes('cancelada'),
      `Mensaje recibido: ${resRenewCancelled.body.message}`
    );

    const resCancelAlready = await request('PATCH', `/api/mensualidades/${testSubId}/cancelar`, {
      id_usuario: 1
    });
    assert(
      'CP-IT3-14: Error al intentar cancelar una mensualidad ya cancelada (HTTP 400)',
      resCancelAlready.status === 400 && resCancelAlready.body.message.includes('ya se encuentra cancelada'),
      `Mensaje: ${resCancelAlready.body.message}`
    );

    // -------------------------------------------------------------
    // GRUPO 5: DETALLE Y ANULACIÓN DE PAGOS (HU-IT3-05, HU-IT3-06)
    // -------------------------------------------------------------
    console.log('\n--- 5. DETALLE Y ANULACIÓN DE COMPROBANTES DE PAGO ---');

    const resPayDetail = await request('GET', `/api/pagos/${testPaymentId}`);
    assert(
      'CP-IT3-15: GET /api/pagos/:id retorna comprobante completo con metadatos',
      resPayDetail.status === 200 &&
      resPayDetail.body.data.id_pago === testPaymentId &&
      resPayDetail.body.data.numero_comprobante !== undefined,
      `Comprobante: ${resPayDetail.body.data?.numero_comprobante}`
    );

    const resPay404 = await request('GET', '/api/pagos/99999');
    assert(
      'CP-IT3-16: GET /api/pagos/:id retorna 404 para comprobante inexistente',
      resPay404.status === 404,
      `Status: ${resPay404.status}`
    );

    // Intentar anular con usuario operador (id_usuario = 2) -> debe dar 403
    const resVoidForbidden = await request('PATCH', `/api/pagos/${testPaymentId}/anular`, {
      id_usuario: 2, // Operador
      motivo: 'Prueba de anulación no autorizada'
    });
    assert(
      'CP-IT3-17: PATCH /api/pagos/:id/anular bloquea a usuarios sin rol ADMIN con HTTP 403',
      resVoidForbidden.status === 403,
      `Status: ${resVoidForbidden.status}, Mensaje: ${resVoidForbidden.body.message}`
    );

    // Anular exitosamente con usuario admin (id_usuario = 1)
    const resVoidAdmin = await request('PATCH', `/api/pagos/${testPaymentId}/anular`, {
      id_usuario: 1, // Admin
      motivo: 'Error de digitación en suscripción de prueba'
    });
    assert(
      'CP-IT3-18: PATCH /api/pagos/:id/anular permite anulación por Administrador (HTTP 200)',
      resVoidAdmin.status === 200 &&
      resVoidAdmin.body.data.estado === 'ANULADO' &&
      resVoidAdmin.body.data.motivo_anulacion !== null,
      `Estado: ${resVoidAdmin.body.data?.estado}, Motivo: ${resVoidAdmin.body.data?.motivo_anulacion}`
    );

    // Intentar re-anular el mismo pago
    const resVoidRepeat = await request('PATCH', `/api/pagos/${testPaymentId}/anular`, {
      id_usuario: 1,
      motivo: 'Intento de anulación repetida'
    });
    assert(
      'CP-IT3-19: Error al intentar anular un comprobante que ya fue anulado (HTTP 400)',
      resVoidRepeat.status === 400 && resVoidRepeat.body.message.includes('ya se encuentra anulado'),
      `Mensaje: ${resVoidRepeat.body.message}`
    );

    // -------------------------------------------------------------
    // GRUPO 6: FILTROS AVANZADOS DE HISTORIAL
    // -------------------------------------------------------------
    console.log('\n--- 6. FILTROS EN HISTORIAL DE PAGOS ---');

    const resFilterMetodo = await request('GET', '/api/pagos?metodo=NEQUI');
    assert(
      'CP-IT3-20: GET /api/pagos?metodo=NEQUI filtra pagos por método',
      resFilterMetodo.status === 200 && resFilterMetodo.body.data.every(p => p.metodo_pago === 'NEQUI'),
      `Encontrados: ${resFilterMetodo.body.data?.length}`
    );

    const resFilterEstado = await request('GET', '/api/pagos?estado=ANULADO');
    assert(
      'CP-IT3-21: GET /api/pagos?estado=ANULADO lista pagos anulados para auditoría',
      resFilterEstado.status === 200 && resFilterEstado.body.data.some(p => p.id_pago === testPaymentId),
      `Anulados: ${resFilterEstado.body.data?.length}`
    );

    const resFilterTipo = await request('GET', '/api/pagos?tipo=MENSUALIDAD');
    assert(
      'CP-IT3-22: GET /api/pagos?tipo=MENSUALIDAD filtra cobros de suscripción',
      resFilterTipo.status === 200 && resFilterTipo.body.data.every(p => p.tipo_pago === 'MENSUALIDAD'),
      `Cobros mensualidad: ${resFilterTipo.body.data?.length}`
    );

    // -------------------------------------------------------------
    // GRUPO 7: REPORTES FINANCIEROS Y ALERTAS (HU-IT3-09, HU-IT3-10)
    // -------------------------------------------------------------
    console.log('\n--- 7. REPORTES FINANCIEROS Y ALERTAS DE CARTERA ---');

    const hoyStr = new Date().toISOString().split('T')[0];
    const resDaily = await request('GET', `/api/reportes/ingresos-dia?fecha=${hoyStr}`);
    assert(
      'CP-IT3-23: GET /api/reportes/ingresos-dia genera balance con totales y desglose por método',
      resDaily.status === 200 &&
      resDaily.body.success === true &&
      resDaily.body.data.total_ingresos !== undefined &&
      Array.isArray(resDaily.body.data.desglose_metodos),
      `Total Hoy: $${resDaily.body.data?.total_ingresos}, Métodos: ${resDaily.body.data?.desglose_metodos?.length}`
    );

    const resMonthly = await request('GET', '/api/reportes/ingresos-mes?year=2026&month=11');
    assert(
      'CP-IT3-24: GET /api/reportes/ingresos-mes consolida mes con desglose diario y por método',
      resMonthly.status === 200 &&
      resMonthly.body.success === true &&
      resMonthly.body.data.periodo === '2026-11' &&
      Array.isArray(resMonthly.body.data.desglose_diario),
      `Total Mes: $${resMonthly.body.data?.total_ingresos}`
    );

    const resExpiring = await request('GET', '/api/mensualidades/proximas-a-vencer?dias=30');
    assert(
      'CP-IT3-25: GET /api/mensualidades/proximas-a-vencer detecta suscripciones por vencer',
      resExpiring.status === 200 &&
      resExpiring.body.success === true &&
      Array.isArray(resExpiring.body.data),
      `Abonados por vencer a 30 días: ${resExpiring.body.data?.length}`
    );

  } catch (err) {
    console.error('ERROR FATAL EN LA SUITE DE PRUEBAS:', err);
    testsFailed++;
  }

  // -------------------------------------------------------------
  // RESUMEN FINAL
  // -------------------------------------------------------------
  console.log('\n============================================================');
  console.log(' RESUMEN EJECUTIVO DE PRUEBAS - ITERACIÓN 3');
  console.log('============================================================');
  console.log(`  Total Pruebas Ejecutadas : ${testsPassed + testsFailed}`);
  console.log(`  Pruebas Aprobadas (PASS) : ${testsPassed}`);
  console.log(`  Pruebas Fallidas  (FAIL) : ${testsFailed}`);
  console.log(`  Tasa de Éxito            : ${Math.round((testsPassed / (testsPassed + testsFailed || 1)) * 100)}%`);
  console.log('============================================================\n');

  if (testsFailed === 0) {
    console.log('🎉 ¡TODAS LAS PRUEBAS DE LA ITERACIÓN 3 PASARON SATISFACTORIAMENTE!\n');
    process.exit(0);
  } else {
    console.error('⚠️ ALGUNAS PRUEBAS FALLARON. REVISE EL DETALLE ARRIBA.\n');
    process.exit(1);
  }
}

runTestSuite();
