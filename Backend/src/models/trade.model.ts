import { PrismaClient } from '.prisma/client'

export interface Trade {
  id: string
  stockId: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  timestamp: Date
}

export const prisma = new PrismaClient()

export const TradeModel = prisma.trade 