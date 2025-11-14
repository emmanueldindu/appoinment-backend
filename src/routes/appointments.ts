import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../lib/auth';

export const appointmentRouter = Router();

const createAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  appointmentDate: z.string(), // ISO date string
  appointmentTime: z.string(), // e.g., "09:00 AM"
  notes: z.string().optional(),
});

const updateAppointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

// Get patient's appointments
appointmentRouter.get(
  '/patient/my-appointments',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'PATIENT') {
        res.status(403).json({ error: 'Only patients can access this endpoint' });
        return;
      }

      const appointments = await prisma.appointment.findMany({
        where: { patientId: req.userId },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              specialty: true,
            },
          },
        },
        orderBy: { appointmentDate: 'desc' },
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get doctor's appointments
appointmentRouter.get(
  '/doctor/my-appointments',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'DOCTOR') {
        res.status(403).json({ error: 'Only doctors can access this endpoint' });
        return;
      }

      const appointments = await prisma.appointment.findMany({
        where: { doctorId: req.userId },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              gender: true,
            },
          },
        },
        orderBy: { appointmentDate: 'desc' },
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get available time slots for a doctor on a specific date
appointmentRouter.get(
  '/available-slots/:doctorId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date || typeof date !== 'string') {
        res.status(400).json({ error: 'Date parameter is required' });
        return;
      }

      // Get all appointments for this doctor on this date
      const bookedAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDate: new Date(date),
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: {
          appointmentTime: true,
        },
      });

      const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);

      // All possible time slots
      const allSlots = {
        morning: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
        afternoon: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'],
        evening: ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM']
      };

      // Filter out booked slots
      const availableSlots = {
        morning: allSlots.morning.filter(slot => !bookedTimes.includes(slot)),
        afternoon: allSlots.afternoon.filter(slot => !bookedTimes.includes(slot)),
        evening: allSlots.evening.filter(slot => !bookedTimes.includes(slot))
      };

      res.json(availableSlots);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get appointment by ID
appointmentRouter.get(
  '/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: req.params.id },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              gender: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              specialty: true,
            },
          },
        },
      });

      if (!appointment) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
      }

      // Check if user is patient, doctor, or admin
      if (
        appointment.patientId !== req.userId &&
        appointment.doctorId !== req.userId &&
        req.userRole !== 'ADMIN'
      ) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create appointment (Patient books with Doctor)
appointmentRouter.post(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'PATIENT') {
        res.status(403).json({ error: 'Only patients can book appointments' });
        return;
      }

      const data = createAppointmentSchema.parse(req.body);

      // Verify doctor exists and is actually a doctor
      const doctor = await prisma.user.findUnique({
        where: { id: data.doctorId },
      });

      if (!doctor || doctor.role !== 'DOCTOR') {
        res.status(404).json({ error: 'Doctor not found' });
        return;
      }

      // Check if time slot is already booked
      const conflict = await prisma.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          appointmentDate: new Date(data.appointmentDate),
          appointmentTime: data.appointmentTime,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (conflict) {
        res.status(400).json({ error: 'This time slot is already booked' });
        return;
      }

      const appointment = await prisma.appointment.create({
        data: {
          patientId: req.userId!,
          doctorId: data.doctorId,
          appointmentDate: new Date(data.appointmentDate),
          appointmentTime: data.appointmentTime,
          notes: data.notes,
          status: 'PENDING',
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              specialty: true,
            },
          },
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              gender: true,
            },
          },
        },
      });

      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update appointment status (Doctor approves/rejects)
appointmentRouter.patch(
  '/:id/status',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = updateAppointmentStatusSchema.parse(req.body);

      const existing = await prisma.appointment.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
      }

      // Only the doctor assigned to this appointment can update status
      if (existing.doctorId !== req.userId && req.userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Only the assigned doctor can update appointment status' });
        return;
      }

      // Validation: Can only mark as COMPLETED if appointment is CONFIRMED
      if (data.status === 'COMPLETED' && existing.status !== 'CONFIRMED') {
        res.status(400).json({ error: 'Only confirmed appointments can be marked as completed' });
        return;
      }

      // Validation: Can only mark as COMPLETED if appointment date has passed or is today
      if (data.status === 'COMPLETED') {
        const appointmentDate = new Date(existing.appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);

        if (appointmentDate > today) {
          res.status(400).json({ error: 'Cannot mark future appointments as completed' });
          return;
        }
      }

      const appointment = await prisma.appointment.update({
        where: { id: req.params.id },
        data: { status: data.status },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              gender: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              specialty: true,
            },
          },
        },
      });

      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get patient statistics
