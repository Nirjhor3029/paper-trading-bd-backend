/**
 * Stock Data Transfer Objects
 * Defines how data is shaped when moving between layers
 * Decouples API response from database schema
 */
class StockDTO {
  /**
   * Format latest price data for API response
   * @param {Object} data - Raw data from repository
   * @returns {Object} Formatted DTO
   */
  static toLatestPriceResponse(data) {
    return {
      stockCode: data.stockCode || '',
      stockName: data.stockName || '',
      sector: data.sector || 'Unknown',
      date: data.date ? data.date.toISOString().split('T')[0] : null,
      prices: {
        open: data.open || 0,
        ltp: data.ltp || 0,
        high: data.high || 0,
        low: data.low || 0,
        close: data.close || 0,
        ycp: data.ycp || 0,
        change: data.change || 0,
        changePercent: parseFloat(data.changePercent) || 0,
        trade: data.trade || 0,
        value: data.value || 0,
        volume: data.volume || 0,
        dseIndex: data.dseIndex || 0,
      },
      metadata: {
        stockId: data.stockId || null,
        lastUpdated: data.date || null,
      },
    };
  }

  /**
   * Format array of latest prices
   * @param {Array} dataArray
   * @returns {Array} Formatted DTOs
   */
  static toLatestPricesResponse(dataArray) {
    return dataArray.map((item) => StockDTO.toLatestPriceResponse(item));
  }

  /**
   * Format historical data
   * @param {Object} price - StockPrice document
   * @returns {Object} Formatted DTO
   */
  static toHistoricalResponse(price) {
    return {
      date: price.date ? price.date.toISOString().split('T')[0] : null,
      open: price.open || 0,
      ltp: price.ltp || 0,
      high: price.high || 0,
      low: price.low || 0,
      close: price.close || 0,
      ycp: price.ycp || 0,
      change: price.change || 0,
      changePercent: price.ycp ? ((price.change / price.ycp) * 100).toFixed(2) : 0,
      trade: price.trade || 0,
      value: price.value || 0,
      volume: price.volume || 0,
    };
  }

  /**
   * Format stock with latest price
   * @param {Object} stock - StockMetadata
   * @param {Object} latestPrice - StockPrice
   * @returns {Object} Formatted DTO
   */
  static toStockWithPriceResponse(stock, latestPrice) {
    const base = {
      code: stock.code,
      name: stock.name,
      sector: stock.sector,
      isActive: stock.isActive,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    };

    if (latestPrice) {
      base.latestPrice = StockDTO.toHistoricalResponse(latestPrice);
    }

    return base;
  }

  /**
   * Format metadata only
   * @param {Object} metadata - StockMetadata
   * @returns {Object} Formatted DTO
   */
  static toMetadataResponse(metadata) {
    if (Array.isArray(metadata)) {
      return metadata.map((m) => StockDTO.toMetadataResponse(m));
    }

    return {
      id: metadata._id,
      code: metadata.code,
      name: metadata.name,
      sector: metadata.sector,
      isActive: metadata.isActive,
      lastUpdated: metadata.lastUpdated,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    };
  }
}

module.exports = StockDTO;
