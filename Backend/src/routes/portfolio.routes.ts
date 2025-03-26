import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient, Portfolio, Stock, Prisma } from '@prisma/client';

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
        } as Prisma.PortfolioInclude
      });

      if (!portfolio) {
        // Create a new portfolio with mock data
        const mockStocks = [
          { symbol: 'AAPL', name: 'Apple Inc.', purchasePrice: 180.50 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', purchasePrice: 140.20 },
          { symbol: 'MSFT', name: 'Microsoft Corporation', purchasePrice: 380.75 }
        ];

        try {
          // First create the portfolio
          const newPortfolio = await prisma.portfolio.create({
            data: {
              userId,
              name: 'My Portfolio',
            }
          });

          // Then create the stocks separately
          const stockPromises = mockStocks.map(stock => 
            prisma.stock.create({
              data: {
                portfolioId: newPortfolio.id,
                symbol: stock.symbol,
                name: stock.name,
                quantity: 10,
                purchasePrice: stock.purchasePrice
              }
            })
          );

          const createdStocks = await Promise.all(stockPromises);

          // Fetch the complete portfolio with stocks
          const completePortfolio = await prisma.portfolio.findUnique({
            where: { id: newPortfolio.id },
            include: {
              stocks: true
            } as Prisma.PortfolioInclude
          });

          reply.send(completePortfolio);
          return;
        } catch (createError) {
          // If portfolio creation fails due to unique constraint
          if ((createError as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
            // Try to fetch existing portfolio again
            const existingPortfolio = await prisma.portfolio.findFirst({
              where: { userId },
              include: {
                stocks: true
              } as Prisma.PortfolioInclude
            });
            
            if (existingPortfolio) {
              reply.send(existingPortfolio);
              return;
            }
          }
          throw createError; // Re-throw if it's a different error
        }
      }

      reply.send(portfolio);
    } catch (error: any) {
      console.error('Portfolio fetch error:', error);
      reply.code(500).send({ 
        error: 'Failed to fetch portfolio',
        details: error.message,
        code: error.code 
      });
    }
  });

  // Get portfolio performance
  fastify.get('/performance', async (request, reply) => {
    const userId = (request.user as any).id;
    const timeframe = (request.query as any).timeframe || '1M'; // Default to 1 month

    try {
      // Calculate start date based on timeframe
      const now = new Date();
      let startDate = new Date();
      switch (timeframe) {
        case '1D':
          startDate.setDate(now.getDate() - 1);
          break;
        case '1W':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1); // Default to 1 month
      }

      // Generate sample performance data
      const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const performanceData = [];
      let baseValue = 10000; // Starting with $10,000

      for (let i = 0; i <= days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Add some random fluctuation to create realistic-looking data
        const randomChange = (Math.random() - 0.45) * 200; // Random change between -100 and +100
        baseValue += randomChange;
        
        performanceData.push({
          date: dateStr,
          value: Math.max(baseValue, 0) // Ensure value doesn't go below 0
        });
      }

      reply.send(performanceData);
    } catch (error) {
      console.error('Portfolio performance fetch error:', error);
      reply.code(500).send({ error: 'Failed to fetch portfolio performance' });
    }
  });
} 