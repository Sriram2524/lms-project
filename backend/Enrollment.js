const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('./config/database');

class Enrollment extends Model {}

Enrollment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'course_id',
      references: { model: 'courses', key: 'id' },
      onDelete: 'CASCADE',
    },
    enrolledAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'enrolled_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    progressPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'progress_percent',
      validate: { min: 0, max: 100 },
    },
    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'amount_paid',
    },
  },
  {
    sequelize,
    modelName: 'Enrollment',
    tableName: 'enrollments',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['course_id'] },
    ],
  }
);

module.exports = Enrollment;
