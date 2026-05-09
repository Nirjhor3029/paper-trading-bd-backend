const mongoose = require('mongoose');
const StockPrice = require('../models/StockPrice');
const StockMetadata = require('../models/StockMetadata');

/**
 * Repository Class - Data Access Layer
 * All database queries and aggregations go here
 * Service layer calls this, not the models directly
 */
class StockRepository {
  /**
   * Get latest prices for all stocks with aggregation
   * @param {string} sortBy - Sort order: 'code' (default), 'date', 'sector'
   * @returns {Promise<Array>} Array of latest stock prices with metadata
   */
  async findLatestPrices(sortBy = 'code', filter = 'all') {
    let finalSort = { stockCode: 1 };
    if (sortBy === 'date') {
      finalSort = { date: -1 };
    } else if (sortBy === 'sector') {
      finalSort = { sector: 1, stockCode: 1 };
    } else if (sortBy === 'volume') {
      finalSort = { volume: -1 };
    }

    const matchStage = {};
    if (filter === 'gainers') {
      matchStage.change = { $gt: 0 };
    } else if (filter === 'losers') {
      matchStage.change = { $lt: 0 };
    }

    const pipeline = [
      { $sort: { date: -1, scrapedAt: -1 } },
      {
        $group: {
          _id: '$stockId',
          latestPrice: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'stockmetadatas',
          localField: '_id',
          foreignField: '_id',
          as: 'stock',
        },
      },
      { $unwind: '$stock' },
      {
        $project: {
          stockId: '$_id',
          stockCode: '$stock.code',
          stockName: '$stock.name',
          sector: '$stock.sector',
          date: '$latestPrice.date',
          open: '$latestPrice.open',
          ltp: '$latestPrice.ltp',
          high: '$latestPrice.high',
          low: '$latestPrice.low',
          close: '$latestPrice.close',
          ycp: '$latestPrice.ycp',
          change: '$latestPrice.change',
          trade: '$latestPrice.trade',
          value: '$latestPrice.value',
          volume: '$latestPrice.volume',
          dseIndex: '$latestPrice.dseIndex',
          changePercent: {
            $cond: {
              if: { $and: [{ $ne: ['$latestPrice.ycp', 0] }, { $ne: ['$latestPrice.ycp', null] }] },
              then: { $multiply: [{ $divide: ['$latestPrice.change', '$latestPrice.ycp'] }, 100] },
              else: 0
            }
          },
        },
      },
    ];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push({ $sort: finalSort });

    return StockPrice.aggregate(pipeline);
  }

  /**
   * Find stock price by stock ID and date range
   * @param {string} stockId - StockMetadata ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Historical price data
   */
  async findByStockId(stockId, days = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return StockPrice.find({
      stockId: new mongoose.Types.ObjectId(stockId),
      date: { $gte: date },
    }).sort({ date: -1 });
  }

  /**
   * Find the single latest price for a stock (no date restriction)
   * @param {string} stockId - StockMetadata ID
   * @returns {Promise<Object|null>} Latest price or null
   */
  async findLatestPriceByStockId(stockId) {
    return StockPrice.findOne({
      stockId: new mongoose.Types.ObjectId(stockId),
    }).sort({ date: -1 });
  }

  /**
   * Find historical data by stock code
   * @param {string} code - Stock code (e.g., 'ACI')
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Historical price data
   */
  async findHistoricalByCode(code, days = 30) {
    const stock = await StockMetadata.findOne({ code: code.toUpperCase() });
    if (!stock) return [];

    return this.findByStockId(stock._id, days);
  }

  /**
   * Find all active stock metadata
   * @returns {Promise<Array>} Array of stock metadata
   */
  async findAllMetadata() {
    return StockMetadata.find({ isActive: true }).sort({ code: 1 });
  }

  /**
   * Find stock metadata by code
   * @param {string} code - Stock code
   * @returns {Promise<Object|null>} Stock metadata or null
   */
  async findMetadataByCode(code) {
    return StockMetadata.findOne({ code: code.toUpperCase() });
  }

  /**
   * Find or create stock metadata
   * @param {string} code - Stock code
   * @param {string} name - Stock name
   * @param {string} sector - Stock sector
   * @returns {Promise<Object>} Stock metadata
   */
  async findOrCreateMetadata(code, name = '', sector = '') {
    let stock = await StockMetadata.findOne({ code: code.toUpperCase() });
    if (!stock) {
      stock = await StockMetadata.create({
        code: code.toUpperCase(),
        name: name || code,
        sector: sector || 'Unknown',
      });
    }
    return stock;
  }

  /**
   * Update stock metadata
   * @param {string} code - Stock code
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated stock or null
   */
  async updateMetadata(code, updates) {
    return StockMetadata.findOneAndUpdate(
      { code: code.toUpperCase() },
      { ...updates, lastUpdated: new Date() },
      { new: true }
    );
  }

  /**
   * Upsert stock price for a given date
   * @param {string} stockId - StockMetadata ID
   * @param {Date} date - Trading date
   * @param {Object} priceData - Price data to upsert
   * @returns {Promise<Object>} Upserted price document
   */
  async upsertStockPrice(stockId, date, priceData) {
    return StockPrice.findOneAndUpdate(
      { stockId: new mongoose.Types.ObjectId(stockId), date },
      priceData,
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  /**
   * Count documents in a collection
   * @param {string} modelName - 'StockMetadata' or 'StockPrice'
   * @returns {Promise<number>} Document count
   */
  async countDocuments(modelName) {
    if (modelName === 'StockMetadata') {
      return StockMetadata.countDocuments();
    }
    return StockPrice.countDocuments();
  }
  async findPriceHistory(stockId, period = '1D') {
    const periodDaysMap = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };
    const days = periodDaysMap[period] ?? 30;

    const since = new Date();
    since.setDate(since.getDate() - days);

    return StockPrice.find(
      { stockId, date: { $gte: since } },
      { date: 1, open: 1, high: 1, low: 1, ltp: 1, volume: 1, trade: 1, value: 1, _id: 0 }
    )
      .sort({ date: 1 })
      .lean();
  }

  async findSparkData(stockId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return StockPrice.find(
      { stockId, date: { $gte: since } },
      { date: 1, ltp: 1, _id: 0 }
    )
      .sort({ date: 1 })
      .lean();
  }
  async findLatestPrice(stockId) {
    return StockPrice.findOne({ stockId }).sort({ date: -1 }).lean();
  }
  async findMetadataByCode(code) {
    console.log(code)

    const res = await StockMetadata.findOne({ code: code.toUpperCase() }).lean();
    console.log(res, "---------------------")
    return res
  }
}

module.exports = new StockRepository();
