# Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts                # Database seeding script
├── src/
│   ├── lib/
│   │   ├── auth.ts           # Authentication utilities (JWT, bcrypt)
│   │   └── prisma.ts         # Prisma client instance
│   ├── routes/
│   │   ├── appointments.ts   # Appointment endpoints
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── availability.ts   # Availability endpoints
│   │   ├── services.ts       # Service endpoints
│   │   └── users.ts          # User endpoints
│   └── index.ts              # Express app entry point
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker PostgreSQL setup
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── README.md                # Main documentation
├── QUICKSTART.md            # Quick start guide
└── PROJECT_STRUCTURE.md     # This file
```

## Key Files

### `prisma/schema.prisma`
Defines the database schema with 4 main models:
- **User**: Authentication and user management
- **Service**: Services offered for booking
- **Appointment**: Booking records
- **Availability**: Time slots when services are available

### `src/index.ts`
Main Express application that:
- Sets up middleware (CORS, JSON parsing)
- Registers all API routes
- Starts the server

### `src/lib/auth.ts`
Authentication utilities:
- Password hashing with bcrypt
- JWT token generation and verification
- Auth middleware for protected routes
- Admin middleware for admin-only routes

### `src/lib/prisma.ts`
Singleton Prisma client instance with:
- Development logging
- Global instance caching

### Route Files
Each route file handles CRUD operations for its domain:
- **auth.ts**: Register, login
- **users.ts**: Get current user profile
- **services.ts**: Manage services (CRUD)
- **appointments.ts**: Manage appointments (CRUD)
- **availability.ts**: Manage availability schedules (CRUD)

## API Architecture

### Authentication Flow
1. User registers/logs in via `/api/auth/*`
2. Server returns JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. Protected routes verify token via `authMiddleware`
5. Admin routes additionally check role via `adminMiddleware`

### Request Validation
- All inputs validated using Zod schemas
- Type-safe request/response handling
- Proper error responses for validation failures

### Database Access
- All database operations use Prisma ORM
- Type-safe queries
- Automatic migrations
- Easy schema evolution

## Environment Variables

Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT signing
- `NODE_ENV`: Environment (development/production)

## Development Workflow

1. **Make schema changes**: Edit `prisma/schema.prisma`
2. **Create migration**: `npm run prisma:migrate`
3. **Update code**: Modify route handlers as needed
4. **Test**: Use curl, Postman, or frontend app
5. **View data**: `npm run prisma:studio`

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ CORS enabled
- ✅ Environment variable configuration

## Testing Endpoints

See `QUICKSTART.md` for curl examples to test each endpoint.
