// ========================================================================
// PARQUEADERO AUTOS COLOMBIA - LÓGICA FRONTEND EN TIEMPO REAL
// ========================================================================

let state = {
  activeTab: 'tabCells',
  cellFilter: 'TODOS',
  cells: [],
  activeVehicles: [],
  rates: [],
  currentExitCalculation: null
};

// 1. Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  loadAll();

  // Polling automático cada 20 segundos para refrescar celdas y tiempo
  setInterval(() => {
    loadCells();
    loadActiveVehicles();
  }, 20000);
});

// Reloj Digital
function initClock() {
  const clockEl = document.getElementById('digitalClock');
  const update = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('es-CO');
  };
  update();
  setInterval(update, 1000);
}

// Notificaciones Toast
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.className = 'fixed bottom-5 right-5 z-50 text-white px-5 py-3 rounded-lg shadow-xl border-l-4 transition-all text-xs font-semibold flex items-center gap-2';

  if (type === 'success') {
    toast.classList.add('bg-emerald-900', 'border-emerald-400');
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> ${message}`;
  } else if (type === 'error') {
    toast.classList.add('bg-rose-900', 'border-rose-400');
    toast.innerHTML = `<i class="fa-solid fa-circle-xmark text-rose-400"></i> ${message}`;
  } else {
    toast.classList.add('bg-slate-900', 'border-blue-400');
    toast.innerHTML = `<i class="fa-solid fa-circle-info text-blue-400"></i> ${message}`;
  }

  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 4000);
}

// Navegación de Pestañas
function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-brand-900', 'text-white', 'shadow');
    btn.classList.add('text-blue-100');
  });

  const activeContent = document.getElementById(tabId);
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeNav) {
    activeNav.classList.add('bg-brand-900', 'text-white', 'shadow');
    activeNav.classList.remove('text-blue-100');
  }

  if (tabId === 'tabCells') loadCells();
  if (tabId === 'tabEntry') onTypeChanged();
  if (tabId === 'tabActive') loadActiveVehicles();
  if (tabId === 'tabNovelties') loadNovelties();
  if (tabId === 'tabRates') loadRates();
  if (tabId === 'tabUsers') loadUsers();
  if (tabId === 'tabAdminCells') {
    loadAdminCells();
    loadCapacityReport();
  }
  if (tabId === 'tabPayments') {
    loadPayments();
  }
  if (tabId === 'tabSubscriptions') {
    loadSubscriptions();
  }
  if (tabId === 'tabReports') {
    initReportDates();
    loadDailyReport();
    loadMonthlyReport();
    loadExpiringSubscriptions();
  }
}

// Carga global de datos
async function loadAll() {
  await Promise.all([
    loadCells(),
    loadActiveVehicles(),
    loadRates()
  ]);
}

// ========================================================================
// PESTAÑA 1: CELDAS Y ESTADÍSTICAS
// ========================================================================
async function loadCells() {
  try {
    const [resCells, resStats] = await Promise.all([
      fetch(`/api/celdas?tipo=${state.cellFilter}`),
      fetch('/api/celdas/estadisticas')
    ]);

    const dataCells = await resCells.json();
    const dataStats = await resStats.json();

    if (dataStats.success) {
      const { total, libres, ocupadas } = dataStats.data;
      document.getElementById('kpiTotal').textContent = total;
      document.getElementById('kpiLibres').textContent = libres;
      document.getElementById('kpiOcupadas').textContent = ocupadas;
      document.getElementById('freeCountBadge').textContent = libres;
      document.getElementById('occCountBadge').textContent = ocupadas;

      const pct = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
      document.getElementById('kpiPorcentaje').textContent = `${pct}%`;
    }

    if (dataCells.success) {
      state.cells = dataCells.data;
      renderCellsGrid(state.cells);
    }
  } catch (err) {
    console.error('Error cargando celdas:', err);
  }
}

function filterCells(tipo) {
  state.cellFilter = tipo;
  document.querySelectorAll('.cell-filter-btn').forEach(btn => {
    btn.classList.remove('bg-white', 'text-brand-900', 'shadow-sm');
    btn.classList.add('text-slate-600');
  });
  const activeBtn = document.getElementById(`btnFilter${tipo}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-white', 'text-brand-900', 'shadow-sm');
    activeBtn.classList.remove('text-slate-600');
  }
  loadCells();
}

function renderCellsGrid(cells) {
  const container = document.getElementById('cellsGrid');
  container.innerHTML = '';

  if (cells.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-slate-400 text-sm">
        No se encontraron celdas para esta categoría.
      </div>
    `;
    return;
  }

  cells.forEach(cell => {
    const isFree = cell.estado === 'LIBRE';
    const card = document.createElement('div');
    card.className = `p-4 rounded-xl border-2 transition transform hover:-translate-y-0.5 cursor-pointer shadow-sm ${
      isFree
        ? 'bg-emerald-50/50 border-emerald-300 hover:border-emerald-500'
        : 'bg-rose-50/50 border-rose-300 hover:border-rose-500'
    }`;

    // Icono según tipo
    let icon = 'fa-car';
    if (cell.tipo_permitido === 'MOTO') icon = 'fa-motorcycle';
    if (cell.tipo_permitido === 'CAMIONETA') icon = 'fa-truck-pickup';
    if (cell.tipo_permitido === 'BICICLETA') icon = 'fa-bicycle';

    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <span class="font-mono text-base font-extrabold ${isFree ? 'text-emerald-800' : 'text-rose-800'}">${cell.codigo_celda}</span>
        <span class="p-1.5 rounded-lg ${isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} text-xs">
          <i class="fa-solid ${icon}"></i>
        </span>
      </div>
      <div class="text-[11px] font-semibold uppercase tracking-wider ${isFree ? 'text-emerald-600' : 'text-rose-600'}">
        ${isFree ? '✓ DISPONIBLE' : '● OCUPADA'}
      </div>
      ${
        !isFree && cell.placa
          ? `
            <div class="mt-2 pt-2 border-t border-rose-200">
              <span class="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">${cell.placa}</span>
              <p class="text-[10px] text-slate-500 mt-1 truncate">Desde: ${cell.fecha_hora_entrada ? cell.fecha_hora_entrada.split(' ')[1] : '--'}</p>
            </div>
          `
          : `
            <div class="mt-2 pt-2 border-t border-emerald-200 text-[10px] text-slate-500">
              Sector: ${cell.sector || 'General'}
            </div>
          `
      }
    `;

    // Si está ocupada, al hacer clic permite liquidar salida directamente
    card.onclick = () => {
      if (!isFree && cell.placa) {
        quickExit(cell.placa);
      } else if (isFree) {
        // Pre-cargar celda en registro de entrada
        switchTab('tabEntry');
        setTimeout(() => {
          const typeRadio = document.querySelector(`input[name="entryTipo"][value="${cell.tipo_permitido}"]`);
          if (typeRadio) {
            typeRadio.checked = true;
            onTypeChanged(cell.id_celda);
          }
        }, 100);
      }
    };

    container.appendChild(card);
  });
}

// ========================================================================
// PESTAÑA 2: REGISTRO DE ENTRADA
// ========================================================================
let checkPlateTimeout = null;

