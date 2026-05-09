const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },

    balance: {
        type: Number,
        default: 100000,
        min: [0, 'Balance cannot be negative'],
    },
    lockedBalance: {
        type: Number,
        default: 0,
        min: 0,
    },

    totalDeposited: { type: Number, default: 100000 },
    totalWithdrawn: { type: Number, default: 0 },
    totalBought: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    totalFeesPaid: { type: Number, default: 0 },

    currency: { type: String, default: 'BDT' },
}, {
    timestamps: true,
    collection: 'wallets',
});

walletSchema.virtual('available').get(function () {
    return this.balance - this.lockedBalance;
});

walletSchema.methods.credit = async function (amount, session) {
    if (amount <= 0) throw new Error('Credit amount must be positive');
    this.balance += amount;
    return this.save({ session });
};

walletSchema.methods.debit = async function (amount, session) {
    if (amount <= 0) throw new Error('Debit amount must be positive');
    if (this.balance < amount) throw new Error('Insufficient balance');
    this.balance -= amount;
    return this.save({ session });
};

module.exports = mongoose.model('Wallet', walletSchema);
