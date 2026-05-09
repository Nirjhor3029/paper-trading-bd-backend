class TradeDTO {
  static toTradeResponse(trade) {
    return {
      id: trade._id,
      stockCode: trade.stockCode,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      grossAmount: trade.grossAmount,
      fee: trade.fee,
      netAmount: trade.netAmount,
      avgBuyPrice: trade.avgBuyPrice,
      realizedPnL: trade.realizedPnL,
      realizedPnLPercent: trade.realizedPnLPercent,
      status: trade.status,
      executedAt: trade.executedAt,
    };
  }

  static toTradesResponse(trades) {
    return trades.map(t => TradeDTO.toTradeResponse(t));
  }
}

module.exports = TradeDTO;
