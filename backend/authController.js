const { body } = require('express-validator');
const { User } = require('./models/index');
const { buildTokenResponse, verifyToken } = require('./jwt');
const { sendSuccess, sendError } = require('./response');
const { handleValidationErrors } = require('./validate');

// ─── Validators ───────────────────────────────────────────────────────────────

const registerValidators = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  body('role').optional()
    .isIn(['student', 'instructor']).withMessage('Role must be student or instructor'),
  handleValidationErrors,
];

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return sendError(res, { message: 'Email already registered', statusCode: 409 });
    }

    const user = await User.create({ name, email, password, role: role || 'student' });
    return sendSuccess(res, {
      data: buildTokenResponse(user),
      message: 'Account created successfully',
      statusCode: 201,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] },
    });

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, { message: 'Invalid email or password', statusCode: 401 });
    }
    if (!user.isActive) {
      return sendError(res, { message: 'Your account has been deactivated', statusCode: 403 });
    }

    return sendSuccess(res, { data: buildTokenResponse(user), message: 'Login successful' });
  } catch (err) {
    next(err);
  }
};

const getMe = (req, res) =>
  sendSuccess(res, { data: { user: req.user }, message: 'Profile fetched' });

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, { message: 'Refresh token required', statusCode: 400 });

    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, { message: 'Invalid refresh token', statusCode: 401 });
    }

    return sendSuccess(res, { data: buildTokenResponse(user), message: 'Token refreshed' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, { message: 'Refresh token expired. Please log in again.', statusCode: 401 });
    }
    next(err);
  }
};

module.exports = { register, login, getMe, refreshToken, registerValidators, loginValidators };
