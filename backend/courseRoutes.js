const router = require('express').Router();
const {
  getAllCourses, getCourseById, getCourseBySlug,
  createCourse, updateCourse, deleteCourse,
  publishCourse, addReview, getMyCourses,
  updateSections, getCourseStats,
} = require('./courseController');
const { protect, restrictTo, optionalAuth } = require('./auth');
const { handleValidationErrors } = require('./validate');
const {
  validateCreateCourse, validateUpdateCourse,
  validateCourseQuery, validateUUIDParam, validateAddReview,
} = require('./courseValidators');

// ─── Admin stats ──────────────────────────────────────────────────────────────
/**
 * @route   GET /api/courses/stats
 * @access  Admin
 */
router.get('/stats', protect, restrictTo('admin'), getCourseStats);

// ─── Instructor: own courses ──────────────────────────────────────────────────
/**
 * @route   GET /api/courses/my-courses
 * @access  Instructor, Admin
 */
router.get(
  '/my-courses',
  protect,
  restrictTo('instructor', 'admin'),
  validateCourseQuery,
  handleValidationErrors,
  getMyCourses
);

// ─── Slug lookup (public) ─────────────────────────────────────────────────────
/**
 * @route   GET /api/courses/slug/:slug
 * @access  Public (published only), Admin/Instructor see own drafts
 */
router.get('/slug/:slug', optionalAuth, getCourseBySlug);

// ─── List & Create ────────────────────────────────────────────────────────────
router
  .route('/')
  /**
   * @route   GET /api/courses
   * @desc    Fetch all courses with pagination, filtering, sorting
   * @access  Public (published); Instructor/Admin see more
   * @query   page, limit, sort, category, level, status, minPrice, maxPrice,
   *          minRating, search, isFeatured, hasCertificate, language, instructorId
   */
  .get(optionalAuth, validateCourseQuery, handleValidationErrors, getAllCourses)

  /**
   * @route   POST /api/courses
   * @desc    Create a new course
   * @access  Instructor, Admin
   */
  .post(
    protect,
    restrictTo('instructor', 'admin'),
    validateCreateCourse,
    handleValidationErrors,
    createCourse
  );

// ─── Single course ────────────────────────────────────────────────────────────
router
  .route('/:id')
  /**
   * @route   GET /api/courses/:id
   * @desc    Fetch single course by UUID
   * @access  Public (published); owner & admin see all statuses
   */
  .get(optionalAuth, validateUUIDParam(), handleValidationErrors, getCourseById)

  /**
   * @route   PATCH /api/courses/:id
   * @desc    Update a course (partial update)
   * @access  Instructor (own), Admin
   */
  .patch(
    protect,
    restrictTo('instructor', 'admin'),
    validateUUIDParam(),
    validateUpdateCourse,
    handleValidationErrors,
    updateCourse
  )

  /**
   * @route   DELETE /api/courses/:id
   * @desc    Delete course (archives if has students; hard-delete if admin)
   * @access  Instructor (own), Admin
   */
  .delete(
    protect,
    restrictTo('instructor', 'admin'),
    validateUUIDParam(),
    handleValidationErrors,
    deleteCourse
  );

// ─── Publish ──────────────────────────────────────────────────────────────────
/**
 * @route   PATCH /api/courses/:id/publish
 * @desc    Submit for review (instructor) or publish directly (admin)
 * @access  Instructor (own), Admin
 */
router.patch(
  '/:id/publish',
  protect,
  restrictTo('instructor', 'admin'),
  validateUUIDParam(),
  handleValidationErrors,
  publishCourse
);

// ─── Sections ─────────────────────────────────────────────────────────────────
/**
 * @route   PUT /api/courses/:id/sections
 * @desc    Replace all sections/lessons for a course
 * @access  Instructor (own), Admin
 */
router.put(
  '/:id/sections',
  protect,
  restrictTo('instructor', 'admin'),
  validateUUIDParam(),
  handleValidationErrors,
  updateSections
);

// ─── Reviews ──────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/courses/:id/reviews
 * @desc    Add a review to a published course
 * @access  Student only
 */
router.post(
  '/:id/reviews',
  protect,
  restrictTo('student'),
  validateUUIDParam(),
  validateAddReview,
  handleValidationErrors,
  addReview
);

module.exports = router;
