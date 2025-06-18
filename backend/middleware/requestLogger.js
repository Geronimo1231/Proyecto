export const requestLogger = (req, res, next) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`)
    }
  })

  next()
}