function onPlateInput(plate) {
  clearTimeout(checkPlateTimeout);
  const banner = document.getElementById('subBanner');
  banner.classList.add('hidden');

  if (!plate || plate.trim().length < 3) return;

  const spinner = document.getElementById('plateCheckSpinner');
  spinner.classList.remove('hidden');

  checkPlateTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`/api/accesos/verificar/${plate.trim().toUpperCase()}`);
      const data = await res.json();
      spinner.classList.add('hidden');

      if (data.success) {
        banner.classList.remove('hidden');
        if (data.data.estaAdentro) {
          banner.className = 'mt-2 p-3 rounded-lg border text-xs bg-rose-50 border-rose-300 text-rose-800 font-semibold';
          banner.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i> El vehículo ya se encuentra adentro en la celda ${data.data.accesoActivo.codigo_celda}.`;
        } else if (data.data.tieneMensualidad) {
          const sub = data.data.mensualidad;
          banner.className = 'mt-2 p-3 rounded-lg border text-xs bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
          banner.innerHTML = `
            <i class="fa-solid fa-crown text-amber-500 mr-1"></i> <strong>Abonado con Mensualidad Activa:</strong> ${sub.cliente_nombre} (Vigente hasta: ${sub.fecha_fin})
          `;
        } else {
          banner.className = 'mt-2 p-3 rounded-lg border text-xs bg-blue-50 border-blue-200 text-blue-800';
          banner.innerHTML = `<i class="fa-solid fa-user mr-1"></i> Vehículo visitante / cobro por fracción normal.`;
        }
      }
    } catch (err) {
      spinner.classList.add('hidden');
    }
  }, 400);
}

async function onTypeChanged(preferIdCelda = null) {
  const selectedType = document.querySelector('input[name="entryTipo"]:checked').value;
  const select = document.getElementById('entryCellSelect');
  const statusSpan = document.getElementById('entryCellStatus');
  select.innerHTML = '<option value="">Cargando celdas disponibles...</option>';

  try {
    const res = await fetch(`/api/celdas/disponibles/${selectedType}`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      select.innerHTML = '';
      data.data.forEach((c, idx) => {
        const opt = document.createElement('option');
        opt.value = c.id_celda;
        opt.textContent = `${c.codigo_celda} (${c.sector}) ${idx === 0 ? '- Recomendada automática' : ''}`;
        if (preferIdCelda && c.id_celda === preferIdCelda) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
      statusSpan.textContent = `${data.data.length} celdas libres`;
      statusSpan.className = 'text-xs text-emerald-600 font-semibold';
      document.getElementById('btnSubmitEntry').disabled = false;
    } else {
      select.innerHTML = '<option value="">NO HAY CELDAS DISPONIBLES</option>';
      statusSpan.textContent = 'Parqueadero Lleno en este tipo';
      statusSpan.className = 'text-xs text-rose-600 font-bold';
      document.getElementById('btnSubmitEntry').disabled = true;
    }
  } catch (err) {
    select.innerHTML = '<option value="">Error cargando celdas</option>';
  }
}

function toggleNoveltyInput() {
  const container = document.getElementById('noveltyInputContainer');
  const text = document.getElementById('noveltyToggleText');
  if (container.classList.contains('hidden')) {
    container.classList.remove('hidden');
    text.textContent = '- Ocultar reporte de novedad';
  } else {
    container.classList.add('hidden');
    text.textContent = '+ Reportar daño o pertenencia';
    document.getElementById('entryNovelty').value = '';
  }
}

async function handleRegisterEntry(e) {
  e.preventDefault();
  const placa = document.getElementById('entryPlate').value.trim().toUpperCase();
  const tipoVehiculo = document.querySelector('input[name="entryTipo"]:checked').value;
  const idCelda = document.getElementById('entryCellSelect').value;
  const marca = document.getElementById('entryMarca').value.trim();
  const color = document.getElementById('entryColor').value.trim();
  const novedadInicial = document.getElementById('entryNovelty').value.trim();
  const severidad = document.querySelector('input[name="entrySeveridad"]:checked') ? document.querySelector('input[name="entrySeveridad"]:checked').value : 'BAJA';

  if (!idCelda) {
    showToast('No hay una celda válida seleccionada', 'error');
    return;
  }

  try {
    const res = await fetch('/api/accesos/entrada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placa,
        tipoVehiculo,
        idCelda,
        marca,
        color,
        novedadInicial,
        severidadNovedad: severidad
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Entrada registrada: ${placa} en celda ${data.data.registro.codigo_celda}`, 'success');
      document.getElementById('formEntry').reset();
      document.getElementById('subBanner').classList.add('hidden');
      toggleNoveltyInput();
      if (!document.getElementById('noveltyInputContainer').classList.contains('hidden')) {
        toggleNoveltyInput();
      }

      // Mostrar Ticket Térmico de Entrada
      showTicketModal({
        tipo: 'ENTRADA',
        folio: data.data.registro.folio_ticket,
        fechaHora: data.data.registro.fecha_hora_entrada,
        placa: data.data.registro.placa,
        tipoVehiculo: data.data.registro.tipo_vehiculo,
        codigoCelda: data.data.registro.codigo_celda,
        novedad: novedadInicial
      });

      loadAll();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Error de comunicación con el servidor', 'error');
  }
}

// ========================================================================
// PESTAÑA 3: REGISTRO DE SALIDA Y COBRO
// ========================================================================
function quickExit(placa) {
  switchTab('tabExit');
  document.getElementById('exitSearchInput').value = placa;
  searchForExit();
}

async function searchForExit() {
  const query = document.getElementById('exitSearchInput').value.trim();
  if (!query) {
    showToast('Ingrese una placa o folio de ticket para consultar', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/accesos/calcular-salida?busqueda=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success) {
      state.currentExitCalculation = data.data;
      renderExitCalculation(data.data);
    } else {
      showToast(data.message, 'error');
      document.getElementById('exitCalculationPanel').classList.add('hidden');
    }
  } catch (err) {
    showToast('Error consultando el vehículo para salida', 'error');
  }
}

function renderExitCalculation(info) {
  const panel = document.getElementById('exitCalculationPanel');
  panel.classList.remove('hidden');

  document.getElementById('exitHiddenRecordId').value = info.acceso.id_registro;
  document.getElementById('exitPlateDisplay').textContent = info.acceso.placa;
  document.getElementById('exitTypeBadge').textContent = info.acceso.tipo_vehiculo;
  document.getElementById('exitCellDisplay').textContent = info.acceso.codigo_celda;

  document.getElementById('exitTimeIn').textContent = info.tiempo.horaEntrada;
  document.getElementById('exitTimeOut').textContent = info.tiempo.horaSalida;
  document.getElementById('exitDuration').textContent = `${info.tiempo.horasFormateadas}h ${info.tiempo.minutosRestantes}m (${info.tiempo.minutosTotales} min)`;

  const totalFormat = `$ ${info.liquidacion.total.toLocaleString('es-CO')} COP`;
  document.getElementById('exitTotalAmount').textContent = totalFormat;
  document.getElementById('exitRateReason').textContent = info.liquidacion.motivo;
}

