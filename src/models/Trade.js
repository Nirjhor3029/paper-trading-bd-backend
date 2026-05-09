const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
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
        index: true,
    },
    side: {
        type: String,
        enum: ['BUY', 'SELL'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    price: {
        type: Number,
        required: true,
        min: [0.01, 'Price must be positive'],
    },
    grossAmount: {
        type: Number,
        required: true,
    },
    fee: {
        type: Number,
        default: 0,
    },
    netAmount: {
        type: Number,
        required: true,
    },
    avgBuyPrice: {
        type: Number,
        default: null,
    },
    realizedPnL: {
        type: Number,
        default: null,
    },
    realizedPnLPercent: {
        type: Number,
        default: null,
    },
    status: {
        type: String,
        enum: ['EXECUTED', 'CANCELLED', 'FAILED'],
        default: 'EXECUTED',
    },
    failReason: { type: String, default: null },
    marketSnapshot: {
        ltp: { type: Number },
        high: { type: Number },
        low: { type: Number },
        changePercent: { type: Number },
        volume: { type: Number },
    },
    executedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    collection: 'trades',
});

tradeSchema.index({ userId: 1, executedAt: -1 });
tradeSchema.index({ userId: 1, stockCode: 1 });
tradeSchema.index({ userId: 1, side: 1 });
tradeSchema.index({ stockCode: 1, executedAt: -1 });

module.exports = mongoose.model('Trade', tradeSchema);
