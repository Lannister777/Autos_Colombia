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