async function handleConfirmExit(e) {
  e.preventDefault();
  const idRegistro = document.getElementById('exitHiddenRecordId').value;
  const metodoPago = document.querySelector('input[name="exitPaymentMethod"]:checked').value;
  const novedadSalida = document.getElementById('exitNoveltyNote').value.trim();

  if (!idRegistro) return;

  try {
    const res = await fetch('/api/accesos/salida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idRegistro,
        metodoPago,
        novedadSalida
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Salida exitosa de ${data.data.registro.placa}. Celda ${data.data.celdaLiberada} liberada.`, 'success');
      document.getElementById('exitCalculationPanel').classList.add('hidden');
      document.getElementById('exitSearchInput').value = '';

      // Mostrar Comprobante Térmico de Salida
      showTicketModal({
        tipo: 'SALIDA',
        folio: data.data.pago ? data.data.pago.numero_comprobante : 'REC-SALIDA',
        fechaHora: new Date().toLocaleString('es-CO'),
        placa: data.data.registro.placa,
        tipoVehiculo: data.data.registro.tipo_vehiculo,
        codigoCelda: data.data.celdaLiberada,
        tiempoEstancia: `${data.data.tiempoEstancia.horas}h ${data.data.tiempoEstancia.minutosRestantes}m`,
        metodoPago: data.data.pago ? data.data.pago.metodo_pago : 'EFECTIVO',
        totalCobrado: `$ ${data.data.totalCobrado.toLocaleString('es-CO')} COP`,
        novedad: novedadSalida
      });

      loadAll();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Error procesando el cobro y salida', 'error');
  }
}

// ========================================================================
// PESTAÑA 4: VEHÍCULOS ADENTRO
// ========================================================================
async function loadActiveVehicles() {
  try {
    const res = await fetch('/api/accesos/activos');
    const data = await res.json();

    if (data.success) {
      state.activeVehicles = data.data;
      document.getElementById('activeCount').textContent = data.count;
      renderActiveTable(data.data);
    }
  } catch (err) {
    console.error('Error cargando vehículos activos:', err);
  }
}

function renderActiveTable(list) {
  const tbody = document.getElementById('activeVehiclesTableBody');
  tbody.innerHTML = '';

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="p-6 text-center text-slate-400">
          No hay vehículos estacionados en este momento.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';

    const horas = Math.floor((item.minutos_acumulados || 0) / 60);
    const mins = (item.minutos_acumulados || 0) % 60;

    tr.innerHTML = `
      <td class="p-3 font-mono text-slate-600 font-bold">${item.folio_ticket}</td>
      <td class="p-3 font-mono text-xs font-black"><span class="bg-slate-800 text-white px-2 py-0.5 rounded">${item.placa}</span></td>
      <td class="p-3"><span class="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded">${item.tipo_vehiculo}</span></td>
      <td class="p-3 font-bold text-slate-800">${item.codigo_celda}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[11px] font-bold ${item.modalidad === 'MENSUALIDAD' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
          ${item.modalidad}
        </span>
      </td>
      <td class="p-3 text-slate-600">${item.fecha_hora_entrada}</td>
      <td class="p-3 font-semibold text-slate-800">${horas}h ${mins}m</td>
      <td class="p-3 text-center">
        <button onclick="quickExit('${item.placa}')" class="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded font-bold text-[11px] shadow">
          Salida / Cobro
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterActiveTable(query) {
  const q = query.trim().toUpperCase();
  const filtered = state.activeVehicles.filter(v => 
    v.placa.includes(q) || v.codigo_celda.includes(q) || v.folio_ticket.includes(q)
  );
  renderActiveTable(filtered);
}

// ========================================================================
// PESTAÑA 5: NOVEDADES
// ========================================================================
async function loadNovelties() {
  const container = document.getElementById('noveltiesList');
  container.innerHTML = '<p class="text-xs text-slate-400">Cargando bitácora...</p>';

  try {
    const res = await fetch('/api/novedades/recientes?limit=25');
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      container.innerHTML = '';
      data.data.forEach(n => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs';
        
        let sevClass = 'bg-blue-100 text-blue-800';
        if (n.severidad === 'MEDIA') sevClass = 'bg-amber-100 text-amber-800';
        if (n.severidad === 'ALTA') sevClass = 'bg-rose-100 text-rose-800';

        item.innerHTML = `
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold bg-slate-800 text-white px-2 py-0.5 rounded text-[11px]">${n.placa}</span>
              <span class="px-2 py-0.5 rounded font-bold text-[10px] ${sevClass}">Severidad: ${n.severidad}</span>
              <span class="text-slate-500 text-[11px]">Momento: <strong>${n.momento}</strong></span>
            </div>
            <p class="text-slate-700 font-medium">${n.descripcion}</p>
          </div>
          <div class="text-right text-[11px] text-slate-400 whitespace-nowrap">
            <div>${n.fecha_hora}</div>
            <div>Op: ${n.operador_nombre}</div>
          </div>
        `;
        container.appendChild(item);
      });
    } else {
      container.innerHTML = '<p class="text-xs text-slate-400 py-4 text-center">No hay novedades registradas recientemente.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p class="text-xs text-rose-500">Error cargando novedades.</p>';
  }
}

function openNewNoveltyModal() {
  const placa = prompt('Ingrese la placa del vehículo para registrar la novedad:');
  if (!placa) return;
  const descripcion = prompt('Describa el daño, rayón, pertenencia u observación:');
  if (!descripcion) return;

  fetch('/api/novedades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      placa: placa.trim().toUpperCase(),
      tipoNovedad: 'OBSERVACION_OPERADOR',
      descripcion: descripcion.trim(),
      severidad: 'MEDIA'
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Novedad registrada exitosamente', 'success');
      loadNovelties();
    } else {
      showToast(data.message, 'error');
    }
  });
}

// ========================================================================
// PESTAÑA 6: TARIFAS
// ========================================================================
async function loadRates() {
  try {
    const res = await fetch('/api/tarifas');
    const data = await res.json();

    if (data.success) {
      state.rates = data.data;
      renderRates(data.data);
    }
  } catch (err) {
    console.error('Error cargando tarifas:', err);
  }
}

function renderRates(rates) {
  const container = document.getElementById('ratesCardsContainer');
  container.innerHTML = '';

  rates.forEach(r => {
    const card = document.createElement('div');
    card.className = 'p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3';

    let icon = 'fa-car';
    if (r.tipo_vehiculo === 'MOTO') icon = 'fa-motorcycle';
    if (r.tipo_vehiculo === 'CAMIONETA') icon = 'fa-truck-pickup';
    if (r.tipo_vehiculo === 'BICICLETA') icon = 'fa-bicycle';

    card.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <span class="font-bold text-base text-slate-800 flex items-center gap-2">
          <i class="fa-solid ${icon} text-brand-700"></i> ${r.tipo_vehiculo}
        </span>
        <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Tarifa Vigente</span>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div class="bg-white p-2 rounded border border-slate-200">
          <span class="text-slate-400 block text-[10px]">Hora / Fracción</span>
          <span class="font-extrabold text-sm text-brand-900">$ ${Number(r.valor_hora_fraccion).toLocaleString('es-CO')}</span>
        </div>
        <div class="bg-white p-2 rounded border border-slate-200">
          <span class="text-slate-400 block text-[10px]">Día Completo</span>
          <span class="font-extrabold text-sm text-slate-800">$ ${Number(r.valor_dia).toLocaleString('es-CO')}</span>
        </div>
        <div class="bg-white p-2 rounded border border-slate-200">
          <span class="text-slate-400 block text-[10px]">Mensualidad</span>
          <span class="font-extrabold text-sm text-emerald-700">$ ${Number(r.valor_mensualidad).toLocaleString('es-CO')}</span>
        </div>
      </div>
      <p class="text-[11px] text-slate-500 italic">Tiempo de gracia reglamentario: ${r.tiempo_gracia_minutos} minutos libres.</p>
    `;
    container.appendChild(card);
  });
}

// ========================================================================
// MODAL DE TICKET / COMPROBANTE TÉRMICO
// ========================================================================
function showTicketModal(data) {
  const modal = document.getElementById('ticketModal');
  modal.classList.remove('hidden');

  document.getElementById('tckTipoDocumento').textContent = data.tipo === 'ENTRADA' ? 'TICKET DE ENTRADA' : 'RECIBO DE SALIDA';
  document.getElementById('tckFolio').textContent = data.folio;
  document.getElementById('tckFechaHora').textContent = data.fechaHora;
  document.getElementById('tckPlaca').textContent = data.placa;
  document.getElementById('tckCategoriaCelda').textContent = `${data.tipoVehiculo} - CELDA: ${data.codigoCelda}`;

  const cobroBox = document.getElementById('tckDetalleCobro');
  if (data.tipo === 'SALIDA') {
    cobroBox.classList.remove('hidden');
    document.getElementById('tckTiempoEstancia').textContent = data.tiempoEstancia || '--';
    document.getElementById('tckMetodoPago').textContent = data.metodoPago || 'EFECTIVO';
    document.getElementById('tckTotalCobrado').textContent = data.totalCobrado || '$ 0';
  } else {
    cobroBox.classList.add('hidden');
  }

  const novBox = document.getElementById('tckNovedadBox');
  if (data.novedad && data.novedad.trim() !== '') {
    novBox.classList.remove('hidden');
    document.getElementById('tckNovedadTexto').textContent = data.novedad;
  } else {
    novBox.classList.add('hidden');
  }
}

function closeTicketModal() {
  document.getElementById('ticketModal').classList.add('hidden');
}

// ========================================================================
// PESTAÑA 7: GESTIÓN DE USUARIOS (ITERACIÓN 2)
// ========================================================================
let editingUserId = null;

async function loadUsers() {
  const role = document.getElementById('userFilterRole')?.value || 'TODOS';
  const active = document.getElementById('userFilterActive')?.value || 'TODOS';
  const q = document.getElementById('userSearchInput')?.value || '';

  let url = `/api/usuarios?rol=${role}&activo=${active}`;
  if (q.trim()) url += `&q=${encodeURIComponent(q.trim())}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!json.success || !json.data || json.data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400">
            <i class="fa-solid fa-user-slash text-2xl mb-1 block"></i>
            No se encontraron usuarios con los criterios seleccionados
          </td>
        </tr>`;
      return;
    }

    json.data.forEach(u => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

      const roleBadge = u.rol === 'ADMIN'
        ? `<span class="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]"><i class="fa-solid fa-crown mr-1"></i>ADMIN</span>`
        : `<span class="bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded text-[10px]"><i class="fa-solid fa-user-tie mr-1"></i>OPERADOR</span>`;

      const activeBadge = u.activo === 1
        ? `<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]"><i class="fa-solid fa-check mr-1"></i>ACTIVO</span>`
        : `<span class="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]"><i class="fa-solid fa-ban mr-1"></i>INACTIVO</span>`;

      const toggleActionTitle = u.activo === 1 ? 'Desactivar Cuenta' : 'Activar Cuenta';
      const toggleIcon = u.activo === 1 ? 'fa-user-slash text-rose-600' : 'fa-user-check text-emerald-600';

      tr.innerHTML = `
        <td class="py-3 px-4 font-mono font-bold text-slate-500">#${u.id_usuario}</td>
        <td class="py-3 px-4 font-semibold text-slate-900">${u.nombre_completo}</td>
        <td class="py-3 px-4 font-mono text-slate-700">${u.username}</td>
        <td class="py-3 px-4">${roleBadge}</td>
        <td class="py-3 px-4">${activeBadge}</td>
        <td class="py-3 px-4 text-slate-500 text-[11px]">${u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString('es-CO') : '--'}</td>
        <td class="py-3 px-4 text-center">
          <div class="inline-flex items-center gap-1">
            <button onclick='editUser(${JSON.stringify(u)})' class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition" title="Editar Información">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="toggleUserActive(${u.id_usuario})" class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded transition" title="${toggleActionTitle}">
              <i class="fa-solid ${toggleIcon}"></i>
            </button>
            <button onclick="openPasswordModal(${u.id_usuario}, '${u.username}')" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-amber-600 rounded transition" title="Cambiar Contraseña">
              <i class="fa-solid fa-key"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando usuarios:', err);
    showToast('Error cargando la lista de usuarios', 'error');
  }
}

function openUserModal() {
  editingUserId = null;
  document.getElementById('userModalTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Nuevo Usuario';
  document.getElementById('userIdField').value = '';
  document.getElementById('userNombreField').value = '';
  document.getElementById('userUsernameField').value = '';
  document.getElementById('userUsernameField').readOnly = false;
  document.getElementById('userPasswordField').value = '';
  document.getElementById('userPasswordFieldWrapper').classList.remove('hidden');
  document.getElementById('userPasswordField').required = true;
  document.getElementById('userRoleField').value = 'OPERADOR';
  document.getElementById('userModal').classList.remove('hidden');
}

function editUser(u) {
  editingUserId = u.id_usuario;
  document.getElementById('userModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Usuario';
  document.getElementById('userIdField').value = u.id_usuario;
  document.getElementById('userNombreField').value = u.nombre_completo;
  document.getElementById('userUsernameField').value = u.username;
  document.getElementById('userUsernameField').readOnly = false;
  document.getElementById('userPasswordFieldWrapper').classList.add('hidden');
  document.getElementById('userPasswordField').required = false;
  document.getElementById('userRoleField').value = u.rol;
  document.getElementById('userModal').classList.remove('hidden');
}

function closeUserModal() {
  document.getElementById('userModal').classList.add('hidden');
}

async function saveUser(e) {
  e.preventDefault();
  const id = document.getElementById('userIdField').value;
  const nombre_completo = document.getElementById('userNombreField').value.trim();
  const username = document.getElementById('userUsernameField').value.trim();
  const password = document.getElementById('userPasswordField').value;
  const rol = document.getElementById('userRoleField').value;

  try {
    let res;
    if (id) {
      // Actualizar PUT
      res = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_completo, username, rol })
      });
    } else {
      // Crear POST
      res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_completo, username, password, rol })
      });
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      showToast(data.message || 'Error guardando usuario', 'error');
      return;
    }

    showToast(data.message || 'Operación exitosa', 'success');
    closeUserModal();
    loadUsers();
  } catch (err) {
    console.error('Error guardando usuario:', err);
    showToast('Error de conexión al guardar usuario', 'error');
  }
}

async function toggleUserActive(id) {
  if (!confirm('¿Confirma que desea alternar el estado (activo/inactivo) de esta cuenta?')) return;
  try {
    const res = await fetch(`/api/usuarios/${id}/toggle-active`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadUsers();
    } else {
      showToast(data.message || 'Error cambiando estado', 'error');
    }
  } catch (err) {
    showToast('Error al comunicar con el servidor', 'error');
  }
}

function openPasswordModal(id, username) {
  document.getElementById('pwdUserIdField').value = id;
  document.getElementById('pwdUsernameDisplay').textContent = username;
  document.getElementById('newPwdField').value = '';
  document.getElementById('passwordModal').classList.remove('hidden');
}

function closePasswordModal() {
  document.getElementById('passwordModal').classList.add('hidden');
}

async function saveNewPassword(e) {
  e.preventDefault();
  const id = document.getElementById('pwdUserIdField').value;
  const newPassword = document.getElementById('newPwdField').value;

  try {
    const res = await fetch(`/api/usuarios/${id}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Contraseña actualizada exitosamente', 'success');
      closePasswordModal();
    } else {
      showToast(data.message || 'Error actualizando contraseña', 'error');
    }
  } catch (err) {
    showToast('Error al conectar con el servidor', 'error');
  }
}

