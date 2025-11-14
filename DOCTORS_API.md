# Doctors Listing API

## Overview

Endpoints to get a list of all doctors and view detailed information about a specific doctor.

---

## Endpoints

### 1. Get All Doctors

**Endpoint:** `GET /api/users/doctors`  
**Auth Required:** No (Public)

**Description:** Gets a list of all registered doctors with their basic information.

**Query Parameters:**
- `specialty` (optional) - Filter doctors by specialty (e.g., CARDIOLOGIST, PEDIATRICIAN)

**Example - Get All Doctors:**
```bash
curl http://localhost:3001/api/users/doctors | jq
```

**Example - Filter by Specialty:**
```bash
curl "http://localhost:3001/api/users/doctors?specialty=CARDIOLOGIST" | jq
```

**Success Response (200):**
```json
[
  {
    "id": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
    "name": "Dr. Sarah Smith",
    "email": "doctor@example.com",
    "specialty": "CARDIOLOGIST",
    "bio": "Experienced cardiologist with over 15 years of practice...",
    "hospital": "Mount Adora Hospital",
    "experience": "15 years",
    "createdAt": "2025-11-12T03:20:30.378Z"
  },
  {
    "id": "another-doctor-id",
    "name": "Dr. John Doe",
    "email": "john@example.com",
    "specialty": "PEDIATRICIAN",
    "bio": "Pediatrician specializing in child healthcare...",
    "hospital": "Children's Medical Center",
    "experience": "8 years",
    "createdAt": "2025-11-11T10:15:00.000Z"
  }
]
```

---

### 2. Get Doctor by ID

**Endpoint:** `GET /api/users/doctors/:id`  
**Auth Required:** No (Public)

**Description:** Gets detailed information about a specific doctor including availability and statistics.

**Example:**
```bash
# Get doctor ID from the list
DOCTOR_ID="6d3e82da-ba69-41c0-a3c2-18e5f153940e"

# Get doctor details
curl "http://localhost:3001/api/users/doctors/$DOCTOR_ID" | jq
```

**Success Response (200):**
```json
{
  "id": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
  "name": "Dr. Sarah Smith",
  "email": "doctor@example.com",
  "role": "DOCTOR",
  "specialty": "CARDIOLOGIST",
  "bio": "Experienced cardiologist with over 15 years of practice. Specialized in interventional cardiology and preventive heart care.",
  "hospital": "Mount Adora Hospital",
  "experience": "15 years",
  "createdAt": "2025-11-12T03:20:30.378Z",
  "availability": {
    "days": [1, 2, 3, 4, 5],
    "slots": {
      "1": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
      "2": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
      "3": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
      "4": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
      "5": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"]
    }
  },
  "stats": {
    "totalPatients": 45,
    "totalAppointments": 127
  }
}
```

**Response Fields:**
- `id` - Doctor's unique ID
- `name` - Doctor's full name
- `email` - Doctor's email
- `role` - Always "DOCTOR"
- `specialty` - Medical specialty
- `bio` - Professional biography
- `hospital` - Hospital/clinic name
- `experience` - Years of experience
- `createdAt` - Account creation date
- `availability.days` - Array of available day numbers (0=Sunday, 6=Saturday)
- `availability.slots` - Object mapping each day to available time slots
- `stats.totalPatients` - Number of unique patients who have booked
- `stats.totalAppointments` - Total number of appointments

**Error Response (404):**
```json
{
  "error": "Doctor not found"
}
```

or

```json
{
  "error": "User is not a doctor"
}
```

---

## Available Specialties

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

---

## Frontend Integration

