import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Type } from '@sinclair/typebox';

const prisma = new PrismaClient();

interface AnalyticsCreateInput {
  userId: number;
  date: Date;
  totalValue: number;
  cashBalance: number;
  dayReturn: number;
  totalReturn: number;
  sectorAllocation: any;
  riskMetrics: any;
}

const AnalyticsSchema = Type.Object({
  totalValue: Type.Number(),
  cashBalance: Type.Number(),
  dayReturn: Type.Number(),
  totalReturn: Type.Number(),
  sectorAllocation: Type.Any(),
  riskMetrics: Type.Any()
});

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Middleware to verify JWT token
  fastify.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Get portfolio analytics summary
  fastify.get('/summary', async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const latestAnalytics = await prisma.portFolioAnalytics.findFirst({
        where: { userId },
        orderBy: { date: 'desc' }
      });

      if (!latestAnalytics) {
        reply.code(404).send({ error: 'No analytics data found' });
        return;
      }

      reply.send(latestAnalytics);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch analytics summary' });
    }
  });

  // Get historical portfolio value
  fastify.get('/historical-value', async (request: any, reply) => {
    const userId = request.user.id;
    const { timeframe = '1M' } = request.query;

    try {
      const now = new Date();
      let startDate = new Date();

      switch (timeframe) {
        case '1W':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'YTD':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }

      const historicalData = await prisma.portFolioAnalytics.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: now
          }
        },
        select: {
          date: true,
          totalValue: true,
          dayReturn: true
        },
        orderBy: { date: 'asc' }
      });

      reply.send(historicalData);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch historical value data' });
    }
  });

  // Get sector allocation
  fastify.get('/sector-allocation', async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const latestAnalytics = await prisma.portFolioAnalytics.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
        select: {
          sectorAllocation: true
        }
      });

      if (!latestAnalytics) {
        reply.code(404).send({ error: 'No sector allocation data found' });
        return;
      }

      reply.send(latestAnalytics.sectorAllocation);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch sector allocation' });
    }
  });

  // Get risk metrics
  fastify.get('/risk-metrics', async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const latestAnalytics = await prisma.portFolioAnalytics.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
        select: {
          riskMetrics: true
        }
      });

      if (!latestAnalytics) {
        reply.code(404).send({ error: 'No risk metrics data found' });
        return;
      }

      reply.send(latestAnalytics.riskMetrics);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch risk metrics' });
    }
  });

  // Store daily analytics (internal use, typically called by a cron job)
  fastify.post('/daily-snapshot', async (request: any, reply) => {
    const userId = request.user.id;
    const {
      totalValue,
      cashBalance,
      dayReturn,
      totalReturn,
      sectorAllocation,
      riskMetrics
    } = request.body;

    try {
      const analytics = await prisma.portFolioAnalytics.create({
        data: {
          userId,
          date: new Date(),
          totalValue,
          cashBalance,
          dayReturn,
          totalReturn,
          sectorAllocation,
          riskMetrics
        }
      });

      reply.code(201).send(analytics);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to store daily analytics' });
    }
  });
} 