# Stock Trading Portfolio

A modern web application for managing and tracking your stock trading portfolio.

## Features

- Real-time portfolio tracking
- Trade management (buy/sell)
- Portfolio analytics and charts
- User authentication
- Dark/Light mode support

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Chakra UI, React Query
- **Backend**: Fastify, TypeScript, Prisma, PostgreSQL

## Quick Start

1. Clone and install dependencies:
```bash
git clone https://github.com/yourusername/stocktrading-portfolio.git
cd stocktrading-portfolio

# Frontend
cd Frontend && npm install

# Backend
cd ../Backend && npm install
```

2. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8001

# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/stocktrading"
JWT_SECRET="your-secret-key"
PORT=8001
```

3. Start the servers:
```bash
# Backend
cd Backend && npm run dev

# Frontend (new terminal)
cd Frontend && npm run dev
```

Access the app at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8001

## Project Structure

```
stocktrading-portfolio/
├── Frontend/          # Next.js frontend application
└── Backend/           # Fastify backend with Prisma
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## API Documentation

The API documentation is available at `/api/docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Chakra UI](https://chakra-ui.com/) for the beautiful components
- [Fastify](https://www.fastify.io/) for the fast and low overhead web framework
- [Prisma](https://www.prisma.io/) for the type-safe ORM

## API Endpoints

- `POST /api/trades` - Add a new trade
- `GET /api/trades` - Get all trades
- `GET /api/portfolio` - Get portfolio summary

## Database Schema

### Trade Table
- id (Primary Key)
- symbol (String)
- type (BUY/SELL)
- quantity (Integer)
- price (Float)
- timestamp (DateTime)

### PortfolioSummary (Materialized View)
- symbol (String)
- totalQuantity (Integer)
- averagePrice (Float)
- totalInvestment (Float)
- currentPrice (Float)
- totalValue (Float)
- profitLoss (Float)
- profitLossPercent (Float) 
