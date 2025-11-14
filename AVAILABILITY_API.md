# Doctor Availability API

## Overview

Doctors can set their available days and time slots. This availability is used to show when patients can book appointments.

---

## Endpoints

### 1. Set Doctor Availability

**Endpoint:** `POST /api/availability/doctor/set-availability`  
**Auth Required:** Yes (Doctor only)  
**Role:** DOCTOR

**Description:** Sets the doctor's availability. This replaces all existing availability settings.

**Request Body:**
```json
{
  "availableDays": [1, 2, 3, 4, 5],
  "timeSlots": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"]
}
```

**Fields:**
- `availableDays` - Array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
- `timeSlots` - Array of time slot strings (e.g., "09:00 AM")

**Example:**
```bash
# Login as doctor
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"doctor123"}' | jq -r '.token')

# Set availability (Monday-Friday, 6 time slots)
curl -X POST http://localhost:3001/api/availability/doctor/set-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{
    "availableDays": [1, 2, 3, 4, 5],
    "timeSlots": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"]
  }' | jq
```

**Success Response (201):**
```json
{
  "message": "Availability updated successfully",
  "totalSlots": 30,
  "availableDays": [1, 2, 3, 4, 5],
  "timeSlots": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"]
}
```

**Note:** `totalSlots` = number of days × number of time slots (5 days × 6 slots = 30 total slots)

---

### 2. Get Doctor's Own Availability

**Endpoint:** `GET /api/availability/doctor/my-availability`  
**Auth Required:** Yes (Doctor only)  
**Role:** DOCTOR

**Description:** Gets the logged-in doctor's availability settings.

**Example:**
```bash
curl http://localhost:3001/api/availability/doctor/my-availability \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq
```

**Success Response (200):**
```json
{
  "availableDays": [1, 2, 3, 4, 5],
  "timeSlots": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
  "details": {
    "1": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
    "2": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
    "3": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
    "4": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
    "5": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"]
  }
}
```

**Fields:**
- `availableDays` - Array of day numbers that doctor is available
- `timeSlots` - Unique list of all time slots
- `details` - Object mapping each day to its time slots

---

### 3. Get Specific Doctor's Availability (Public)

**Endpoint:** `GET /api/availability/doctor/:doctorId`  
**Auth Required:** No (Public)

**Description:** Gets a specific doctor's availability. Used by patients to see when they can book.

**Example:**
```bash
# Get doctor ID
DOCTOR_ID=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"doctor123"}' | jq -r '.user.id')

# Get availability (no auth needed)
curl "http://localhost:3001/api/availability/doctor/$DOCTOR_ID" | jq
```

**Success Response (200):**
```json
{
  "doctorId": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
  "doctorName": "Dr. Sarah Smith",
  "availableDays": [1, 2, 3, 4, 5],
  "availability": {
    "1": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
    "2": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
    "3": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
    "4": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"],
    "5": ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"]
  }
}
```

**Error Response (404):**
```json
{
  "error": "Doctor not found"
}
```

---

### 4. Clear Doctor Availability

**Endpoint:** `DELETE /api/availability/doctor/clear-availability`  
**Auth Required:** Yes (Doctor only)  
**Role:** DOCTOR

**Description:** Clears all availability settings for the doctor.

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/availability/doctor/clear-availability \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq
```

**Success Response (200):**
```json
{
  "message": "Availability cleared successfully"
}
```

---

## Frontend Integration

### Doctor Availability Settings Page

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function DoctorAvailability() {
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load existing availability
  useEffect(() => {
    const fetchAvailability = async () => {
      const token = localStorage.getItem('doctorToken');
      const response = await fetch(
        'http://localhost:3001/api/availability/doctor/my-availability',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAvailableDays(data.availableDays);
        setSelectedSlots(data.timeSlots);
      }
    };

    fetchAvailability();
  }, []);

  // Save availability
  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem('doctorToken');
    
    const response = await fetch(
      'http://localhost:3001/api/availability/doctor/set-availability',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          availableDays,
          timeSlots: selectedSlots
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      alert(`Availability saved! ${data.totalSlots} slots created.`);
    } else {
      alert('Failed to save availability');
    }
    
    setLoading(false);
  };

  return (
    <div>
      {/* Day selection UI */}
      {/* Time slot selection UI */}
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
}
```

### Patient Viewing Doctor Availability

```typescript
const fetchDoctorAvailability = async (doctorId: string) => {
  const response = await fetch(
    `http://localhost:3001/api/availability/doctor/${doctorId}`
  );
  const data = await response.json();
  
  // data.availableDays = [1, 2, 3, 4, 5]
  // data.availability = { "1": ["09:00 AM", ...], ... }
  
  return data;
};
```

---

## Day Number Reference

| Number | Day |
|--------|-----|
| 0 | Sunday |
| 1 | Monday |
| 2 | Tuesday |
| 3 | Wednesday |
| 4 | Thursday |
| 5 | Friday |
| 6 | Saturday |

---

## Common Time Slots

**Morning:**
- 09:00 AM, 09:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM

**Afternoon:**
- 02:00 PM, 02:30 PM, 03:00 PM, 03:30 PM, 04:00 PM, 04:30 PM

**Evening:**
- 05:00 PM, 05:30 PM, 06:00 PM, 06:30 PM, 07:00 PM

---

## Complete Workflow

### 1. Doctor Sets Availability

```bash
# Doctor logs in
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"doctor123"}' | jq -r '.token')

# Doctor sets availability (Mon-Fri, morning & afternoon)
curl -X POST http://localhost:3001/api/availability/doctor/set-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{
    "availableDays": [1, 2, 3, 4, 5],
    "timeSlots": [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
    ]
  }'
```

### 2. Patient Views Doctor's Availability

```bash
# Get doctor ID
DOCTOR_ID="6d3e82da-ba69-41c0-a3c2-18e5f153940e"

# View availability (no auth needed)
curl "http://localhost:3001/api/availability/doctor/$DOCTOR_ID"
```

### 3. Patient Books Appointment

```bash
# Patient books during available slot
PATIENT_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"patient123"}' | jq -r '.token')

curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "doctorId": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
    "appointmentDate": "2025-11-13",
    "appointmentTime": "09:00 AM"
  }'
```

---

## Notes

- Setting availability **replaces** all existing settings
- Each combination of (day, time slot) creates one availability record
- Availability is checked when patients book appointments
- Doctors can update their availability anytime
- Public endpoint allows patients to see availability without authentication
- Days are 0-indexed (0=Sunday, 6=Saturday)

---

## Error Responses

### 403 Forbidden
```json
{
  "error": "Only doctors can set availability"
}
```

### 404 Not Found
```json
{
  "error": "Doctor not found"
}
```

### 400 Bad Request
```json
{
  "error": [
    {
      "code": "invalid_type",
      "expected": "array",
      "received": "string",
      "path": ["availableDays"]
    }
  ]
}
```
