import rateLimit from 'express-rate-limit';

// The default in-memory store is process-local and is not a coordinated rate
// limit for multi-instance production deployments; no distributed store is
// introduced in this sprint.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

export default authRateLimiter;
