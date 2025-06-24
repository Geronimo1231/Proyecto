import dotenv from "dotenv"

dotenv.config()

export const config = {
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  server: {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
  },
  upload: {
    path: process.env.UPLOAD_PATH || "./uploads",
    maxFileSize: process.env.MAX_FILE_SIZE || 10485760, // 10MB
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutos
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  },
  gps: {
    updateInterval: process.env.GPS_UPDATE_INTERVAL || 30000, // 30 segundos
    batchSize: process.env.GPS_BATCH_SIZE || 100,
  },
}
