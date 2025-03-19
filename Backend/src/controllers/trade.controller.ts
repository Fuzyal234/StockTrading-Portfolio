import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const tradeSchema = z.object({
  symbol: z.string().min(1).max(10),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
})

export default async function tradeRoutes(fastify: FastifyInstance) {
  // Add new trade
  fastify.post('/api/trades', async (request: any, reply) => {
    try {
      const tradeData = tradeSchema.parse(request.body)
      const userId = request.user.id

      // First, get or create the stock
      const stock = await prisma.stock.upsert({
        where: { symbol: tradeData.symbol },
        create: {
          symbol: tradeData.symbol,
          companyName: tradeData.symbol, // You might want to fetch this from an external API
          currentPrice: tradeData.price
        },
        update: {
          currentPrice: tradeData.price
        }
      })

      // Create the trade with proper relations
      const trade = await prisma.trade.create({
        data: {
          type: tradeData.type,
          quantity: tradeData.quantity,
          price: tradeData.price,
          user: {
            connect: { id: userId }
          },
          stock: {
            connect: { id: stock.id }
          }
        },
        include: {
          stock: true,
          user: true
        }
      })

      return reply.code(201).send(trade)
    } catch (error) {
      console.error('Trade creation error:', error)
      return reply.code(400).send({ error: 'Invalid trade data' })
    }
  })

  // Get all trades
  fastify.get('/api/trades', async (request: any) => {
    const userId = request.user.id
    const trades = await prisma.trade.findMany({
      where: { userId },
      include: {
        stock: true
      },
      orderBy: { timestamp: 'desc' },
    })
    return trades
  })

  // Get portfolio summary
  fastify.get('/api/portfolio', async (request: any) => {
    const userId = request.user.id
    const summary = await prisma.$queryRaw`
      SELECT 
        s.symbol,
        s."companyName",
        SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) as total_quantity,
        SUM(CASE WHEN t.type = 'BUY' THEN t.price * t.quantity ELSE -t.price * t.quantity END) / 
          NULLIF(SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END), 0) as average_price,
        SUM(CASE WHEN t.type = 'BUY' THEN t.price * t.quantity ELSE -t.price * t.quantity END) as total_investment,
        s."currentPrice" as current_price,
        s."currentPrice" * SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) as current_value
      FROM "Trade" t
      JOIN "Stock" s ON t."stockId" = s.id
      WHERE t."userId" = ${userId}
      GROUP BY s.id, s.symbol, s."companyName", s."currentPrice"
      HAVING SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) > 0
    `
    return summary
  })
} 