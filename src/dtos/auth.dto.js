class AuthDTO {
  static toRegisterResponse(user, token) {
    return {
      token,
      user: user.toPublic(),
    };
  }

  static toLoginResponse(user, token) {
    return {
      token,
      user: user.toPublic(),
    };
  }

  static toProfileResponse(user, wallet) {
    return {
      user: user.toPublic(),
      wallet: wallet
        ? {
            balance: wallet.balance,
            lockedBalance: wallet.lockedBalance,
            available: wallet.available,
            totalDeposited: wallet.totalDeposited,
            totalWithdrawn: wallet.totalWithdrawn,
            totalBought: wallet.totalBought,
            totalSold: wallet.totalSold,
            totalFeesPaid: wallet.totalFeesPaid,
            currency: wallet.currency,
          }
        : null,
    };
  }
}

module.exports = AuthDTO;
