const paymentModel = require('../models/paymentModel');
const db = require('../config/database');

const paymentController = {
  // GET /api/pagos - Listar historial de pagos con filtros (RF-IT3-04)
  async getAllPayments(req, res) {
    try {
      const { metodo, estado, tipo, fecha_inicio, fecha_fin, placa, search } = req.query;
      const payments = await paymentModel.getAllPayments({
        metodo,
        estado,
        tipo,
        fecha_inicio,
        fecha_fin,
        placa,
        search
      });

      return res.json({
        success: true,
        count: payments.length,
        data: payments
      });
    } catch (err) {
      console.error('Error al listar pagos:', err);
      return res.status(500).json({ success: false, message: 'Error interno al consultar historial de pagos' });
    }
  },

  // GET /api/pagos/:id - Ver detalle completo de un pago (RF-IT3-05, RF-IT3-09)
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await paymentModel.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({ success: false, message: 'Pago no encontrado' });
      }

      return res.json({
        success: true,
        data: payment
      });
    } catch (err) {
      console.error('Error al obtener detalle de pago:', err);
      return res.status(500).json({ success: false, message: 'Error interno al consultar detalle de pago' });
    }
  },

  // PATCH /api/pagos/:id/anular - Anular pago (solo Administrador) (RF-IT3-06, HU-IT3-06)
  async voidPayment(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario, motivo } = req.body;

      if (!id_usuario) {
        return res.status(400).json({ success: false, message: 'El ID de usuario es obligatorio' });
      }

      if (!motivo || motivo.trim() === '') {
        return res.status(400).json({ success: false, message: 'Debe especificar el motivo de anulación' });
      }

      // Validar rol de administrador
      const user = await db.getOne('SELECT id_usuario, rol FROM usuarios WHERE id_usuario = ?', [id_usuario]);
      if (!user || user.rol !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para anular pagos. Requiere rol de Administrador.'
        });
      }

      const updatedPayment = await paymentModel.voidPayment(id, id_usuario, motivo.trim());

      return res.json({
        success: true,
        message: 'Pago anulado correctamente',
        data: updatedPayment
      });
    } catch (err) {
      console.error('Error al anular pago:', err);
      const statusCode = err.message === 'Pago no encontrado' ? 404 : 400;
      return res.status(statusCode).json({ success: false, message: err.message });
    }
  },

  // GET /api/mensualidades - Listar mensualidades (RF-IT3-07)
  async getAllSubscriptions(req, res) {
    try {
      const { estado, search } = req.query;
      const subscriptions = await paymentModel.getAllSubscriptions({ estado, search });

      return res.json({
        success: true,
        count: subscriptions.length,
        data: subscriptions
      });
    } catch (err) {
      console.error('Error al listar mensualidades:', err);
      return res.status(500).json({ success: false, message: 'Error interno al consultar mensualidades' });
    }
  },

  // GET /api/mensualidades/:id - Detalle de mensualidad
  async getSubscriptionById(req, res) {
    try {
      const { id } = req.params;
      const subscription = await paymentModel.getSubscriptionById(id);

      if (!subscription) {
        return res.status(404).json({ success: false, message: 'Mensualidad no encontrada' });
      }

      return res.json({
        success: true,
        data: subscription
      });
    } catch (err) {
      console.error('Error al obtener mensualidad:', err);
      return res.status(500).json({ success: false, message: 'Error al consultar mensualidad' });
    }
  },

  // POST /api/mensualidades - Crear nueva mensualidad con pago (RF-IT3-02, HU-IT3-02)
  async createSubscription(req, res) {
    try {
      const {
        id_cliente,
        id_vehiculo,
        id_celda,
        id_celda_asignada,
        fecha_inicio,
        fecha_fin,
        valor_mensual,
        metodo_pago,
        referencia_transaccion,
        id_usuario
      } = req.body;

      if (!id_cliente || !id_vehiculo || !valor_mensual) {
        return res.status(400).json({
          success: false,
          message: 'Cliente, vehículo y valor mensual son obligatorios'
        });
      }

      const celdaId = id_celda_asignada || id_celda || null;

      const result = await paymentModel.createSubscription({
        id_cliente: parseInt(id_cliente, 10),
        id_vehiculo: parseInt(id_vehiculo, 10),
        id_celda_asignada: celdaId ? parseInt(celdaId, 10) : null,
        fecha_inicio,
        fecha_fin,
        valor_mensual: parseFloat(valor_mensual),
        metodo_pago: metodo_pago || 'EFECTIVO',
        referencia_transaccion: referencia_transaccion || null,
        id_usuario: id_usuario ? parseInt(id_usuario, 10) : 1
      });

      return res.status(201).json({
        success: true,
        message: 'Mensualidad creada y pago registrado con éxito',
        data: result
      });
    } catch (err) {
      console.error('Error al crear mensualidad:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/mensualidades/:id/renovar - Renovar mensualidad existente (RF-IT3-03, HU-IT3-03)
  async renewSubscription(req, res) {
    try {
      const { id } = req.params;
      const { metodo_pago, referencia_transaccion, valor_mensual, id_usuario } = req.body;

      const result = await paymentModel.renewSubscription(id, {
        metodo_pago: metodo_pago || 'EFECTIVO',
        referencia_transaccion: referencia_transaccion || null,
        valor_mensual: valor_mensual ? parseFloat(valor_mensual) : null,
        id_usuario: id_usuario ? parseInt(id_usuario, 10) : 1
      });

      return res.json({
        success: true,
        message: 'Mensualidad renovada y pago registrado exitosamente',
        data: result
      });
    } catch (err) {
      console.error('Error al renovar mensualidad:', err);
      const statusCode = err.message === 'Mensualidad no encontrada' ? 404 : 400;
      return res.status(statusCode).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/mensualidades/:id/cancelar - Cancelar mensualidad (RF-IT3-08, HU-IT3-08)
  async cancelSubscription(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario } = req.body;

      const updated = await paymentModel.cancelSubscription(id, id_usuario);

      return res.json({
        success: true,
        message: 'Mensualidad cancelada y celda liberada correctamente',
        data: updated
      });
    } catch (err) {
      console.error('Error al cancelar mensualidad:', err);
      const statusCode = err.message === 'Mensualidad no encontrada' ? 404 : 400;
      return res.status(statusCode).json({ success: false, message: err.message });
    }
  },

  // GET /api/reportes/ingresos-dia - Reporte de ingresos del día (RF-IT3-10, HU-IT3-09)
  async getDailyIncomeReport(req, res) {
    try {
      const { fecha } = req.query;
      const report = await paymentModel.getDailyIncomeReport(fecha);

      return res.json({
        success: true,
        data: report
      });
    } catch (err) {
      console.error('Error al generar reporte diario:', err);
      return res.status(500).json({ success: false, message: 'Error interno al generar reporte diario' });
    }
  },

  // GET /api/reportes/ingresos-mes - Reporte de ingresos del mes (RF-IT3-11)
  async getMonthlyIncomeReport(req, res) {
    try {
      const { year, month } = req.query;
      const report = await paymentModel.getMonthlyIncomeReport(year, month);

      return res.json({
        success: true,
        data: report
      });
    } catch (err) {
      console.error('Error al generar reporte mensual:', err);
      return res.status(500).json({ success: false, message: 'Error interno al generar reporte mensual' });
    }
  },

  // GET /api/mensualidades/proximas-a-vencer - Mensualidades próximas a vencer (RF-IT3-12, HU-IT3-10)
  async getExpiringSubscriptions(req, res) {
    try {
      const dias = parseInt(req.query.dias || '7', 10);
      const expiring = await paymentModel.getExpiringSubscriptions(dias);

      return res.json({
        success: true,
        dias_limite: dias,
        count: expiring.length,
        data: expiring
      });
    } catch (err) {
      console.error('Error al consultar mensualidades por vencer:', err);
      return res.status(500).json({ success: false, message: 'Error al consultar vencimientos' });
    }
  },

  // GET /api/pagos/formulario-datos - Datos para selectores en formularios
  async getFormData(req, res) {
    try {
      const data = await paymentModel.getFormData();
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Error al obtener datos de formulario:', err);
      return res.status(500).json({ success: false, message: 'Error al cargar datos auxiliares' });
    }
  }
};

module.exports = paymentController;
