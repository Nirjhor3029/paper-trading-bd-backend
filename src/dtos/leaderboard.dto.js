class LeaderboardDTO {
  static toEntryResponse(entry) {
    return {
      rank: entry.rank,
      userId: entry.userId,
      name: entry.name,
      avatar: entry.avatar,
      tier: entry.tier,
      totalValue: Math.round(entry.totalValue * 100) / 100,
      walletBalance: Math.round(entry.walletBalance * 100) / 100,
      holdingsValue: Math.round(entry.holdingsValue * 100) / 100,
      netPnL: Math.round(entry.netPnL * 100) / 100,
      pnlPercent: Math.round(entry.pnlPercent * 100) / 100,
      totalTrades: entry.totalTrades,
      winRate: Math.round(entry.winRate * 100) / 100,
      holdings: entry.holdingDetails,
    };
  }
}

module.exports = LeaderboardDTO;
