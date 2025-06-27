require("dotenv").config();

const commonDatabaseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
};

module.exports = {
  app: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    frontendUrl: process.env.FRONTEND_URL,
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },
    gps: {
      updateInterval: parseInt(process.env.GPS_UPDATE_INTERVAL) || 30000,
      batchSize: parseInt(process.env.GPS_BATCH_SIZE) || 100,
    },
  },

  development: {
    ...commonDatabaseConfig,
  },
  test: {
    ...commonDatabaseConfig,
    database: process.env.DB_NAME_TEST || "mi_base_test",
  },
  production: {
    ...commonDatabaseConfig,
    database: process.env.DB_NAME_PROD || "mi_base_produccion",
  },
};
