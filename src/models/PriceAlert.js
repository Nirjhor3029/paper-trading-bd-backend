const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    stockCode: { type: String, required: true, uppercase: true },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockMetadata' },
    targetPrice: { type: Number, required: true, min: 0 },
    direction: {
        type: String,
        enum: ['ABOVE', 'BELOW'],
        required: true,
    },
    isActive: { type: Boolean, default: true },
    isTriggered: { type: Boolean, default: false },
    triggeredAt: { type: Date, default: null },
    triggeredPrice: { type: Number, default: null },
    notifyPush: { type: Boolean, default: true },
    notifyEmail: { type: Boolean, default: false },
    message: { type: String, default: '' },
}, {
    timestamps: true,
    collection: 'pricealerts',
});

priceAlertSchema.index({ userId: 1, isActive: 1 });
priceAlertSchema.index({ stockCode: 1, isActive: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
