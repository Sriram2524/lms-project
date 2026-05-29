const { DataTypes, Model, Op } = require('sequelize');
const slugify = require('slugify');
const { sequelize } = require('./config/database');

const CATEGORIES = [
  'Programming', 'Design', 'Business', 'Marketing',
  'Data Science', 'DevOps', 'Mobile Development',
  'Cybersecurity', 'AI & Machine Learning', 'Cloud Computing', 'Other',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const STATUSES = ['draft', 'pending_review', 'published', 'archived'];

class Course extends Model {
  // Virtual: effective price after discount
  get effectivePrice() {
    return this.discountPrice != null ? parseFloat(this.discountPrice) : parseFloat(this.price);
  }

  // Compute average rating from the Reviews association
  async refreshRatingStats() {
    const Review = require('./Review');
    const result = await Review.findOne({
      where: { courseId: this.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      raw: true,
    });
    this.averageRating = result?.avg ? parseFloat(parseFloat(result.avg).toFixed(1)) : 0;
    this.totalReviews = parseInt(result?.count) || 0;
    await this.save();
  }
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Course title is required' },
        len: { args: [5, 150], msg: 'Title must be between 5 and 150 characters' },
      },
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: { name: 'courses_slug_unique', msg: 'Slug already exists' },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description is required' },
        len: { args: [20, 5000], msg: 'Description must be between 20 and 5000 characters' },
      },
    },
    shortDescription: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: 'short_description',
      validate: {
        len: { args: [0, 300], msg: 'Short description cannot exceed 300 characters' },
      },
    },
    instructorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'instructor_id',
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
    },
    category: {
      type: DataTypes.ENUM(...CATEGORIES),
      allowNull: false,
      validate: {
        isIn: { args: [CATEGORIES], msg: 'Invalid category' },
      },
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        maxTen(val) {
          if (val && val.length > 10) throw new Error('Cannot have more than 10 tags');
        },
      },
    },
    level: {
      type: DataTypes.ENUM(...LEVELS),
      allowNull: false,
      validate: {
        isIn: { args: [LEVELS], msg: 'Invalid level' },
      },
    },
    language: {
      type: DataTypes.STRING(50),
      defaultValue: 'English',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Price cannot be negative' },
        isDecimal: { msg: 'Price must be a number' },
      },
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'discount_price',
      validate: {
        min: { args: [0], msg: 'Discount price cannot be negative' },
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'thumbnail_url',
    },
    previewVideoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'preview_video_url',
    },
    durationHours: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 0,
      field: 'duration_hours',
    },
    // Stored as JSONB arrays for requirements / outcomes / audience
    requirements: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    learningOutcomes: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      field: 'learning_outcomes',
    },
    targetAudience: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      field: 'target_audience',
    },
    status: {
      type: DataTypes.ENUM(...STATUSES),
      defaultValue: 'draft',
      allowNull: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured',
    },
    hasCertificate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_certificate',
    },
    enrollmentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'enrollment_count',
    },
    maxEnrollments: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'max_enrollments',
      validate: {
        min: { args: [1], msg: 'Max enrollments must be at least 1' },
      },
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 0,
      field: 'average_rating',
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_reviews',
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at',
    },
    contentUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'content_updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Course',
    tableName: 'courses',
    underscored: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['instructor_id'] },
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['level'] },
      { fields: ['price'] },
      { fields: ['average_rating'] },
      { fields: ['enrollment_count'] },
      { fields: ['created_at'] },
      { fields: ['is_featured'] },
    ],
    hooks: {
      beforeValidate: async (course) => {
        // Auto-generate slug from title
        if (course.changed('title') || !course.slug) {
          let slug = slugify(course.title, { lower: true, strict: true });
          // Ensure uniqueness
          const existing = await Course.findOne({
            where: { slug, id: { [Op.ne]: course.id || null } },
          });
          if (existing) slug = `${slug}-${Date.now()}`;
          course.slug = slug;
        }
      },
      beforeSave: (course) => {
        // Set publishedAt on first publish
        if (course.changed('status') && course.status === 'published' && !course.publishedAt) {
          course.publishedAt = new Date();
        }
        // Validate discount < price
        if (
          course.discountPrice != null &&
          parseFloat(course.discountPrice) >= parseFloat(course.price)
        ) {
          throw new Error('Discount price must be less than the original price');
        }
      },
    },
  }
);

module.exports = { Course, CATEGORIES, LEVELS, STATUSES };
