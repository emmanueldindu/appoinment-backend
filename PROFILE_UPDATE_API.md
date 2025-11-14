# Profile Update API

## Overview

Endpoints for patients and doctors to view and update their profile information.

---

## Endpoints

### 1. Get Current User Profile

**Endpoint:** `GET /api/users/me`  
**Auth Required:** Yes (Any role)

**Description:** Gets the current authenticated user's complete profile.

**Example:**
```bash
# Patient
PATIENT_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"patient123"}' | jq -r '.token')

curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $PATIENT_TOKEN" | jq
```

**Success Response (200) - Patient:**
```json
{
  "id": "7a97370f-fcaa-4b62-86c5-1fcbb9bf0d21",
  "email": "patient@example.com",
  "name": "John Doe",
  "role": "PATIENT",
  "gender": "MALE",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "address": "123 Main St, New York",
  "bloodGroup": "O+",
  "allergies": "Penicillin",
  "specialty": null,
  "bio": null,
  "hospital": null,
  "experience": null,
  "licenseNumber": null,
  "consultationFee": null,
  "education": null,
  "createdAt": "2025-11-12T03:20:30.302Z"
}
```

**Success Response (200) - Doctor:**
```json
{
  "id": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
  "email": "doctor@example.com",
  "name": "Dr. Sarah Smith",
  "role": "DOCTOR",
  "specialty": "CARDIOLOGIST",
  "bio": "Experienced cardiologist...",
  "hospital": "Mount Adora Hospital",
  "experience": "15 years",
  "phone": "+1987654321",
  "address": "456 Medical Center",
  "licenseNumber": "MD-12345",
  "consultationFee": "200",
  "education": "MD - Harvard Medical School",
  "gender": null,
  "dateOfBirth": null,
  "bloodGroup": null,
  "allergies": null,
  "createdAt": "2025-11-12T03:20:30.378Z"
}
```

---

### 2. Update Patient Profile

**Endpoint:** `PATCH /api/users/patient/update-profile`  
**Auth Required:** Yes (Patient only)

**Description:** Updates patient's profile information.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "address": "123 Main St, New York",
  "bloodGroup": "O+",
  "allergies": "Penicillin, Peanuts"
}
```

**Fields:**
- `name` (optional) - Full name (2-100 characters)
- `phone` (optional) - Phone number (max 20 characters)
- `dateOfBirth` (optional) - Date of birth (YYYY-MM-DD format)
- `gender` (optional) - MALE or FEMALE
- `address` (optional) - Full address (max 500 characters)
- `bloodGroup` (optional) - Blood group (max 10 characters)
- `allergies` (optional) - Allergies (max 500 characters)

**Example:**
```bash
PATIENT_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"patient123"}' | jq -r '.token')

curl -X PATCH http://localhost:3001/api/users/patient/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "name": "John Doe Updated",
    "phone": "+1234567890",
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "address": "123 Main St, New York",
    "bloodGroup": "O+",
    "allergies": "Penicillin"
  }' | jq
```

**Success Response (200):**
```json
{
  "id": "7a97370f-fcaa-4b62-86c5-1fcbb9bf0d21",
  "email": "patient@example.com",
  "name": "John Doe Updated",
  "role": "PATIENT",
  "gender": "MALE",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "address": "123 Main St, New York",
  "bloodGroup": "O+",
  "allergies": "Penicillin",
  "createdAt": "2025-11-12T03:20:30.302Z"
}
```

**Error Responses:**

### 403 Forbidden
```json
{
  "error": "Only patients can update patient profile"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "error": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "path": ["name"],
      "message": "String must contain at least 2 character(s)"
    }
  ]
}
```

---

### 3. Update Doctor Profile

**Endpoint:** `PATCH /api/users/doctor/update-profile`  
**Auth Required:** Yes (Doctor only)

**Description:** Updates doctor's profile information.

**Request Body:**
```json
{
  "name": "Dr. Sarah Smith",
  "phone": "+1987654321",
  "bio": "Experienced cardiologist specializing in interventional cardiology",
  "hospital": "Mount Adora Hospital",
  "experience": "15 years",
  "address": "456 Medical Center, NY",
  "licenseNumber": "MD-12345",
  "consultationFee": "200",
  "education": "MD - Harvard Medical School"
}
```

**Fields:**
- `name` (optional) - Full name (2-100 characters)
- `phone` (optional) - Phone number (max 20 characters)
- `bio` (optional) - Professional biography (max 500 characters)
- `hospital` (optional) - Hospital/clinic name (max 200 characters)
- `experience` (optional) - Years of experience (max 100 characters)
- `address` (optional) - Full address (max 500 characters)
- `licenseNumber` (optional) - Medical license number (max 50 characters)
- `consultationFee` (optional) - Consultation fee (max 20 characters)
- `education` (optional) - Educational background (max 300 characters)

**Example:**
```bash
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"doctor123"}' | jq -r '.token')

