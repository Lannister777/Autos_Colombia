// Suite de Pruebas Automatizadas End-to-End (E2E) para Parqueadero Autos Colombia
// Valida todas las funcionalidades de las Iteraciones 1 y 2
const http = require('http');

const BASE_URL = 'http://127.0.0.1:3000';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) { json = body; }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS AUTOMATIZADAS - AUTOS COLOMBIA');
  console.log(`📍 Servidor objetivo: ${BASE_URL}`);
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // BLOQUE 0: SERVIDOR Y ASSETS ESTÁTICOS
    // -------------------------------------------------------------
    console.log('📦 BLOQUE 0: Verificación de Servidor y Páginas Web');
    const resHome = await request({ hostname: '127.0.0.1', port: 3000, path: '/', method: 'GET' });
    assert(resHome.status === 200, 'Frontend SPA principal (index.html) responde HTTP 200');

    const resFigma = await request({ hostname: '127.0.0.1', port: 3000, path: '/figma-mockups.html', method: 'GET' });
    assert(resFigma.status === 200, 'Visor de Mockups Figma (figma-mockups.html) responde HTTP 200');

    // -------------------------------------------------------------
    // BLOQUE 1: PRUEBAS DE LA ITERACIÓN 1 (CONTROL OPERATIVO DE VEHÍCULOS)
    // -------------------------------------------------------------
    console.log('\n🚗 BLOQUE 1: Pruebas Funcionales de la Iteración 1 (Accesos y Cobro)');
    const testPlate = 'AUT' + Math.floor(100 + Math.random() * 900);

    // 1.1 Verificar placa antes de entrar
    const resPlate = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/accesos/verificar/${testPlate}`,
      method: 'GET'
    });
    assert(resPlate.status === 200 && resPlate.data.success, `Verificación de placa ${testPlate} responde OK`);
    assert(resPlate.data.data.estaAdentro === false, `Placa ${testPlate} no se encuentra dentro del parqueadero`);

    // 1.2 Registrar Entrada
    const resEntry = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/accesos/entrada',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      placa: testPlate,
      tipoVehiculo: 'AUTOMOVIL',
      marca: 'Toyota',
      color: 'Gris Plata',
      novedadInicial: 'Sin rayones visibles',
      severidadNovedad: 'BAJA'
    });
    assert(resEntry.status === 201 && resEntry.data.success, `Registro de entrada exitoso para placa ${testPlate}`);
    const record = resEntry.data.data.registro;
    assert(record.folio_ticket.startsWith('TCK-'), `Folio de ticket emitido correctamente: ${record.folio_ticket}`);

    // 1.3 Previsualizar / Calcular Salida
    const resCalc = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/accesos/calcular-salida?busqueda=${testPlate}`,
      method: 'GET'
    });
    assert(resCalc.status === 200 && resCalc.data.success, `Cálculo de salida para ${testPlate} responde OK`);
    assert(resCalc.data.data.liquidacion.total >= 0, `Liquidación calculada: $${resCalc.data.data.liquidacion.total} COP`);

    // 1.4 Registrar Novedad durante estancia
    const resNov = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/novedades',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      placa: testPlate,
      momento: 'ESTANCIA',
      tipoNovedad: 'INSPECCION_RUTINA',
      descripcion: 'Vehículo inspeccionado en celda sin incidentes',
      severidad: 'BAJA'
    });
    assert(resNov.status === 201 && resNov.data.success, `Novedad de estancia registrada para ${testPlate}`);

    // 1.5 Confirmar Salida y Liberar Celda
    const resExit = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/accesos/salida',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      idRegistro: record.id_registro,
      metodoPago: 'EFECTIVO',
      novedadSalida: 'Salida conforme'
    });
    assert(resExit.status === 200 && resExit.data.success, `Salida procesada y celda ${resExit.data.data.celdaLiberada} liberada con éxito`);

    // -------------------------------------------------------------
    // BLOQUE 2: PRUEBAS DE LA ITERACIÓN 2 (USUARIOS Y RBAC)
    // -------------------------------------------------------------
    console.log('\n👥 BLOQUE 2: Pruebas Funcionales de la Iteración 2 (Gestión de Usuarios)');

    // 2.1 Login con credenciales válidas
    const resLoginValid = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin123' });
    assert(resLoginValid.status === 200 && resLoginValid.data.success, 'Login exitoso de Administrador (admin / admin123)');
    assert(resLoginValid.data.data.usuario.rol === 'ADMIN', 'Rol de usuario validado correctamente como ADMIN');
    assert(typeof resLoginValid.data.data.token === 'string', 'Token de sesión emitido correctamente');

    // 2.2 Login con contraseña inválida
    const resLoginInvalid = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'clave_incorrecta_xyz' });
    assert(resLoginInvalid.status === 401, 'Login rechazado con HTTP 401 para contraseña errónea');

    // 2.3 Listar usuarios con filtros
    const resUsersList = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/usuarios?rol=OPERADOR&activo=1',
      method: 'GET'
    });
    assert(resUsersList.status === 200 && resUsersList.data.success, 'Consulta de usuarios con filtros (rol=OPERADOR&activo=1) exitosa');

    // 2.4 Crear nuevo usuario
    const randUser = 'op_auto_' + Math.floor(Math.random() * 10000);
    const resCreateUser = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/usuarios',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      nombre_completo: 'Operador Automatizado E2E',
      username: randUser,
      password: 'password123',
      rol: 'OPERADOR'
    });
    assert(resCreateUser.status === 201 && resCreateUser.data.success, `Creación exitosa de nuevo usuario: ${randUser}`);
    const newUserId = resCreateUser.data.data.id_usuario;

    // 2.5 Rechazar usuario con username duplicado
    const resDupUser = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/usuarios',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      nombre_completo: 'Intento Duplicado',
      username: randUser,
      password: 'password123',
      rol: 'OPERADOR'
    });
    assert(resDupUser.status === 400, 'Rechazo exitoso HTTP 400 por intento de crear username duplicado');

    // 2.6 Modificar usuario
    const resUpdateUser = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/usuarios/${newUserId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      nombre_completo: 'Operador Actualizado E2E',
      username: randUser,
      rol: 'OPERADOR'
    });
    assert(resUpdateUser.status === 200 && resUpdateUser.data.success, 'Actualización de datos del usuario exitosa');

    // 2.7 Alternar estado activo / inactivo
    const resToggleUser = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/usuarios/${newUserId}/toggle-active`,
      method: 'PATCH'
    });
    assert(resToggleUser.status === 200 && resToggleUser.data.data.activo === 0, 'Desactivación de cuenta exitosa (activo = 0)');

    // 2.8 Cambiar contraseña
    const resChangePwd = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/usuarios/${newUserId}/password`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, { newPassword: 'new_super_secure_pwd_2026' });
    assert(resChangePwd.status === 200 && resChangePwd.data.success, 'Cambio de contraseña exitoso');

    // -------------------------------------------------------------
    // BLOQUE 3: PRUEBAS DE LA ITERACIÓN 2 (ADMINISTRACIÓN DE CELDAS)
    // -------------------------------------------------------------
    console.log('\n🅿️ BLOQUE 3: Pruebas Funcionales de la Iteración 2 (Gestión de Celdas)');

    const randCellCode = 'Z-' + Math.floor(10 + Math.random() * 90);

    // 3.1 Crear nueva celda de prueba
    const resCreateCell = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/celdas',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      codigo_celda: randCellCode,
      tipo_permitido: 'AUTOMOVIL',
      sector: 'Sector Z - Pruebas E2E'
    });
    assert(resCreateCell.status === 201 && resCreateCell.data.success, `Creación de nueva celda ${randCellCode} exitosa`);
    const newCellId = resCreateCell.data.data.id_celda;

    // 3.2 Rechazar celda con código duplicado
    const resDupCell = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/celdas',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      codigo_celda: randCellCode,
      tipo_permitido: 'AUTOMOVIL',
      sector: 'Sector Z'
    });
    assert(resDupCell.status === 400, 'Rechazo exitoso HTTP 400 por código de celda duplicado');

    // 3.3 Editar configuración de celda
    const resUpdateCell = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/celdas/${newCellId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      codigo_celda: randCellCode,
      tipo_permitido: 'CAMIONETA',
      sector: 'Sector Z - Modificado'
    });
    assert(resUpdateCell.status === 200 && resUpdateCell.data.data.tipo_permitido === 'CAMIONETA', 'Edición de tipo permitido y sector de celda exitosa');

    // 3.4 Poner celda en Mantenimiento
    const resMaint = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/celdas/${newCellId}/maintenance`,
      method: 'PATCH'
    });
    assert(resMaint.status === 200 && resMaint.data.data.estado === 'MANTENIMIENTO', `Celda ${randCellCode} puesta en estado MANTENIMIENTO exitosamente`);

    // 3.5 Habilitar celda de mantenimiento a disponible
    const resAvail = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/celdas/${newCellId}/available`,
      method: 'PATCH'
    });
    assert(resAvail.status === 200 && resAvail.data.data.estado === 'LIBRE', `Celda ${randCellCode} rehabilitada a estado LIBRE exitosamente`);

    // 3.6 Eliminar celda sin historial
    const resDelCell = await request({
      hostname: '127.0.0.1', port: 3000,
      path: `/api/celdas/${newCellId}`,
      method: 'DELETE'
    });
    assert(resDelCell.status === 200 && resDelCell.data.success, `Eliminación controlada de celda ${randCellCode} (sin historial) exitosa`);

    // 3.7 Reporte Ejecutivo de Capacidad y Ocupación
    const resReport = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/celdas/reporte-capacidad',
      method: 'GET'
    });
    assert(resReport.status === 200 && resReport.data.success, 'Generación de Reporte de Capacidad exitosa');
    const rData = resReport.data.data;
    assert(typeof rData.total === 'number' && rData.total > 0, `Total de celdas en parqueadero: ${rData.total}`);
    assert(typeof rData.porcentajeOcupacion === 'number', `Porcentaje de ocupación calculado: ${rData.porcentajeOcupacion}%`);

    // -------------------------------------------------------------
    // BALANCE FINAL DE LA SUITE
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('📊 RESULTADOS FINALES DE LA SUITE DE PRUEBAS E2E');
    console.log(`✅ Pruebas Aprobadas: ${passedTests} / ${totalTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
    if (passedTests === totalTests) {
      console.log('🏆 ESTADO GLOBAL: TODAS LAS PRUEBAS APROBADAS EXITOSAMENTE.');
      console.log('✨ Iteraciones 1 y 2 100% Funcionales y Listas para Producción.');
    } else {
      console.error(`⚠️ Hubo ${totalTests - passedTests} pruebas fallidas.`);
    }
    console.log('================================================================');

  } catch (err) {
    console.error('Error fatal durante la ejecución de las pruebas:', err);
  }
}

runTestSuite();
