const StockMetadata = require('../models/StockMetadata');
const StockPrice = require('../models/StockPrice');
const logger = require('../utils/logger');

class StockService {
  async getAllLatestPrices() {
    try {
      const prices = await StockPrice.findLatestPrices();
      return prices;
    } catch (error) {
      logger.error('Error in getAllLatestPrices:', error);
      throw error;
    }
  }

  async getStockByCode(code) {
    try {
      const stock = await StockMetadata.findOne({ code: code.toUpperCase() });
      if (!stock) return null;

      const latestPrice = await StockPrice.findOne({ stockId: stock._id })
        .sort({ date: -1 });

      return { stock, latestPrice };
    } catch (error) {
      logger.error(`Error in getStockByCode for ${code}:`, error);
      throw error;
    }
  }

  async getHistoricalData(code, days = 30) {
    try {
      const stock = await StockMetadata.findOne({ code: code.toUpperCase() });
      if (!stock) return [];

      const date = new Date();
      date.setDate(date.getDate() - days);

      return await StockPrice.find({
        stockId: stock._id,
        date: { $gte: date },
      }).sort({ date: -1 });
    } catch (error) {
      logger.error(`Error in getHistoricalData for ${code}:`, error);
      throw error;
    }
  }

  async getAllMetadata() {
    try {
      return await StockMetadata.find({ isActive: true }).sort({ code: 1 });
    } catch (error) {
      logger.error('Error in getAllMetadata:', error);
      throw error;
    }
  }

  async updateMetadata(code, updates) {
    try {
      const stock = await StockMetadata.findOneAndUpdate(
        { code: code.toUpperCase() },
        { ...updates, lastUpdated: new Date() },
        { new: true }
      );
      return stock;
    } catch (error) {
      logger.error(`Error in updateMetadata for ${code}:`, error);
      throw error;
    }
  }
}

module.exports = new StockService();
