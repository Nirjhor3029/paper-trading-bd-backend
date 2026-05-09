const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false,
    },
    googleId: { type: String, sparse: true },

    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 60,
    },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },

    tier: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
    },
    premiumExpiresAt: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    stats: {
        totalTrades: { type: Number, default: 0 },
        totalBuys: { type: Number, default: 0 },
        totalSells: { type: Number, default: 0 },
        totalProfit: { type: Number, default: 0 },
        totalLoss: { type: Number, default: 0 },
        netPnL: { type: Number, default: 0 },
        bestTrade: { type: Number, default: 0 },
        winRate: { type: Number, default: 0 },
    },

    lastLoginAt: { type: Date, default: null },
    lastActiveAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    collection: 'users',
});

userSchema.index({ 'stats.netPnL': -1 });
userSchema.index({ tier: 1, isActive: 1 });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublic = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        avatar: this.avatar,
        tier: this.tier,
        stats: this.stats,
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.model('User', userSchema);
