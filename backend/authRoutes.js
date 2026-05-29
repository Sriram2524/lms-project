const router = require('express').Router();
const {
  register, login, getMe, refreshToken,
  registerValidators, loginValidators,
} = require('./authController');
const { protect } = require('./auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('./validate');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidators, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login and get JWT tokens
 * @access  Public
 */
router.post('/login', loginValidators, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required'), handleValidationErrors],
  refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, getMe);

module.exports = router;
