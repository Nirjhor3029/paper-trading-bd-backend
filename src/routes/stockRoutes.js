const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { validateStockUpdate } = require('../middlewares/validationMiddleware');

router.get('/health', stockController.healthCheck);
router.get('/stocks', stockController.getLatestPrices);
router.get('/stocks/metadata', stockController.getAllMetadata);
router.get('/stocks/:code', stockController.getStockByCode);
router.get('/stocks/:code/history', stockController.getHistoricalData);
router.put('/stocks/:code/metadata', validateStockUpdate, stockController.updateMetadata);

module.exports = router;
