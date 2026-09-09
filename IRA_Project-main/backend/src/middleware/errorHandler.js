function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || (err.message && err.message.includes("CORS") ? 403 : 500);
  res.status(status).json({
    error: true,
    message: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
