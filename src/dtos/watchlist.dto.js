class WatchlistDTO {
  static toWatchlistResponse(item) {
    return {
      id: item._id,
      stockCode: item.stockCode,
      addedAt: item.addedAt,
      note: item.note,
    };
  }

  static toWatchlistsResponse(items) {
    return items.map(i => WatchlistDTO.toWatchlistResponse(i));
  }
}

module.exports = WatchlistDTO;
