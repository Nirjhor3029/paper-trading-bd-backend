const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    stockCode: {
        type: String,
        required: true,
        uppercase: true,
    },
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockMetadata',
    },
    addedAt: { type: Date, default: Date.now },
    note: { type: String, default: '', maxlength: 200 },
}, {
    timestamps: true,
    collection: 'watchlists',
});

watchlistSchema.index({ userId: 1, stockCode: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
