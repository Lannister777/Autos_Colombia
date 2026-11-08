const express = require('express');
const router = express.Router();

const accessController = require('../controllers/accessController');
const cellController = require('../controllers/cellController');
const noveltyController = require('../controllers/noveltyController');
const rateController = require('../controllers/rateController');
const userController = require('../controllers/userController');
const cellAdminController = require('../controllers/cellAdminController');

// 1. Rutas de Control de Accesos (Entrada / Salida / Activos)
router.get('/accesos/verificar/:placa', accessController.checkPlate);
router.post('/accesos/entrada', accessController.registerEntry);
router.get('/accesos/calcular-salida', accessController.calculateExit);
router.post('/accesos/salida', accessController.confirmExit);
router.get('/accesos/activos', accessController.getActiveVehicles);

// 2. Rutas de Celdas (Consulta Operativa)
router.get('/celdas', cellController.getCells);
router.get('/celdas/estadisticas', cellController.getStats);
router.get('/celdas/disponibles/:tipo', cellController.getAvailable);

// 3. Rutas de Novedades
router.post('/novedades', noveltyController.create);
router.get('/novedades/placa/:placa', noveltyController.getByPlate);
router.get('/novedades/recientes', noveltyController.getRecent);

// 4. Rutas de Tarifas
router.get('/tarifas', rateController.getAllRates);

// 5. Rutas de Gestión de Usuarios (Iteración 2)
router.post('/auth/login', userController.login);
router.get('/usuarios', userController.getAll);
router.get('/usuarios/:id', userController.getById);
router.post('/usuarios', userController.create);
router.put('/usuarios/:id', userController.update);
router.patch('/usuarios/:id/toggle-active', userController.toggleActive);
router.patch('/usuarios/:id/password', userController.changePassword);

// 6. Rutas de Administración de Celdas (Iteración 2)
router.post('/celdas', cellAdminController.create);
router.put('/celdas/:id', cellAdminController.update);
router.delete('/celdas/:id', cellAdminController.delete);
router.patch('/celdas/:id/maintenance', cellAdminController.setMaintenance);
router.patch('/celdas/:id/available', cellAdminController.setAvailable);
router.get('/celdas/reporte-capacidad', cellAdminController.getCapacityReport);

module.exports = router;
