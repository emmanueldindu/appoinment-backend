# Quick Reference - Appointments API

## 🚀 Server
```bash
cd /Users/theoneglobal/Desktop/appointment/backend
npm run dev
```
**URL:** `http://localhost:3001`

---

## 🔑 Test Accounts

| Role | Email | Password | ID |
|------|-------|----------|-----|
| Patient | patient@example.com | patient123 | 7a97370f-fcaa-4b62-86c5-1fcbb9bf0d21 |
| Doctor | doctor@example.com | doctor123 | 6d3e82da-ba69-41c0-a3c2-18e5f153940e |
| Admin | admin@example.com | admin123 | - |

---

## 📍 Quick Commands

### Get Tokens
```bash
# Patient Token
PATIENT_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"patient123"}' | jq -r '.token')

# Doctor Token
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"doctor123"}' | jq -r '.token')
```

### Check Available Slots
```bash
curl "http://localhost:3001/api/appointments/available-slots/6d3e82da-ba69-41c0-a3c2-18e5f153940e?date=2025-11-15" | jq
```

### Book Appointment (Patient)
```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "doctorId": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
    "appointmentDate": "2025-11-15",
    "appointmentTime": "09:00 AM",
    "notes": "First consultation"
  }' | jq
```

### View Patient Appointments
```bash
curl http://localhost:3001/api/appointments/patient/my-appointments \
  -H "Authorization: Bearer $PATIENT_TOKEN" | jq
```

### View Doctor Appointments
```bash
curl http://localhost:3001/api/appointments/doctor/my-appointments \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq
```

### Get Patient Stats
```bash
curl http://localhost:3001/api/appointments/patient/stats \
  -H "Authorization: Bearer $PATIENT_TOKEN" | jq
```

### Get Doctor Stats
```bash
curl http://localhost:3001/api/appointments/doctor/stats \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq
```

### Approve Appointment (Doctor)
```bash
curl -X PATCH http://localhost:3001/api/appointments/APPOINTMENT_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{"status":"CONFIRMED"}' | jq
```

### Reject Appointment (Doctor)
```bash
curl -X PATCH http://localhost:3001/api/appointments/APPOINTMENT_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{"status":"CANCELLED"}' | jq
```

### Set Doctor Availability
```bash
curl -X POST http://localhost:3001/api/availability/doctor/set-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{"availableDays":[1,2,3,4,5],"timeSlots":["09:00 AM","10:00 AM","02:00 PM"]}' | jq
```

### Get Doctor Availability
```bash
curl http://localhost:3001/api/availability/doctor/my-availability \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq
```

### Get All Doctors
```bash
curl http://localhost:3001/api/users/doctors | jq
```

### Get Doctors by Specialty
```bash
curl "http://localhost:3001/api/users/doctors?specialty=CARDIOLOGIST" | jq
```

### Get Doctor Details by ID
```bash
curl "http://localhost:3001/api/users/doctors/DOCTOR_ID" | jq
```

### Get Current User Profile
```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Update Patient Profile
```bash
curl -X PATCH http://localhost:3001/api/users/patient/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{"name":"John Doe","phone":"+1234567890","gender":"MALE"}' | jq
```

### Update Doctor Profile
```bash
curl -X PATCH http://localhost:3001/api/users/doctor/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{"name":"Dr. Smith","bio":"Updated bio","hospital":"Hospital Name"}' | jq
```

---

## 📋 Status Values

- `PENDING` - Initial booking
- `CONFIRMED` - Doctor approved
- `CANCELLED` - Rejected/Cancelled
- `COMPLETED` - Finished

---

## 🎯 Frontend Integration

### React/Next.js Example

```typescript
// Book appointment
const bookAppointment = async (doctorId: string, date: string, time: string) => {
  const response = await fetch('http://localhost:3001/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      doctorId,
      appointmentDate: date,
      appointmentTime: time,
      notes: "Optional notes"
    })
  });
  return response.json();
};

// Get available slots
const getAvailableSlots = async (doctorId: string, date: string) => {
  const response = await fetch(
    `http://localhost:3001/api/appointments/available-slots/${doctorId}?date=${date}`
  );
  return response.json();
};
```

---

## 🛠️ Useful Commands

```bash
# View database
npm run prisma:studio

# Reset database
npm run prisma:migrate reset

# Reseed database
npm run prisma:seed

# Check server health
curl http://localhost:3001/health
```

---

## 📚 Documentation

- **APPOINTMENTS_API.md** - Full API documentation
- **APPOINTMENTS_COMPLETE.md** - Implementation summary
- **DASHBOARD_STATS.md** - Dashboard statistics guide
- **AVAILABILITY_API.md** - Doctor availability API
- **AVAILABILITY_COMPLETE.md** - Availability implementation guide
- **DOCTORS_API.md** - Doctors listing and details API
- **DOCTOR_PROFILE_API.md** - Doctor profile completion API
- **PROFILE_UPDATE_API.md** - Profile update endpoints (patient & doctor)
- **API_TESTS.md** - All API endpoints
