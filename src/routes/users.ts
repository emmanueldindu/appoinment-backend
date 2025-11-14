import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../lib/auth';

export const userRouter = Router();

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  hospital: z.string().max(200).optional(),
  experience: z.string().max(100).optional(),
});

const updatePatientProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().optional(), // Will be converted to Date
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  address: z.string().max(500).optional(),
  bloodGroup: z.string().max(10).optional(),
  allergies: z.string().max(500).optional(),
});

const updateDoctorProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  hospital: z.string().max(200).optional(),
  experience: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  licenseNumber: z.string().max(50).optional(),
  consultationFee: z.string().max(20).optional(),
  education: z.string().max(300).optional(),
});

// Get current user
userRouter.get(
  '/me',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          gender: true,
          specialty: true,
          bio: true,
          hospital: true,
          experience: true,
          phone: true,
          dateOfBirth: true,
          address: true,
          bloodGroup: true,
          allergies: true,
          licenseNumber: true,
          consultationFee: true,
          education: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update doctor profile
userRouter.patch(
  '/doctor/complete-profile',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'DOCTOR') {
        res.status(403).json({ error: 'Only doctors can complete profile' });
        return;
      }

      const data = updateProfileSchema.parse(req.body);

      const user = await prisma.user.update({
        where: { id: req.userId! },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          specialty: true,
          bio: true,
          hospital: true,
          experience: true,
        },
      });

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all doctors
userRouter.get('/doctors', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { specialty } = req.query;

    const where: any = { role: 'DOCTOR' };
    
    // Filter by specialty if provided
    if (specialty && typeof specialty === 'string') {
      where.specialty = specialty;
    }

    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        bio: true,
        hospital: true,
        experience: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor by ID
userRouter.get('/doctors/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const doctor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
        bio: true,
        hospital: true,
        experience: true,
        createdAt: true,
      },
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    if (doctor.role !== 'DOCTOR') {
      res.status(404).json({ error: 'User is not a doctor' });
      return;
    }

    // Get doctor's availability
    const availability = await prisma.availability.findMany({
      where: {
        userId: id,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: 'asc' }],
    });

    // Group availability by day
    const availabilityByDay = availability.reduce((acc, item) => {
      if (!acc[item.dayOfWeek]) {
        acc[item.dayOfWeek] = [];
      }
      acc[item.dayOfWeek].push(item.timeSlot);
      return acc;
    }, {} as Record<number, string[]>);

    // Get total number of patients (unique patients who booked with this doctor)
    const uniquePatients = await prisma.appointment.findMany({
      where: { doctorId: id },
      select: { patientId: true },
      distinct: ['patientId'],
    });

    // Get total appointments count
    const totalAppointments = await prisma.appointment.count({
      where: { doctorId: id },
    });

    res.json({
      ...doctor,
      availability: {
        days: Object.keys(availabilityByDay).map(Number),
        slots: availabilityByDay,
      },
      stats: {
        totalPatients: uniquePatients.length,
        totalAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update patient profile
userRouter.patch(
  '/patient/update-profile',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'PATIENT') {
        res.status(403).json({ error: 'Only patients can update patient profile' });
        return;
      }

      const validatedData = updatePatientProfileSchema.parse(req.body);

      // Convert dateOfBirth string to Date if provided
      const updateData: any = { ...validatedData };
      if (validatedData.dateOfBirth) {
        updateData.dateOfBirth = new Date(validatedData.dateOfBirth);
      }

      const user = await prisma.user.update({
        where: { id: req.userId! },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          gender: true,
          phone: true,
          dateOfBirth: true,
          address: true,
          bloodGroup: true,
          allergies: true,
          createdAt: true,
        },
      });

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update doctor profile
userRouter.patch(
  '/doctor/update-profile',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'DOCTOR') {
        res.status(403).json({ error: 'Only doctors can update doctor profile' });
        return;
      }

      const data = updateDoctorProfileSchema.parse(req.body);

      const user = await prisma.user.update({
        where: { id: req.userId! },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          specialty: true,
          bio: true,
          hospital: true,
          experience: true,
          phone: true,
          address: true,
          licenseNumber: true,
          consultationFee: true,
          education: true,
          createdAt: true,
        },
      });

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
