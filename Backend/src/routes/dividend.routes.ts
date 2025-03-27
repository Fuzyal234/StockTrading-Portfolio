import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient, DividendHistory } from '@prisma/client';
import { Type } from '@sinclair/typebox';

const prisma = new PrismaClient();

const DividendSchema = Type.Object({
  symbol: Type.String(),
  amount: Type.Number(),
  paymentDate: Type.String() // ISO date string
});

export async function dividendRoutes(fastify: FastifyInstance) {
  // Middleware to verify JWT token
  fastify.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Record a new dividend payment
  fastify.post('/', {
    schema: {
      body: DividendSchema
    },
    handler: async (request: any, reply) => {
      const { symbol, amount, paymentDate } = request.body;
      const userId = request.user.id;

      try {
        const dividend = await prisma.dividendHistory.create({
          data: {
            symbol,
            amount,
            paymentDate: new Date(paymentDate),
            userId
          }
        });
        reply.code(201).send(dividend);
      } catch (error) {
        console.error('Dividend recording error:', error);
        reply.code(500).send({ error: 'Failed to record dividend' });
      }
    }
  });

  // Get all dividend history for a user
  fastify.get('/', async (request: any, reply) => {
    const userId = request.user.id;
    const { year, symbol } = request.query;

    try {
      const whereClause: any = { userId };
      
      if (year) {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31);
        whereClause.paymentDate = {
          gte: startDate,
          lte: endDate
        };
      }

      if (symbol) {
        whereClause.symbol = symbol;
      }

      const dividends = await prisma.dividendHistory.findMany({
        where: whereClause,
        orderBy: { paymentDate: 'desc' }
      });

      reply.send(dividends);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch dividend history' });
    }
  });

  // Get dividend summary by year
  fastify.get('/summary/yearly', async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const dividends = await prisma.dividendHistory.groupBy({
        by: ['symbol'],
        where: { userId },
        _sum: {
          amount: true
        }
      });

      reply.send(dividends);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch yearly dividend summary' });
    }
  });

  // Get dividend summary by stock
  fastify.get('/summary/by-stock', async (request: any, reply) => {
    const userId = request.user.id;
    const { year } = request.query;

    try {
      const whereClause: any = { userId };
      
      if (year) {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31);
        whereClause.paymentDate = {
          gte: startDate,
          lte: endDate
        };
      }

      const dividends = await prisma.dividendHistory.groupBy({
        by: ['symbol'],
        where: whereClause,
        _sum: {
          amount: true
        },
        _count: true
      });

      reply.send(dividends);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch stock-wise dividend summary' });
    }
  });

  // Get upcoming dividends (based on historical patterns)
  fastify.get('/upcoming', async (request: any, reply) => {
    const userId = request.user.id;
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

    try {
      // Get recent dividend history to predict upcoming payments
      const recentDividends = await prisma.dividendHistory.findMany({
        where: {
          userId,
          paymentDate: {
            gte: threeMonthsAgo
          }
        },
        orderBy: {
          paymentDate: 'desc'
        }
      });

      // Process dividends to predict next payment dates
      const upcomingDividends = recentDividends.map((dividend: DividendHistory) => {
        const nextPaymentDate = new Date(dividend.paymentDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 3); // Assume quarterly dividends

        return {
          symbol: dividend.symbol,
          estimatedAmount: dividend.amount,
          estimatedPaymentDate: nextPaymentDate,
          lastPaymentDate: dividend.paymentDate
        };
      });

      reply.send(upcomingDividends);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch upcoming dividends' });
    }
  });
} 