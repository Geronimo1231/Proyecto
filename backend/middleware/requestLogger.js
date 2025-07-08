import pkg from "../config/config.cjs"
const { logger } = pkg


export const requestLogger = (req, res, next) => {
  const start = Date.now()

  // Log request
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  })

  // Override res.json to log response
  const originalJson = res.json
  res.json = function (data) {
    const duration = Date.now() - start

    logger.info(`${req.method} ${req.url} - ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })

    return originalJson.call(this, data)
  }

  next()
}
