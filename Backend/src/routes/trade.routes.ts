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
        const trade = await prisma.trade.create({
          data: {
            userId,
            stockId,
            type,
            quantity,
            price
          }
        });

        // Update portfolio
        const portfolio = await prisma.portfolio.findUnique({
          where: { userId }
        });

        if (!portfolio) {
          await prisma.portfolio.create({
            data: {
              userId,
              totalValue: 0,
              totalProfit: 0,
              stocks: {
                create: {
                  stockId,
                  quantity: type === 'BUY' ? quantity : -quantity,
                  avgPrice: price,
                  currentValue: price * quantity,
                  profit: 0
                }
              }
            }
          });
        } else {
          // Update existing portfolio
          const portfolioStock = await prisma.portfolioStock.findUnique({
            where: {
              portfolioId_stockId: {
                portfolioId: portfolio.id,
                stockId
              }
            }
          });

          if (portfolioStock) {
            const newQuantity = type === 'BUY' 
              ? portfolioStock.quantity + quantity 
              : portfolioStock.quantity - quantity;

            await prisma.portfolioStock.update({
              where: {
                id: portfolioStock.id
              },
              data: {
                quantity: newQuantity,
                currentValue: newQuantity * price
              }
            });
          } else {
            await prisma.portfolioStock.create({
              data: {
                portfolioId: portfolio.id,
                stockId,
                quantity: type === 'BUY' ? quantity : -quantity,
                avgPrice: price,
                currentValue: price * quantity,
                profit: 0
              }
            });
          }
        }

        reply.code(201).send(trade);
      } catch (error) {
        reply.code(500).send({ error: 'Failed to create trade' });
      }
    }
  });

    // Get all trades for a user
  fastify.get('/', async (request: FastifyRequest, reply) => {
    const userId = (request.user as { id: string }).id;

    try {
      const trades = await prisma.trade.findMany({
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
      const trade = await prisma.trade.findFirst({
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