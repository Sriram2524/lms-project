const { verifyToken } = require('./jwt');
const { sendError } = require('./response');
const { User } = require('./models/index');

/**
 * Protect routes — verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, { message: 'Access denied. No token provided.', statusCode: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return sendError(res, { message: 'User belonging to this token no longer exists.', statusCode: 401 });
    }

    if (!user.isActive) {
      return sendError(res, { message: 'Your account has been deactivated.', statusCode: 403 });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, { message: 'Invalid token.', statusCode: 401 });
    }
    if (err.name === 'TokenExpiredError') {
      return sendError(res, { message: 'Token has expired. Please log in again.', statusCode: 401 });
    }
    next(err);
  }
};

/**
 * Role-based access control
 * Usage: restrictTo('admin', 'instructor')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendError(res, {
      message: `Access denied. Required role(s): ${roles.join(', ')}`,
      statusCode: 403,
    });
  }
  next();
};

/**
 * Optional auth — attaches req.user if token is present, never blocks
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyToken(token);
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    }
  } catch (_) { /* ignore */ }
  next();
};

module.exports = { protect, restrictTo, optionalAuth };
