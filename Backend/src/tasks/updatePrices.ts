import { PrismaClient } from '@prisma/client';
import { StockPriceService } from '../services/stockPrice.service';

const prisma = new PrismaClient();

export async function startPriceUpdateTask() {
  // Update prices every 5 minutes
  setInterval(async () => {
    try {
      await StockPriceService.updateAllStockPrices(prisma);
      console.log('Stock prices updated successfully');
    } catch (error) {
      console.error('Failed to update stock prices:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes in milliseconds

  // Initial update
  try {
    await StockPriceService.updateAllStockPrices(prisma);
    console.log('Initial stock prices update completed');
  } catch (error) {
    console.error('Failed to perform initial stock prices update:', error);
  }
} 