// ========================================================================
// PESTAÑA 8: ADMINISTRACIÓN DE CELDAS Y CAPACIDAD (ITERACIÓN 2)
// ========================================================================
let editingCellId = null;

async function loadCapacityReport() {
  try {
    const res = await fetch('/api/celdas/reporte-capacidad');
    const json = await res.json();
    if (!json.success || !json.data) return;

    const d = json.data;
    document.getElementById('capKpiTotal').textContent = d.total;
    document.getElementById('capKpiLibres').textContent = d.libres;
    document.getElementById('capKpiOcupadas').textContent = d.ocupadas;
    document.getElementById('capKpiMantenimiento').textContent = d.mantenimiento;
    document.getElementById('capKpiPorcentaje').textContent = `${d.porcentajeOcupacion}%`;
  } catch (err) {
    console.error('Error cargando reporte de capacidad:', err);
  }
}

async function loadAdminCells() {
  const tipo = document.getElementById('adminCellFilterType')?.value || 'TODOS';
  const estado = document.getElementById('adminCellFilterState')?.value || 'TODOS';
  const q = document.getElementById('adminCellSearchInput')?.value.toUpperCase() || '';

  try {
    const res = await fetch('/api/celdas');
    const json = await res.json();
    const tbody = document.getElementById('adminCellsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!json.success || !json.data) return;

    let cells = json.data;
    if (tipo !== 'TODOS') cells = cells.filter(c => c.tipo_permitido === tipo);
    if (estado !== 'TODOS') cells = cells.filter(c => c.estado === estado);
    if (q.trim()) cells = cells.filter(c => c.codigo_celda.includes(q) || (c.sector && c.sector.toUpperCase().includes(q)));

    if (cells.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400">
            <i class="fa-solid fa-table-cells text-2xl mb-1 block"></i>
            No se encontraron celdas con los filtros aplicados
          </td>
        </tr>`;
      return;
    }

    cells.forEach(c => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

      let stateBadge = '';
      if (c.estado === 'LIBRE') {
        stateBadge = `<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]"><i class="fa-solid fa-circle-check mr-1"></i>LIBRE</span>`;
      } else if (c.estado === 'OCUPADA') {
        stateBadge = `<span class="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]"><i class="fa-solid fa-car-side mr-1"></i>OCUPADA (${c.placa || 'En Curso'})</span>`;
      } else {
        stateBadge = `<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]"><i class="fa-solid fa-wrench mr-1"></i>MANTENIMIENTO</span>`;
      }

      let typeIcon = 'fa-car';
      if (c.tipo_permitido === 'MOTO') typeIcon = 'fa-motorcycle';
      if (c.tipo_permitido === 'CAMIONETA') typeIcon = 'fa-truck-pickup';
      if (c.tipo_permitido === 'BICICLETA') typeIcon = 'fa-bicycle';

      // Acciones según estado
      let maintenanceBtn = '';
      if (c.estado === 'LIBRE') {
        maintenanceBtn = `
          <button onclick="toggleCellMaintenance(${c.id_celda}, false)" class="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded text-[11px] border border-amber-200" title="Poner en Mantenimiento">
            <i class="fa-solid fa-wrench"></i> Mantenimiento
          </button>`;
      } else if (c.estado === 'MANTENIMIENTO') {
        maintenanceBtn = `
          <button onclick="toggleCellMaintenance(${c.id_celda}, true)" class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[11px] border border-emerald-200" title="Habilitar a Disponible">
            <i class="fa-solid fa-check"></i> Habilitar
          </button>`;
      } else {
        maintenanceBtn = `<span class="text-[11px] text-slate-400 italic">Vehículo adentro</span>`;
      }

      const canEdit = c.estado !== 'OCUPADA';
      const editBtn = canEdit
        ? `<button onclick='editCell(${JSON.stringify(c)})' class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>`
        : `<button disabled class="p-1.5 bg-slate-100 text-slate-300 rounded cursor-not-allowed" title="No editable mientras esté ocupada"><i class="fa-solid fa-pen-to-square"></i></button>`;

      const deleteBtn = c.estado === 'LIBRE'
        ? `<button onclick="deleteCell(${c.id_celda}, '${c.codigo_celda}')" class="p-1.5 bg-slate-100 hover:bg-rose-100 text-rose-600 rounded transition" title="Eliminar Celda"><i class="fa-solid fa-trash"></i></button>`
        : '';

      tr.innerHTML = `
        <td class="py-3 px-4 font-mono font-bold text-slate-900">${c.codigo_celda}</td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <i class="fa-solid ${typeIcon} text-brand-700"></i> ${c.tipo_permitido}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-600">${c.sector || 'General'}</td>
        <td class="py-3 px-4">${stateBadge}</td>
        <td class="py-3 px-4 text-center">
          <div class="inline-flex items-center gap-1.5">
            ${maintenanceBtn}
            ${editBtn}
            ${deleteBtn}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando celdas admin:', err);
    showToast('Error al consultar inventario de celdas', 'error');
  }
}

function openCellModal() {
  editingCellId = null;
  document.getElementById('cellModalTitle').innerHTML = '<i class="fa-solid fa-plus"></i> Nueva Celda de Parqueo';
  document.getElementById('cellIdField').value = '';
  document.getElementById('cellCodigoField').value = '';
  document.getElementById('cellTipoField').value = 'AUTOMOVIL';
  document.getElementById('cellSectorField').value = 'Sector A - Principal';
  document.getElementById('cellModal').classList.remove('hidden');
}

function editCell(c) {
  editingCellId = c.id_celda;
  document.getElementById('cellModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Celda';
  document.getElementById('cellIdField').value = c.id_celda;
  document.getElementById('cellCodigoField').value = c.codigo_celda;
  document.getElementById('cellTipoField').value = c.tipo_permitido;
  document.getElementById('cellSectorField').value = c.sector || '';
  document.getElementById('cellModal').classList.remove('hidden');
}

function closeCellModal() {
  document.getElementById('cellModal').classList.add('hidden');
}

async function saveCell(e) {
  e.preventDefault();
  const id = document.getElementById('cellIdField').value;
  const codigo_celda = document.getElementById('cellCodigoField').value.trim().toUpperCase();
  const tipo_permitido = document.getElementById('cellTipoField').value;
  const sector = document.getElementById('cellSectorField').value.trim();

  try {
    let res;
    if (id) {
      res = await fetch(`/api/celdas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_celda, tipo_permitido, sector })
      });
    } else {
      res = await fetch('/api/celdas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_celda, tipo_permitido, sector })
      });
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      showToast(data.message || 'Error guardando celda', 'error');
      return;
    }

    showToast(data.message || 'Celda guardada con éxito', 'success');
    closeCellModal();
    loadAdminCells();
    loadCapacityReport();
    loadCells(); // Refrescar vista caseta
  } catch (err) {
    showToast('Error de conexión al guardar celda', 'error');
  }
}

