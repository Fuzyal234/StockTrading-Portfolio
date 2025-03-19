import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Type } from '@sinclair/typebox';

const prisma = new PrismaClient();

const StockSchema = Type.Object({
  symbol: Type.String(),
  companyName: Type.String(),
  currentPrice: Type.Number()
});

export async function stockRoutes(fastify: FastifyInstance) {
  // Middleware to verify JWT token
  fastify.addHook('preHandler', async (request: any, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Get all stocks
  fastify.get('/', async (request, reply) => {
    try {
      const stocks = await prisma.stock.findMany({
        orderBy: {
          symbol: 'asc'
        }
      });
      reply.send(stocks);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch stocks' });
    }
  });

  // Get a specific stock
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const stock = await prisma.stock.findUnique({
        where: { id }
      });

      if (!stock) {
        reply.code(404).send({ error: 'Stock not found' });
        return;
      }

      reply.send(stock);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch stock' });
    }
  });

  // Create a new stock (admin only)
  fastify.post('/', {
    schema: {
      body: StockSchema
    },
    handler: async (request, reply) => {
      const { symbol, companyName, currentPrice } = request.body as any;

      try {
        // Check if stock already exists
        const existingStock = await prisma.stock.findUnique({
          where: { symbol }
        });

        if (existingStock) {
          reply.code(400).send({ error: 'Stock already exists with this symbol' });
          return;
        }

        const stock = await prisma.stock.create({
          data: {
            symbol,
            companyName,
            currentPrice
          }
        });

        reply.code(201).send(stock);
      } catch (error) {
        reply.code(500).send({ error: 'Failed to create stock' });
      }
    }
  });

  // Update stock price
  fastify.patch('/:id/price', {
    schema: {
      body: Type.Object({
        currentPrice: Type.Number()
      })
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const { currentPrice } = request.body as { currentPrice: number };

      try {
        // First get all portfolio stocks for this stock
        const portfolioStocks = await prisma.portfolioStock.findMany({
          where: { stockId: id }
        });

        // Update stock price
        const stock = await prisma.stock.update({
          where: { id },
          data: {
            currentPrice,
            lastUpdated: new Date()
          }
        });

        // Update each portfolio stock's current value
        for (const ps of portfolioStocks) {
          await prisma.portfolioStock.update({
            where: { id: ps.id },
            data: {
              currentValue: ps.quantity * currentPrice
            }
          });
        }

        reply.send(stock);
      } catch (error) {
        console.error('Failed to update stock price:', error);
        reply.code(500).send({ error: 'Failed to update stock price' });
      }
    }
  });

  // Search stocks by symbol
  fastify.get('/search/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };

    try {
      const stocks = await prisma.stock.findMany({
        where: {
          symbol: {
            contains: symbol.toUpperCase(),
            mode: 'insensitive'
          }
        },
        take: 10
      });

      reply.send(stocks);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to search stocks' });
    }
  });
} 