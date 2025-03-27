import { FastifyInstance } from 'fastify';
import { PrismaClient } from '.prisma/client';
import { Type } from '@sinclair/typebox';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const UserRegisterSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  name: Type.String({ minLength: 2 })
});

const UserLoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String()
});

export async function userRoutes(fastify: FastifyInstance) {
  // Register a new user
  fastify.post('/register', {
    schema: {
      body: UserRegisterSchema
    },
    handler: async (request, reply) => {
      const { email, password, name } = request.body as any;

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          reply.code(400).send({ error: 'User already exists with this email' });
          return;
        }

        // Hash the password with Argon2
        const hashedPassword = await argon2.hash(password);

        // Create the user
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name
          }
        });

        // Generate JWT token
        const token = fastify.jwt.sign({ 
          id: user.id.toString(),
          email: user.email,
          name: user.name || ''
        });

        // Return user data and token (excluding password)
        const { password: _, ...userData } = user;
        reply.code(201).send({ user: userData, token });
      } catch (error) {
        console.error('Registration error:', error);
        reply.code(500).send({ error: 'Failed to register user' });
      }
    }
  });

  // Login user
  fastify.post('/login', {
    schema: {
      body: UserLoginSchema
    },
    handler: async (request, reply) => {
      const { email, password } = request.body as any;

      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          reply.code(401).send({ error: 'Invalid credentials' });
          return;
        }

        // Verify password using Argon2
        const isValidPassword = await argon2.verify(user.password, password);
        if (!isValidPassword) {
          reply.code(401).send({ error: 'Invalid credentials' });
          return;
        }

        // Generate JWT token
        const token = fastify.jwt.sign({ 
          id: user.id.toString(),
          email: user.email,
          name: user.name || ''
        });

        // Return user data and token (excluding password)
        const { password: _, ...userData } = user;
        reply.send({ user: userData, token });
      } catch (error) {
        console.error('Login error:', error);
        reply.code(500).send({ error: 'Failed to login' });
      }
    }
  });

  // Get current user profile
  fastify.get('/me', {
    handler: async (request, reply) => {
      try {
        const userId = parseInt(request.user.id);
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!user) {
          reply.code(404).send({ error: 'User not found' });
          return;
        }

        reply.send(user);
      } catch (error) {
        console.error('Error in /me endpoint:', error);
        reply.code(401).send({ error: 'Unauthorized' });
      }
    }
  });

  // Update user profile
  fastify.put('/me', {
    schema: {
      body: Type.Object({
        name: Type.Optional(Type.String({ minLength: 2 })),
        password: Type.Optional(Type.String({ minLength: 6 }))
      })
    },
    handler: async (request, reply) => {
      try {
        const userId = parseInt(request.user.id);
        const { name, password } = request.body as any;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (password) updateData.password = await argon2.hash(password);

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
          }
        });

        reply.send(updatedUser);
      } catch (error) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    }
  });
}