import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const authenticate = asyncHandler(async (request, _response, next) => {
  const authorization = request.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  let claims;
  try {
    claims = verifyAccessToken(authorization.slice(7));
  } catch {
    throw new AppError('Invalid or expired access token', 401);
  }

  const user = await User.findById(claims.sub).select('+tokenVersion');
  // The version check revokes already-issued access tokens after password changes.
  if (!user || claims.ver !== user.tokenVersion) {
    throw new AppError('Invalid or expired access token', 401);
  }

  request.user = user;
  return next();
});