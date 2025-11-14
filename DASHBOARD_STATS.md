# Dashboard Statistics API

## Overview

Statistics endpoints for patient and doctor dashboards to display appointment metrics.

---

## Patient Dashboard Stats

### Endpoint
```
GET /api/appointments/patient/stats
```

### Authentication
- **Required:** Yes
- **Role:** PATIENT only

### Response
```json
{
  "total": 12,
  "upcoming": 2,
  "completed": 8,
  "cancelled": 2
}
```

### Fields Explanation

| Field | Description | Calculation |
|-------|-------------|-------------|
| `total` | Total appointments | All appointments count |
| `upcoming` | Upcoming appointments | Status = PENDING or CONFIRMED |
| `completed` | Completed appointments | Status = COMPLETED |
| `cancelled` | Cancelled appointments | Status = CANCELLED |

### Usage Example

```bash
# Get patient token
PATIENT_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"patient123"}' | jq -r '.token')

# Get stats
curl http://localhost:3001/api/appointments/patient/stats \
  -H "Authorization: Bearer $PATIENT_TOKEN" | jq
```

### Frontend Integration (React/Next.js)

```typescript
const fetchPatientStats = async () => {
  const response = await fetch(
    'http://localhost:3001/api/appointments/patient/stats',
    {
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    }
  );
  const stats = await response.json();
  
  // stats = { total: 12, upcoming: 2, completed: 8, cancelled: 2 }
  return stats;
};

// Use in component
const PatientDashboard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetchPatientStats().then(setStats);
  }, []);
  
  return (
    <div className="stats-grid">
      <StatCard label="Total Appointments" value={stats?.total} />
      <StatCard label="Upcoming" value={stats?.upcoming} />
      <StatCard label="Completed" value={stats?.completed} />
      <StatCard label="Cancelled" value={stats?.cancelled} />
    </div>
  );
};
```

---

## Doctor Dashboard Stats

### Endpoint
```
GET /api/appointments/doctor/stats
```

### Authentication
- **Required:** Yes
- **Role:** DOCTOR only

### Response
```json
{
  "totalPatients": 45,
  "todayAppointments": 8,
  "todayPending": 3,
  "weekAppointments": 42,
  "totalPending": 5
}
```

### Fields Explanation

| Field | Description | Calculation |
|-------|-------------|-------------|
| `totalPatients` | Unique patients | Count of distinct patients who booked |
| `todayAppointments` | Today's appointments | Appointments today with PENDING or CONFIRMED status |
| `todayPending` | Today's pending | Today's appointments with PENDING status |
| `weekAppointments` | This week's total | All appointments this week (Sun-Sat) |
| `totalPending` | All pending | Total PENDING appointments (all dates) |

### Usage Example

```bash
# Get doctor token
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"doctor123"}' | jq -r '.token')

# Get stats
curl http://localhost:3001/api/appointments/doctor/stats \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq
```

### Frontend Integration (React/Next.js)

```typescript
const fetchDoctorStats = async () => {
  const response = await fetch(
    'http://localhost:3001/api/appointments/doctor/stats',
    {
      headers: {
        'Authorization': `Bearer ${doctorToken}`
      }
    }
  );
  const stats = await response.json();
  
  // stats = { totalPatients: 45, todayAppointments: 8, ... }
  return stats;
};

// Use in component
const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetchDoctorStats().then(setStats);
  }, []);
  
  return (
    <div className="stats-grid">
      <StatCard 
        label="Total Patients" 
        value={stats?.totalPatients} 
      />
      <StatCard 
        label="Today's Appointments" 
        value={stats?.todayAppointments}
        subtitle={`${stats?.todayPending} pending`}
      />
      <StatCard 
        label="This Week" 
        value={stats?.weekAppointments} 
      />
      <StatCard 
        label="Pending" 
        value={stats?.totalPending} 
      />
    </div>
  );
};
```

---

## Complete Dashboard Example

### Patient Dashboard Component

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function PatientDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('patientToken');
      const response = await fetch(
        'http://localhost:3001/api/appointments/patient/stats',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setStats(data);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Appointments',
      value: stats.total,
      icon: '📅',
      color: 'bg-blue-500'
    },
    {
      label: 'Upcoming',
      value: stats.upcoming,
      icon: '⏰',
      color: 'bg-green-500'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: '✅',
      color: 'bg-purple-500'
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: '❌',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6">
          <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
            {stat.icon}
          </div>
          <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
```

### Doctor Dashboard Component

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    todayPending: 0,
    weekAppointments: 0,
    totalPending: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('doctorToken');
      const response = await fetch(
        'http://localhost:3001/api/appointments/doctor/stats',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setStats(data);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      label: "Today's Appointments",
      value: stats.todayAppointments,
      subtitle: `${stats.todayPending} pending`,
      icon: '📅',
      color: 'bg-green-500'
    },
    {
      label: 'This Week',
      value: stats.weekAppointments,
      icon: '📊',
      color: 'bg-purple-500'
    },
    {
      label: 'Pending Approvals',
      value: stats.totalPending,
      icon: '⏳',
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6">
          <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
            {stat.icon}
          </div>
          <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          {stat.subtitle && (
            <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Testing

### Test Patient Stats

```bash
# Login as patient
PATIENT_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"patient123"}' | jq -r '.token')

# Get stats
curl http://localhost:3001/api/appointments/patient/stats \
  -H "Authorization: Bearer $PATIENT_TOKEN" | jq

# Expected output:
# {
#   "total": 2,
#   "upcoming": 2,
#   "completed": 0,
#   "cancelled": 0
# }
```

### Test Doctor Stats

```bash
# Login as doctor
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"doctor123"}' | jq -r '.token')

# Get stats
curl http://localhost:3001/api/appointments/doctor/stats \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq

# Expected output:
# {
#   "totalPatients": 1,
#   "todayAppointments": 0,
#   "todayPending": 0,
#   "weekAppointments": 2,
#   "totalPending": 2
# }
```

---

## Error Responses

### 403 Forbidden
```json
{
  "error": "Only patients can access this endpoint"
}
```
or
```json
{
  "error": "Only doctors can access this endpoint"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

---

## Notes

- Stats are calculated in real-time from the database
- Week starts on Sunday and ends on Saturday
- "Today" is based on server timezone
- All counts exclude soft-deleted appointments
- Patient stats show all their appointments regardless of doctor
- Doctor stats show all appointments with them regardless of patient

---

## API Endpoints Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/appointments/patient/stats` | GET | Patient | Get patient dashboard statistics |
| `/api/appointments/doctor/stats` | GET | Doctor | Get doctor dashboard statistics |

---

## Related Endpoints

- `GET /api/appointments/patient/my-appointments` - Get full appointment list
- `GET /api/appointments/doctor/my-appointments` - Get doctor's appointments
- `POST /api/appointments` - Book new appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
