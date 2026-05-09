const authService = require('../services/authService');
const AuthDTO = require('../dtos/auth.dto');
const ResponseFormatter = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const { user, token } = await authService.register({ name, email, password });
      const data = AuthDTO.toRegisterResponse(user, token);
      ResponseFormatter.created(res, data, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login({ email, password });
      const data = AuthDTO.toLoginResponse(user, token);
      ResponseFormatter.success(res, data, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { user, wallet } = await authService.getProfile(req.user._id);
      const data = AuthDTO.toProfileResponse(user, wallet);
      ResponseFormatter.success(res, data, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword({ email });
      ResponseFormatter.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const { user, token: jwtToken } = await authService.resetPassword({ token, password });
      const data = AuthDTO.toLoginResponse(user, jwtToken);
      ResponseFormatter.success(res, data, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const { user, token } = await authService.changePassword(req.user._id, { currentPassword, newPassword });
      const data = AuthDTO.toLoginResponse(user, token);
      ResponseFormatter.success(res, data, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