### Doctors List Page

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const url = selectedSpecialty
        ? `http://localhost:3001/api/users/doctors?specialty=${selectedSpecialty}`
        : 'http://localhost:3001/api/users/doctors';
      
      const response = await fetch(url);
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Specialty filter */}
      <select
        value={selectedSpecialty}
        onChange={(e) => setSelectedSpecialty(e.target.value)}
      >
        <option value="">All Specialties</option>
        <option value="CARDIOLOGIST">Cardiologist</option>
        <option value="PEDIATRICIAN">Pediatrician</option>
        {/* ... other specialties */}
      </select>

      {/* Doctors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
```

### Doctor Details Page

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function DoctorDetails() {
  const params = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorDetails();
  }, [params.id]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/doctors/${params.id}`
      );
      const data = await response.json();
      setDoctor(data);
    } catch (error) {
      console.error('Failed to fetch doctor details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!doctor) return <div>Doctor not found</div>;

  return (
    <div>
      <h1>{doctor.name}</h1>
      <p>{doctor.specialty}</p>
      <p>{doctor.bio}</p>
      <p>Hospital: {doctor.hospital}</p>
      <p>Experience: {doctor.experience}</p>
      
      {/* Availability */}
      <div>
        <h2>Available Days</h2>
        {doctor.availability.days.map(day => (
          <div key={day}>
            Day {day}: {doctor.availability.slots[day].join(', ')}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div>
        <p>Total Patients: {doctor.stats.totalPatients}</p>
        <p>Total Appointments: {doctor.stats.totalAppointments}</p>
      </div>

      {/* Book appointment button */}
      <button onClick={() => bookAppointment(doctor.id)}>
        Book Appointment
      </button>
    </div>
  );
}
```

---

## Use Cases

### 1. Browse All Doctors
```bash
curl http://localhost:3001/api/users/doctors
```

### 2. Find Cardiologists
```bash
curl "http://localhost:3001/api/users/doctors?specialty=CARDIOLOGIST"
```

### 3. View Doctor Profile
```bash
curl "http://localhost:3001/api/users/doctors/6d3e82da-ba69-41c0-a3c2-18e5f153940e"
```

### 4. Check Doctor's Availability
```bash
# Get doctor details which includes availability
curl "http://localhost:3001/api/users/doctors/DOCTOR_ID" | jq '.availability'
```

---

## Complete Booking Flow

### 1. Patient Browses Doctors
```typescript
const doctors = await fetch('http://localhost:3001/api/users/doctors')
  .then(r => r.json());
```

### 2. Patient Selects a Doctor
```typescript
const doctor = await fetch(`http://localhost:3001/api/users/doctors/${doctorId}`)
  .then(r => r.json());
```

### 3. Patient Views Availability
```typescript
// From doctor details
const availableDays = doctor.availability.days;
const timeSlots = doctor.availability.slots;
```

### 4. Patient Books Appointment
```typescript
const response = await fetch('http://localhost:3001/api/appointments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${patientToken}`
  },
  body: JSON.stringify({
    doctorId: doctor.id,
    appointmentDate: '2025-11-15',
    appointmentTime: '09:00 AM',
    notes: 'First consultation'
  })
});
```

---

## Response Examples

### All Doctors (Empty)
```json
[]
```

### All Doctors (With Data)
```json
[
  {
    "id": "uuid-1",
    "name": "Dr. Sarah Smith",
    "specialty": "CARDIOLOGIST",
    "bio": "...",
    "hospital": "Mount Adora Hospital",
    "experience": "15 years"
  },
  {
    "id": "uuid-2",
    "name": "Dr. John Doe",
    "specialty": "PEDIATRICIAN",
    "bio": "...",
    "hospital": "Children's Hospital",
    "experience": "8 years"
  }
]
```

### Doctor Details (With Availability)
```json
{
  "id": "uuid",
  "name": "Dr. Sarah Smith",
  "specialty": "CARDIOLOGIST",
  "bio": "Experienced cardiologist...",
  "hospital": "Mount Adora Hospital",
  "experience": "15 years",
  "availability": {
    "days": [1, 2, 3, 4, 5],
    "slots": {
      "1": ["09:00 AM", "10:00 AM"],
      "2": ["09:00 AM", "10:00 AM"]
    }
  },
  "stats": {
    "totalPatients": 45,
    "totalAppointments": 127
  }
}
```

---

## Notes

- Both endpoints are **public** (no authentication required)
- Doctors are ordered by creation date (newest first)
- Specialty filter is case-sensitive
- Doctor details include availability and statistics
- Availability shows which days and time slots doctor is available
- Stats show total unique patients and total appointments

---

## Related Endpoints

- `GET /api/availability/doctor/:doctorId` - Get doctor availability (alternative)
- `POST /api/appointments` - Book appointment with doctor
- `GET /api/appointments/available-slots/:doctorId?date=YYYY-MM-DD` - Check available slots for specific date
