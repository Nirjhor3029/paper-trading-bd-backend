const mongoose = require('mongoose');
const stockService = require('../services/stockService');
const logger = require('../utils/logger');
const StockDTO = require('../dtos/stock.dto');
const ResponseFormatter = require('../utils/response');
const { NotFoundError, ServiceUnavailableError } = require('../utils/errors');
const stockRepository = require('../repositories/stockRepository');

/**
 * Stock Controller - HTTP Request Handlers Only
 * Uses DTO for data shaping and ResponseFormatter for consistent responses
 */
class StockController {
  async getLatestPrices(req, res, next) {
    try {
      const sortBy = req.query.sortBy || 'code';
      const filter = req.query.filter || 'all';
      const prices = await stockService.getAllLatestPrices(sortBy, filter);
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
      ResponseFormatter.success(res, formattedData, 'Historical data retrieved successfully', 200, { stock_code: code.toUpperCase() });
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

  async getStockTopbar(req, res, next) {
    const data = await stockService.getStockTopbar()

    ResponseFormatter.success(res, data, "fetched data")

  }

  async getStockDetail(req, res, next) {
    try {
      const { symbol } = req.params;
      const { period = '1D' } = req.query;

      if (!symbol) {
        return res.status(400).json({ success: false, message: 'Stock symbol is required' });
      }

      // 1. Resolve metadata
      const meta = await stockRepository.findMetadataByCode(symbol);

      console.log("meta", meta)
      if (!meta) {
        return res.status(404).json({ success: false, message: `Stock '${symbol}' not found` });
      }

      // 2. Latest price snapshot
      const latest = await stockRepository.findLatestPrice(meta._id);
      if (!latest) {
        return res.status(404).json({
          success: false,
          message: `No price data available for '${symbol}'`,
        });
      }

      const sparkRaw = await stockRepository.findSparkData(meta._id, 30);
      const spark = sparkRaw.map((d) => d.ltp);

      // 4. Full OHLCV history for the requested period tab
      const history = await stockRepository.findPriceHistory(meta._id, period);

      // 5. Compute derived fields (mirrors frontend fakeData logic)
      const changePercent =
        latest.ycp && latest.ycp !== 0
          ? parseFloat(((latest.change / latest.ycp) * 100).toFixed(2))
          : 0;

      // 6. Shape response to match MappedStock interface
      const stock = {
        symbol: meta.code,
        name: meta.name,
        sector: meta.sector,

        // Price fields
        price: latest.ltp,
        open: latest.open,
        high: latest.high,
        low: latest.low,
        ycp: latest.ycp,       // yesterday's close price
        change: latest.change,
        pct: changePercent,

        // Volume / activity
        vol: latest.volume,
        value: latest.value,
        trade: latest.trade,

        // DSE ranking
        dseIndex: latest.dseIndex,

        // Chart data
        spark,                  // number[] for SparkLine
        history,                // full OHLCV for period tab (optional use)

        // Meta timestamps
        dataDate: latest.date,
        lastUpdated: meta.lastUpdated,
      };

      return res.status(200).json({ success: true, data: stock });
    } catch (err) {
      console.error('[getStockDetail] Error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

module.exports = new StockController();
