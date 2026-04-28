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
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.status(200).json({
      status: dbStatus === 1 ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStates[dbStatus] || 'unknown',
        state: dbStatus,
        host: mongoose.connection.host || 'not connected'
      }
    });
  }

  async testDBConnection(req, res) {
    try {
      const dbStatus = mongoose.connection.readyState;
      
      if (dbStatus !== 1) {
        return res.status(503).json({
          success: false,
          message: 'Database not connected',
          dbStatus: dbStatus,
          hint: 'Check MONGODB_URI environment variable'
        });
      }
      
      // Try a simple query to verify DB is working
      const StockMetadata = require('../models/StockMetadata');
      const count = await StockMetadata.countDocuments();
      
      res.status(200).json({
        success: true,
        message: 'Database connection successful',
        database: {
          status: 'connected',
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          collections: {
            stockMetadata: count
          }
        },
        env: {
          nodeEnv: process.env.NODE_ENV || 'development',
          mongoUriSet: !!process.env.MONGODB_URI
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Database connection test failed',
        error: error.message,
        hint: 'Verify MONGODB_URI is correct and Atlas IP whitelist includes Vercel'
      });
    }
  }
}

module.exports = new StockController();
