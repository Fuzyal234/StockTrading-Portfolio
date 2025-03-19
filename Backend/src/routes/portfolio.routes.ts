import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient, Trade, Portfolio, Stock, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface TradeWithStock extends Trade {
  stock: Stock;
}

interface PortfolioWithStocks extends Portfolio {
  stocks: Array<{
    id: string;
    portfolioId: string;
    stockId: string;
    quantity: number;
    avgPrice: Prisma.Decimal;
    currentValue: Prisma.Decimal;
    profit: Prisma.Decimal;
    stock: Stock;
  }>;
}

type PortfolioStock = PortfolioWithStocks['stocks'][number];

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
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        include: {
          stocks: {
            include: {
              stock: true
            }
          }
        }
      });

      if (!portfolio) {
        // If no portfolio exists, create an empty one
        const newPortfolio = await prisma.portfolio.create({
          data: {
            userId,
            totalValue: 0,
            totalProfit: 0
          },
          include: {
            stocks: {
              include: {
                stock: true
              }
            }
          }
        });
        reply.send(newPortfolio);
        return;
      }

      reply.send(portfolio);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch portfolio' });
    }
  });

  // Get portfolio performance over time
  fastify.get('/performance', async (request, reply) => {
    const userId = (request.user as any).id;

    try {
      const trades = await prisma.trade.findMany({
        where: { userId },
        orderBy: { timestamp: 'asc' },
        include: { stock: true }
      });

      // Calculate portfolio value at each trade
      let currentValue = 0;
      const performance = trades.map((trade: TradeWithStock) => {
        const tradeValue = Number(trade.price) * trade.quantity;
        if (trade.type === 'BUY') {
          currentValue += tradeValue;
        } else {
          currentValue -= tradeValue;
        }

        return {
          timestamp: trade.timestamp,
          value: currentValue,
          type: trade.type,
          symbol: trade.stock.symbol,
          quantity: trade.quantity,
          price: Number(trade.price)
        };
      });

      reply.send(performance);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch portfolio performance' });
    }
  });

  // Get portfolio statistics
  fastify.get('/stats', async (request, reply) => {
    const userId = (request.user as any).id;

    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        include: {
          stocks: {
            include: {
              stock: true
            }
          }
        }
      });

      if (!portfolio) {
        reply.code(404).send({ error: 'Portfolio not found' });
        return;
      }

      // Calculate statistics with proper types
      const stats = {
        totalValue: Number(portfolio.totalValue),
        totalProfit: Number(portfolio.totalProfit),
        numberOfStocks: portfolio.stocks.length,
        topHoldings: [...portfolio.stocks]
          .sort((a, b) => Number(b.currentValue) - Number(a.currentValue))
          .slice(0, 5)
          .map(holding => ({
            symbol: holding.stock.symbol,
            value: Number(holding.currentValue),
            quantity: holding.quantity,
            profit: Number(holding.profit)
          }))
      };

      reply.send(stats);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch portfolio statistics' });
    }
  });

  // Update portfolio values
  fastify.post('/update-values', async (request, reply) => {
    const userId = (request.user as any).id;

    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        include: {
          stocks: {
            include: {
              stock: true
            }
          }
        }
      });

      if (!portfolio) {
        reply.code(404).send({ error: 'Portfolio not found' });
        return;
      }

      // Update each stock's current value and profit
      let totalValue = 0;
      let totalProfit = 0;

      for (const holding of portfolio.stocks) {
        const currentValue = holding.quantity * Number(holding.stock.currentPrice);
        const profit = currentValue - (holding.quantity * Number(holding.avgPrice));

        await prisma.portfolioStock.update({
          where: { id: holding.id },
          data: {
            currentValue,
            profit
          }
        });

        totalValue += currentValue;
        totalProfit += profit;
      }

      // Update portfolio totals
      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          totalValue,
          totalProfit,
          lastUpdated: new Date()
        },
        include: {
          stocks: {
            include: {
              stock: true
            }
          }
        }
      });

      reply.send(updatedPortfolio);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update portfolio values' });
    }
  });
} 