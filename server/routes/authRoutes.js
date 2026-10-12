import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, loginLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordRequest,
  loginRequest,
  refreshTokenRequest,
  registerRequest,
  resetPasswordParamRequest,
  resetPasswordRequest
} from '../validators/authValidators.js';
import { emptyRequest } from '../validators/common.js';

const router = Router();

router.post('/register', authLimiter, validate(registerRequest), authController.register);
router.post('/login', loginLimiter, validate(loginRequest), authController.login);
router.post('/refresh-token', validate(refreshTokenRequest), authController.refreshToken);
router.post('/logout', validate(refreshTokenRequest), authController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordRequest), authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordParamRequest), authController.resetPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordRequest), authController.resetPassword);
router.get('/me', validate(emptyRequest), authenticate, authController.me);

export default router;