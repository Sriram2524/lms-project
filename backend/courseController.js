const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('./config/database');
const { Course, CATEGORIES } = require('./models/Course');
const { User, Section, Lesson, Review, Enrollment } = require('./models/index');
const { sendSuccess, sendError, buildPaginationMeta, parsePagination, parseSort } = require('./response');

// ─── Build WHERE clause from query filters ────────────────────────────────────

const buildWhere = (query, userRole, userId) => {
  const where = {};

  // Status visibility rules
  if (userRole === 'admin') {
    if (query.status) where.status = query.status;
    // no restriction — sees all
  } else if (userRole === 'instructor') {
    // Instructor sees: published OR their own (any status)
    if (query.status) {
      where[Op.or] = [{ status: query.status, instructorId: userId }, { status: 'published' }];
    } else {
      where[Op.or] = [{ instructorId: userId }, { status: 'published' }];
    }
  } else {
    // Students / public only see published
    where.status = 'published';
  }

  if (query.category) where.category = query.category;
  if (query.level) where.level = query.level;
  if (query.language) where.language = { [Op.iLike]: `%${query.language}%` };
  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured === 'true';
  if (query.hasCertificate !== undefined) where.hasCertificate = query.hasCertificate === 'true';
  if (query.instructorId) where.instructorId = query.instructorId;

  // Price range
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) where.price[Op.gte] = parseFloat(query.minPrice);
    if (query.maxPrice !== undefined) where.price[Op.lte] = parseFloat(query.maxPrice);
  }

  // Rating filter
  if (query.minRating !== undefined) {
    where.averageRating = { [Op.gte]: parseFloat(query.minRating) };
  }

  // Full-text search (PostgreSQL ILIKE for title/description)
  if (query.search) {
    const term = `%${query.search}%`;
    where[Op.or] = [
      ...(where[Op.or] || []),
      { title: { [Op.iLike]: term } },
      { description: { [Op.iLike]: term } },
    ];
  }

  return where;
};

// ─── GET /courses ─────────────────────────────────────────────────────────────

