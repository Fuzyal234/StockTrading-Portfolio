# Stock Trading Portfolio

A full-stack application for managing stock trading portfolios with real-time calculations and visualizations.

## Features

- Record buy and sell transactions
- Calculate total portfolio value
- Track profit/loss per stock and overall portfolio
- Visualize portfolio metrics
- Real-time updates of stock prices
- Materialized views for efficient calculations

## Tech Stack

- Frontend: Next.js with Chakra UI
- Backend: Node.js with Fastify
- Database: PostgreSQL with Prisma
- Containerization: Docker

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Docker (optional)

### Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Set up the database:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Docker Setup (Optional)

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

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
