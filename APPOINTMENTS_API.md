# Appointments API Documentation

## Overview

The appointments system allows patients to book appointments with doctors. Doctors can view, approve, reject, or complete appointments.

---

## Endpoints

### 1. Create Appointment (Patient Books with Doctor)

**Endpoint:** `POST /api/appointments`  
**Auth Required:** Yes (Patient only)  
**Role:** PATIENT

**Request Body:**
```json
{
  "doctorId": "uuid-of-doctor",
  "appointmentDate": "2025-11-15",
  "appointmentTime": "09:00 AM",
  "notes": "Optional notes"
}
```

**Example:**
```bash
# First, login as patient to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "patient123"
  }'

# Copy the token from response, then book appointment
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -d '{
    "doctorId": "DOCTOR_UUID_HERE",
    "appointmentDate": "2025-11-15",
    "appointmentTime": "09:00 AM",
    "notes": "First consultation"
  }'
```

**Success Response (201):**
```json
{
  "id": "appointment-uuid",
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2025-11-15T00:00:00.000Z",
  "appointmentTime": "09:00 AM",
  "status": "PENDING",
  "notes": "First consultation",
  "createdAt": "2025-11-12T03:00:00.000Z",
  "updatedAt": "2025-11-12T03:00:00.000Z",
  "doctor": {
    "id": "doctor-uuid",
    "name": "Dr. Sarah Smith",
    "email": "doctor@example.com",
    "specialty": "CARDIOLOGIST"
  },
  "patient": {
    "id": "patient-uuid",
    "name": "John Doe",
    "email": "patient@example.com",
    "gender": "MALE"
  }
}
```

**Error Responses:**
- `403` - Only patients can book appointments
- `404` - Doctor not found
- `400` - Time slot already booked

---

### 2. Get Patient's Appointments

**Endpoint:** `GET /api/appointments/patient/my-appointments`  
**Auth Required:** Yes (Patient only)  
**Role:** PATIENT

**Example:**
```bash
curl http://localhost:3001/api/appointments/patient/my-appointments \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Success Response (200):**
```json
[
  {
    "id": "appointment-uuid",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "appointmentDate": "2025-11-15T00:00:00.000Z",
    "appointmentTime": "09:00 AM",
    "status": "CONFIRMED",
    "notes": "First consultation",
    "createdAt": "2025-11-12T03:00:00.000Z",
    "updatedAt": "2025-11-12T03:00:00.000Z",
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. Sarah Smith",
      "email": "doctor@example.com",
      "specialty": "CARDIOLOGIST"
    }
  }
]
```

---

### 3. Get Doctor's Appointments

**Endpoint:** `GET /api/appointments/doctor/my-appointments`  
**Auth Required:** Yes (Doctor only)  
**Role:** DOCTOR

**Example:**
```bash
# First, login as doctor
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "doctor123"
  }'

# Get appointments
curl http://localhost:3001/api/appointments/doctor/my-appointments \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

**Success Response (200):**
```json
[
  {
    "id": "appointment-uuid",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "appointmentDate": "2025-11-15T00:00:00.000Z",
    "appointmentTime": "09:00 AM",
    "status": "PENDING",
    "notes": "First consultation",
    "createdAt": "2025-11-12T03:00:00.000Z",
    "updatedAt": "2025-11-12T03:00:00.000Z",
    "patient": {
      "id": "patient-uuid",
      "name": "John Doe",
      "email": "patient@example.com",
      "gender": "MALE"
    }
  }
]
```

---

### 4. Get Available Time Slots

**Endpoint:** `GET /api/appointments/available-slots/:doctorId?date=YYYY-MM-DD`  
**Auth Required:** No (Public)

**Example:**
```bash
curl "http://localhost:3001/api/appointments/available-slots/DOCTOR_UUID_HERE?date=2025-11-15"
```

**Success Response (200):**
```json
{
  "morning": ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
  "afternoon": ["02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"],
  "evening": ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"]
}
```

**Note:** Already booked slots are filtered out from the response.

---

### 5. Get Appointment by ID

**Endpoint:** `GET /api/appointments/:id`  
**Auth Required:** Yes (Patient, Doctor, or Admin)

**Example:**
```bash
curl http://localhost:3001/api/appointments/APPOINTMENT_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200):**
```json
{
  "id": "appointment-uuid",
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2025-11-15T00:00:00.000Z",
  "appointmentTime": "09:00 AM",
  "status": "CONFIRMED",
  "notes": "First consultation",
  "createdAt": "2025-11-12T03:00:00.000Z",
  "updatedAt": "2025-11-12T03:00:00.000Z",
  "patient": {
    "id": "patient-uuid",
    "name": "John Doe",
    "email": "patient@example.com",
    "gender": "MALE"
  },
  "doctor": {
    "id": "doctor-uuid",
    "name": "Dr. Sarah Smith",
    "email": "doctor@example.com",
    "specialty": "CARDIOLOGIST"
  }
}
```

**Error Responses:**
- `404` - Appointment not found
- `403` - Access denied (not patient, doctor, or admin)

---

### 6. Update Appointment Status (Doctor Approves/Rejects)

**Endpoint:** `PATCH /api/appointments/:id/status`  
**Auth Required:** Yes (Doctor only)  
**Role:** DOCTOR

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Available Status Values:**
- `PENDING` - Initial status
- `CONFIRMED` - Doctor approved
- `CANCELLED` - Cancelled by patient or doctor
- `COMPLETED` - Appointment completed

**Example - Doctor Confirms Appointment:**
```bash
curl -X PATCH http://localhost:3001/api/appointments/APPOINTMENT_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "status": "CONFIRMED"
  }'
