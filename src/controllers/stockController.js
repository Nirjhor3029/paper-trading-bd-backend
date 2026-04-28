const mongoose = require('mongoose');
const stockService = require('../services/stockService');
const logger = require('../utils/logger');
const StockDTO = require('../dtos/stock.dto');
const ResponseFormatter = require('../utils/response');
const { NotFoundError, ServiceUnavailableError } = require('../utils/errors');

/**
 * Stock Controller - HTTP Request Handlers Only
 * Uses DTO for data shaping and ResponseFormatter for consistent responses
 */
class StockController {
  async getLatestPrices(req, res, next) {
    try {
      const sortBy = req.query.sortBy || 'code'; // 'code', 'date', or 'sector'
      const prices = await stockService.getAllLatestPrices(sortBy);
      const formattedData = StockDTO.toLatestPricesResponse(prices);

      ResponseFormatter.success(res, formattedData, 'Latest prices retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStockByCode(req, res, next) {
    try {
      const { code } = req.params;
      const result = await stockService.getStockByCode(code);

      if (!result) {
        return next(new NotFoundError(`Stock with code ${code}`));
      }

      const formattedData = StockDTO.toStockWithPriceResponse(result.stock, result.latestPrice);
      ResponseFormatter.success(res, formattedData, 'Stock retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHistoricalData(req, res, next) {
    try {
      const { code } = req.params;
      const days = parseInt(req.query.days, 10) || 30;

      const data = await stockService.getHistoricalData(code, days);

      if (!data || data.length === 0) {
        return next(new NotFoundError(`Historical data for stock ${code}`));
      }

      const formattedData = data.map((price) => StockDTO.toHistoricalResponse(price));
      ResponseFormatter.success(res, formattedData, 'Historical data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllMetadata(req, res, next) {
    try {
      const metadata = await stockService.getAllMetadata();
      const formattedData = StockDTO.toMetadataResponse(metadata);

      ResponseFormatter.success(res, formattedData, 'Metadata retrieved successfully');
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
        return next(new NotFoundError(`Stock with code ${code}`));
      }

      const formattedData = StockDTO.toMetadataResponse(stock);
      ResponseFormatter.success(res, formattedData, `Stock ${code} metadata updated successfully`);
    } catch (error) {
      next(error);
    }
  }

  async healthCheck(req, res, next) {
    try {
      const dbStatus = mongoose.connection.readyState;
      const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      const status = dbStatus === 1 ? 'ok' : 'error';
      const statusCode = dbStatus === 1 ? 200 : 503;

      res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: dbStates[dbStatus] || 'unknown',
          state: dbStatus,
          host: mongoose.connection.host || 'not connected',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async testDBConnection(req, res, next) {
    try {
      const dbStatus = mongoose.connection.readyState;

      if (dbStatus !== 1) {
        return next(new ServiceUnavailableError('Database'));
      }

      const metadata = await stockService.getAllMetadata();

      ResponseFormatter.success(
        res,
        {
          database: {
            status: 'connected',
            host: mongoose.connection.host,
            name: mongoose.connection.name,
            collections: {
              stockMetadata: metadata.length,
            },
          },
          env: {
            nodeEnv: process.env.NODE_ENV || 'development',
            mongoUriSet: !!process.env.MONGODB_URI,
          },
        },
        'Database connection successful'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StockController();
