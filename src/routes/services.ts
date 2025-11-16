import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware, AuthRequest } from '../lib/auth';

export const serviceRouter = Router();

const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().positive(),
  price: z.number().nonnegative(),
});

// Get all active services (public)
serviceRouter.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get service by ID
serviceRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create service (admin only)
serviceRouter.post(
  '/',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = createServiceSchema.parse(req.body);
      const service = await prisma.service.create({ data });
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update service (admin only)
serviceRouter.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = createServiceSchema.partial().parse(req.body);
      const service = await prisma.service.update({
        where: { id: req.params.id },
        data,
      });
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete service (admin only)
serviceRouter.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await prisma.service.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