```

**Example - Doctor Rejects Appointment:**
```bash
curl -X PATCH http://localhost:3001/api/appointments/APPOINTMENT_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "status": "CANCELLED"
  }'
```

**Example - Doctor Marks as Completed:**
```bash
curl -X PATCH http://localhost:3001/api/appointments/APPOINTMENT_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "status": "COMPLETED"
  }'
```

**Success Response (200):**
```json
{
  "id": "appointment-uuid",
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2025-11-15T00:00:00.000Z",
  "appointmentTime": "09:00 AM",
  "status": "CONFIRMED",
  "notes": "First consultation",
  "createdAt": "2025-11-12T03:00:00.000Z",
  "updatedAt": "2025-11-12T03:05:00.000Z",
  "patient": {
    "id": "patient-uuid",
    "name": "John Doe",
    "email": "patient@example.com",
    "gender": "MALE"
  },
  "doctor": {
    "id": "doctor-uuid",
    "name": "Dr. Sarah Smith",
    "email": "doctor@example.com",
    "specialty": "CARDIOLOGIST"
  }
}
```

**Error Responses:**
- `404` - Appointment not found
- `403` - Only the assigned doctor can update status

---

### 7. Get Patient Statistics

**Endpoint:** `GET /api/appointments/patient/stats`  
**Auth Required:** Yes (Patient only)  
**Role:** PATIENT

**Example:**
```bash
curl http://localhost:3001/api/appointments/patient/stats \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Success Response (200):**
```json
{
  "total": 12,
  "upcoming": 2,
  "completed": 8,
  "cancelled": 2
}
```

**Description:**
- `total` - Total number of appointments
- `upcoming` - Appointments with status PENDING or CONFIRMED
- `completed` - Appointments with status COMPLETED
- `cancelled` - Appointments with status CANCELLED

---

### 8. Get Doctor Statistics

**Endpoint:** `GET /api/appointments/doctor/stats`  
**Auth Required:** Yes (Doctor only)  
**Role:** DOCTOR

**Example:**
```bash
curl http://localhost:3001/api/appointments/doctor/stats \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

**Success Response (200):**
```json
{
  "totalPatients": 45,
  "todayAppointments": 8,
  "todayPending": 3,
  "weekAppointments": 42,
  "totalPending": 5
}
```

**Description:**
- `totalPatients` - Total unique patients who have booked with this doctor
- `todayAppointments` - Appointments scheduled for today (PENDING or CONFIRMED)
- `todayPending` - Today's appointments that are still PENDING
- `weekAppointments` - Appointments this week (Sunday to Saturday)
- `totalPending` - All pending appointments (not just today)

---

### 9. Cancel Appointment

**Endpoint:** `DELETE /api/appointments/:id`  
**Auth Required:** Yes (Patient or Doctor)

**Example - Patient Cancels:**
```bash
curl -X DELETE http://localhost:3001/api/appointments/APPOINTMENT_UUID \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

**Example - Doctor Cancels:**
```bash
curl -X DELETE http://localhost:3001/api/appointments/APPOINTMENT_UUID \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

**Success Response (200):**
```json
{
  "message": "Appointment cancelled successfully"
}
```

**Note:** This doesn't delete the appointment from the database, it marks it as `CANCELLED`.

**Error Responses:**
- `404` - Appointment not found
- `403` - Access denied (not patient or doctor)

---

## Complete Workflow Example

### Step 1: Get Doctor ID

First, you need to get a doctor's ID. You can register a doctor or use the seeded doctor:

```bash
# Login as doctor to get their ID
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "doctor123"
  }'
```

Copy the `id` from the response.

### Step 2: Check Available Slots

```bash
curl "http://localhost:3001/api/appointments/available-slots/DOCTOR_ID?date=2025-11-15"
```

### Step 3: Patient Books Appointment

```bash
# Login as patient
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "patient123"
  }'

# Book appointment
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -d '{
    "doctorId": "DOCTOR_ID",
    "appointmentDate": "2025-11-15",
    "appointmentTime": "09:00 AM",
    "notes": "First consultation"
  }'
```

### Step 4: Doctor Views Appointments

```bash
curl http://localhost:3001/api/appointments/doctor/my-appointments \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

### Step 5: Doctor Confirms Appointment

```bash
curl -X PATCH http://localhost:3001/api/appointments/APPOINTMENT_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{
    "status": "CONFIRMED"
  }'
```

### Step 6: Patient Views Their Appointments

```bash
curl http://localhost:3001/api/appointments/patient/my-appointments \
  -H "Authorization: Bearer PATIENT_TOKEN"
```

---

## Test Credentials

From the seeded database:

**Patient:**
- Email: `patient@example.com`
- Password: `patient123`

**Doctor:**
- Email: `doctor@example.com`
- Password: `doctor123`
- Specialty: CARDIOLOGIST

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

---

## Status Flow

```
PENDING (initial) 
    ↓
CONFIRMED (doctor approves)
    ↓
COMPLETED (after appointment)

OR

PENDING → CANCELLED (patient/doctor cancels)
```

---

## Notes

- Patients can only book appointments, not update status
- Doctors can update status (confirm, reject, complete)
- Both patients and doctors can cancel appointments
- Time slots are 30-minute intervals
- Appointments are organized by morning, afternoon, and evening
- Available slots automatically exclude already booked times
