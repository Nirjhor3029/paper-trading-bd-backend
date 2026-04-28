const stockService = require('../services/stockService');
const logger = require('../utils/logger');

class StockController {
  async getLatestPrices(req, res, next) {
    try {
      const prices = await stockService.getAllLatestPrices();
      
      res.status(200).json({
        success: true,
        count: prices.length,
        data: prices,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockByCode(req, res, next) {
    try {
      const { code } = req.params;
      const result = await stockService.getStockByCode(code);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Stock with code ${code} not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistoricalData(req, res, next) {
    try {
      const { code } = req.params;
      const days = parseInt(req.query.days, 10) || 30;

      const data = await stockService.getHistoricalData(code, days);

      res.status(200).json({
        success: true,
        stockCode: code.toUpperCase(),
        days,
        count: data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllMetadata(req, res, next) {
    try {
      const metadata = await stockService.getAllMetadata();
      res.status(200).json({
        success: true,
        count: metadata.length,
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMetadata(req, res, next) {
    try {
      const { code } = req.params;
      const updates = req.body;

      const stock = await stockService.updateMetadata(code, updates);

      if (!stock) {
        return res.status(404).json({
          success: false,
          message: `Stock with code ${code} not found`,
        });
      }

      res.status(200).json({
        success: true,
        message: `Stock ${code} metadata updated successfully`,
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  }

  async healthCheck(req, res) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}

module.exports = new StockController();
