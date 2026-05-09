class HoldingDTO {
  static toHoldingResponse(holding, latestPrice) {
    return {
      stockCode: holding.stockCode,
      quantity: holding.quantity,
      avgBuyPrice: holding.avgBuyPrice,
      currentPrice: latestPrice ? latestPrice.ltp : null,
      change: latestPrice ? latestPrice.change : null,
      changePercent: latestPrice ? latestPrice.changePercent : null,
      investedValue: holding.totalBuyCost,
      currentValue: latestPrice ? holding.quantity * latestPrice.ltp : null,
      pnl: latestPrice ? (latestPrice.ltp - holding.avgBuyPrice) * holding.quantity : null,
      pnlPercent: latestPrice ? ((latestPrice.ltp - holding.avgBuyPrice) / holding.avgBuyPrice * 100).toFixed(2) : null,
      realizedPnL: holding.realizedPnL,
    };
  }

  static toHoldingsResponse(holdings) {
    return holdings.map(h => HoldingDTO.toHoldingResponse(h));
  }
}

module.exports = HoldingDTO;
