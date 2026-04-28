const mongoose = require('mongoose');

const stockPriceSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockMetadata',
    required: [true, 'Stock ID is required'],
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
  },
  open: { type: Number, default: 0 },
  ltp: { type: Number, default: 0 },
  high: { type: Number, default: 0 },
  low: { type: Number, default: 0 },
  close: { type: Number, default: 0 },
  ycp: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  trade: { type: Number, default: 0 },
  value: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  dseIndex: { type: Number, default: 0 },
  scrapedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  collection: 'stockprices',
});

stockPriceSchema.index({ stockId: 1, date: 1 }, { unique: true });
stockPriceSchema.index({ date: -1 });
stockPriceSchema.index({ stockId: 1, date: -1 });

stockPriceSchema.virtual('changePercent').get(function () {
  if (this.ycp && this.ycp !== 0) {
    return ((this.change / this.ycp) * 100).toFixed(2);
  }
  return 0;
});

stockPriceSchema.statics.findByStockId = function (stockId, days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    stockId,
    date: { $gte: date },
  }).sort({ date: -1 });
};

stockPriceSchema.statics.findLatestPrices = function () {
  return this.aggregate([
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
  ]);
};

module.exports = mongoose.model('StockPrice', stockPriceSchema);
