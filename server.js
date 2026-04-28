const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config');
const logger = require('./src/utils/logger');

const PORT = config.port;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      const apiBase = `http://localhost:${PORT}`;
      
      console.log('\n' + '='.repeat(60));
      console.log('🚀 DSE Trading Backend API - Server Ready');
      console.log('='.repeat(60));
      console.log(`\n📍 Environment : ${config.env}`);
      console.log(`🔗 Server URL  : ${apiBase}\n`);
      
      console.log('📊 Available API Endpoints:');
      console.log('-'.repeat(60));
      console.log(`  GET  ${apiBase}/`);
      console.log(`  GET  ${apiBase}/api/health`);
      console.log(`  GET  ${apiBase}/api/stocks`);
      console.log(`  GET  ${apiBase}/api/stocks/metadata`);
      console.log(`  GET  ${apiBase}/api/stocks/:code`);
      console.log(`  GET  ${apiBase}/api/stocks/:code/history?days=30`);
      console.log(`  PUT  ${apiBase}/api/stocks/:code/metadata`);
      console.log('-'.repeat(60) + '\n');
      
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Closing server...');
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
