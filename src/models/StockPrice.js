const mongoose = require('mongoose');

/**
 * StockPrice Schema - Only schema definition here
 * All queries/aggregations moved to Repository layer
 */
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

// Indexes
stockPriceSchema.index({ stockId: 1, date: 1 }, { unique: true });
stockPriceSchema.index({ date: -1 });
stockPriceSchema.index({ stockId: 1, date: -1 });

// Virtuals (note: don't work in aggregations, handled in repo)
stockPriceSchema.virtual('changePercent').get(function () {
  if (this.ycp && this.ycp !== 0) {
    return ((this.change / this.ycp) * 100).toFixed(2);
  }
  return 0;
});

// Simple statics only (complex queries in Repository)
stockPriceSchema.statics.findByStockId = function (stockId, days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    stockId,
    date: { $gte: date },
  }).sort({ date: -1 });
};

module.exports = mongoose.model('StockPrice', stockPriceSchema);
