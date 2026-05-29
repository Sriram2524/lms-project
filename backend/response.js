/**
 * Standard success response
 */
const sendSuccess = (res, { data = null, message = 'Success', statusCode = 200, meta = null } = {}) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Standard error response
 */
const sendError = (res, { message = 'Something went wrong', statusCode = 500, errors = null } = {}) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

/**
 * Build pagination meta object
 */
const buildPaginationMeta = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit);
  return {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Parse page/limit/offset from request query
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Parse sort string into Sequelize order array
 * e.g. "-price,createdAt"  →  [['price','DESC'],['createdAt','ASC']]
 */
const ALLOWED_SORT_FIELDS = {
  price: 'price',
  createdAt: 'created_at',
  enrollmentCount: 'enrollment_count',
  averageRating: 'average_rating',
  title: 'title',
  durationHours: 'duration_hours',
};

const parseSort = (sortQuery) => {
  if (!sortQuery) return [['created_at', 'DESC']];

  const order = [];
  for (const part of sortQuery.split(',')) {
    const isDesc = part.startsWith('-');
    const key = isDesc ? part.slice(1) : part;
    const col = ALLOWED_SORT_FIELDS[key];
    if (col) order.push([col, isDesc ? 'DESC' : 'ASC']);
  }
  return order.length ? order : [['created_at', 'DESC']];
};

module.exports = { sendSuccess, sendError, buildPaginationMeta, parsePagination, parseSort };