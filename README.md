# Stock Trading Portfolio

A modern web application for managing and tracking your stock trading portfolio. Built with Next.js, Fastify, and Prisma.

## Features

- Real-time portfolio tracking
- Trade management (buy/sell)
- Portfolio analytics and charts
- User authentication
- Responsive design
- Dark/Light mode support

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Chakra UI
- React Query
- Recharts
- Axios

### Backend
- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Pino Logger

## Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stocktrading-portfolio.git
cd stocktrading-portfolio
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd Frontend
npm install

# Install backend dependencies
cd ../Backend
npm install
```

3. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8001

# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/stocktrading"
JWT_SECRET="your-secret-key"
PORT=8001
```

4. Set up the database:
```bash
cd Backend
npx prisma generate
npx prisma migrate dev
```

5. Start the development servers:
```bash
# Start backend server
cd Backend
npm run dev

# Start frontend server (in a new terminal)
cd Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8001

## Project Structure

```
stocktrading-portfolio/
├── Frontend/
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   │   ├── components/   # React components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── lib/          # Utility functions and API client
│   │   │   └── services/     # API services
│   │   └── public/           # Static assets
│   ├── Backend/
│   │   ├── src/
│   │   │   ├── controllers/  # Route controllers
│   │   │   ├── models/       # Data models
│   │   │   ├── routes/       # API routes
│   │   │   ├── utils/        # Utility functions
│   │   │   └── validation/   # Request validation
│   │   └── prisma/          # Database schema and migrations
│   └── Dockerization/       # Docker configuration
```

## API Documentation

The API documentation is available at `/api/docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
