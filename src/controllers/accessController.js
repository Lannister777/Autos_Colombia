const vehicleModel = require('../models/vehicleModel');
const cellModel = require('../models/cellModel');
const accessModel = require('../models/accessModel');
const noveltyModel = require('../models/noveltyModel');
const billingModel = require('../models/billingModel');

const accessController = {
  // Verificar placa (estado en parqueadero y mensualidad)
  async checkPlate(req, res) {
    try {
      const { placa } = req.params;
      if (!placa) {
        return res.status(400).json({ success: false, message: 'La placa es requerida' });
      }

      const cleanPlate = placa.trim().toUpperCase();
      const activeAccess = await accessModel.getActiveByPlate(cleanPlate);
      const subscription = await vehicleModel.checkActiveSubscription(cleanPlate);
      const vehicle = await vehicleModel.getByPlate(cleanPlate);

      return res.json({
        success: true,
        data: {
          placa: cleanPlate,
          estaAdentro: !!activeAccess,
          accesoActivo: activeAccess,
          tieneMensualidad: !!subscription,
          mensualidad: subscription,
          vehiculoRegistrado: vehicle
        }
      });
    } catch (err) {
      console.error('Error en checkPlate:', err);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Registrar Entrada (RF-01, RF-02, RF-03, RF-04, RF-05, HU-01, HU-02)
  async registerEntry(req, res) {
    try {
      const { placa, tipoVehiculo, idCelda, marca, color, novedadInicial, severidadNovedad } = req.body;

      if (!placa || !tipoVehiculo) {
        return res.status(400).json({
          success: false,
          message: 'Placa y tipo de vehículo son obligatorios'
        });
      }

      const cleanPlate = placa.trim().toUpperCase();

      // 1. Validar que no se encuentre ya adentro (HU-01 Escenario 3)
      const existing = await accessModel.getActiveByPlate(cleanPlate);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `El vehículo con placa ${cleanPlate} ya se encuentra dentro del parqueadero en la celda ${existing.codigo_celda}.`
        });
      }

      // 2. Verificar mensualidad activa (HU-02)
      const subscription = await vehicleModel.checkActiveSubscription(cleanPlate);
      const modalidad = subscription ? 'MENSUALIDAD' : 'OCASIONAL';

      // 3. Gestionar o buscar celda libre (HU-03)
      let targetCell = null;
      if (idCelda) {
        targetCell = await cellModel.getCellById(idCelda);
        if (!targetCell || targetCell.estado !== 'LIBRE') {
          return res.status(400).json({
            success: false,
            message: 'La celda seleccionada no está disponible actualmente'
          });
        }
      } else {
        // Asignación automática: buscar primera celda libre para este tipo
        const libres = await cellModel.getAvailableCells(tipoVehiculo);
        if (libres.length === 0) {
          return res.status(400).json({
            success: false,
            message: `No hay celdas disponibles para la categoría: ${tipoVehiculo}. Parqueadero lleno en este sector.`
          });
        }
        targetCell = libres[0];
      }

      // 4. Crear o recuperar registro de vehículo
      const vehicle = await vehicleModel.findOrCreate(cleanPlate, tipoVehiculo, marca, null, color);

      // 5. Asignar celda y cambiar estado a OCUPADA
      await cellModel.updateCellState(targetCell.id_celda, 'OCUPADA');

      // 6. Crear el registro de acceso
      const entryRecord = await accessModel.createEntry(
        vehicle.id_vehiculo,
        targetCell.id_celda,
        modalidad,
        1 // Operador id 1
      );

      // 7. Si se incluyó novedad física o inspección de entrada (HU-04, RF-04)
      let createdNovelty = null;
      if (novedadInicial && novedadInicial.trim() !== '') {
        createdNovelty = await noveltyModel.createNovelty(
          entryRecord.id_registro,
          vehicle.id_vehiculo,
          'ENTRADA',
          'INSPECCION_INGRESO',
          novedadInicial.trim(),
          severidadNovedad || 'BAJA',
          1
        );
      }

      return res.status(201).json({
        success: true,
        message: 'Entrada registrada exitosamente',
        data: {
          registro: entryRecord,
          esAbonado: !!subscription,
          mensualidad: subscription,
          novedad: createdNovelty
        }
      });
    } catch (err) {
      console.error('Error al registrar entrada:', err);
      return res.status(500).json({ success: false, message: 'Error interno al procesar la entrada' });
    }
  },

  // Previsualizar / Calcular Liquidación de Salida (RF-07, RF-08)
  async calculateExit(req, res) {
    try {
      const { busqueda } = req.query; // Puede ser placa o folio ticket
      if (!busqueda) {
        return res.status(400).json({ success: false, message: 'Parámetro de búsqueda requerido' });
      }

      const cleanQuery = busqueda.trim().toUpperCase();
      let activeAccess = await accessModel.getActiveByPlate(cleanQuery);
      if (!activeAccess) {
        activeAccess = await accessModel.getActiveByTicket(cleanQuery);
      }

      if (!activeAccess) {
        return res.status(404).json({
          success: false,
          message: `No se encontró ningún vehículo activo en parqueadero con la placa o ticket: ${cleanQuery}`
        });
      }

      // Calcular minutos transcurridos
      const horaEntrada = new Date(activeAccess.fecha_hora_entrada);
      const horaSalida = new Date();
      const diffMs = horaSalida - horaEntrada;
      const minutosTranscurridos = Math.max(1, Math.floor(diffMs / (1000 * 60)));

      // Verificar si tiene mensualidad
      const subscription = await vehicleModel.checkActiveSubscription(activeAccess.placa);
      const hasSub = !!subscription;

      // Obtener tarifa
      const tariff = await billingModel.getTariffByType(activeAccess.tipo_vehiculo);
      const liquidacion = billingModel.calculateCharge(tariff, minutosTranscurridos, hasSub);

      return res.json({
        success: true,
        data: {
          acceso: activeAccess,
          tiempo: {
            horaEntrada: activeAccess.fecha_hora_entrada,
            horaSalida: horaSalida.toISOString().replace('T', ' ').slice(0, 19),
            minutosTotales: minutosTranscurridos,
            horasFormateadas: Math.floor(minutosTranscurridos / 60),
            minutosRestantes: minutosTranscurridos % 60
          },
          tarifa: tariff,
          liquidacion,
          mensualidad: subscription
        }
      });
    } catch (err) {
      console.error('Error al calcular salida:', err);
      return res.status(500).json({ success: false, message: 'Error al liquidar salida' });
    }
  },

  // Confirmar y Procesar Salida (RF-07, RF-08, RF-09, RF-10, HU-05, HU-06)
  async confirmExit(req, res) {
    try {
      const { idRegistro, metodoPago, referenciaPago, novedadSalida } = req.body;

      if (!idRegistro) {
        return res.status(400).json({ success: false, message: 'ID de registro es requerido' });
      }

      // 1. Obtener registro
      const active = await accessModel.getActiveByTicket(''); // O buscar por id
      // Consulta directa por id
      const db = require('../config/database');
      const record = await db.getOne(
        `SELECT r.*, v.placa, v.tipo_vehiculo, c.id_celda, c.codigo_celda 
         FROM registros_acceso r
         INNER JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo
         INNER JOIN celdas c ON r.id_celda = c.id_celda
         WHERE r.id_registro = ? AND r.estado = 'EN_CURSO'`,
        [idRegistro]
      );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'El registro no existe o ya ha sido finalizado previamente'
        });
      }

      // 2. Calcular minutos
      const horaEntrada = new Date(record.fecha_hora_entrada);
      const horaSalida = new Date();
      const diffMs = horaSalida - horaEntrada;
      const minutos = Math.max(1, Math.floor(diffMs / (1000 * 60)));

      // 3. Liquidar valor
      const sub = await vehicleModel.checkActiveSubscription(record.placa);
      const tariff = await billingModel.getTariffByType(record.tipo_vehiculo);
      const liquidacion = billingModel.calculateCharge(tariff, minutos, !!sub);

      // 4. Actualizar registro de acceso a FINALIZADO
      const updatedAccess = await accessModel.registerExit(
        record.id_registro,
        minutos,
        liquidacion.total,
        1
      );

      // 5. Liberar Celda (RF-09)
      await cellModel.updateCellState(record.id_celda, 'LIBRE');

      // 6. Registrar pago (RF-10) si el valor es > 0 o registrar recibo de exoneración
      const payment = await billingModel.registerPayment(
        record.id_registro,
        sub ? sub.id_mensualidad : null,
        liquidacion.total,
        metodoPago || 'EFECTIVO',
        referenciaPago || null,
        1
      );

      // 7. Si hay novedad de salida
      if (novedadSalida && novedadSalida.trim() !== '') {
        await noveltyModel.createNovelty(
          record.id_registro,
          record.id_vehiculo,
          'SALIDA',
          'NOVEDAD_EGRESO',
          novedadSalida.trim(),
          'BAJA',
          1
        );
      }

      return res.json({
        success: true,
        message: 'Salida procesada y celda liberada con éxito',
        data: {
          registro: updatedAccess,
          pago: payment,
          tiempoEstancia: {
            minutos,
            horas: Math.floor(minutos / 60),
            minutosRestantes: minutos % 60
          },
          totalCobrado: liquidacion.total,
          motivo: liquidacion.motivo,
          celdaLiberada: record.codigo_celda
        }
      });
    } catch (err) {
      console.error('Error al confirmar salida:', err);
      return res.status(500).json({ success: false, message: 'Error procesando la salida del vehículo' });
    }
  },

  // Listar Vehículos Actualmente en Parqueadero (RF-06)
  async getActiveVehicles(req, res) {
    try {
      const list = await accessModel.getActiveList();
      return res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      console.error('Error al listar activos:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener vehículos activos' });
    }
  }
};

module.exports = accessController;
