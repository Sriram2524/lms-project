const { body, query, param } = require('express-validator');
const { CATEGORIES, LEVELS, STATUSES } = require('./models/Course');

// ─── Reusable rules ───────────────────────────────────────────────────────────

const titleRule = body('title').trim()
  .isLength({ min: 5, max: 150 }).withMessage('Title must be 5–150 characters');

const descriptionRule = body('description').trim()
  .isLength({ min: 20, max: 5000 }).withMessage('Description must be 20–5000 characters');

const categoryRule = body('category')
  .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`);

const levelRule = body('level')
  .isIn(LEVELS).withMessage(`Level must be one of: ${LEVELS.join(', ')}`);

const priceRule = body('price')
  .isFloat({ min: 0 }).withMessage('Price must be a non-negative number');

// ─── Create ───────────────────────────────────────────────────────────────────

const validateCreateCourse = [
  titleRule,
  descriptionRule,
  categoryRule,
  levelRule,
  priceRule,

  body('shortDescription').optional({ nullable: true }).trim()
    .isLength({ max: 300 }).withMessage('Short description max 300 characters'),

  body('discountPrice').optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Discount price must be non-negative'),

  body('language').optional().trim().notEmpty().withMessage('Language cannot be empty'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),

  body('tags').optional().isArray({ max: 10 }).withMessage('Tags: max 10 items'),
  body('tags.*').optional().isString().trim().notEmpty().withMessage('Each tag must be a non-empty string'),

  body('requirements').optional().isArray({ max: 20 }).withMessage('Requirements: max 20 items'),
  body('learningOutcomes').optional().isArray({ max: 20 }).withMessage('Learning outcomes: max 20 items'),
  body('targetAudience').optional().isArray({ max: 10 }).withMessage('Target audience: max 10 items'),

  body('maxEnrollments').optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Max enrollments must be a positive integer'),

  body('hasCertificate').optional().isBoolean().withMessage('hasCertificate must be boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be boolean'),
];

// ─── Update ───────────────────────────────────────────────────────────────────

const validateUpdateCourse = [
  titleRule.optional(),
  descriptionRule.optional(),
  categoryRule.optional(),
  levelRule.optional(),
  priceRule.optional(),

  body('status').optional().isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(', ')}`),

  body('discountPrice').optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Discount price must be non-negative'),

  body('tags').optional().isArray({ max: 10 }).withMessage('Tags: max 10 items'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be boolean'),
  body('hasCertificate').optional().isBoolean().withMessage('hasCertificate must be boolean'),
  body('maxEnrollments').optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Max enrollments must be a positive integer'),
  body('thumbnailUrl').optional({ nullable: true }).isURL().withMessage('thumbnailUrl must be a valid URL'),
  body('previewVideoUrl').optional({ nullable: true }).isURL().withMessage('previewVideoUrl must be a valid URL'),
];

// ─── Query filters ────────────────────────────────────────────────────────────

const validateCourseQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  query('sort').optional()
    .matches(/^(-?(price|createdAt|enrollmentCount|averageRating|title|durationHours),?)+$/)
    .withMessage('Invalid sort field(s)'),

  query('category').optional().isIn(CATEGORIES).withMessage('Invalid category filter'),
  query('level').optional().isIn(LEVELS).withMessage('Invalid level filter'),
  query('status').optional().isIn(STATUSES).withMessage('Invalid status filter'),

  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be non-negative'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('minRating must be 0–5'),

  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search query max 100 characters'),
  query('isFeatured').optional().isBoolean().withMessage('isFeatured must be boolean'),
  query('hasCertificate').optional().isBoolean().withMessage('hasCertificate must be boolean'),
  query('language').optional().isString().trim(),
];

// ─── Param ────────────────────────────────────────────────────────────────────

const validateUUIDParam = (name = 'id') => [
  param(name).isUUID().withMessage(`Invalid ${name} — must be a UUID`),
];

// ─── Review ───────────────────────────────────────────────────────────────────

const validateAddReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment max 1000 characters'),
];

module.exports = {
  validateCreateCourse,
  validateUpdateCourse,
  validateCourseQuery,
  validateUUIDParam,
  validateAddReview,
};
