const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { generateToken } = require('../middlewares/authMiddleware');
const { BadRequestError, UnauthorizedError, ConflictError } = require('../utils/errors');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dse-trading-jwt-secret-dev';
const jwt = require('jsonwebtoken');

class AuthService {
  async register({ name, email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await User.create({ name, email, password });

    await Wallet.create({ userId: user._id });

    const token = generateToken(user._id);

    return { user, token };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return { user, token };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const wallet = await Wallet.findOne({ userId });

    return { user, wallet };
  }

  async forgotPassword({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      return { message: 'If that email is registered, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    return { resetToken, message: 'Password reset token generated' };
  }

  async resetPassword({ token, password }) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Token is invalid or has expired');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);

    return { user, token: jwtToken };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    return { user, token };
  }
}

module.exports = new AuthService();
