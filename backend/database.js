const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';

const useSsl =
  process.env.DB_SSL === 'true' ||
  process.env.DB_SSL === '1' ||
  process.env.DB_SSL === 'require' ||
  env === 'production';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: env === 'development' ? console.log : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
  },
  ...(useSsl && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
    },
  }),
};

const sequelize = new Sequelize(
  process.env.DB_NAME || 'course_management',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  config
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully');

    if (env === 'development') {
      // Sync models without dropping tables (use migrations in production)
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synced');
    }
  } catch (error) {
    console.error('❌ PostgreSQL Connection Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
