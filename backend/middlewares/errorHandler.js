module.exports = (err, req, res, next) => {
  console.error("Error caught by central error handler:", err);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 422;
    errorMessage = "Unprocessable Entity";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    errorMessage = "Unauthorized";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    errorMessage = "Not Found";
  } else if (err.name === "MethodNotAllowedError") {
    statusCode = 405;
    errorMessage = "Method Not Allowed";
  } else if (err.name === "InternalServerError") {
    statusCode = 500;
    errorMessage = "Internal Server Error";
  }

  return res
    .status(statusCode)
    .json({ error: errorMessage, detailedError: err.message });
};
