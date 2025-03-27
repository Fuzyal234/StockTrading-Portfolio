import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { tradeRoutes } from './routes/trade.routes';
import { portfolioRoutes } from './routes/portfolio.routes';
import { stockRoutes } from './routes/stock.routes';
import { userRoutes } from './routes/user.routes';
import { watchlistRoutes } from './routes/watchlist.routes';
import { alertRoutes } from './routes/alert.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { dividendRoutes } from './routes/dividend.routes';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      name: string;
    }
    user: {
      id: string;
      email: string;
      name: string;
    }
  }
}

const prisma = new PrismaClient();
const server = fastify({ 
  logger: true,
  ignoreTrailingSlash: true
});

// Register plugins
server.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  sign: {
    expiresIn: '7d'
  }
});

server.register(require('@fastify/formbody'));

// Enable CORS - more permissive for development
server.register(require('@fastify/cors'), {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400,
});

// Add preHandler hook for all routes to handle preflight
server.addHook('preHandler', (request, reply, done) => {
  if (request.method === 'OPTIONS') {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.send();
    return;
  }
  done();
});

// Global authentication hook
server.addHook('onRequest', async (request, reply) => {
  try {
    const url = request.url;
    if (!url.includes('/api/users/login') && 
        !url.includes('/api/users/register') &&
        !url.includes('/health')) {
      await request.jwtVerify();
    }
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Global error handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal Server Error'
  });
});

// Register routes
server.register(userRoutes, { prefix: '/api/users' });
server.register(tradeRoutes, { prefix: '/api/trades' });
server.register(portfolioRoutes, { prefix: '/api/portfolio' });
server.register(stockRoutes, { prefix: '/api/stocks' });
server.register(watchlistRoutes, { prefix: '/api/watchlists' });
server.register(alertRoutes, { prefix: '/api/alerts' });
server.register(analyticsRoutes, { prefix: '/api/analytics' });
server.register(dividendRoutes, { prefix: '/api/dividends' });

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await server.listen({ 
      port: parseInt(process.env.PORT || '8001'), 
      host: '0.0.0.0' 
    });
    console.log(`Server is running on ${process.env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
