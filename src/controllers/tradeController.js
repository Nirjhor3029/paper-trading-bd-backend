const tradeService = require('../services/tradeService');
const TradeDTO = require('../dtos/trade.dto');
const HoldingDTO = require('../dtos/holding.dto');
const ResponseFormatter = require('../utils/response');
const StockPrice = require('../models/StockPrice');

class TradeController {
  async buy(req, res, next) {
    try {
      const { stockCode, quantity, price } = req.body;
      const trade = await tradeService.buy(req.user._id, { stockCode, quantity, price });
      const data = TradeDTO.toTradeResponse(trade);
      ResponseFormatter.created(res, data, 'Buy order executed successfully');
    } catch (error) {
      next(error);
    }
  }

  async sell(req, res, next) {
    try {
      const { stockCode, quantity, price } = req.body;
      const trade = await tradeService.sell(req.user._id, { stockCode, quantity, price });
      const data = TradeDTO.toTradeResponse(trade);
      ResponseFormatter.created(res, data, 'Sell order executed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTrades(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const skip = parseInt(req.query.skip) || 0;
      const { trades, total } = await tradeService.getUserTrades(req.user._id, { limit, skip });
      const data = TradeDTO.toTradesResponse(trades);
      ResponseFormatter.paginated(res, data, skip / limit + 1, limit, total, 'Trades retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHoldings(req, res, next) {
    try {
      const holdings = await tradeService.getUserHoldings(req.user._id);
      const data = await Promise.all(holdings.map(async (h) => {
        const latestPrice = await StockPrice.findOne({ stockId: h.stockId }).sort({ date: -1 });
        return HoldingDTO.toHoldingResponse(h, latestPrice);
      }));
      ResponseFormatter.success(res, data, 'Holdings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TradeController();
