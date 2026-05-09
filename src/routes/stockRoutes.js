const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { validateStockUpdate } = require('../middlewares/validationMiddleware');

router.get('/health', stockController.healthCheck);
router.get("/stock-topbar", stockController.getStockTopbar)
router.get('/health/db', stockController.testDBConnection);
router.get('/stocks', stockController.getLatestPrices);
router.get('/stocks/metadata', stockController.getAllMetadata);
router.get('/stocks/:code', stockController.getStockByCode);
router.get('/stocks/:code/history', stockController.getHistoricalData);
router.get('/stocks-spark/:symbol', stockController.getStockDetail);
router.put('/stocks/:code/metadata', validateStockUpdate, stockController.updateMetadata);

module.exports = router;
