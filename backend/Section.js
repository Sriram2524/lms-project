const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./config/database');

class Section extends Model {}

Section.init(
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Section title is required' },
        len: { args: [2, 200], msg: 'Title must be between 2 and 200 characters' },
      },
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: { args: [0], msg: 'Order must be non-negative' } },
    },
  },
  {
    sequelize,
    modelName: 'Section',
    tableName: 'sections',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['course_id'] },
      { fields: ['course_id', 'order'] },
    ],
  }
);

module.exports = Section;
