const User = require('./User');
const { Course } = require('./Course');
const Section = require('./Section');
const Lesson = require('./Lesson');
const Review = require('./Review');
const Enrollment = require('./Enrollment');

// ─── Associations ─────────────────────────────────────────────────────────────

// User ↔ Course (instructor)
User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses', onDelete: 'RESTRICT' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// Course → Sections → Lessons
Course.hasMany(Section, { foreignKey: 'courseId', as: 'sections', onDelete: 'CASCADE' });
Section.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Section.hasMany(Lesson, { foreignKey: 'sectionId', as: 'lessons', onDelete: 'CASCADE' });
Lesson.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });

// Course → Reviews ← User
Course.hasMany(Review, { foreignKey: 'courseId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Student ↔ Course (enrollments)
User.belongsToMany(Course, { through: Enrollment, foreignKey: 'userId', as: 'enrolledCourses' });
Course.belongsToMany(User, { through: Enrollment, foreignKey: 'courseId', as: 'students' });

User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'student' });

Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

module.exports = { User, Course, Section, Lesson, Review, Enrollment };
