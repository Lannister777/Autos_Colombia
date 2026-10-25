const express = require('express');
const router = express.Router();

const accessController = require('../controllers/accessController');
const cellController = require('../controllers/cellController');
const noveltyController = require('../controllers/noveltyController');
const rateController = require('../controllers/rateController');

// 1. Rutas de Control de Accesos (Entrada / Salida / Activos)
router.get('/accesos/verificar/:placa', accessController.checkPlate);
router.post('/accesos/entrada', accessController.registerEntry);
router.get('/accesos/calcular-salida', accessController.calculateExit);
router.post('/accesos/salida', accessController.confirmExit);
router.get('/accesos/activos', accessController.getActiveVehicles);

// 2. Rutas de Celdas
router.get('/celdas', cellController.getCells);
router.get('/celdas/estadisticas', cellController.getStats);
router.get('/celdas/disponibles/:tipo', cellController.getAvailable);

// 3. Rutas de Novedades
router.post('/novedades', noveltyController.create);
router.get('/novedades/placa/:placa', noveltyController.getByPlate);
router.get('/novedades/recientes', noveltyController.getRecent);

// 4. Rutas de Tarifas
router.get('/tarifas', rateController.getAllRates);

module.exports = router;
