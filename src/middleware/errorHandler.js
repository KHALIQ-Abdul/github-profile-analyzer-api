const { nodeEnv } = require('../config/env');

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || err.response?.status || 500;

  let message = err.message || 'Internal Server Error';
  if (err.response?.status === 404) message = 'GitHub user not found';
  if (err.response?.status === 403) message = 'GitHub API rate limit exceeded or access forbidden. Add GITHUB_TOKEN in .env.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(nodeEnv === 'development'
      ? { stack: err.stack, details: err.response?.data }
      : {})
  });
};
