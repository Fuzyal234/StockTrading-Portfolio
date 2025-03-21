import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient } from '.prisma/client';
import { Type } from '@sinclair/typebox';

const prisma = new PrismaClient();

const TradeSchema = Type.Object({
  stockId: Type.String(),
  type: Type.Union([Type.Literal('BUY'), Type.Literal('SELL')]),
  quantity: Type.Number(),
  price: Type.Number()
});

export async function tradeRoutes(fastify: FastifyInstance) {
  // Middleware to verify JWT token
  fastify.addHook('preHandler', async (request: any, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Create a new trade
  fastify.post('/', {
    schema: {
      body: TradeSchema
    },
    handler: async (request, reply) => {
      const { stockId, type, quantity, price } = request.body as any;
      const userId = (request.user as any).id;

      try {
        // Create the trade
        const trade = await prisma.Trade.create({
          data: {
            userId,
            stockId,
            type,
            quantity,
            price,
            timestamp: new Date()
          }
        });

        // Update or create stock in portfolio
        const portfolio = await prisma.portfolio.findFirst({
          where: { userId }
        });

        if (!portfolio) {
          // Create new portfolio with the stock
          await prisma.portfolio.create({
            data: {
              userId,
              name: 'My Portfolio',
              stocks: {
                create: {
                  symbol: stockId,
                  name: stockId,
                  quantity: type === 'BUY' ? quantity : -quantity,
                  purchasePrice: price
                }
              }
            }
          });
        } else {
          // Update existing stock or create new one
          const existingStock = await prisma.stock.findFirst({
            where: {
              symbol: stockId,
              portfolioId: portfolio.id
            }
          });

          if (existingStock) {
            await prisma.stock.update({
              where: { id: existingStock.id },
              data: {
                quantity: type === 'BUY' 
                  ? existingStock.quantity + quantity 
                  : existingStock.quantity - quantity
              }
            });
          } else {
            await prisma.stock.create({
              data: {
                symbol: stockId,
                name: stockId,
                quantity: type === 'BUY' ? quantity : -quantity,
                purchasePrice: price,
                portfolioId: portfolio.id
              }
            });
          }
        }

        reply.code(201).send(trade);
      } catch (error) {
        console.error('Trade creation error:', error);
        reply.code(500).send({ error: 'Failed to create trade' });
      }
    }
  });

    // Get all trades for a user
  fastify.get('/', async (request: FastifyRequest, reply) => {
    const userId = (request.user as { id: string }).id;

    try {
      const trades = await prisma.Trade.findMany({
        where: { userId },
        include: {
          stock: true
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      reply.send(trades);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch trades' });
    }
  });

  // Get a specific trade
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).id;

    try {
      const trade = await prisma.Trade.findFirst({
        where: {
          id,
          userId
        },
        include: {
          stock: true
        }
      });

      if (!trade) {
        reply.code(404).send({ error: 'Trade not found' });
        return;
      }

      reply.send(trade);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch trade' });
    }
  });
} 