const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const stockRoutes = require('./routes/stockRoutes');
const authRoutes = require('./routes/authRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', stockRoutes);
app.use('/api', authRoutes);
app.use('/api', tradeRoutes);
app.use('/api', watchlistRoutes);
app.use('/api', leaderboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'DSE Trading Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
