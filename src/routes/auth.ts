import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateToken } from '../lib/auth';

export const authRouter = Router();

const patientRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

const doctorRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  specialty: z.enum([
    'CARDIOLOGIST',
    'DERMATOLOGIST',
    'PEDIATRICIAN',
    'NEUROLOGIST',
    'ORTHOPEDIC',
    'PSYCHIATRIST',
    'GENERAL_PHYSICIAN',
    'GYNECOLOGIST',
    'OPHTHALMOLOGIST',
    'ENT_SPECIALIST',
    'DENTIST',
    'OTHER',
  ]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Patient Registration
authRouter.post('/register/patient', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, gender } = patientRegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        gender,
        role: 'PATIENT',
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor Registration
authRouter.post('/register/doctor', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, specialty } = doctorRegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        specialty,
        role: 'DOCTOR',
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        specialty: user.specialty,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        gender: user.gender,
        specialty: user.specialty,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
