import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient, Portfolio, Stock } from '@prisma/client';

const prisma = new PrismaClient();

export async function portfolioRoutes(fastify: FastifyInstance) {
  // Middleware to verify JWT token
  fastify.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Get user's portfolio
  fastify.get('/', async (request, reply) => {
    const userId = (request.user as any).id;

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { userId },
        include: {
          stocks: true
        }
      });

      if (!portfolio) {
        // Create a new portfolio with mock data
        const mockStocks = [
          { symbol: 'AAPL', name: 'Apple Inc.', purchasePrice: 180.50 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', purchasePrice: 140.20 },
          { symbol: 'MSFT', name: 'Microsoft Corporation', purchasePrice: 380.75 }
        ];

        // Create portfolio with mock positions
        const newPortfolio = await prisma.portfolio.create({
          data: {
            userId,
            name: 'My Portfolio',
            stocks: {
              create: mockStocks.map(stock => ({
                symbol: stock.symbol,
                name: stock.name,
                quantity: 10,
                purchasePrice: stock.purchasePrice
              }))
            }
          },
          include: {
            stocks: true
          }
        });
        reply.send(newPortfolio);
        return;
      }

      reply.send(portfolio);
    } catch (error) {
      console.error('Portfolio fetch error:', error);
      reply.code(500).send({ error: 'Failed to fetch portfolio' });
    }
  });
} 