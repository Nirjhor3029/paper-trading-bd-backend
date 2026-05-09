const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/leaderboard', leaderboardController.getLeaderboard);
router.get('/leaderboard/me', protect, leaderboardController.getUserRank);

module.exports = router;
