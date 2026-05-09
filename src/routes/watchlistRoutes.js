const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { protect } = require('../middlewares/authMiddleware');
const Joi = require('joi');
const { validate } = require('../middlewares/validationMiddleware');

const validateAddWatchlist = validate(Joi.object({
  stockCode: Joi.string().trim().uppercase().required(),
}));

router.post('/watchlist', protect, validateAddWatchlist, watchlistController.add);
router.get('/watchlist', protect, watchlistController.getAll);
router.delete('/watchlist/:stockCode', protect, watchlistController.remove);

module.exports = router;
