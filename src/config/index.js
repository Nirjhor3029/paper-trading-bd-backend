require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dse_scraper',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
