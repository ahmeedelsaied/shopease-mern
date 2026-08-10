import asyncHandler from '../utils/asyncHandler.js';

const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    const error = new Error('Not authorized');
    error.authCode = 'AUTH_TOKEN_MISSING';
    throw error;
  }

  if (req.user.role !== 'admin') {
    res.status(403);
    const error = new Error('Admin access required');
    error.authCode = 'ADMIN_ACCESS_REQUIRED';
    throw error;
  }

  next();
});

export { admin };
