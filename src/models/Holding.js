const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockMetadata',
        required: true,
    },
    stockCode: {
        type: String,
        required: true,
        uppercase: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative'],
    },
    avgBuyPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    totalBuyQty: { type: Number, default: 0 },
    totalBuyCost: { type: Number, default: 0 },
    realizedPnL: { type: Number, default: 0 },
    firstBoughtAt: { type: Date, default: Date.now },
    lastTradeAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    collection: 'holdings',
});

holdingSchema.index({ userId: 1, stockCode: 1 }, { unique: true });
holdingSchema.index({ userId: 1, quantity: -1 });

holdingSchema.methods.applyBuy = function (qty, price) {
    this.totalBuyCost += qty * price;
    this.totalBuyQty += qty;
    this.quantity += qty;
    this.avgBuyPrice = this.totalBuyCost / this.totalBuyQty;
    this.lastTradeAt = new Date();
};

holdingSchema.methods.applySell = function (qty, sellPrice) {
    const pnl = (sellPrice - this.avgBuyPrice) * qty;
    this.realizedPnL += pnl;
    this.quantity -= qty;
    this.lastTradeAt = new Date();
    return pnl;
};

module.exports = mongoose.model('Holding', holdingSchema);
