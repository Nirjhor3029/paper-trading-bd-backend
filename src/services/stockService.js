const stockRepo = require('../repositories/stockRepository');

/**
 * Service Class - Business Logic Layer
 * Handles business rules, calls Repository for data access
 */
class StockService {
  /**
   * Get all latest stock prices
   * @param {string} sortBy - Sort order: 'code', 'date', 'sector'
   * @returns {Promise<Array>} Latest prices for all stocks
   */
  async getAllLatestPrices(sortBy = 'code') {
    try {
      return await stockRepo.findLatestPrices(sortBy);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get stock by code with latest price
   * @param {string} code - Stock code
   * @returns {Promise<Object|null>} Stock with latest price or null
   */
  async getStockByCode(code) {
    try {
      const stock = await stockRepo.findMetadataByCode(code);
      if (!stock) return null;

      const latestPrice = await stockRepo.findByStockId(stock._id, 1);
      return { stock, latestPrice: latestPrice[0] || null };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get historical data for a stock
   * @param {string} code - Stock code
   * @param {number} days - Number of days
   * @returns {Promise<Array>} Historical price data
   */
  async getHistoricalData(code, days = 30) {
    try {
      return await stockRepo.findHistoricalByCode(code, days);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all stock metadata
   * @returns {Promise<Array>} All active stock metadata
   */
  async getAllMetadata() {
    try {
      return await stockRepo.findAllMetadata();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update stock metadata
   * @param {string} code - Stock code
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated stock or null
   */
  async updateMetadata(code, updates) {
    try {
      return await stockRepo.updateMetadata(code, updates);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save stock data to DB (for scraper integration)
   * @param {Array} stockDataArray - Array of scraped stock data
   * @returns {Promise<void>}
   */
  async saveStockToDB(stockDataArray) {
    try {
      const Service = require('./scraperService'); // Lazy load to avoid circular
      return await Service.saveStockToDB(stockDataArray);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StockService();
