import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample patient
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patient = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      password: patientPassword,
      name: 'John Doe',
      role: 'PATIENT',
      gender: 'MALE',
    },
  });
  console.log('✅ Patient user created:', patient.email);

  // Create sample doctor
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@example.com' },
    update: {},
    create: {
      email: 'doctor@example.com',
      password: doctorPassword,
      name: 'Dr. Sarah Smith',
      role: 'DOCTOR',
      specialty: 'CARDIOLOGIST',
    },
  });
  console.log('✅ Doctor user created:', doctor.email);

  // Create services
  const services = [
    {
      name: 'Haircut',
      description: 'Professional haircut service',
      duration: 30,
      price: 25.0,
    },
    {
      name: 'Hair Coloring',
      description: 'Full hair coloring service',
      duration: 90,
      price: 75.0,
    },
    {
      name: 'Massage',
      description: 'Relaxing full body massage',
      duration: 60,
      price: 60.0,
    },
    {
      name: 'Consultation',
      description: 'Initial consultation',
      duration: 15,
      price: 0.0,
    },
  ];

  // Check if services already exist
  const existingServices = await prisma.service.count();
  if (existingServices === 0) {
    await prisma.service.createMany({
      data: services,
    });
    console.log('✅ Services created');
  } else {
    console.log('✅ Services already exist');
  }

  // Create availability for admin (Monday to Friday, 9 AM to 5 PM)
  const availabilitySlots = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
  ];

  for (const slot of availabilitySlots) {
    await prisma.availability.create({
      data: {
        ...slot,
        userId: admin.id,
      },
    });
  }
  console.log('✅ Availability created for admin');

  console.log('🎉 Seeding completed!');
  console.log('\nTest credentials:');
  console.log('Admin - Email: admin@example.com, Password: admin123');
  console.log('Patient - Email: patient@example.com, Password: patient123');
  console.log('Doctor - Email: doctor@example.com, Password: doctor123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
