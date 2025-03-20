import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export class StockPriceService {
  static async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      });

      const quote = response.data['Global Quote'];
      return parseFloat(quote['05. price']);
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw new Error(`Failed to fetch price for ${symbol}`);
    }
  }

  static async updateAllStockPrices(prisma: any) {
    try {
      const stocks = await prisma.stock.findMany();
      
      for (const stock of stocks) {
        const currentPrice = await this.getCurrentPrice(stock.symbol);
        
        await prisma.stock.update({
          where: { id: stock.id },
          data: {
            currentPrice,
            lastUpdated: new Date()
          }
        });

        // Update portfolio holdings
        const holdings = await prisma.portfolioStock.findMany({
          where: { stockId: stock.id },
          include: { portfolio: true }
        });

        for (const holding of holdings) {
          const currentValue = holding.quantity * currentPrice;
          const profit = currentValue - (holding.quantity * holding.avgPrice);

          await prisma.portfolioStock.update({
            where: { id: holding.id },
            data: {
              currentValue,
              profit
            }
          });

          // Update portfolio totals
          const portfolioHoldings = await prisma.portfolioStock.findMany({
            where: { portfolioId: holding.portfolioId }
          });

          const totalValue = portfolioHoldings.reduce((sum: number, h: any) => sum + h.currentValue, 0);
          const totalProfit = portfolioHoldings.reduce((sum: number, h: any) => sum + h.profit, 0);

          await prisma.portfolio.update({
            where: { id: holding.portfolioId },
            data: {
              totalValue,
              totalProfit,
              lastUpdated: new Date()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error updating stock prices:', error);
      throw error;
    }
  }
} 