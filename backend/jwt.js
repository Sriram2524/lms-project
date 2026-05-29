const jwt = require('jsonwebtoken');

const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';

const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, accessSecret, {
    expiresIn: accessExpiresIn,
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

const verifyToken = (token, secret = accessSecret) =>
  jwt.verify(token, secret);

const buildTokenResponse = (user) => ({
  accessToken: generateAccessToken(user.id, user.role),
  refreshToken: generateRefreshToken(user.id),
  expiresIn: accessExpiresIn,
  tokenType: 'Bearer',
  user: { id: user.id, name: user.name, email: user.email, role: user.role },
});

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, buildTokenResponse };
