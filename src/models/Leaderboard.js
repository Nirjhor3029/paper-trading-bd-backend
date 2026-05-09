const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true,
    },
    period: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'],
        default: 'ALL_TIME',
        index: true,
    },
    entries: [{
        rank: { type: Number },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        avatar: { type: String, default: null },
        netPnL: { type: Number },
        pnLPercent: { type: Number },
        totalTrades: { type: Number },
        walletValue: { type: Number },
        tier: { type: String },
    }],
}, {
    timestamps: true,
    collection: 'leaderboards',
});

leaderboardSchema.index({ date: -1, period: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