const getAllCourses = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const order = parseSort(req.query.sort);
    const where = buildWhere(req.query, req.user?.role, req.user?.id);

    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'email', 'avatarUrl'] },
      ],
      attributes: {
        exclude: ['requirements', 'learningOutcomes', 'targetAudience'],
      },
      order,
      limit,
      offset,
      distinct: true,
    });

    return sendSuccess(res, {
      data: { courses },
      message: 'Courses fetched successfully',
      meta: buildPaginationMeta({ page, limit, total: count }),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /courses/:id ─────────────────────────────────────────────────────────

const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'email', 'avatarUrl', 'bio'] },
        {
          model: Section,
          as: 'sections',
          include: [{ model: Lesson, as: 'lessons', order: [['order', 'ASC']] }],
          order: [['order', 'ASC']],
        },
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
          order: [['created_at', 'DESC']],
          limit: 20,
        },
      ],
    });

    if (!course) return sendError(res, { message: 'Course not found', statusCode: 404 });

    const isOwner = req.user && course.instructorId === req.user.id;
    const isAdmin = req.user?.role === 'admin';
    if (course.status !== 'published' && !isOwner && !isAdmin) {
      return sendError(res, { message: 'Course not found', statusCode: 404 });
    }

    return sendSuccess(res, { data: { course }, message: 'Course fetched successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /courses/slug/:slug ──────────────────────────────────────────────────

const getCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'email', 'avatarUrl', 'bio'] },
        {
          model: Section,
          as: 'sections',
          include: [{ model: Lesson, as: 'lessons' }],
          order: [['order', 'ASC']],
        },
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
          limit: 20,
        },
      ],
    });

    if (!course) return sendError(res, { message: 'Course not found', statusCode: 404 });

    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user?.id === course.instructorId;
    if (course.status !== 'published' && !isAdmin && !isOwner) {
      return sendError(res, { message: 'Course not found', statusCode: 404 });
    }

    return sendSuccess(res, { data: { course }, message: 'Course fetched successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /courses ────────────────────────────────────────────────────────────

const createCourse = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Instructors can only create courses for themselves
    if (req.user.role === 'instructor') {
      data.instructorId = req.user.id;
    } else if (!data.instructorId) {
      data.instructorId = req.user.id;
    }

    // Validate instructor exists and has instructor/admin role
    if (data.instructorId !== req.user.id) {
      const instructor = await User.findByPk(data.instructorId);
      if (!instructor || !['instructor', 'admin'].includes(instructor.role)) {
        return sendError(res, { message: 'Specified instructor not found or invalid role', statusCode: 400 });
      }
    }

    const course = await Course.create(data);
    await course.reload({ include: [{ model: User, as: 'instructor', attributes: ['id', 'name', 'email'] }] });

    return sendSuccess(res, { data: { course }, message: 'Course created successfully', statusCode: 201 });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /courses/:id ───────────────────────────────────────────────────────

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return sendError(res, { message: 'Course not found', statusCode: 404 });

    const isOwner = course.instructorId === req.user.id;
    if (req.user.role === 'instructor' && !isOwner) {
      return sendError(res, { message: 'You are not authorized to update this course', statusCode: 403 });
    }

    // Instructors cannot change instructor, enrollmentCount
    if (req.user.role === 'instructor') {
      delete req.body.instructorId;
      delete req.body.enrollmentCount;
    }

    // Validate discount < price
    const newPrice = req.body.price ?? parseFloat(course.price);
    const newDiscount = req.body.discountPrice ?? course.discountPrice;
    if (newDiscount != null && parseFloat(newDiscount) >= newPrice) {
      return sendError(res, {
        message: 'Discount price must be less than the original price',
        statusCode: 422,
      });
    }

    // Prevent re-publishing archived without admin
    if (req.body.status === 'published' && course.status === 'archived' && req.user.role !== 'admin') {
      return sendError(res, {
        message: 'Archived courses must be reviewed by an admin before re-publishing',
        statusCode: 403,
      });
    }

    await course.update(req.body);
    await course.reload({ include: [{ model: User, as: 'instructor', attributes: ['id', 'name', 'email'] }] });

    return sendSuccess(res, { data: { course }, message: 'Course updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /courses/:id ──────────────────────────────────────────────────────

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return sendError(res, { message: 'Course not found', statusCode: 404 });

    const isOwner = course.instructorId === req.user.id;
    if (req.user.role === 'instructor' && !isOwner) {
      return sendError(res, { message: 'You are not authorized to delete this course', statusCode: 403 });
    }

    // Soft-archive if students enrolled (non-admins)
    if (course.enrollmentCount > 0 && req.user.role !== 'admin') {
      await course.update({ status: 'archived' });
      return sendSuccess(res, {
        data: { course },
        message: 'Course archived (has enrolled students). Admins can hard-delete.',
      });
    }

    await course.destroy();
    return sendSuccess(res, { data: null, message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /courses/:id/publish ───────────────────────────────────────────────

const publishCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Section, as: 'sections', include: [{ model: Lesson, as: 'lessons' }] }],
    });
    if (!course) return sendError(res, { message: 'Course not found', statusCode: 404 });

    const isOwner = course.instructorId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return sendError(res, { message: 'Not authorized', statusCode: 403 });
    }

    // Pre-publish validations
    const hasLessons = course.sections?.some((s) => s.lessons?.length > 0);
    if (!hasLessons) {
      return sendError(res, {
        message: 'Course must have at least one section with one lesson before publishing',
        statusCode: 422,
      });
    }
    if (!course.thumbnailUrl) {
      return sendError(res, { message: 'Course must have a thumbnail before publishing', statusCode: 422 });
    }
    if (!course.learningOutcomes?.length) {
      return sendError(res, { message: 'Course must have at least one learning outcome', statusCode: 422 });
    }

    const newStatus = req.user.role === 'admin' ? 'published' : 'pending_review';
    await course.update({ status: newStatus });

    return sendSuccess(res, {
      data: { course },
      message: req.user.role === 'admin' ? 'Course published successfully' : 'Course submitted for admin review',
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /courses/:id/reviews ────────────────────────────────────────────────

const addReview = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return sendError(res, { message: 'Course not found', statusCode: 404 });
    if (course.status !== 'published') {
      return sendError(res, { message: 'Cannot review an unpublished course', statusCode: 400 });
    }
    if (['instructor', 'admin'].includes(req.user.role)) {
      return sendError(res, { message: 'Only students can leave reviews', statusCode: 403 });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ where: { courseId: course.id, userId: req.user.id } });
    if (existing) {
      return sendError(res, { message: 'You have already reviewed this course', statusCode: 409 });
    }

    await Review.create({ courseId: course.id, userId: req.user.id, rating: req.body.rating, comment: req.body.comment });
    await course.refreshRatingStats();

    return sendSuccess(res, {
      data: { averageRating: course.averageRating, totalReviews: course.totalReviews },
      message: 'Review submitted successfully',
      statusCode: 201,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /courses/my-courses (instructor) ─────────────────────────────────────

const getMyCourses = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const order = parseSort(req.query.sort);
    const where = { instructorId: req.user.id };
    if (req.query.status) where.status = req.query.status;

    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      attributes: { exclude: ['requirements', 'learningOutcomes', 'targetAudience'] },
      order,
      limit,
      offset,
    });

    return sendSuccess(res, {
      data: { courses },
      message: 'Your courses fetched successfully',
      meta: buildPaginationMeta({ page, limit, total: count }),
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /courses/:id/sections (replace all sections) ──────────────────────

const updateSections = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const course = await Course.findByPk(req.params.id, { transaction: t });
    if (!course) { await t.rollback(); return sendError(res, { message: 'Course not found', statusCode: 404 }); }

    const isOwner = course.instructorId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') { await t.rollback(); return sendError(res, { message: 'Not authorized', statusCode: 403 }); }

    if (!Array.isArray(req.body.sections)) {
      await t.rollback();
      return sendError(res, { message: 'sections must be an array', statusCode: 422 });
    }

    // Delete old sections (cascade deletes lessons)
    await Section.destroy({ where: { courseId: course.id }, transaction: t });

    // Re-create sections + lessons in order
    let totalMinutes = 0;
    for (let i = 0; i < req.body.sections.length; i++) {
      const secData = req.body.sections[i];
      const section = await Section.create(
        { courseId: course.id, title: secData.title, order: i },
        { transaction: t }
      );
      if (Array.isArray(secData.lessons)) {
        for (let j = 0; j < secData.lessons.length; j++) {
          const l = secData.lessons[j];
          await Lesson.create(
            { sectionId: section.id, title: l.title, description: l.description,
              videoUrl: l.videoUrl, durationMinutes: l.durationMinutes || 0,
              order: j, isFree: l.isFree || false, contentType: l.contentType || 'video' },
            { transaction: t }
          );
          totalMinutes += l.durationMinutes || 0;
        }
      }
    }

    await course.update(
      { durationHours: parseFloat((totalMinutes / 60).toFixed(2)), contentUpdatedAt: new Date() },
      { transaction: t }
    );

    await t.commit();

    const updated = await Section.findAll({
      where: { courseId: course.id },
      include: [{ model: Lesson, as: 'lessons' }],
      order: [['order', 'ASC']],
    });

    return sendSuccess(res, {
      data: { sections: updated, durationHours: course.durationHours },
      message: 'Sections updated successfully',
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// ─── GET /courses/stats (admin only) ─────────────────────────────────────────

const getCourseStats = async (req, res, next) => {
  try {
    const [byStatus, byCategory, totals] = await Promise.all([
      Course.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('enrollment_count')), 'totalEnrollments'],
          [fn('AVG', col('price')), 'avgPrice'],
          [fn('AVG', col('average_rating')), 'avgRating'],
        ],
        group: ['status'],
        raw: true,
      }),
      Course.findAll({
        where: { status: 'published' },
        attributes: [
          'category',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('enrollment_count')), 'totalEnrollments'],
        ],
        group: ['category'],
        order: [[literal('"count"'), 'DESC']],
        raw: true,
      }),
      Course.findAll({
        attributes: [
          [fn('COUNT', col('id')), 'totalCourses'],
          [fn('SUM', col('enrollment_count')), 'totalEnrollments'],
          [fn('SUM', literal('enrollment_count * COALESCE(discount_price, price)')), 'estimatedRevenue'],
        ],
        raw: true,
      }),
    ]);

    return sendSuccess(res, {
      data: { byStatus, byCategory, totals: totals[0] },
      message: 'Course statistics fetched',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCourses, getCourseById, getCourseBySlug,
  createCourse, updateCourse, deleteCourse,
  publishCourse, addReview, getMyCourses,
  updateSections, getCourseStats,
};
