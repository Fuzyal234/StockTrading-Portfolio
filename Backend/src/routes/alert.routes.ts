import { FastifyInstance, FastifyRequest } from 'fastify';
import { PrismaClient, Alert } from '@prisma/client';
import { Type } from '@sinclair/typebox';

const prisma = new PrismaClient();

const AlertSchema = Type.Object({
  symbol: Type.String(),
  type: Type.Union([Type.Literal('PRICE_ABOVE'), Type.Literal('PRICE_BELOW')]),
  price: Type.Number()
});

interface AlertCreateInput {
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW';
  price: number;
  userId: number;
  active: boolean;
  triggered: boolean;
}

export async function alertRoutes(fastify: FastifyInstance) {
  // Middleware to verify JWT token
  fastify.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Create a new alert
  fastify.post('/', {
    schema: {
      body: AlertSchema
    },
    handler: async (request: any, reply) => {
      const { symbol, type, price } = request.body;
      const userId = request.user.id;

      try {
        const alert = await prisma.alert.create({
          data: {
            symbol,
            type,
            price,
            userId,
            active: true,
            triggered: false
          }
        });
        reply.code(201).send(alert);
      } catch (error) {
        console.error('Alert creation error:', error);
        reply.code(500).send({ error: 'Failed to create alert' });
      }
    }
  });

  // Get all alerts for a user
  fastify.get('/', async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const alerts = await prisma.alert.findMany({
        where: { 
          userId,
          active: true 
        },
        orderBy: { createdAt: 'desc' }
      });
      reply.send(alerts);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch alerts' });
    }
  });

  // Get triggered alerts for a user
  fastify.get('/triggered', async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const alerts = await prisma.alert.findMany({
        where: { 
          userId,
          triggered: true 
        },
        orderBy: { updatedAt: 'desc' }
      });
      reply.send(alerts);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch triggered alerts' });
    }
  });

  // Update an alert
  fastify.put('/:id', {
    schema: {
      body: AlertSchema
    },
    handler: async (request: any, reply) => {
      const { id } = request.params;
      const { symbol, type, price } = request.body;
      const userId = request.user.id;

      try {
        const alert = await prisma.alert.findFirst({
          where: {
            id: parseInt(id),
            userId
          }
        });

        if (!alert) {
          reply.code(404).send({ error: 'Alert not found' });
          return;
        }

        const updatedAlert = await prisma.alert.update({
          where: { id: parseInt(id) },
          data: {
            symbol,
            type,
            price,
            triggered: false // Reset triggered status on update
          }
        });

        reply.send(updatedAlert);
      } catch (error) {
        reply.code(500).send({ error: 'Failed to update alert' });
      }
    }
  });

  // Deactivate an alert
  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    try {
      const alert = await prisma.alert.findFirst({
        where: {
          id: parseInt(id),
          userId
        }
      });

      if (!alert) {
        reply.code(404).send({ error: 'Alert not found' });
        return;
      }

      await prisma.alert.update({
        where: { id: parseInt(id) },
        data: { active: false }
      });

      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: 'Failed to deactivate alert' });
    }
  });

  // Mark alert as triggered (internal use)
  fastify.patch('/:id/trigger', async (request: any, reply) => {
    const { id } = request.params;

    try {
      const updatedAlert = await prisma.alert.update({
        where: { id: parseInt(id) },
        data: { triggered: true }
      });

      reply.send(updatedAlert);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to mark alert as triggered' });
    }
  });
} 