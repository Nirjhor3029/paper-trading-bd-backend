const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Holding = require('../models/Holding');
const StockPrice = require('../models/StockPrice');

class LeaderboardService {
  async getLeaderboard(limit = 50, skip = 0) {
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'holdings',
          localField: 'userId',
          foreignField: 'userId',
          as: 'holdings',
        },
      },
      { $unwind: { path: '$holdings', preserveNullAndEmptyArrays: true } },
      { $match: { $or: [{ 'holdings.quantity': { $gt: 0 } }, { 'holdings': { $exists: false } }] } },
      {
        $group: {
          _id: '$userId',
          name: { $first: '$user.name' },
          avatar: { $first: '$user.avatar' },
          tier: { $first: '$user.tier' },
          walletBalance: { $first: '$balance' },
          totalDeposited: { $first: '$totalDeposited' },
          totalTrades: { $first: '$user.stats.totalTrades' },
          winRate: { $first: '$user.stats.winRate' },
          holdings: {
            $push: {
              stockId: '$holdings.stockId',
              stockCode: '$holdings.stockCode',
              quantity: '$holdings.quantity',
              avgBuyPrice: '$holdings.avgBuyPrice',
              totalBuyCost: '$holdings.totalBuyCost',
            },
          },
        },
      },
      { $sort: { walletBalance: -1 } },
    ];

    const wallets = await Wallet.aggregate(pipeline);

    const latestPrices = await StockPrice.aggregate([
      { $sort: { date: -1 } },
      { $group: { _id: '$stockId', ltp: { $first: '$ltp' } } },
    ]);
    const priceMap = new Map(latestPrices.map((p) => [p._id.toString(), p.ltp]));

    const enriched = wallets
      .map((w) => {
        const validHoldings = (w.holdings || []).filter(
          (h) => h.stockId && h.quantity > 0
        );

        let holdingsValue = 0;
        let invested = 0;
        const holdingDetails = validHoldings.map((h) => {
          const ltp = priceMap.get(h.stockId.toString()) || 0;
          holdingsValue += ltp * h.quantity;
          invested += h.totalBuyCost || 0;
          return {
            stockCode: h.stockCode,
            quantity: h.quantity,
            avgBuyPrice: h.avgBuyPrice,
            currentPrice: ltp,
          };
        });

        const totalValue = (w.walletBalance || 0) + holdingsValue;
        const netPnL = totalValue - (w.totalDeposited || 100000);
        const pnlPercent = invested > 0
          ? ((holdingsValue - invested) / invested) * 100
          : 0;

        return {
          userId: w._id,
          name: w.name,
          avatar: w.avatar,
          tier: w.tier,
          totalValue,
          walletBalance: w.walletBalance || 0,
          holdingsValue,
          netPnL,
          pnlPercent,
          totalTrades: w.totalTrades || 0,
          winRate: w.winRate || 0,
          holdingDetails,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue);

    const total = enriched.length;
    const paged = enriched.slice(skip, skip + limit).map((entry, i) => ({
      ...entry,
      rank: skip + i + 1,
    }));

    return { entries: paged, total };
  }

  async getUserRank(userId) {
    const { entries } = await this.getLeaderboard(999999, 0);
    const idx = entries.findIndex(
      (e) => e.userId.toString() === userId.toString()
    );
    if (idx === -1) return null;
    return { rank: idx + 1, ...entries[idx] };
  }
}

module.exports = new LeaderboardService();
