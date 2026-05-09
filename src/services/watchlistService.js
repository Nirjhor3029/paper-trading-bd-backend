const Watchlist = require('../models/Watchlist');
const StockMetadata = require('../models/StockMetadata');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/errors');

class WatchlistService {
  async add(userId, stockCode) {
    const stock = await StockMetadata.findOne({ code: stockCode.toUpperCase() });
    if (!stock) throw new NotFoundError(`Stock ${stockCode} not found`);

    const existing = await Watchlist.findOne({ userId, stockCode: stockCode.toUpperCase() });
    if (existing) throw new ConflictError('Stock already in watchlist');

    const item = await Watchlist.create({
      userId,
      stockCode: stockCode.toUpperCase(),
      stockId: stock._id,
    });

    return item;
  }

  async remove(userId, stockCode) {
    const item = await Watchlist.findOneAndDelete({ userId, stockCode: stockCode.toUpperCase() });
    if (!item) throw new NotFoundError('Stock not found in watchlist');
    return item;
  }

  async getAll(userId) {
    const items = await Watchlist.find({ userId }).sort({ addedAt: -1 });
    return items;
  }
}

module.exports = new WatchlistService();
