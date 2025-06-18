import dotenv from "dotenv"

dotenv.config()

export const config = {
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 8080,
    name: process.env.DB_NAME || "vehicle_management",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "tu_clave_secreta_muy_segura",
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  },
  server: {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
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