appointmentRouter.get(
  '/patient/stats',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'PATIENT') {
        res.status(403).json({ error: 'Only patients can access this endpoint' });
        return;
      }

      const patientId = req.userId!;

      // Get all appointments for counting
      const allAppointments = await prisma.appointment.findMany({
        where: { patientId },
        select: { status: true },
      });

      const total = allAppointments.length;
      const upcoming = allAppointments.filter(
        apt => apt.status === 'PENDING' || apt.status === 'CONFIRMED'
      ).length;
      const completed = allAppointments.filter(
        apt => apt.status === 'COMPLETED'
      ).length;
      const cancelled = allAppointments.filter(
        apt => apt.status === 'CANCELLED'
      ).length;

      res.json({
        totalAppointments: total,
        upcomingAppointments: upcoming,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get patient's upcoming appointments
appointmentRouter.get(
  '/patient/upcoming',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'PATIENT') {
        res.status(403).json({ error: 'Only patients can access this endpoint' });
        return;
      }

      const patientId = req.userId!;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const appointments = await prisma.appointment.findMany({
        where: {
          patientId,
          appointmentDate: {
            gte: today,
          },
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              specialty: true,
            },
          },
        },
        orderBy: {
          appointmentDate: 'asc',
        },
        take: 5, // Limit to 5 upcoming appointments
      });

      const formattedAppointments = appointments.map(apt => ({
        id: apt.id,
        doctorId: apt.doctorId,
        doctorName: apt.doctor.name,
        doctorSpecialty: apt.doctor.specialty,
        date: apt.appointmentDate.toISOString(),
        time: apt.appointmentTime,
        status: apt.status,
        reason: apt.notes || '',
      }));

      res.json(formattedAppointments);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get doctor statistics
appointmentRouter.get(
  '/doctor/stats',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'DOCTOR') {
        res.status(403).json({ error: 'Only doctors can access this endpoint' });
        return;
      }

      const doctorId = req.userId!;

      // Total unique patients
      const uniquePatients = await prisma.appointment.findMany({
        where: { doctorId },
        select: { patientId: true },
        distinct: ['patientId'],
      });
      const totalPatients = uniquePatients.length;

      // Today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = await prisma.appointment.count({
        where: {
          doctorId,
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      const todayPending = await prisma.appointment.count({
        where: {
          doctorId,
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
          status: 'PENDING',
        },
      });

      // This week's appointments
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const weekAppointments = await prisma.appointment.count({
        where: {
          doctorId,
          appointmentDate: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
          status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
        },
      });

      // Total pending appointments
      const totalPending = await prisma.appointment.count({
        where: {
          doctorId,
          status: 'PENDING',
        },
      });

      // Total completed appointments
      const totalCompleted = await prisma.appointment.count({
        where: {
          doctorId,
          status: 'COMPLETED',
        },
      });

      res.json({
        totalPatients,
        todayAppointments,
        todayPending,
        weekAppointments,
        totalPending,
        totalCompleted,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get doctor's schedule for the next 7 days (starting from optional startDate)
appointmentRouter.get(
  '/doctor/weekly-schedule',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.userRole !== 'DOCTOR') {
        res.status(403).json({ error: 'Only doctors can access this endpoint' });
        return;
      }

      const { startDate: startDateParam } = req.query;

      let startDate = new Date();
      if (typeof startDateParam === 'string' && !Number.isNaN(Date.parse(startDateParam))) {
        startDate = new Date(startDateParam);
      }
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: req.userId!,
          appointmentDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
        select: {
          id: true,
          appointmentDate: true,
          appointmentTime: true,
          status: true,
          notes: true,
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              gender: true,
            },
          },
        },
      });

      const schedule = Array.from({ length: 7 }, (_, index) => {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + index);

        const dayAppointments = appointments.filter((appointment) => {
          const appointmentDate = new Date(appointment.appointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate.getTime() === dayDate.getTime();
        });

        return {
          date: dayDate.toISOString(),
          totalAppointments: dayAppointments.length,
          appointments: dayAppointments,
        };
      });

      res.json({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: schedule,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Cancel/Delete appointment (Patient or Doctor can cancel)
appointmentRouter.delete(
  '/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const existing = await prisma.appointment.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
      }

      // Patient or doctor can cancel their own appointments
      if (
        existing.patientId !== req.userId &&
        existing.doctorId !== req.userId &&
        req.userRole !== 'ADMIN'
      ) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Instead of deleting, mark as cancelled
      await prisma.appointment.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' },
      });

      res.status(200).json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