async function toggleCellMaintenance(id, isCurrentlyMaintenance) {
  const endpoint = isCurrentlyMaintenance ? `/api/celdas/${id}/available` : `/api/celdas/${id}/maintenance`;
  const confirmMsg = isCurrentlyMaintenance ? '¿Desea habilitar nuevamente esta celda para parqueo?' : '¿Desea poner esta celda en Mantenimiento?';
  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(endpoint, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminCells();
      loadCapacityReport();
      loadCells();
    } else {
      showToast(data.message || 'Error modificando estado de celda', 'error');
    }
  } catch (err) {
    showToast('Error de conexión con el servidor', 'error');
  }
}

async function deleteCell(id, codigo) {
  if (!confirm(`¿Está seguro de eliminar permanentemente la celda ${codigo}? Esta acción no se puede deshacer.`)) return;

  try {
    const res = await fetch(`/api/celdas/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminCells();
      loadCapacityReport();
      loadCells();
    } else {
      showToast(data.message || 'No se pudo eliminar la celda', 'error');
    }
  } catch (err) {
    showToast('Error de conexión con el servidor', 'error');
  }
}

// ========================================================================
// PESTAÑA 7: GESTIÓN DE PAGOS (ITERACIÓN 3)
// ========================================================================

async function loadPayments() {
  try {
    const params = new URLSearchParams();
    const fechaIni = document.getElementById('paymentFilterFechaInicio')?.value;
    const fechaFin = document.getElementById('paymentFilterFechaFin')?.value;
    const metodo = document.getElementById('paymentFilterMetodo')?.value;
    const tipo = document.getElementById('paymentFilterTipo')?.value;
    const estado = document.getElementById('paymentFilterEstado')?.value;
    const search = document.getElementById('paymentSearchInput')?.value;

    if (fechaIni) params.append('fecha_inicio', fechaIni);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    if (metodo && metodo !== 'TODOS') params.append('metodo', metodo);
    if (tipo && tipo !== 'TODOS') params.append('tipo', tipo);
    if (estado && estado !== 'TODOS') params.append('estado', estado);
    if (search && search.trim() !== '') params.append('search', search.trim());

    const res = await fetch(`/api/pagos?${params.toString()}`);
    const result = await res.json();

    if (!result.success) {
      showToast(result.message || 'Error al consultar pagos', 'error');
      return;
    }

    const payments = result.data || [];
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;

    // Calcular KPIs
    let totalMonto = 0;
    let countAcceso = 0;
    let countMensualidad = 0;

    payments.forEach(p => {
      if (p.estado !== 'ANULADO') {
        totalMonto += Number(p.monto_pagado || 0);
        if (p.tipo_pago === 'MENSUALIDAD') countMensualidad++;
        else countAcceso++;
      }
    });

    const kpiRecaudo = document.getElementById('kpiRecaudoTotal');
    const kpiTrans = document.getElementById('kpiTransaccionesTotal');
    const kpiAcc = document.getElementById('kpiPagosAcceso');
    const kpiMen = document.getElementById('kpiPagosMensualidad');

    if (kpiRecaudo) kpiRecaudo.textContent = `$ ${totalMonto.toLocaleString('es-CO')}`;
    if (kpiTrans) kpiTrans.textContent = payments.length;
    if (kpiAcc) kpiAcc.textContent = countAcceso;
    if (kpiMen) kpiMen.textContent = countMensualidad;

    if (payments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="py-8 text-center text-slate-400">
            <i class="fa-solid fa-receipt text-3xl mb-2 block"></i>
            No se encontraron comprobantes de pago con los filtros seleccionados
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = payments.map(p => {
      const fecha = new Date(p.fecha_hora_pago).toLocaleString('es-CO');
      const isAnulado = p.estado === 'ANULADO';

      const badgeEstado = isAnulado
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">ANULADO</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">APROBADO</span>';

      const badgeTipo = p.tipo_pago === 'MENSUALIDAD'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">MENSUALIDAD</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">ACCESO</span>';

      let metodoIcon = 'fa-money-bill-wave text-emerald-600';
      if (p.metodo_pago === 'NEQUI') metodoIcon = 'fa-mobile-screen-button text-purple-600';
      if (p.metodo_pago === 'DAVIPLATA') metodoIcon = 'fa-wallet text-rose-600';
      if (p.metodo_pago === 'TARJETA') metodoIcon = 'fa-credit-card text-blue-600';

      return `
        <tr class="hover:bg-slate-50 transition ${isAnulado ? 'opacity-60 bg-slate-50/50' : ''}">
          <td class="py-3 px-4 font-mono font-bold text-slate-800">${p.numero_comprobante}</td>
          <td class="py-3 px-4">${badgeTipo}</td>
          <td class="py-3 px-4 text-slate-600 whitespace-nowrap">${fecha}</td>
          <td class="py-3 px-4">
            <span class="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">${p.placa_vehiculo}</span>
            <span class="text-[10px] text-slate-400 block">${p.tipo_vehiculo}</span>
          </td>
          <td class="py-3 px-4 text-slate-700 font-medium">${p.cliente_nombre || 'Cliente Ocasional'}</td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center gap-1.5 font-semibold text-slate-800">
              <i class="fa-solid ${metodoIcon}"></i> ${p.metodo_pago}
            </span>
          </td>
          <td class="py-3 px-4 font-mono text-[11px] text-slate-500">${p.referencia_transaccion || '--'}</td>
          <td class="py-3 px-4 text-right font-bold text-slate-800 text-sm">$ ${Number(p.monto_pagado).toLocaleString('es-CO')}</td>
          <td class="py-3 px-4 text-center">${badgeEstado}</td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="showPaymentDetail(${p.id_pago})" title="Ver detalle y comprobante" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                <i class="fa-solid fa-receipt text-sm"></i>
              </button>
              ${!isAnulado ? `
                <button onclick="openVoidModal(${p.id_pago}, '${p.numero_comprobante}')" title="Anular comprobante" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition">
                  <i class="fa-solid fa-ban text-sm"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error al cargar pagos:', err);
    showToast('Error de red al consultar historial de pagos', 'error');
  }
}

function resetPaymentFilters() {
  const fIni = document.getElementById('paymentFilterFechaInicio');
  const fFin = document.getElementById('paymentFilterFechaFin');
  const fMet = document.getElementById('paymentFilterMetodo');
  const fTip = document.getElementById('paymentFilterTipo');
  const fEst = document.getElementById('paymentFilterEstado');
  const fSea = document.getElementById('paymentSearchInput');

  if (fIni) fIni.value = '';
  if (fFin) fFin.value = '';
  if (fMet) fMet.value = 'TODOS';
  if (fTip) fTip.value = 'TODOS';
  if (fEst) fEst.value = 'TODOS';
  if (fSea) fSea.value = '';

  loadPayments();
}

async function showPaymentDetail(id) {
  try {
    const res = await fetch(`/api/pagos/${id}`);
    const data = await res.json();
    if (!data.success || !data.data) {
      showToast('No se pudo cargar el detalle del pago', 'error');
      return;
    }

    const p = data.data;
    document.getElementById('payReceiptComprobante').textContent = p.numero_comprobante;
    document.getElementById('payReceiptFecha').textContent = new Date(p.fecha_hora_pago).toLocaleString('es-CO');
    document.getElementById('payReceiptTipoServicio').textContent = p.tipo_pago === 'MENSUALIDAD' ? 'SUSCRIPCIÓN MENSUAL' : 'ACCESO VEHICULAR OCASIONAL';
    document.getElementById('payReceiptPlaca').textContent = p.placa_vehiculo;
    document.getElementById('payReceiptCliente').textContent = p.cliente_nombre || 'Cliente Ocasional';
    document.getElementById('payReceiptMetodo').textContent = p.metodo_pago;
    document.getElementById('payReceiptOperador').textContent = p.operador_nombre || 'Operador en Turno';
    document.getElementById('payReceiptTotal').textContent = `$ ${Number(p.monto_pagado).toLocaleString('es-CO')}`;

    const refRow = document.getElementById('payReceiptRefRow');
    if (p.referencia_transaccion) {
      refRow.classList.remove('hidden');
      document.getElementById('payReceiptRef').textContent = p.referencia_transaccion;
    } else {
      refRow.classList.add('hidden');
    }

    const estadoEl = document.getElementById('payReceiptEstado');
    const anuladoBox = document.getElementById('payReceiptAnuladoBox');

    if (p.estado === 'ANULADO') {
      estadoEl.textContent = 'ANULADO';
      estadoEl.className = 'font-bold text-rose-600';
      anuladoBox.classList.remove('hidden');
      document.getElementById('payReceiptAnuladoMotivo').textContent = p.motivo_anulacion || 'Sin motivo registrado';
      document.getElementById('payReceiptAnuladoFecha').textContent = `Anulado por: ${p.anulado_por_nombre || 'Administrador'} el ${p.fecha_anulacion ? new Date(p.fecha_anulacion).toLocaleString('es-CO') : ''}`;
    } else {
      estadoEl.textContent = 'APROBADO';
      estadoEl.className = 'font-bold text-emerald-600';
      anuladoBox.classList.add('hidden');
    }

    document.getElementById('paymentDetailModal').classList.remove('hidden');
  } catch (err) {
    showToast('Error de conexión al consultar detalle', 'error');
  }
}

function closePaymentDetailModal() {
  document.getElementById('paymentDetailModal')?.classList.add('hidden');
}

function reprintPaymentReceipt() {
  const content = document.getElementById('printPaymentReceiptArea');
  if (!content) return;

  const printWin = window.open('', '_blank', 'width=450,height=600');
  printWin.document.write(`
    <html>
      <head>
        <title>Comprobante de Pago - Autos Colombia</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 12px; color: #111; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .border-b { border-bottom: 1px dashed #666; padding-bottom: 8px; margin-bottom: 8px; }
          .flex { display: flex; justify-content: space-between; margin: 4px 0; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}

function openVoidModal(id, comprobante) {
  document.getElementById('voidPaymentId').value = id;
  document.getElementById('voidComprobanteText').value = comprobante;
  document.getElementById('voidMotivoField').value = '';
  document.getElementById('voidPaymentModal').classList.remove('hidden');
}

function closeVoidModal() {
  document.getElementById('voidPaymentModal')?.classList.add('hidden');
}

async function confirmVoidPayment(e) {
  e.preventDefault();
  const id = document.getElementById('voidPaymentId').value;
  const idUsuario = document.getElementById('voidUserIdSelect').value;
  const motivo = document.getElementById('voidMotivoField').value;

  try {
    const res = await fetch(`/api/pagos/${id}/anular`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: parseInt(idUsuario, 10), motivo })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Pago anulado exitosamente', 'success');
      closeVoidModal();
      loadPayments();
    } else {
      showToast(data.message || 'Error al anular pago', 'error');
    }
  } catch (err) {
    showToast('Error de conexión al anular pago', 'error');
  }
}

// ========================================================================
// PESTAÑA 8: GESTIÓN DE MENSUALIDADES (ITERACIÓN 3)
// ========================================================================

async function loadSubscriptions() {
  try {
    const estado = document.getElementById('subFilterEstado')?.value || 'TODOS';
    const search = document.getElementById('subSearchInput')?.value || '';

    const params = new URLSearchParams();
    if (estado !== 'TODOS') params.append('estado', estado);
    if (search.trim() !== '') params.append('search', search.trim());

    const res = await fetch(`/api/mensualidades?${params.toString()}`);
    const result = await res.json();

    if (!result.success) {
      showToast('Error al cargar mensualidades', 'error');
      return;
    }

    const subscriptions = result.data || [];
    const tbody = document.getElementById('subscriptionsTableBody');
    if (!tbody) return;

    // Actualizar KPIs
    let countActivas = 0;
    let countPorVencer = 0;
    let countVencidas = 0;

    subscriptions.forEach(s => {
      if (s.estado === 'ACTIVA') {
        countActivas++;
        if (s.dias_restantes !== null && s.dias_restantes <= 7 && s.dias_restantes >= 0) {
          countPorVencer++;
        }
      } else if (s.estado === 'VENCIDA') {
        countVencidas++;
      }
    });

    const kpiAct = document.getElementById('kpiSubsActivas');
    const kpiPor = document.getElementById('kpiSubsPorVencer');
    const kpiVen = document.getElementById('kpiSubsVencidas');
    const kpiTot = document.getElementById('kpiSubsTotal');

    if (kpiAct) kpiAct.textContent = countActivas;
    if (kpiPor) kpiPor.textContent = countPorVencer;
    if (kpiVen) kpiVen.textContent = countVencidas;
    if (kpiTot) kpiTot.textContent = subscriptions.length;

    if (subscriptions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="py-8 text-center text-slate-400">
            <i class="fa-solid fa-calendar-xmark text-3xl mb-2 block"></i>
            No se encontraron suscripciones de mensualidad registradas
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = subscriptions.map(s => {
      let badgeEstado = '';
      if (s.estado === 'ACTIVA') {
        badgeEstado = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">ACTIVA</span>';
      } else if (s.estado === 'VENCIDA') {
        badgeEstado = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">VENCIDA</span>';
      } else {
        badgeEstado = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">CANCELADA</span>';
      }

      let diasLabel = '';
      if (s.estado === 'ACTIVA' && s.dias_restantes !== null) {
        if (s.dias_restantes <= 7) {
          diasLabel = `<span class="text-amber-600 font-bold block text-[10px]"><i class="fa-solid fa-clock"></i> Vence en ${s.dias_restantes} d</span>`;
        } else {
          diasLabel = `<span class="text-slate-400 block text-[10px]">${s.dias_restantes} días vigentes</span>`;
        }
      }

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-3 px-4 font-mono font-bold text-slate-700">#${s.id_mensualidad}</td>
          <td class="py-3 px-4">
            <span class="font-bold text-slate-800 block">${s.cliente_nombre}</span>
            <span class="text-[10px] text-slate-400">CC: ${s.cliente_documento}</span>
          </td>
          <td class="py-3 px-4">
            <span class="text-slate-700 font-semibold block">${s.cliente_telefono}</span>
            <span class="text-[10px] text-slate-400 truncate max-w-[150px] block">${s.cliente_email || '--'}</span>
          </td>
          <td class="py-3 px-4">
            <span class="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">${s.vehiculo_placa}</span>
            <span class="text-[10px] text-slate-400 block">${s.tipo_vehiculo} • ${s.marca || ''}</span>
          </td>
          <td class="py-3 px-4">
            ${s.codigo_celda 
              ? `<span class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-bold font-mono text-[11px] border border-indigo-200">${s.codigo_celda}</span>`
              : '<span class="text-slate-400 italic">Sin celda fija</span>'}
          </td>
          <td class="py-3 px-4 text-slate-700">
            <span class="font-semibold block">${s.fecha_inicio} al ${s.fecha_fin}</span>
            ${diasLabel}
          </td>
          <td class="py-3 px-4 text-right font-bold text-slate-800 text-sm">$ ${Number(s.valor_mensual).toLocaleString('es-CO')}</td>
          <td class="py-3 px-4 text-center">${badgeEstado}</td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="showSubDetail(${s.id_mensualidad})" title="Ver ficha y pagos" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                <i class="fa-solid fa-circle-info text-sm"></i>
              </button>
              ${s.estado !== 'CANCELADA' ? `
                <button onclick="openRenewSubModal(${s.id_mensualidad}, '${s.cliente_nombre}', '${s.vehiculo_placa}', ${s.valor_mensual})" title="Renovar suscripción" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition">
                  <i class="fa-solid fa-rotate text-sm"></i>
                </button>
                <button onclick="cancelSubscription(${s.id_mensualidad})" title="Cancelar suscripción" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition">
                  <i class="fa-solid fa-xmark text-sm"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Error de red al consultar mensualidades', 'error');
  }
}

async function openNewSubscriptionModal() {
  try {
    const res = await fetch('/api/pagos/formulario-datos');
    const data = await res.json();
    if (!data.success) {
      showToast('Error cargando datos auxiliares', 'error');
      return;
    }

    const { clientes, vehiculos, celdas, tarifas } = data.data;

    // Llenar select clientes
    const selCliente = document.getElementById('subClienteSelect');
    selCliente.innerHTML = clientes.map(c => `
      <option value="${c.id_cliente}">${c.nombre_completo} (CC ${c.documento})</option>
    `).join('');

    // Llenar select vehículos
    const selVehiculo = document.getElementById('subVehiculoSelect');
    selVehiculo.innerHTML = vehiculos.map(v => `
      <option value="${v.id_vehiculo}">${v.placa} - ${v.tipo_vehiculo} (${v.marca || ''})</option>
    `).join('');

    // Llenar select celdas disponibles
    const selCelda = document.getElementById('subCeldaSelect');
    selCelda.innerHTML = '<option value="">-- Sin celda fija asignada --</option>' + celdas.map(c => `
      <option value="${c.id_celda}">${c.codigo_celda} (${c.tipo_permitido} - ${c.sector})</option>
    `).join('');

    // Fecha inicio por defecto hoy
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('subFechaInicioField').value = hoy;

    // Fecha fin por defecto +30 días
    const d30 = new Date();
    d30.setDate(d30.getDate() + 30);
    document.getElementById('subFechaFinField').value = d30.toISOString().split('T')[0];

    // Valor mensual de tarifas (default automóvil)
    const tAuto = tarifas.find(t => t.tipo_vehiculo === 'AUTOMOVIL');
    document.getElementById('subValorField').value = tAuto ? Number(tAuto.valor_mensualidad) : 180000;

    document.getElementById('newSubModal').classList.remove('hidden');
  } catch (err) {
    showToast('Error al preparar modal de mensualidad', 'error');
  }
}

function closeNewSubModal() {
  document.getElementById('newSubModal')?.classList.add('hidden');
}

async function saveNewSubscription(e) {
  e.preventDefault();

  const payload = {
    id_cliente: parseInt(document.getElementById('subClienteSelect').value, 10),
    id_vehiculo: parseInt(document.getElementById('subVehiculoSelect').value, 10),
    id_celda_asignada: document.getElementById('subCeldaSelect').value ? parseInt(document.getElementById('subCeldaSelect').value, 10) : null,
    fecha_inicio: document.getElementById('subFechaInicioField').value,
    fecha_fin: document.getElementById('subFechaFinField').value || null,
    valor_mensual: parseFloat(document.getElementById('subValorField').value),
    metodo_pago: document.getElementById('subMetodoPagoSelect').value,
    referencia_transaccion: document.getElementById('subReferenciaField').value || null,
    id_usuario: 1
  };

  try {
    const res = await fetch('/api/mensualidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message || 'Mensualidad creada y pago registrado', 'success');
      closeNewSubModal();
      loadSubscriptions();
      loadCells();
    } else {
      showToast(data.message || 'Error al crear mensualidad', 'error');
    }
  } catch (err) {
    showToast('Error de conexión al crear mensualidad', 'error');
  }
}

function openRenewSubModal(id, clientName, vehiclePlate, valorMensual) {
  document.getElementById('renewSubId').value = id;
  document.getElementById('renewClientName').textContent = clientName;
  document.getElementById('renewVehiclePlate').textContent = vehiclePlate;
  document.getElementById('renewValorField').value = valorMensual || 180000;
  document.getElementById('renewRefField').value = '';
  document.getElementById('renewSubModal').classList.remove('hidden');
}

function closeRenewSubModal() {
  document.getElementById('renewSubModal')?.classList.add('hidden');
}

async function confirmRenewSubscription(e) {
  e.preventDefault();
  const id = document.getElementById('renewSubId').value;
  const valor = document.getElementById('renewValorField').value;
  const metodo = document.getElementById('renewMetodoSelect').value;
  const ref = document.getElementById('renewRefField').value;

  try {
    const res = await fetch(`/api/mensualidades/${id}/renovar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor_mensual: parseFloat(valor),
        metodo_pago: metodo,
        referencia_transaccion: ref || null,
        id_usuario: 1
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Mensualidad renovada con éxito', 'success');
      closeRenewSubModal();
      loadSubscriptions();
    } else {
      showToast(data.message || 'Error al renovar mensualidad', 'error');
    }
  } catch (err) {
    showToast('Error de red al renovar mensualidad', 'error');
  }
}

async function cancelSubscription(id) {
  if (!confirm(`¿Está seguro de cancelar la mensualidad #${id}? Esta acción liberará la celda asociada.`)) return;

  try {
    const res = await fetch(`/api/mensualidades/${id}/cancelar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: 1 })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Mensualidad cancelada y celda liberada', 'success');
      loadSubscriptions();
      loadCells();
    } else {
      showToast(data.message || 'No se pudo cancelar mensualidad', 'error');
    }
  } catch (err) {
    showToast('Error de conexión', 'error');
  }
}

async function showSubDetail(id) {
  try {
    const res = await fetch(`/api/mensualidades/${id}`);
    const data = await res.json();
    if (!data.success || !data.data) {
      showToast('Error al consultar datos del abonado', 'error');
      return;
    }

    const s = data.data;
    document.getElementById('dtSubCliente').textContent = s.cliente_nombre;
    document.getElementById('dtSubDoc').textContent = s.cliente_documento;
    document.getElementById('dtSubTel').textContent = s.cliente_telefono;
    document.getElementById('dtSubVehiculo').textContent = `${s.vehiculo_placa} (${s.tipo_vehiculo} ${s.marca || ''})`;
    document.getElementById('dtSubCelda').textContent = s.codigo_celda ? `${s.codigo_celda} - ${s.celda_sector}` : 'Sin celda fija';
    document.getElementById('dtSubPeriodo').textContent = `${s.fecha_inicio} al ${s.fecha_fin}`;

    const estadoEl = document.getElementById('dtSubEstado');
    if (s.estado === 'ACTIVA') {
      estadoEl.innerHTML = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">ACTIVA</span>';
      document.getElementById('dtSubDias').textContent = `${s.dias_restantes} días`;
      document.getElementById('dtSubDias').className = 'font-bold text-sm text-emerald-600';
    } else if (s.estado === 'VENCIDA') {
      estadoEl.innerHTML = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">VENCIDA</span>';
      document.getElementById('dtSubDias').textContent = 'VENCIDA';
      document.getElementById('dtSubDias').className = 'font-bold text-sm text-rose-600';
    } else {
      estadoEl.innerHTML = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">CANCELADA</span>';
      document.getElementById('dtSubDias').textContent = 'CANCELADA';
      document.getElementById('dtSubDias').className = 'font-bold text-sm text-slate-500';
    }

    // Tabla de comprobantes de pago
    const pBody = document.getElementById('subDetailPaymentsBody');
    if (s.pagos && s.pagos.length > 0) {
      pBody.innerHTML = s.pagos.map(p => `
        <tr class="hover:bg-slate-50">
          <td class="py-2 px-3 font-mono font-bold text-slate-800">${p.numero_comprobante}</td>
          <td class="py-2 px-3 text-slate-600">${new Date(p.fecha_hora_pago).toLocaleDateString('es-CO')}</td>
          <td class="py-2 px-3 font-semibold text-slate-700">${p.metodo_pago}</td>
          <td class="py-2 px-3 text-right font-bold text-slate-800">$ ${Number(p.monto_pagado).toLocaleString('es-CO')}</td>
          <td class="py-2 px-3 text-center">
            <button onclick="closeSubDetailModal(); showPaymentDetail(${p.id_pago});" class="text-blue-600 hover:text-blue-800 font-bold text-[10px] underline">
              Ver
            </button>
          </td>
        </tr>
      `).join('');
    } else {
      pBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-400">Sin pagos registrados</td></tr>';
    }

    document.getElementById('subDetailModal').classList.remove('hidden');
  } catch (err) {
    showToast('Error consultando detalle de mensualidad', 'error');
  }
}

function closeSubDetailModal() {
  document.getElementById('subDetailModal')?.classList.add('hidden');
}

// ========================================================================
// PESTAÑA 9: REPORTES FINANCIEROS Y AUDITORÍA (ITERACIÓN 3)
// ========================================================================

function initReportDates() {
  const hoy = new Date().toISOString().split('T')[0];
  const dDate = document.getElementById('dailyReportDate');
  if (dDate && !dDate.value) dDate.value = hoy;

  const now = new Date();
  const mYear = document.getElementById('monthlyReportYear');
  const mMonth = document.getElementById('monthlyReportMonth');
  if (mYear) mYear.value = String(now.getFullYear());
  if (mMonth) mMonth.value = String(now.getMonth() + 1);
}

async function loadDailyReport() {
  try {
    const fecha = document.getElementById('dailyReportDate')?.value || new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/reportes/ingresos-dia?fecha=${fecha}`);
    const data = await res.json();

    if (!data.success || !data.data) {
      showToast('Error cargando reporte diario', 'error');
      return;
    }

    const r = data.data;
    document.getElementById('dailyTotalAmount').textContent = `$ ${Number(r.total_ingresos).toLocaleString('es-CO')}`;
    document.getElementById('dailyTotalCount').textContent = r.total_transacciones;

    const methodCont = document.getElementById('dailyMethodBreakdown');
    if (r.desglose_metodos && r.desglose_metodos.length > 0) {
      methodCont.innerHTML = r.desglose_metodos.map(m => {
        let icon = 'fa-money-bill text-emerald-600';
        if (m.metodo_pago === 'NEQUI') icon = 'fa-mobile-screen text-purple-600';
        if (m.metodo_pago === 'DAVIPLATA') icon = 'fa-wallet text-rose-600';
        if (m.metodo_pago === 'TARJETA') icon = 'fa-credit-card text-blue-600';

        return `
          <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span class="flex items-center gap-2 font-bold text-slate-700">
              <i class="fa-solid ${icon}"></i> ${m.metodo_pago}
            </span>
            <div class="text-right">
              <span class="font-bold text-slate-900">$ ${Number(m.total).toLocaleString('es-CO')}</span>
              <span class="text-[10px] text-slate-400 block">${m.cantidad} transacciones</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      methodCont.innerHTML = '<p class="text-slate-400 text-xs italic text-center py-4">No hay ingresos registrados en esta fecha</p>';
    }
  } catch (err) {
    showToast('Error al consultar reporte diario', 'error');
  }
}

async function loadMonthlyReport() {
  try {
    const year = document.getElementById('monthlyReportYear')?.value || '2026';
    const month = document.getElementById('monthlyReportMonth')?.value || '11';

    const res = await fetch(`/api/reportes/ingresos-mes?year=${year}&month=${month}`);
    const data = await res.json();

    if (!data.success || !data.data) {
      showToast('Error cargando balance mensual', 'error');
      return;
    }

    const r = data.data;
    document.getElementById('monthlyTotalAmount').textContent = `$ ${Number(r.total_ingresos).toLocaleString('es-CO')}`;
    document.getElementById('monthlyTotalCount').textContent = r.total_transacciones;

    // Participación por método
    const mCont = document.getElementById('monthlyMethodsContainer');
    if (r.desglose_metodos && r.desglose_metodos.length > 0) {
      mCont.innerHTML = r.desglose_metodos.map(m => `
        <div class="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
          <span class="text-[10px] text-slate-500 font-bold block">${m.metodo_pago}</span>
          <span class="font-bold text-slate-800 text-xs block mt-0.5">$ ${Number(m.total).toLocaleString('es-CO')}</span>
          <span class="text-[9px] text-slate-400">${m.cantidad} ops</span>
        </div>
      `).join('');
    } else {
      mCont.innerHTML = '<div class="col-span-4 text-center text-slate-400 text-xs py-2">Sin operaciones en el mes</div>';
    }

    // Tabla día por día
    const tBody = document.getElementById('monthlyTableBody');
    if (r.desglose_diario && r.desglose_diario.length > 0) {
      tBody.innerHTML = r.desglose_diario.map(d => `
        <tr class="hover:bg-slate-50">
          <td class="py-2 px-4 font-mono font-bold text-slate-700">${d.fecha}</td>
          <td class="py-2 px-4 text-center font-bold text-slate-800">Día ${d.dia}</td>
          <td class="py-2 px-4 text-center font-semibold text-blue-700">${d.transacciones} ops</td>
          <td class="py-2 px-4 text-right font-bold text-emerald-700 text-sm">$ ${Number(d.total).toLocaleString('es-CO')}</td>
        </tr>
      `).join('');
    } else {
      tBody.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-slate-400">No se registraron cobros en el mes seleccionado</td></tr>';
    }
  } catch (err) {
    showToast('Error cargando reporte mensual', 'error');
  }
}

async function loadExpiringSubscriptions() {
  try {
    const dias = document.getElementById('expiringDaysSelect')?.value || '7';
    const res = await fetch(`/api/mensualidades/proximas-a-vencer?dias=${dias}`);
    const data = await res.json();

    if (!data.success) {
      showToast('Error cargando alertas de vencimiento', 'error');
      return;
    }

    const list = data.data || [];
    const container = document.getElementById('expiringSubsContainer');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
          <i class="fa-solid fa-circle-check text-emerald-500 text-2xl mb-1 block"></i>
          <p class="text-xs font-semibold text-slate-600">Al día: No hay mensualidades próximas a vencer en los próximos ${dias} días.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(s => `
      <div class="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
        <div>
          <span class="font-bold text-slate-800 block">${s.cliente_nombre}</span>
          <span class="text-[10px] text-slate-500 font-mono">Placa: ${s.vehiculo_placa} • Celda: ${s.codigo_celda || 'N/A'} • Tel: ${s.cliente_telefono}</span>
        </div>
        <div class="text-right flex items-center gap-2">
          <div>
            <span class="text-amber-700 font-bold block">${s.dias_restantes <= 0 ? '¡VENCE HOY!' : `Vence en ${s.dias_restantes} d`}</span>
            <span class="text-[10px] text-slate-400">${s.fecha_fin}</span>
          </div>
          <button onclick="openRenewSubModal(${s.id_mensualidad}, '${s.cliente_nombre}', '${s.vehiculo_placa}', ${s.valor_mensual})" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] shadow">
            Renovar
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    showToast('Error cargando alertas de vencimiento', 'error');
  }
}