curl -X PATCH http://localhost:3001/api/users/doctor/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{
    "name": "Dr. Sarah Smith Updated",
    "phone": "+1987654321",
    "bio": "Updated bio - Experienced cardiologist",
    "hospital": "Mount Adora Hospital",
    "experience": "16 years",
    "licenseNumber": "MD-12345",
    "consultationFee": "200",
    "education": "MD - Harvard Medical School"
  }' | jq
```

**Success Response (200):**
```json
{
  "id": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
  "email": "doctor@example.com",
  "name": "Dr. Sarah Smith Updated",
  "role": "DOCTOR",
  "specialty": "CARDIOLOGIST",
  "bio": "Updated bio - Experienced cardiologist",
  "hospital": "Mount Adora Hospital",
  "experience": "16 years",
  "phone": "+1987654321",
  "address": null,
  "licenseNumber": "MD-12345",
  "consultationFee": "200",
  "education": "MD - Harvard Medical School",
  "createdAt": "2025-11-12T03:20:30.378Z"
}
```

**Error Responses:**

### 403 Forbidden
```json
{
  "error": "Only doctors can update doctor profile"
}
```

---

## Frontend Integration

### Patient Profile Page

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function PatientProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    bloodGroup: '',
    allergies: ''
  });
  const [loading, setLoading] = useState(false);

  // Load current profile
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        setFormData({
          fullName: user.name || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
          gender: user.gender || 'MALE',
          address: user.address || '',
          bloodGroup: user.bloodGroup || '',
          allergies: user.allergies || ''
        });
      }
    };
    
    loadProfile();
  }, []);

  // Update profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        'http://localhost:3001/api/users/patient/update-profile',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.fullName,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address,
            bloodGroup: formData.bloodGroup,
            allergies: formData.allergies
          })
        }
      );

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

### Doctor Profile Page

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function DoctorProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
    hospital: '',
    experience: '',
    address: '',
    licenseNumber: '',
    consultationFee: '',
    education: ''
  });
  const [loading, setLoading] = useState(false);

  // Load current profile
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        setFormData({
          fullName: user.name || '',
          phone: user.phone || '',
          bio: user.bio || '',
          hospital: user.hospital || '',
          experience: user.experience || '',
          address: user.address || '',
          licenseNumber: user.licenseNumber || '',
          consultationFee: user.consultationFee || '',
          education: user.education || ''
        });
      }
    };
    
    loadProfile();
  }, []);

  // Update profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        'http://localhost:3001/api/users/doctor/update-profile',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.fullName,
            phone: formData.phone,
            bio: formData.bio,
            hospital: formData.hospital,
            experience: formData.experience,
            address: formData.address,
            licenseNumber: formData.licenseNumber,
            consultationFee: formData.consultationFee,
            education: formData.education
          })
        }
      );

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

---

## Database Schema

### User Model (Complete)

```prisma
model User {
  id               String    @id @default(uuid())
  email            String    @unique
  password         String
  name             String
  role             Role      @default(PATIENT)
  
  // Common fields
  gender           Gender?
  phone            String?
  address          String?
  
  // Patient-specific fields
  dateOfBirth      DateTime?
  bloodGroup       String?
  allergies        String?
  
  // Doctor-specific fields
  specialty        Specialty?
  bio              String?
  hospital         String?
  experience       String?
  licenseNumber    String?
  consultationFee  String?
  education        String?
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

---

## Validation Rules

### Patient Profile

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| `name` | String | No | 100 chars | Min 2 characters |
| `phone` | String | No | 20 chars | - |
| `dateOfBirth` | Date | No | - | YYYY-MM-DD format |
| `gender` | Enum | No | - | MALE or FEMALE |
| `address` | String | No | 500 chars | - |
| `bloodGroup` | String | No | 10 chars | - |
| `allergies` | String | No | 500 chars | - |

### Doctor Profile

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| `name` | String | No | 100 chars | Min 2 characters |
| `phone` | String | No | 20 chars | - |
| `bio` | String | No | 500 chars | - |
| `hospital` | String | No | 200 chars | - |
| `experience` | String | No | 100 chars | - |
| `address` | String | No | 500 chars | - |
| `licenseNumber` | String | No | 50 chars | - |
| `consultationFee` | String | No | 20 chars | - |
| `education` | String | No | 300 chars | - |

---

## Notes

- All fields are optional in update requests
- Only provide fields you want to update
- Email cannot be changed via these endpoints
- Role cannot be changed
- Specialty cannot be changed (for doctors)
- Profile updates are immediate
- Returns updated user object on success

---

## Related Endpoints

- `POST /api/auth/register/patient` - Register as patient
- `POST /api/auth/register/doctor` - Register as doctor
- `POST /api/auth/login` - Login
- `PATCH /api/users/doctor/complete-profile` - Initial profile completion (doctors)
- `GET /api/users/doctors/:id` - View doctor profile (public)
