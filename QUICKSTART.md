# Quick Start Guide

## Prerequisites

Make sure you have PostgreSQL installed and running on your machine.

### Install PostgreSQL (if not installed)

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Create Database:**
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE appointment_db;
CREATE USER appointment_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE appointment_db TO appointment_user;
\q
```

## Setup Steps

### 1. Configure Environment Variables

Copy the example environment file and update it:
```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL`:
```env
DATABASE_URL="postgresql://appointment_user:your_password@localhost:5432/appointment_db?schema=public"
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migrations

This will create all the necessary tables in your database:
```bash
npm run prisma:migrate
```

When prompted for a migration name, you can use: `init`

### 4. Seed the Database (Optional)

This will create sample data including admin and client users:
```bash
npm run prisma:seed
```

**Test Credentials:**
- Admin: `admin@example.com` / `admin123`
- Client: `client@example.com` / `client123`

### 5. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001`

## Verify Installation

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

You should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Test API Endpoints

### Register a new user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Get Services:
```bash
curl http://localhost:3001/api/services
```

## Useful Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:migrate` - Create and run new migration
- `npm run prisma:generate` - Regenerate Prisma Client

## Troubleshooting

### Database Connection Issues

If you get connection errors:
1. Make sure PostgreSQL is running: `brew services list`
2. Check your DATABASE_URL in `.env`
3. Verify database exists: `psql -l`

### Port Already in Use

If port 3001 is already in use, change the PORT in `.env`

### Prisma Client Not Generated

Run: `npm run prisma:generate`

## Next Steps

- Check out the API documentation in `README.md`
- Explore the database schema in `prisma/schema.prisma`
- Use Prisma Studio to view/edit data: `npm run prisma:studio`
