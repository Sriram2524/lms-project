const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./config/database');

class Lesson extends Model {}

Lesson.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'section_id',
      references: { model: 'sections', key: 'id' },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Lesson title is required' },
        len: { args: [2, 200], msg: 'Title must be between 2 and 200 characters' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'video_url',
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'duration_minutes',
      validate: { min: { args: [0], msg: 'Duration cannot be negative' } },
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_free',
    },
    contentType: {
      type: DataTypes.ENUM('video', 'article', 'quiz', 'assignment'),
      defaultValue: 'video',
      field: 'content_type',
    },
  },
  {
    sequelize,
    modelName: 'Lesson',
    tableName: 'lessons',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['section_id'] },
      { fields: ['section_id', 'order'] },
    ],
  }
);

module.exports = Lesson;
