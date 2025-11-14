# API Testing Guide

## Base URL
```
http://localhost:3001
```

## 1. Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T02:47:00.000Z"
}
```

---

## 2. Patient Registration

**Endpoint:** `POST /api/auth/register/patient`

**Fields:**
- `name` (string, required) - Full name
- `email` (string, required) - Valid email
- `password` (string, required, min 6 chars)
- `gender` (enum, required) - MALE, FEMALE, or OTHER

```bash
curl -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.patient@example.com",
    "password": "password123",
    "gender": "MALE"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "john.patient@example.com",
    "name": "John Doe",
    "gender": "MALE",
    "role": "PATIENT"
  },
  "token": "jwt-token-here"
}
```

---

## 3. Doctor Registration

**Endpoint:** `POST /api/auth/register/doctor`

**Fields:**
- `name` (string, required) - Full name
- `email` (string, required) - Valid email
- `password` (string, required, min 6 chars)
- `specialty` (enum, required) - See specialty list below

**Available Specialties:**
- CARDIOLOGIST
- DERMATOLOGIST
- PEDIATRICIAN
- NEUROLOGIST
- ORTHOPEDIC
- PSYCHIATRIST
- GENERAL_PHYSICIAN
- GYNECOLOGIST
- OPHTHALMOLOGIST
- ENT_SPECIALIST
- DENTIST
- OTHER

```bash
curl -X POST http://localhost:3001/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah Smith",
    "email": "sarah.doctor@example.com",
    "password": "password123",
    "specialty": "CARDIOLOGIST"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "sarah.doctor@example.com",
    "name": "Dr. Sarah Smith",
    "specialty": "CARDIOLOGIST",
    "role": "DOCTOR"
  },
  "token": "jwt-token-here"
}
```

---

## 4. Login

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.patient@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "john.patient@example.com",
    "name": "John Doe",
    "role": "PATIENT",
    "gender": "MALE",
    "specialty": null
  },
  "token": "jwt-token-here"
}
```

---

## 5. Get All Services

**Endpoint:** `GET /api/services`

```bash
curl http://localhost:3001/api/services
```

**Expected Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "Haircut",
    "description": "Professional haircut service",
    "duration": 30,
    "price": 25.0,
    "isActive": true,
    "createdAt": "2025-11-12T02:53:40.000Z",
    "updatedAt": "2025-11-12T02:53:40.000Z"
  }
]
```

---

## 6. Get Current User (Protected)

**Endpoint:** `GET /api/users/me`

**Requires:** Authorization header with Bearer token

```bash
# Replace YOUR_TOKEN with the token from login/register
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing Different Specialties

### Dermatologist
```bash
curl -X POST http://localhost:3001/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Emily Brown",
    "email": "emily.derma@example.com",
    "password": "password123",
    "specialty": "DERMATOLOGIST"
  }'
```

### Pediatrician
```bash
curl -X POST http://localhost:3001/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Michael Johnson",
    "email": "michael.pedia@example.com",
    "password": "password123",
    "specialty": "PEDIATRICIAN"
  }'
```

### Neurologist
```bash
curl -X POST http://localhost:3001/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Lisa Anderson",
    "email": "lisa.neuro@example.com",
    "password": "password123",
    "specialty": "NEUROLOGIST"
  }'
```

---

## Testing Different Genders

### Female Patient
```bash
curl -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.patient@example.com",
    "password": "password123",
    "gender": "FEMALE"
  }'
```

### Other Gender
```bash
curl -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Taylor",
    "email": "alex.patient@example.com",
    "password": "password123",
    "gender": "OTHER"
  }'
```

---

## Error Cases

### Invalid Email
```bash
curl -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "password123",
    "gender": "MALE"
  }'
```

### Password Too Short
```bash
curl -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123",
    "gender": "MALE"
  }'
```

### Invalid Specialty
```bash
curl -X POST http://localhost:3001/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test",
    "email": "test.doctor@example.com",
    "password": "password123",
    "specialty": "INVALID_SPECIALTY"
  }'
```

### Duplicate Email
```bash
# Register first user
curl -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First User",
    "email": "duplicate@example.com",
    "password": "password123",
    "gender": "MALE"
  }'

# Try to register with same email (should fail)
curl -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Second User",
    "email": "duplicate@example.com",
    "password": "password123",
    "gender": "FEMALE"
  }'
```

---

## Quick Test Script

Save this as `test-api.sh` and run with `bash test-api.sh`:

```bash
#!/bin/bash

echo "=== Testing Health Check ==="
curl -s http://localhost:3001/health | jq

echo -e "\n=== Registering Patient ==="
curl -s -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test.patient@example.com",
    "password": "password123",
    "gender": "MALE"
  }' | jq

echo -e "\n=== Registering Doctor ==="
curl -s -X POST http://localhost:3001/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test Doctor",
    "email": "test.doctor@example.com",
    "password": "password123",
    "specialty": "CARDIOLOGIST"
  }' | jq

echo -e "\n=== Getting Services ==="
curl -s http://localhost:3001/api/services | jq

echo -e "\n=== All tests completed ==="
```
