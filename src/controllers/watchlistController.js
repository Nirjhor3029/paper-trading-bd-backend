const watchlistService = require('../services/watchlistService');
const WatchlistDTO = require('../dtos/watchlist.dto');
const ResponseFormatter = require('../utils/response');

class WatchlistController {
  async add(req, res, next) {
    try {
      const { stockCode } = req.body;
      const item = await watchlistService.add(req.user._id, stockCode);
      const data = WatchlistDTO.toWatchlistResponse(item);
      ResponseFormatter.created(res, data, 'Stock added to watchlist');
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const { stockCode } = req.params;
      await watchlistService.remove(req.user._id, stockCode);
      ResponseFormatter.success(res, null, 'Stock removed from watchlist');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const items = await watchlistService.getAll(req.user._id);
      const data = WatchlistDTO.toWatchlistsResponse(items);
      ResponseFormatter.success(res, data, 'Watchlist retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WatchlistController();
