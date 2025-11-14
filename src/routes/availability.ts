import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../lib/auth';

export const availabilityRouter = Router();

const setAvailabilitySchema = z.object({
  availableDays: z.array(z.number().min(0).max(6)),
  timeSlots: z.array(z.string()),
});

// Get doctor's availability
availabilityRouter.get(
  '/doctor/my-availability',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'DOCTOR') {
        res.status(403).json({ error: 'Only doctors can access this endpoint' });
        return;
      }

      const availability = await prisma.availability.findMany({
        where: {
          userId: req.userId!,
          isActive: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: 'asc' }],
      });

      // Group by day
      const grouped = availability.reduce((acc, item) => {
        if (!acc[item.dayOfWeek]) {
          acc[item.dayOfWeek] = [];
        }
        acc[item.dayOfWeek].push(item.timeSlot);
        return acc;
      }, {} as Record<number, string[]>);

      const availableDays = Object.keys(grouped).map(Number);
      const allTimeSlots = [...new Set(availability.map(a => a.timeSlot))];

      res.json({
        availableDays,
        timeSlots: allTimeSlots,
        details: grouped,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get specific doctor's availability (public)
availabilityRouter.get(
  '/doctor/:doctorId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { doctorId } = req.params;

      const doctor = await prisma.user.findUnique({
        where: { id: doctorId },
      });

      if (!doctor || doctor.role !== 'DOCTOR') {
        res.status(404).json({ error: 'Doctor not found' });
        return;
      }

      const availability = await prisma.availability.findMany({
        where: {
          userId: doctorId,
          isActive: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: 'asc' }],
      });

      // Group by day
      const grouped = availability.reduce((acc, item) => {
        if (!acc[item.dayOfWeek]) {
          acc[item.dayOfWeek] = [];
        }
        acc[item.dayOfWeek].push(item.timeSlot);
        return acc;
      }, {} as Record<number, string[]>);

      res.json({
        doctorId,
        doctorName: doctor.name,
        availableDays: Object.keys(grouped).map(Number),
        availability: grouped,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Set doctor's availability (replaces all existing)
availabilityRouter.post(
  '/doctor/set-availability',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'DOCTOR') {
        res.status(403).json({ error: 'Only doctors can set availability' });
        return;
      }

      const { availableDays, timeSlots } = setAvailabilitySchema.parse(req.body);

      // Delete all existing availability for this doctor
      await prisma.availability.deleteMany({
        where: { userId: req.userId! },
      });

      // Create new availability entries
      const availabilityEntries = [];
      for (const day of availableDays) {
        for (const slot of timeSlots) {
          availabilityEntries.push({
            userId: req.userId!,
            dayOfWeek: day,
            timeSlot: slot,
            isActive: true,
          });
        }
      }

      if (availabilityEntries.length > 0) {
        await prisma.availability.createMany({
          data: availabilityEntries,
        });
      }

      res.status(201).json({
        message: 'Availability updated successfully',
        totalSlots: availabilityEntries.length,
        availableDays,
        timeSlots,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Clear doctor's availability
availabilityRouter.delete(
  '/doctor/clear-availability',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'DOCTOR') {
        res.status(403).json({ error: 'Only doctors can clear availability' });
        return;
      }

      await prisma.availability.deleteMany({
        where: { userId: req.userId! },
      });

      res.json({ message: 'Availability cleared successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
