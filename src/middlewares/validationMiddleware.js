const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
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

const validateStockUpdate = validate(Joi.object({
  name: Joi.string().trim().max(200),
  sector: Joi.string().trim().max(100),
  isActive: Joi.boolean(),
}).min(1));

const validateRegister = validate(Joi.object({
  name: Joi.string().trim().max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
}));

const validateLogin = validate(Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}));

const validateForgotPassword = validate(Joi.object({
  email: Joi.string().email().required(),
}));

const validateResetPassword = validate(Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(128).required(),
}));

const validateChangePassword = validate(Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
}));

module.exports = {
  validate,
  validateStockUpdate,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
};
