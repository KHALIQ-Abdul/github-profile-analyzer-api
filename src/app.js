const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { clientOrigin } = require('./config/env');
const profileRoutes = require('./routes/profile.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: clientOrigin === '*' ? true : clientOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GitHub Profile Analyzer API is running',
    endpoints: {
      health: 'GET /health',
      analyze: 'POST /api/analyze/:username',
      profiles: 'GET /api/profiles',
      singleProfile: 'GET /api/profiles/:username',
      deleteProfile: 'DELETE /api/profiles/:username'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server healthy', timestamp: new Date().toISOString() });
});

app.use('/api', profileRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
