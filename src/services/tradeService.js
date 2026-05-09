const Trade = require('../models/Trade');
const Holding = require('../models/Holding');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const StockMetadata = require('../models/StockMetadata');
const StockPrice = require('../models/StockPrice');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const BROKERAGE_RATE = 0.005;

class TradeService {
  async buy(userId, { stockCode, quantity, price }) {
    const stock = await StockMetadata.findOne({ code: stockCode.toUpperCase() });
    if (!stock) throw new NotFoundError(`Stock ${stockCode} not found`);

    const grossAmount = quantity * price;
    const fee = grossAmount * BROKERAGE_RATE;
    const netAmount = grossAmount + fee;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new BadRequestError('Wallet not found');
    if (wallet.balance < netAmount) throw new BadRequestError('Insufficient balance');

    const latestPrice = await StockPrice.findOne({ stockId: stock._id }).sort({ date: -1 });

    const trade = await Trade.create({
      userId,
      stockId: stock._id,
      stockCode: stockCode.toUpperCase(),
      side: 'BUY',
      quantity,
      price,
      grossAmount,
      fee,
      netAmount,
      marketSnapshot: latestPrice ? {
        ltp: latestPrice.ltp,
        high: latestPrice.high,
        low: latestPrice.low,
        changePercent: latestPrice.changePercent,
        volume: latestPrice.volume,
      } : undefined,
    });

    wallet.balance -= netAmount;
    wallet.totalBought += grossAmount;
    wallet.totalFeesPaid += fee;
    await wallet.save();

    await Transaction.create({
      userId,
      type: 'BUY',
      direction: 'DEBIT',
      amount: netAmount,
      balanceBefore: wallet.balance + netAmount,
      balanceAfter: wallet.balance,
      tradeId: trade._id,
      stockCode: stockCode.toUpperCase(),
      description: `Bought ${quantity} shares of ${stockCode} @ ৳${price}`,
    });

    let holding = await Holding.findOne({ userId, stockCode: stockCode.toUpperCase() });
    if (!holding) {
      holding = await Holding.create({
        userId,
        stockId: stock._id,
        stockCode: stockCode.toUpperCase(),
        quantity: 0,
        avgBuyPrice: 0,
      });
    }
    holding.applyBuy(quantity, price);
    await holding.save();

    await Transaction.create({
      userId,
      type: 'FEE',
      direction: 'DEBIT',
      amount: fee,
      balanceBefore: wallet.balance + fee,
      balanceAfter: wallet.balance,
      tradeId: trade._id,
      stockCode: stockCode.toUpperCase(),
      description: `Brokerage fee for buying ${stockCode}`,
    });

    return trade;
  }

  async sell(userId, { stockCode, quantity, price }) {
    const stock = await StockMetadata.findOne({ code: stockCode.toUpperCase() });
    if (!stock) throw new NotFoundError(`Stock ${stockCode} not found`);

    const holding = await Holding.findOne({ userId, stockCode: stockCode.toUpperCase() });
    if (!holding || holding.quantity < quantity) throw new BadRequestError('Insufficient shares');

    const grossAmount = quantity * price;
    const fee = grossAmount * BROKERAGE_RATE;
    const netAmount = grossAmount - fee;

    const latestPrice = await StockPrice.findOne({ stockId: stock._id }).sort({ date: -1 });

    const pnl = holding.applySell(quantity, price);
    await holding.save();

    const trade = await Trade.create({
      userId,
      stockId: stock._id,
      stockCode: stockCode.toUpperCase(),
      side: 'SELL',
      quantity,
      price,
      grossAmount,
      fee,
      netAmount,
      avgBuyPrice: holding.avgBuyPrice,
      realizedPnL: pnl,
      realizedPnLPercent: holding.avgBuyPrice > 0 ? parseFloat(((price - holding.avgBuyPrice) / holding.avgBuyPrice * 100).toFixed(2)) : null,
      marketSnapshot: latestPrice ? {
        ltp: latestPrice.ltp,
        high: latestPrice.high,
        low: latestPrice.low,
        changePercent: latestPrice.changePercent,
        volume: latestPrice.volume,
      } : undefined,
    });

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new BadRequestError('Wallet not found');

    wallet.balance += netAmount;
    wallet.totalSold += grossAmount;
    wallet.totalFeesPaid += fee;
    await wallet.save();

    await Transaction.create({
      userId,
      type: 'SELL',
      direction: 'CREDIT',
      amount: netAmount,
      balanceBefore: wallet.balance - netAmount,
      balanceAfter: wallet.balance,
      tradeId: trade._id,
      stockCode: stockCode.toUpperCase(),
      description: `Sold ${quantity} shares of ${stockCode} @ ৳${price}`,
    });

    await Transaction.create({
      userId,
      type: 'FEE',
      direction: 'DEBIT',
      amount: fee,
      balanceBefore: wallet.balance + fee,
      balanceAfter: wallet.balance,
      tradeId: trade._id,
      stockCode: stockCode.toUpperCase(),
      description: `Brokerage fee for selling ${stockCode}`,
    });

    return trade;
  }

  async getUserTrades(userId, { limit = 50, skip = 0 } = {}) {
    const trades = await Trade.find({ userId })
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Trade.countDocuments({ userId });
    return { trades, total };
  }

  async getUserHoldings(userId) {
    const holdings = await Holding.find({ userId, quantity: { $gt: 0 } }).sort({ stockCode: 1 });
    return holdings;
  }
}

module.exports = new TradeService();
