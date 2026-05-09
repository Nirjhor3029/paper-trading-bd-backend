const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');
const { protect } = require('../middlewares/authMiddleware');
const Joi = require('joi');
const { validate } = require('../middlewares/validationMiddleware');

const validateTrade = validate(Joi.object({
  stockCode: Joi.string().trim().uppercase().required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().positive().required(),
}));

router.post('/trades/buy', protect, validateTrade, tradeController.buy);
router.post('/trades/sell', protect, validateTrade, tradeController.sell);
router.get('/trades', protect, tradeController.getTrades);
router.get('/trades/holdings', protect, tradeController.getHoldings);

module.exports = router;
