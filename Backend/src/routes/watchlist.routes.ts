import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient, Watchlist } from '@prisma/client';
import { Type } from '@sinclair/typebox';

const prisma = new PrismaClient();

const WatchlistSchema = Type.Object({
  name: Type.String(),
  symbols: Type.Array(Type.String())
});

interface WatchlistCreateInput {
  name: string;
  symbols: string[];
  userId: number;
}

export async function watchlistRoutes(fastify: FastifyInstance) {
  // Middleware to verify JWT token
  fastify.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Create a new watchlist
  fastify.post('/', {
    schema: {
      body: WatchlistSchema
    },
    handler: async (request: any, reply) => {
      const { name, symbols } = request.body;
      const userId = request.user.id;

      try {
        const watchlist = await prisma.watchlist.create({
          data: {
            name,
            symbols,
            userId
          }
        });
        reply.code(201).send(watchlist);
      } catch (error) {
        console.error('Watchlist creation error:', error);
        reply.code(500).send({ error: 'Failed to create watchlist' });
      }
    }
  });

  // Get all watchlists for a user
  fastify.get('/', async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const watchlists = await prisma.watchlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      reply.send(watchlists);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch watchlists' });
    }
  });

  // Get a specific watchlist
  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    try {
      const watchlist = await prisma.watchlist.findFirst({
        where: {
          id: parseInt(id),
          userId
        }
      });

      if (!watchlist) {
        reply.code(404).send({ error: 'Watchlist not found' });
        return;
      }

      reply.send(watchlist);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch watchlist' });
    }
  });

  // Update a watchlist
  fastify.put('/:id', {
    schema: {
      body: WatchlistSchema
    },
    handler: async (request: any, reply) => {
      const { id } = request.params;
      const { name, symbols } = request.body;
      const userId = request.user.id;

      try {
        const watchlist = await prisma.watchlist.findFirst({
          where: {
            id: parseInt(id),
            userId
          }
        });

        if (!watchlist) {
          reply.code(404).send({ error: 'Watchlist not found' });
          return;
        }

        const updatedWatchlist = await prisma.watchlist.update({
          where: { id: parseInt(id) },
          data: {
            name,
            symbols
          }
        });

        reply.send(updatedWatchlist);
      } catch (error) {
        reply.code(500).send({ error: 'Failed to update watchlist' });
      }
    }
  });

  // Delete a watchlist
  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    try {
      const watchlist = await prisma.watchlist.findFirst({
        where: {
          id: parseInt(id),
          userId
        }
      });

      if (!watchlist) {
        reply.code(404).send({ error: 'Watchlist not found' });
        return;
      }

      await prisma.watchlist.delete({
        where: { id: parseInt(id) }
      });

      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: 'Failed to delete watchlist' });
    }
  });
} 