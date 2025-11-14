# Doctor Profile Completion API

## Overview

After registration, doctors can complete their profile with additional information that will be displayed to patients.

---

## Endpoint

### Complete/Update Doctor Profile

**Endpoint:** `PATCH /api/users/doctor/complete-profile`  
**Auth Required:** Yes (Doctor only)  
**Role:** DOCTOR

**Description:** Updates doctor's profile with bio, hospital, and years of experience.

**Request Body:**
```json
{
  "bio": "Experienced cardiologist with over 15 years of practice...",
  "hospital": "Mount Adora Hospital",
  "experience": "15 years"
}
```

**Fields:**
- `bio` (optional) - Professional biography (max 500 characters)
- `hospital` (optional) - Hospital/clinic name (max 200 characters)
- `experience` (optional) - Years of experience (max 100 characters)

**Example:**
```bash
# Login as doctor
DOCTOR_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"doctor123"}' | jq -r '.token')

# Complete profile
curl -X PATCH http://localhost:3001/api/users/doctor/complete-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{
    "bio": "Experienced cardiologist with over 15 years of practice. Specialized in interventional cardiology and preventive heart care.",
    "hospital": "Mount Adora Hospital",
    "experience": "15 years"
  }' | jq
```

**Success Response (200):**
```json
{
  "id": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
  "email": "doctor@example.com",
  "name": "Dr. Sarah Smith",
  "role": "DOCTOR",
  "specialty": "CARDIOLOGIST",
  "bio": "Experienced cardiologist with over 15 years of practice. Specialized in interventional cardiology and preventive heart care.",
  "hospital": "Mount Adora Hospital",
  "experience": "15 years"
}
```

**Error Responses:**

### 403 Forbidden
```json
{
  "error": "Only doctors can complete profile"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "error": [
    {
      "code": "too_big",
      "maximum": 500,
      "type": "string",
      "path": ["bio"],
      "message": "String must contain at most 500 character(s)"
    }
  ]
}
```

---

## Get Current User Profile

**Endpoint:** `GET /api/users/me`  
**Auth Required:** Yes  
**Role:** Any

**Description:** Gets the current user's profile including all fields.

**Example:**
```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq
```

**Success Response (200):**
```json
{
  "id": "6d3e82da-ba69-41c0-a3c2-18e5f153940e",
  "email": "doctor@example.com",
  "name": "Dr. Sarah Smith",
  "role": "DOCTOR",
  "gender": null,
  "specialty": "CARDIOLOGIST",
  "bio": "Experienced cardiologist with over 15 years of practice...",
  "hospital": "Mount Adora Hospital",
  "experience": "15 years",
  "createdAt": "2025-11-12T03:20:30.378Z"
}
```

---

## Frontend Integration

### Complete Profile Page

Update your `handleSubmit` function in `/doctor/complete-profile/page.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token'); // or however you store it
    
    const response = await fetch(
      'http://localhost:3001/api/users/doctor/complete-profile',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('Profile completed:', data);
      router.push('/doctor/dashboard');
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    console.error('Failed to complete profile:', error);
    alert('Failed to save profile. Please try again.');
  }
};
```

### Load Existing Profile (Optional)

If you want to allow doctors to edit their profile later:

```typescript
useEffect(() => {
  const loadProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      'http://localhost:3001/api/users/me',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    if (response.ok) {
      const user = await response.json();
      setProfileData({
        bio: user.bio || '',
        hospital: user.hospital || '',
        experience: user.experience || ''
      });
    }
  };

  loadProfile();
}, []);
```

---

## Database Schema

### User Model (Updated)

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String
  name       String
  role       Role     @default(PATIENT)
  gender     Gender?
  specialty  Specialty?
  bio        String?        // NEW
  hospital   String?        // NEW
  experience String?        // NEW
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**New Fields:**
- `bio` - Text field for professional biography (optional, max 500 chars)
- `hospital` - Text field for hospital/clinic name (optional, max 200 chars)
- `experience` - Text field for years of experience (optional, max 100 chars)

---

## Workflow

### 1. Doctor Registers

```bash
curl -X POST http://localhost:3001/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "email": "john.doctor@example.com",
    "password": "password123",
    "specialty": "CARDIOLOGIST"
  }'
```

### 2. Doctor Completes Profile

```bash
# Use token from registration
curl -X PATCH http://localhost:3001/api/users/doctor/complete-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bio": "Board-certified cardiologist...",
    "hospital": "City Medical Center",
    "experience": "10 years"
  }'
```

### 3. Profile is Visible to Patients

When patients view doctor details, they see:
- Name
- Specialty
- Bio
- Hospital
- Experience
- Availability

---

## Validation Rules

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| `bio` | String | No | 500 chars | Professional biography |
| `hospital` | String | No | 200 chars | Hospital/clinic name |
| `experience` | String | No | 100 chars | Can be any format (e.g., "5 years", "10+ years") |

---

## Notes

- All fields are optional - doctors can skip profile completion
- Fields can be updated anytime by calling the same endpoint
- Profile information is returned in login response
- Profile is visible to patients when viewing doctor details
- Only doctors can update their profile (patients cannot)

---

## Complete Example

```bash
# 1. Register as doctor
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Emily Brown",
    "email": "emily.doctor@example.com",
    "password": "password123",
    "specialty": "PEDIATRICIAN"
  }')

# 2. Extract token
TOKEN=$(echo $RESPONSE | jq -r '.token')

# 3. Complete profile
curl -X PATCH http://localhost:3001/api/users/doctor/complete-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bio": "Pediatrician with a passion for child healthcare. Specialized in developmental pediatrics and preventive care.",
    "hospital": "Children's Medical Center",
    "experience": "8 years"
  }' | jq

# 4. Verify profile
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Error Handling

### Frontend Example

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      'http://localhost:3001/api/users/doctor/complete-profile',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save profile');
    }

    const data = await response.json();
    console.log('Profile saved:', data);
    router.push('/doctor/dashboard');
    
  } catch (error) {
    console.error('Error:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Related Endpoints

- `POST /api/auth/register/doctor` - Register as doctor
- `POST /api/auth/login` - Login
- `GET /api/users/me` - Get current user
- `GET /api/availability/doctor/:doctorId` - Get doctor availability
- `GET /api/appointments/doctor/my-appointments` - Get doctor's appointments
