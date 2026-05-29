const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./config/database');

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'course_id',
      references: { model: 'courses', key: 'id' },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Rating must be at least 1' },
        max: { args: [5], msg: 'Rating cannot exceed 5' },
        isInt: { msg: 'Rating must be an integer' },
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: { args: [0, 1000], msg: 'Comment cannot exceed 1000 characters' },
      },
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    underscored: true,
    timestamps: true,
    indexes: [
      // One review per student per course
      { unique: true, fields: ['course_id', 'user_id'], name: 'reviews_course_user_unique' },
      { fields: ['course_id'] },
      { fields: ['user_id'] },
    ],
  }
);

module.exports = Review;
