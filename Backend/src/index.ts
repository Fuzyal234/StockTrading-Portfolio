import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { tradeRoutes } from './routes/trade.routes';
import { portfolioRoutes } from './routes/portfolio.routes';
import { stockRoutes } from './routes/stock.routes';
import { userRoutes } from './routes/user.routes';
const prisma = new PrismaClient();
const server = fastify({ logger: true });

// Register plugins
server.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'your-secret-key'
});

server.register(require('@fastify/formbody'));

// Enable CORS
server.register(require('@fastify/cors'), {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
});

// Register routes
server.register(tradeRoutes, { prefix: '/api/trades' });
server.register(portfolioRoutes, { prefix: '/api/portfolio' });
server.register(stockRoutes, { prefix: '/api/stocks' });
server.register(userRoutes, { prefix: '/api/users' });
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
    console.log(`Server is running on ${server.server.address()}`);
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
