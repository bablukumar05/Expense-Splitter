import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordRequest,
  loginRequest,
  refreshTokenRequest,
  registerRequest,
  resetPasswordRequest
} from '../validators/authValidators.js';
import { emptyRequest } from '../validators/common.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerRequest), authController.register);
router.post('/login', authRateLimiter, validate(loginRequest), authController.login);
router.post('/refresh-token', authRateLimiter, validate(refreshTokenRequest), authController.refreshToken);
router.post('/logout', authRateLimiter, validate(refreshTokenRequest), authController.logout);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordRequest), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordRequest), authController.resetPassword);
router.get('/me', validate(emptyRequest), authenticate, authController.me);

export default router;