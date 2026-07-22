// ─── Error Handler Middleware ─────────────────────────────────────────────────
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.stack}`);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

// ─── 404 Handler ──────────────────────────────────────────────────────────────
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = { errorHandler, notFoundHandler };
