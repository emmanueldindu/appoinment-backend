#!/bin/bash

echo "🚀 Setting up Appointment Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your database credentials!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Dependencies installed ✅"
echo ""
echo "Next steps:"
echo "1. Update .env with your PostgreSQL database URL"
echo "2. Run: npm run prisma:generate"
echo "3. Run: npm run prisma:migrate"
echo "4. Run: npm run prisma:seed (optional)"
echo "5. Run: npm run dev"
echo ""
echo "Example DATABASE_URL:"
echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/appointment_db?schema=public\""
