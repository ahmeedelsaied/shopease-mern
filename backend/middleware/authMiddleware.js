import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    const error = new Error('Not authorized, token missing');
    error.authCode = 'AUTH_TOKEN_MISSING';
    throw error;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    const error = new Error('User not found');
    error.authCode = 'AUTH_USER_NOT_FOUND';
    throw error;
  }

  req.user = user;
  next();
});

export { protect };
