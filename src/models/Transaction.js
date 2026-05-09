const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            'SIGNUP_BONUS',
            'BUY',
            'SELL',
            'FEE',
            'REFUND',
            'RESET',
        ],
    },
    direction: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be positive'],
    },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    tradeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trade',
        default: null,
        index: true,
    },
    stockCode: { type: String, default: null },
    description: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
    timestamps: true,
    collection: 'transactions',
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
