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
