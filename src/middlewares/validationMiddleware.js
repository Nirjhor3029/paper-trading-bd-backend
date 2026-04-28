const Joi = require('joi');

const validateStockUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().max(200),
    sector: Joi.string().trim().max(100),
    isActive: Joi.boolean(),
  }).min(1);

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(d => d.message),
    });
  }
  
  req.body = value;
  next();
};

module.exports = { validateStockUpdate };
