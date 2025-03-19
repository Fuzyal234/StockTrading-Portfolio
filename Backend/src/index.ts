import fastify, { FastifyError, FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { tradeRoutes } from './routes/trade.routes';
import { portfolioRoutes } from './routes/portfolio.routes';
import { stockRoutes } from './routes/stock.routes';
import { userRoutes } from './routes/user.routes';
import { config } from './config';
import { logger } from './utils/logger';

interface CustomFastifyError extends FastifyError {
  type?: string;
  code: string;
}

// Initialize Prisma with logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Initialize Fastify with structured logging
const server = fastify({
  logger: {
    level: config.logLevel,
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
          userAgent: request.headers['user-agent'],
        };
      },
      err(err: CustomFastifyError) {
        return {
          type: err.type || '',
          message: err.message || '',
          stack: err.stack || '',
          code: err.code || '',
          statusCode: err.statusCode || 500,
          validation: err.validation || []
        };
      },
    },
  },
});

// Register plugins with proper error handling
const registerPlugins = async () => {
  try {
    await server.register(require('@fastify/jwt'), {
      secret: config.jwtSecret,
    });

    await server.register(require('@fastify/formbody'));

    await server.register(require('@fastify/cors'), {
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    logger.info('All plugins registered successfully');
  } catch (error) {
    logger.error('Failed to register plugins:', error);
    throw error;
  }
};

// Register routes with proper error handling
const registerRoutes = async () => {
  try {
    await server.register(tradeRoutes, { prefix: '/api/trades' });
    await server.register(portfolioRoutes, { prefix: '/api/portfolio' });
    await server.register(stockRoutes, { prefix: '/api/stocks' });
    await server.register(userRoutes, { prefix: '/api/users' });
    
    // Health check route with detailed status
    server.get('/health', async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: config.nodeEnv,
        };
      } catch (error) {
        logger.error('Health check failed:', error);
        throw error;
      }
    });

    logger.info('All routes registered successfully');
  } catch (error) {
    logger.error('Failed to register routes:', error);
    throw error;
  }
};

// Start server with proper error handling
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();

    await server.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    logger.info(`Server is running on port ${config.port}`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  try {
    await server.close();
    await prisma.$disconnect();
    logger.info('Server shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

start();
