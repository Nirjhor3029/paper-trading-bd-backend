const leaderboardService = require('../services/leaderboardService');
const LeaderboardDTO = require('../dtos/leaderboard.dto');
const ResponseFormatter = require('../utils/response');

class LeaderboardController {
  async getLeaderboard(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const skip = parseInt(req.query.skip) || 0;
      const { entries, total } = await leaderboardService.getLeaderboard(limit, skip);
      const data = entries.map(LeaderboardDTO.toEntryResponse);
      ResponseFormatter.paginated(res, data, skip / limit + 1, limit, total, 'Leaderboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserRank(req, res, next) {
    try {
      const rank = await leaderboardService.getUserRank(req.user._id);
      if (!rank) {
        return ResponseFormatter.success(res, { rank: null, totalValue: 0 }, 'No rank data yet');
      }
      const data = LeaderboardDTO.toEntryResponse(rank);
      ResponseFormatter.success(res, data, 'User rank retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeaderboardController();
