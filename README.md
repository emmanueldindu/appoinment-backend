# Appointment Booking System - Backend

A robust Node.js backend built with TypeScript, Express, PostgreSQL, and Prisma for managing appointments and services.

## Features

- 🔐 JWT-based authentication
- 👥 User management (Client & Admin roles)
- 📅 Appointment booking and management
- 🛠️ Service management
- ⏰ Availability scheduling
- 🗄️ PostgreSQL database with Prisma ORM
- ✅ Input validation with Zod
- 🔒 Secure password hashing with bcrypt

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher) OR Docker
- npm or yarn

### Quick Start with Docker (Recommended)

If you have Docker installed, you can quickly start PostgreSQL:

```bash
# Start PostgreSQL container
docker-compose up -d

# Your DATABASE_URL will be:
# DATABASE_URL="postgresql://appointment_user:appointment_pass@localhost:5432/appointment_db?schema=public"
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/appointment_db?schema=public"
PORT=3001
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user (protected)

### Services
- `GET /api/services` - Get all active services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Appointments
- `GET /api/appointments` - Get user's appointments (protected)
- `GET /api/appointments/all` - Get all appointments (admin only)
- `GET /api/appointments/:id` - Get appointment by ID (protected)
- `POST /api/appointments` - Create appointment (protected)
- `PUT /api/appointments/:id` - Update appointment (protected)
- `DELETE /api/appointments/:id` - Delete appointment (protected)

### Availability
- `GET /api/availability` - Get availability schedule
- `POST /api/availability` - Create availability (admin only)
- `PUT /api/availability/:id` - Update availability (admin only)
- `DELETE /api/availability/:id` - Delete availability (admin only)

## Database Schema

### User
- id (UUID)
- email (unique)
- password (hashed)
- name
- role (CLIENT | ADMIN)
- timestamps

### Service
- id (UUID)
- name
- description
- duration (minutes)
- price
- isActive
- timestamps

### Appointment
- id (UUID)
- userId (FK)
- serviceId (FK)
- startTime
- endTime
- status (PENDING | CONFIRMED | CANCELLED | COMPLETED)
- notes
- timestamps

### Availability
- id (UUID)
- userId (FK)
- dayOfWeek (0-6)
- startTime (HH:MM)
- endTime (HH:MM)
- isActive
- timestamps

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed the database

## Development

The project uses:
- TypeScript for type safety
- Prisma for database management
- Express for API routing
- Zod for runtime validation
- JWT for authentication

## License

ISC
