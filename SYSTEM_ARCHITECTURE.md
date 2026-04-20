# Care Execution MVP - Complete System Architecture

**Last Updated**: April 17, 2026  
**Current Environment**: Development  
**Database**: SQL Server  
**Backend Framework**: .NET 9.0 ASP.NET Core  
**Frontend Framework**: React Native (Expo)

---

## Table of Contents
1. [Database Schema](#database-schema)
2. [Backend Services](#backend-services)
3. [Backend Controllers & API Endpoints](#backend-controllers--api-endpoints)
4. [Frontend Screens](#frontend-screens)
5. [API Integration Points](#api-integration-points)
6. [Authentication Flow](#authentication-flow)
7. [Role-Based Access Control](#role-based-access-control)
8. [Data Models (DTOs)](#data-models-dtos)
9. [System Workflows](#system-workflows)
10. [Architecture Gaps & Corrections](#architecture-gaps--corrections)

---

## Database Schema

### Entities Overview

#### 1. **User** Entity
**File**: `CareExecution.Domain/Entities/Users.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique user identifier |
| `Email` | string | User email address (unique) |
| `PasswordHash` | string | Hashed password (BCrypt) |
| `Role` | string | "Doctor" or "Patient" |
| `PractitionerId` | Guid? (FK) | Reference to Practitioner (if Doctor) |
| `PatientId` | Guid? (FK) | Reference to Patient (if Patient) |
| `CreatedAt` | DateTime | Account creation timestamp |

**Relationships**:
- One-to-One: `User` → `Practitioner` (if role is Doctor)
- One-to-One: `User` → `Patient` (if role is Patient)

---

#### 2. **Patient** Entity
**File**: `CareExecution.Domain/Entities/Patient.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique patient identifier |
| `PractitionerId` | Guid (FK) | Reference to assigned practitioner |
| `Name` | string | Patient's full name |
| `Email` | string | Patient email |
| `Age` | int? | Patient age |
| `Gender` | string | Patient gender |
| `Phone` | string | Patient phone number |
| `CreatedAt` | DateTime | Record creation timestamp |

**Relationships**:
- Many-to-One: `Patient` → `Practitioner` (patients assigned to doctors)
- One-to-Many: `Patient` ← `CarePlan` (multiple care plans per patient)
- One-to-Many: `Patient` ← `PatientDiagnostic` (multiple diagnostics per patient)

---

#### 3. **Practitioner** Entity
**File**: `CareExecution.Domain/Entities/Practitioner.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique practitioner identifier |
| `UserId` | Guid (FK) | Reference to User account |
| `LicenseNumber` | string | Medical license number |
| `Specialization` | string | Medical specialization (e.g., Cardiology) |
| `Hospital` | string | Hospital/clinic name |
| `Department` | string | Department name |
| `PhoneNumber` | string | Professional contact number |
| `CreatedAt` | DateTime | Record creation timestamp |

**Relationships**:
- One-to-One: `Practitioner` ← `User`
- One-to-Many: `Practitioner` ← `Patient` (manages multiple patients)

---

#### 4. **CarePlan** Entity
**File**: `CareExecution.Domain/Entities/CarePlan.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique care plan identifier |
| `PatientId` | Guid (FK) | Reference to patient |
| `CreatedBy` | Guid (FK) | Reference to doctor who created plan |
| `StartDate` | DateTime? | Plan start date |
| `EndDate` | DateTime? | Plan end date |
| `Status` | string | "Active", "Completed", "Paused" |

**Relationships**:
- Many-to-One: `CarePlan` → `Patient`
- One-to-Many: `CarePlan` ← `TaskItem` (contains multiple tasks)

---

#### 5. **TaskItem** Entity
**File**: `CareExecution.Domain/Entities/Task.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique task identifier |
| `CarePlanId` | Guid (FK) | Reference to care plan |
| `Type` | string | "Meal", "Medication", "Activity" |
| `Title` | string | Task title/name |
| `Description` | string | Task description |
| `ScheduleType` | string | Recurrence pattern |
| `StartDate` | DateTime? | Task start date |
| `EndDate` | DateTime? | Task end date |

**Relationships**:
- Many-to-One: `TaskItem` → `CarePlan`
- One-to-Many: `TaskItem` ← `TaskSchedule` (scheduled time slots)
- One-to-Many: `TaskItem` ← `TaskLog` (execution history)

---

#### 6. **TaskSchedule** Entity
**File**: `CareExecution.Domain/Entities/TaskSchedule.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique schedule identifier |
| `TaskId` | Guid (FK) | Reference to task |
| `ScheduledTime` | TimeSpan | Time of day for task (e.g., 09:00 AM) |

**Relationships**:
- Many-to-One: `TaskSchedule` → `TaskItem`

---

#### 7. **TaskLog** Entity
**File**: `CareExecution.Domain/Entities/TaskLog.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique log entry identifier |
| `TaskId` | Guid (FK) | Reference to task |
| `ScheduledTime` | DateTime | Scheduled execution time |
| `Status` | string | "Pending", "Completed", "Missed", "Skipped" |
| `ActualTime` | DateTime? | Actual completion/skip time |
| `CreatedAt` | DateTime | Log entry creation timestamp |
| `Notified` | bool | Whether patient was notified |

**Relationships**:
- Many-to-One: `TaskLog` → `TaskItem`

---

#### 8. **PatientDiagnostic** Entity
**File**: `CareExecution.Domain/Entities/PatientDiagnostic.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique diagnostic identifier |
| `PatientId` | Guid (FK) | Reference to patient |
| `DiagnosisName` | string | Medical diagnosis name |
| `DiagnosisDate` | DateTime | Date of diagnosis |
| `Severity` | string | "Critical", "High", "Medium", "Low" |
| `Notes` | string | Additional clinical notes |
| `ICD10Code` | string | ICD-10 medical classification code |
| `Status` | string | "Active", "Resolved", "Inactive" |
| `CreatedAt` | DateTime | Record creation timestamp |
| `UpdatedAt` | DateTime? | Last update timestamp |

**Relationships**:
- Many-to-One: `PatientDiagnostic` → `Patient`

---

#### 9. **MedicationDetails** Entity
**File**: `CareExecution.Domain/Entities/MedicationDetails.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique medication record identifier |
| `TaskId` | Guid (FK) | Reference to medication task |
| `MedicineName` | string | Name of medication |
| `Dosage` | string | Dosage information (e.g., "500mg") |
| `Instructions` | string | Usage instructions |

**Relationships**:
- Many-to-One: `MedicationDetails` → `TaskItem`

---

#### 10. **RefreshToken** Entity
**File**: `CareExecution.Domain/Entities/RefreshToken.cs`

| Property | Type | Description |
|----------|------|-------------|
| `Id` | Guid (PK) | Unique token identifier |
| `UserId` | Guid (FK) | Reference to user |
| `Token` | string | Refresh token value |
| `ExpiresAt` | DateTime | Token expiration datetime |
| `CreatedAt` | DateTime | Token creation timestamp |
| `CreatedByIp` | string | IP address that created token |
| `RevokedAt` | DateTime? | Revocation timestamp (if revoked) |
| `ReplacedByToken` | string | Token that replaced this one |
| `DeviceInfo` | string | Device information (User-Agent) |
| `IsExpired` | bool (computed) | Whether token is expired |
| `IsActive` | bool (computed) | Whether token is active and valid |

**Relationships**:
- Many-to-One: `RefreshToken` → `User`

---

### Database Context
**File**: `CareExecution.Infrastructure/CareExecutionDbContextcs.cs`

DbSets:
- `DbSet<User>` - User accounts
- `DbSet<Patient>` - Patient records
- `DbSet<Practitioner>` - Doctor/practitioner records
- `DbSet<CarePlan>` - Care plans
- `DbSet<TaskItem>` - Tasks
- `DbSet<TaskSchedule>` - Task schedules
- `DbSet<TaskLog>` - Task execution logs
- `DbSet<MedicationDetails>` - Medication information
- `DbSet<PatientDiagnostic>` - Patient diagnoses
- `DbSet<RefreshToken>` - Refresh tokens

---

## Backend Services

### Service Architecture Overview

All services follow a clean architecture pattern with:
- **Service Interface** in `CareExecution.Application/Services/Interfaces/`
- **Service Implementation** in `CareExecution.Application/Services/`
- **Dependency Injection** configured in `Program.cs`

---

### 1. **AuthService** & **IAuthService**
**File**: `CareExecution.Infrastructure/Identity/AuthService.cs`

**Responsibilities**: User authentication and token management

#### Key Methods:

```csharp
// User login
Task<AuthResponse> LoginAsync(string email, string password, string ip, string device)
- Validates email and password against database
- Creates JWT access token
- Creates refresh token with 7-day expiration
- Tracks IP address and device information
- Returns: AccessToken + RefreshToken

// User registration (Patient)
Task<AuthResponse> RegisterAsync(string email, string password, string name, 
                                  int age, string gender, string phone, string ip, string device)
- Creates new Patient entity
- Creates new User with "Patient" role
- Hashes password using BCrypt
- Links Patient to User
- Generates JWT and refresh token
- Returns: AccessToken + RefreshToken

// Doctor registration
Task<AuthResponse> RegisterDoctorAsync(PractitionerRegistrationDto dto, string ip, string device)
- Creates new Practitioner entity
- Creates new User with "Doctor" role
- Hashes password using BCrypt
- Links Practitioner to User
- Generates JWT and refresh token
- Returns: AccessToken + RefreshToken

// Token refresh
Task<AuthResponse> RefreshAsync(string token, string ip)
- Validates refresh token
- Implements token rotation (old token revoked, new token issued)
- Updates RevokedAt and ReplacedByToken fields
- Returns: New AccessToken + New RefreshToken

// Logout
Task LogoutAsync(string token)
- Revokes refresh token by setting RevokedAt timestamp
- Token becomes inactive
```

---

### 2. **JwtTokenService** & **IJwtTokenService**
**File**: `CareExecution.Infrastructure/Identity/JwtTokenService.cs`

**Responsibilities**: JWT token generation and claim management

#### Key Methods:

```csharp
// Generate access token
string GenerateToken(User user)
- Uses HS256 algorithm
- Token validity: 8 hours
- Claims included:
  * NameIdentifier: User.Id (sub)
  * Email: User.Email
  * Role: User.Role
  * PractitionerId: User.PractitionerId (if Doctor)
  * PatientId: User.PatientId (if Patient)
- Config from appsettings:
  * Jwt:Key - signing key
  * Jwt:Issuer - token issuer
  * Jwt:Audience - token audience
```

#### JWT Token Structure:
```
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "Doctor",
  "practitionerId": "practitioner-id",
  "iat": 1234567890,
  "exp": 1234567890 + (8 * 3600)
}
```

---

### 3. **PatientService** & **IPatientService**
**File**: `CareExecution.Application/Services/PatientService.cs`

**Responsibilities**: Patient account management and task retrieval

#### Key Methods:

```csharp
// Create patient
Task<Guid> CreatePatient(CreatePatientDto dto)
- Creates new Patient entity
- Generates unique GUID
- Sets CreatedAt timestamp
- Assigns to practitioner
- Returns: Patient ID

// Get daily tasks for patient
Task<List<DailyTaskDto>> GetDailyTasks(Guid patientId, DateTime date)
- Queries TaskLogs for specified date
- Filters by patient's associated CarePlan
- Returns: List of daily tasks with:
  * TaskId
  * Title
  * Type (Meal/Medication/Activity)
  * ScheduledTime
  * Status (Pending/Completed/Missed/Skipped)
```

---

### 4. **PractitionerService** & **IPractitionerService**
**File**: `CareExecution.Application/Services/PractitionerService.cs`

**Responsibilities**: Doctor profile management

#### Key Methods:

```csharp
// Get practitioner by ID
Task<Practitioner> GetPractitionerByIdAsync(Guid practitionerId)

// Get practitioner by User ID
Task<Practitioner> GetPractitionerByUserIdAsync(Guid userId)

// Get all practitioners
Task<List<Practitioner>> GetAllPractitionersAsync()

// Update practitioner profile
Task UpdatePractitionerAsync(Guid practitionerId, PractitionerRegistrationDto dto)

// Delete practitioner
Task DeletePractitionerAsync(Guid practitionerId)
```

---

### 5. **CarePlanService** & **ICarePlanService**
**File**: `CareExecution.Application/Services/CarePlanService.cs`

**Responsibilities**: Care plan lifecycle management

#### Key Methods:

```csharp
// Create care plan
Task<Guid> CreateCarePlanAsync(CreateCarePlanDto dto)
- Creates new CarePlan entity
- Status defaults to "Active"
- Links to Patient and Creator (Doctor)
- Returns: Care Plan ID

// Get care plan details
Task<CarePlan> GetCarePlanAsync(Guid carePlanId)
- Includes: Tasks, TaskSchedules, TaskLogs
- Throws exception if not found

// Get doctor's care plans
Task<List<CarePlan>> GetDoctorCarePlansAsync(Guid doctorId)
- Filters by CreatedBy = doctorId
- Includes Patient and Tasks

// Get patient's care plans
Task<List<CarePlan>> GetPatientCarePlansAsync(Guid patientId)
- Filters by PatientId
- Ordered by StartDate descending

// Update care plan
Task UpdateCarePlanAsync(Guid carePlanId, UpdateCarePlanDto dto)
- Updates: StartDate, EndDate, Status

// Delete care plan (cascading)
Task DeleteCarePlanAsync(Guid carePlanId)
- Deletes associated TaskLogs
- Deletes associated Tasks
- Deletes CarePlan

// Assign tasks to care plan
Task AssignTasksToCarePlanAsync(Guid carePlanId, List<Guid> taskIds)
- Updates CarePlanId for given tasks
```

---

### 6. **TaskService** & **ITaskService**
**File**: `CareExecution.Application/Services/TaskService.cs`

**Responsibilities**: Task creation and management

#### Key Methods:

```csharp
// Create task
Task<Guid> CreateTaskAsync(CreateTaskDto dto)
- Creates TaskItem entity
- Creates TaskSchedule entries for each TimeSlot
- Returns: Task ID

// Create medication task
Task<Guid> CreateMedicationTaskAsync(CreateMedicationTaskDto dto)
- Extends CreateTaskAsync
- Creates MedicationDetails entity with:
  * MedicineName
  * Dosage
  * Instructions
- Returns: Task ID

// Get task details
Task<TaskItem> GetTaskAsync(Guid taskId)
- Includes: TaskSchedules, TaskLogs
- Throws if not found

// Get care plan tasks
Task<List<TaskItem>> GetCarePlanTasksAsync(Guid carePlanId)
- Includes: TaskSchedules, TaskLogs

// Update task
Task UpdateTaskAsync(Guid taskId, UpdateTaskDto dto)
- Updates: Title, Description, Type

// Delete task (cascading)
Task DeleteTaskAsync(Guid taskId)
- Deletes associated TaskSchedules
- Deletes associated TaskLogs
- Deletes Task

// Search tasks
Task<List<TaskItem>> SearchTasksAsync(string title, string type)
- Filters by Title and/or Type
- Includes TaskSchedules
```

---

### 7. **ExecutionService** & **IExecutionService**
**File**: `CareExecution.Application/Services/ExecutionService.cs`

**Responsibilities**: Task execution tracking

#### Key Methods:

```csharp
// Complete task
Task CompleteTaskAsync(Guid taskId, DateTime scheduledTime)
- Finds TaskLog matching TaskId and ScheduledTime
- Sets Status = "Completed"
- Sets ActualTime = DateTime.UtcNow
- Saves changes

// Skip task
Task SkipTaskAsync(Guid taskId, DateTime scheduledTime)
- Finds TaskLog matching TaskId and ScheduledTime
- Sets Status = "Skipped"
- Sets ActualTime = DateTime.UtcNow
- Saves changes
```

---

### 8. **DashboardService** & **IDashboardService**
**File**: `CareExecution.Application/Services/DashboardService.cs`

**Responsibilities**: Analytics and reporting

#### Key Methods:

```csharp
// Get doctor dashboard
Task<List<PatientDashboardDto>> GetDashboardAsync(Guid practitionerId)
- Caches results for 30 seconds
- For each patient:
  * Calculates adherence = Completed / Total * 100
  * Counts missed tasks
  * Determines risk level (< 70% = at risk)
- Returns: Today's patient adherence snapshot

// Get patient detailed adherence
Task<PatientDetailedAdherenceDto> GetPatientDetailAsync(Guid patientId)
- Calculates:
  * Current adherence (24-hour)
  * Weekly adherence
  * Monthly adherence
  * Trend
- Counts: Completed, Skipped, Missed, Pending tasks
- Returns: Detailed adherence metrics with daily breakdown

// Get high-risk patients
Task<List<HighRiskPatientsDto>> GetHighRiskPatientsAsync(Guid practitionerId)
- Filters patients with adherence < 70%
- Returns: Risk level, missed tasks count, last task date

// Get general metrics
Task<DashboardMetricsDto> GetGeneralMetricsAsync(Guid practitionerId)
- Aggregates across all practitioner's patients:
  * Total patients
  * Active patients (with tasks today)
  * Average adherence
  * Task completion stats
```

---

### 9. **DiagnosticService** & **IDiagnosticService**
**File**: `CareExecution.Application/Services/DiagnosticService.cs`

**Responsibilities**: Patient diagnostic management

#### Key Methods:

```csharp
// Get diagnostic by ID
Task<DiagnosticDto> GetDiagnosticByIdAsync(Guid diagnosticId)

// Get patient diagnostics
Task<List<DiagnosticDto>> GetPatientDiagnosticsAsync(Guid patientId)
- Ordered by DiagnosisDate descending

// Get active diagnostics
Task<List<DiagnosticDto>> GetActiveDiagnosticsAsync(Guid patientId)
- Filters by Status = "Active"

// Get diagnostics by severity
Task<List<DiagnosticDto>> GetDiagnosticsBySeverityAsync(Guid patientId, string severity)

// Create diagnostic
Task<Guid> CreateDiagnosticAsync(CreateDiagnosticDto dto)
- Creates PatientDiagnostic entity
- Default severity: "Medium"
- Default status: "Active"
- Returns: Diagnostic ID

// Update diagnostic
Task UpdateDiagnosticAsync(UpdateDiagnosticDto dto)
- Updates: DiagnosisName, Severity, Notes, ICD10Code, Status
- Sets UpdatedAt = DateTime.UtcNow

// Delete diagnostic
Task DeleteDiagnosticAsync(Guid diagnosticId)
```

---

### 10. **AdherenceService** & **IAdherenceService**
**File**: `CareExecution.Application/Services/AdherenceService.cs`

**Responsibilities**: Adherence metrics calculation

#### Key Methods:

```csharp
// Calculate adherence metrics
Task<AdherenceMetricsDto> CalculateAdherenceMetricsAsync(Guid patientId)
- Current adherence (last 24 hours)
- Weekly adherence (last 7 days)
- Monthly adherence (last 30 days)
- Trend analysis
- Daily breakdown (list of DailyAdherenceDto)
```

---

### 11. **TimelineService** & **ITimelineService**
**File**: `CareExecution.Application/Services/TimelineService.cs`

**Responsibilities**: Task timeline visualization

#### Key Methods:

```csharp
// Get timeline for patient on specific date
Task<List<PatientTimelineDto>> GetTimeline(Guid patientId, DateTime date)
- Retrieves all tasks scheduled for that date
- Ordered chronologically
- Includes task status
```

---

### 12. **SchedulerService** & **ISchedulerService**
**File**: `CareExecution.Application/Services/SchedulerService.cs`

**Responsibilities**: Background task scheduling and reminder dispatch

#### Key Methods:

```csharp
Task GenerateDueTaskLogsAsync(DateTime fromUtc, DateTime toUtc)
- Generates TaskLog entries for scheduled task windows
- Idempotent insert behavior using TaskId + ScheduledTime

Task ProcessDueNotificationsAsync(DateTime nowUtc)
- Finds pending, not-yet-notified logs in a small window around current time
- Sends reminders through INotificationService
- Marks Notified = true

Task MarkMissedAsync(DateTime nowUtc)
- Marks stale pending logs as Missed after grace period
```

---

### 13. **NotificationService** & **INotificationService**
**File**: `CareExecution.Application/Services/NotificationService.cs`

**Responsibilities**: Notification dispatch + user preference/history management

#### Key Methods:

```csharp
Task SendAsync(Guid patientId, string title, string body)
Task SetPreferencesAsync(Guid ownerId, string[] reminderTimes, bool enabled)
Task<NotificationPreferencesDto> GetPreferencesAsync(Guid ownerId)
Task SetEnabledAsync(Guid ownerId, bool enabled)
Task<IReadOnlyList<NotificationHistoryItemDto>> GetHistoryAsync(Guid ownerId)
```

---

### 14. **InsightService** & **IInsightService** (Placeholder)
**Responsibilities**: Clinical insights and recommendations

---

## Backend Controllers & API Endpoints

### Base Configuration
- **Base URL**: `http://localhost:5160/api`
- **Authentication**: JWT Bearer Token
- **Response Format**: JSON

---

### 1. **AuthController**
**File**: `CareExecution.API/Controller/AuthController.cs`  
**Route**: `/api/auth`

#### Endpoints:

##### POST /api/auth/login
**Authorization**: None (Public)
```csharp
Request Body:
{
  "email": "patient@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "RefreshTokenValue123..."
}

Error Responses:
- 401: Invalid credentials
- 400: Missing email or password
```

---

##### POST /api/auth/register
**Authorization**: None (Public)
```csharp
Request Body:
{
  "email": "patient@example.com",
  "password": "password123",
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "phone": "555-1234"
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "RefreshTokenValue123..."
}

Error Responses:
- 400: Email already registered
- 400: Invalid input
```

---

##### POST /api/auth/register-doctor
**Authorization**: None (Public)
```csharp
Request Body:
{
  "email": "doctor@hospital.com",
  "password": "password123",
  "licenseNumber": "LIC12345",
  "specialization": "Cardiology",
  "hospital": "General Hospital",
  "department": "Cardiology",
  "phoneNumber": "555-5678"
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "RefreshTokenValue123..."
}

Error Responses:
- 400: Email already registered
- 400: Invalid input
```

---

##### POST /api/auth/refresh
**Authorization**: None (Public)
```csharp
Request Body:
"refresh_token_value_here"

Response (200 OK):
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}

Error Responses:
- 401: Invalid or expired refresh token
```

---

##### POST /api/auth/logout
**Authorization**: JWT Bearer
```csharp
Request Body:
"refresh_token_value_here"

Response (200 OK):
{}

Error Responses:
- 400: Invalid token
```

---

### 2. **PatientsController**
**File**: `CareExecution.API/Controller/PatientsController.cs`  
**Route**: `/api/patients`

#### Endpoints:

##### POST /api/patients
**Authorization**: None (Public - for doctor to add patient)
```csharp
Request Body:
{
  "name": "Jane Doe",
  "age": 42,
  "gender": "Female",
  "phone": "555-9999",
  "practitionerId": "doctor-uuid"
}

Response (200 OK):
{
  "id": "patient-uuid"
}
```

---

##### GET /api/patients/daily-tasks
**Authorization**: JWT Bearer (Role: Patient)
```csharp
Query Parameters:
- date: "2024-04-17" (ISO format)

Response (200 OK):
[
  {
    "taskId": "task-uuid",
    "title": "Take Medication",
    "type": "Medication",
    "scheduledTime": "2024-04-17T09:00:00Z",
    "status": "Pending"
  },
  ...
]

Error Responses:
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (wrong role)
- 400: PatientId claim not found in token
```

---

### 3. **PractitionersController**
**File**: `CareExecution.API/Controller/PractitionersController.cs`  
**Route**: `/api/practitioners`  
**Authorization**: JWT Bearer (Role: Doctor)

#### Endpoints:

##### GET /api/practitioners/{practitionerId}
```csharp
Response (200 OK):
{
  "id": "practitioner-uuid",
  "userId": "user-uuid",
  "licenseNumber": "LIC12345",
  "specialization": "Cardiology",
  "hospital": "General Hospital",
  "department": "Cardiology",
  "phoneNumber": "555-5678",
  "createdAt": "2024-01-15T10:30:00Z"
}

Error Responses:
- 404: Practitioner not found
```

---

##### GET /api/practitioners/user/{userId}
```csharp
Response (200 OK): Same as above
```

---

##### GET /api/practitioners
```csharp
Response (200 OK):
[
  { ...practitioner object... },
  ...
]
```

---

##### PUT /api/practitioners/{practitionerId}
```csharp
Request Body:
{
  "specialization": "Neurology",
  "hospital": "City Hospital",
  "department": "Neurology"
}

Response (200 OK):
{
  "message": "Practitioner updated successfully"
}
```

---

##### DELETE /api/practitioners/{practitionerId}
```csharp
Response (200 OK):
{
  "message": "Practitioner deleted successfully"
}
```

---

### 4. **CarePlansController**
**File**: `CareExecution.API/Controller/CarePlansController.cs`  
**Route**: `/api/careplans`  
**Authorization**: JWT Bearer

#### Endpoints:

##### POST /api/careplans
```csharp
Request Body:
{
  "patientId": "patient-uuid",
  "createdBy": "doctor-uuid",
  "startDate": "2024-04-17",
  "endDate": "2024-05-17"
}

Response (200 OK):
{
  "id": "careplan-uuid",
  "message": "Care plan created successfully"
}
```

---

##### GET /api/careplans/{carePlanId}
```csharp
Response (200 OK):
{
  "id": "careplan-uuid",
  "patientId": "patient-uuid",
  "createdBy": "doctor-uuid",
  "startDate": "2024-04-17T00:00:00Z",
  "endDate": "2024-05-17T00:00:00Z",
  "status": "Active",
  "tasks": [ {...}, ... ]
}
```

---

##### GET /api/careplans/doctor/{doctorId}
```csharp
Response (200 OK):
[
  { ...careplan object... },
  ...
]
```

---

##### GET /api/careplans/patient/{patientId}
```csharp
Response (200 OK):
[
  { ...careplan object... },
  ...
]
```

---

##### PUT /api/careplans/{carePlanId}
```csharp
Request Body:
{
  "startDate": "2024-04-20",
  "endDate": "2024-05-20",
  "status": "Paused",
  "notes": "Adjusted based on patient feedback"
}

Response (200 OK):
{
  "message": "Care plan updated successfully"
}
```

---

##### DELETE /api/careplans/{carePlanId}
```csharp
Response (200 OK):
{
  "message": "Care plan deleted successfully"
}
```

---

##### POST /api/careplans/{carePlanId}/assign-tasks
```csharp
Request Body:
[
  "task-uuid-1",
  "task-uuid-2",
  "task-uuid-3"
]

Response (200 OK):
{
  "message": "Tasks assigned to care plan successfully"
}
```

---

### 5. **TasksController**
**File**: `CareExecution.API/Controller/TasksController.cs`  
**Route**: `/api/tasks`  
**Authorization**: JWT Bearer

#### Endpoints:

##### POST /api/tasks
```csharp
Request Body:
{
  "carePlanId": "careplan-uuid",
  "type": "Medication",
  "title": "Take Blood Pressure Medication",
  "description": "Take one tablet",
  "timeSlots": ["09:00:00", "21:00:00"]
}

Response (200 OK):
{
  "id": "task-uuid",
  "message": "Task created successfully"
}
```

---

##### POST /api/tasks/medication
```csharp
Request Body:
{
  "carePlanId": "careplan-uuid",
  "type": "Medication",
  "title": "Aspirin",
  "description": "Daily aspirin",
  "timeSlots": ["09:00:00"],
  "medicineName": "Aspirin",
  "dosage": "81mg",
  "instructions": "Take with food"
}

Response (200 OK):
{
  "id": "task-uuid",
  "message": "Medication task created successfully"
}
```

---

##### GET /api/tasks/{taskId}
```csharp
Response (200 OK):
{
  "id": "task-uuid",
  "carePlanId": "careplan-uuid",
  "type": "Medication",
  "title": "Aspirin",
  "description": "Daily aspirin",
  "scheduleType": null,
  "startDate": "2024-04-17T00:00:00Z",
  "endDate": null,
  "taskSchedules": [
    {
      "id": "schedule-uuid",
      "taskId": "task-uuid",
      "scheduledTime": "09:00:00"
    }
  ],
  "taskLogs": [ {...}, ... ]
}
```

---

##### GET /api/tasks/careplan/{carePlanId}
```csharp
Response (200 OK):
[
  { ...task object... },
  ...
]
```

---

##### PUT /api/tasks/{taskId}
```csharp
Request Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "type": "Medication"
}

Response (200 OK):
{
  "message": "Task updated successfully"
}
```

---

##### DELETE /api/tasks/{taskId}
```csharp
Response (200 OK):
{
  "message": "Task deleted successfully"
}
```

---

##### GET /api/tasks/search
```csharp
Query Parameters:
- title: "medication" (optional)
- type: "Medication" (optional)

Response (200 OK):
[
  { ...task object... },
  ...
]
```

---

### 6. **ExecutionController**
**File**: `CareExecution.API/Controller/ExecutionController.cs`  
**Route**: `/api/execution`  
**Authorization**: JWT Bearer

#### Endpoints:

##### POST /api/execution/complete
```csharp
Request Body:
{
  "taskId": "task-uuid",
  "scheduledTime": "2024-04-17T09:00:00Z"
}

Response (200 OK):
{
  "message": "Task completed successfully"
}

Error Responses:
- 404: Task log not found
```

---

##### POST /api/execution/skip
```csharp
Request Body:
{
  "taskId": "task-uuid",
  "scheduledTime": "2024-04-17T09:00:00Z"
}

Response (200 OK):
{
  "message": "Task skipped successfully"
}

Error Responses:
- 404: Task log not found
```

---

### 7. **DashboardController**
**File**: `CareExecution.API/Controller/DashboardController.cs`  
**Route**: `/api/dashboard`  
**Authorization**: JWT Bearer

#### Endpoints:

##### GET /api/dashboard/{practitionerId}
```csharp
Response (200 OK):
[
  {
    "patientId": "patient-uuid",
    "patientName": "Jane Doe",
    "adherencePercentage": 85.5,
    "missedTasks": 2,
    "isAtRisk": false
  },
  ...
]

Error Responses:
- 403: User can only access own data (unless Admin)
```

---

##### GET /api/dashboard/{patientId}/adherence
```csharp
Response (200 OK):
{
  "patientId": "patient-uuid",
  "patientName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-1234",
  "currentAdherence": 85.5,
  "weeklyAdherence": 82.3,
  "monthlyAdherence": 80.1,
  "trend": "Improving",
  "completedTasks": 34,
  "skippedTasks": 4,
  "missedTasks": 2,
  "pendingTasks": 5,
  "dailyBreakdown": [
    {
      "date": "2024-04-17",
      "adherence": 100,
      "completed": 3,
      "skipped": 0,
      "missed": 0
    },
    ...
  ]
}
```

---

##### GET /api/dashboard/{practitionerId}/high-risk
```csharp
Response (200 OK):
[
  {
    "patientId": "patient-uuid",
    "patientName": "John Smith",
    "adherencePercentage": 45.2,
    "missedTasksCount": 15,
    "lastTaskDate": "2024-04-15T10:00:00Z",
    "riskLevel": "High"
  },
  ...
]
```

---

##### GET /api/dashboard/{practitionerId}/metrics
```csharp
Response (200 OK):
{
  "totalPatients": 25,
  "activePatients": 18,
  "averageAdherence": 78.5,
  "totalTasks": 450,
  "completedTasks": 380,
  "missedTasks": 45,
  "patientList": [ {...}, ... ]
}
```

---

##### GET /api/dashboard/{patientId}/details
```csharp
Response (200 OK):
{
  "patientId": "patient-uuid",
  "patientName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-1234",
  "currentAdherence": 85.5,
  "weeklyAdherence": 82.3,
  "monthlyAdherence": 80.1,
  "trend": "Improving",
  "completedTasks": 34,
  "skippedTasks": 4,
  "missedTasks": 2,
  "pendingTasks": 5,
  "dailyBreakdown": [ {...}, ... ]
}
```

---

### 8. **DiagnosticsController**
**File**: `CareExecution.API/Controller/DiagnosticsController.cs`  
**Route**: `/api/diagnostics`  
**Authorization**: JWT Bearer

#### Endpoints:

##### GET /api/diagnostics/{diagnosticId}
```csharp
Response (200 OK):
{
  "id": "diagnostic-uuid",
  "patientId": "patient-uuid",
  "diagnosisName": "Type 2 Diabetes",
  "diagnosisDate": "2023-06-15",
  "severity": "High",
  "notes": "Controlled with medication",
  "icd10Code": "E11.9",
  "status": "Active",
  "createdAt": "2023-06-15T10:00:00Z",
  "updatedAt": "2024-04-01T14:30:00Z"
}
```

---

##### GET /api/diagnostics/patient/{patientId}
```csharp
Response (200 OK):
[
  { ...diagnostic object... },
  ...
]
```

---

##### GET /api/diagnostics/patient/{patientId}/active
```csharp
Response (200 OK):
[
  { ...diagnostic object with Status="Active"... },
  ...
]
```

---

##### GET /api/diagnostics/patient/{patientId}/severity/{severity}
**severity**: "Critical" | "High" | "Medium" | "Low"
```csharp
Response (200 OK):
[
  { ...diagnostic object matching severity... },
  ...
]
```

---

##### POST /api/diagnostics
```csharp
Request Body:
{
  "patientId": "patient-uuid",
  "diagnosisName": "Type 2 Diabetes",
  "diagnosisDate": "2023-06-15",
  "severity": "High",
  "notes": "Controlled with medication",
  "icd10Code": "E11.9",
  "status": "Active"
}

Response (201 Created):
Location: /api/diagnostics/{diagnosticId}
{
  "id": "diagnostic-uuid"
}
```

---

##### PUT /api/diagnostics
```csharp
Request Body:
{
  "id": "diagnostic-uuid",
  "diagnosisName": "Type 2 Diabetes",
  "severity": "Medium",
  "notes": "Well controlled",
  "icd10Code": "E11.9",
  "status": "Active"
}

Response (200 OK):
{
  "message": "Diagnostic updated successfully"
}
```

---

##### DELETE /api/diagnostics/{diagnosticId}
```csharp
Response (200 OK):
{
  "message": "Diagnostic deleted successfully"
}
```

---

### 9. **NotificationController**
**File**: `CareExecution.API/Controller/NotificationController.cs`  
**Route**: `/api/notifications`  
**Authorization**: JWT Bearer  
**Status**: Implemented (in-memory preferences/history; FCM transport pluggable)

#### Endpoints:

##### POST /api/notifications/preferences
```csharp
Request Body:
{
  "reminderTimes": ["08:00", "12:00", "18:00"],
  "enabled": true
}

Response (200 OK):
{
  "message": "Preferences updated successfully"
}
```

---

##### GET /api/notifications/preferences
```csharp
Response (200 OK):
{
  "reminderTimes": ["08:00", "12:00", "18:00"],
  "enabled": true
}
```

---

##### POST /api/notifications/enable-disable
```csharp
Request Body:
{
  "enable": true
}

Response (200 OK):
{
  "message": "Notifications enabled"
}
```

---

##### GET /api/notifications/history
```csharp
Response (200 OK):
{
  "notifications": [
    {
      "timestampUtc": "2026-04-17T09:00:00Z",
      "title": "Reminder",
      "body": "Take your aspirin"
    },
    ...
  ]
}
```

---

### 10. **TimelineController**
**File**: `CareExecution.API/Controller/TimelineController.cs`  
**Route**: `/api/patients/{patientId}/timeline`  
**Authorization**: JWT Bearer

#### Endpoints:

##### GET /api/patients/{patientId}/timeline
```csharp
Query Parameters:
- date: "2024-04-17" (ISO format)

Response (200 OK):
[
  {
    "taskId": "task-uuid",
    "title": "Take Medication",
    "type": "Medication",
    "scheduledTime": "2024-04-17T09:00:00Z",
    "status": "Completed"
  },
  ...
]
```

---

## Frontend Screens

### Navigation Structure

The frontend uses **React Navigation** with stack-based navigation. The app has three main stacks:

1. **AuthStack** - Authentication screens (unauthenticated users)
2. **PatientStack** - Patient app (role-based)
3. **DoctorStack** - Doctor app (role-based)

**Navigation File**: `src/navigation/AppNavigator.js`

---

### 1. **AuthStack Screens**

#### LoginScreen
**File**: `src/screens/auth/LoginScreen.js`

**Purpose**: User login interface

**UI Components**:
- Email input field
- Password input field
- Login button
- Navigation links to:
  - Patient Registration (RegistrationScreen)
  - Doctor Registration (DoctorRegistrationScreen)

**Functionality**:
- Validates email and password
- Calls `login(email, password)` from authApi
- Decodes JWT token using `decodeJWT()`
- Stores token in AsyncStorage
- Stores decoded user data in AsyncStorage
- Updates AppContext with user info
- Auto-navigates based on user role

**Error Handling**:
- Displays validation errors
- Handles network errors
- Shows error alerts

---

#### RegistrationScreen (Patient)
**File**: `src/screens/auth/RegistrationScreen.js`

**Purpose**: Patient self-registration interface

**Form Fields**:
- Full Name (required)
- Email (required)
- Password (required, min 6 chars)
- Confirm Password (required, must match)
- Age (optional)
- Gender (dropdown: Male/Female)
- Phone (required)

**Functionality**:
- Form validation
- Calls `register(userData)` from authApi
- Decodes JWT token
- Stores token and user data
- Updates AppContext
- Shows success alert
- Auto-navigates to HomeScreen

---

#### DoctorRegistrationScreen
**File**: `src/screens/auth/DoctorRegistrationScreen.js`

**Purpose**: Doctor registration interface

**Form Fields**:
- Email (required)
- Password (required, min 6 chars)
- Confirm Password (required, must match)
- License Number (required)
- Specialization (dropdown: General Practice, etc.)
- Hospital (optional)
- Department (optional)
- Phone Number (optional)

**Functionality**:
- Form validation
- Calls `/api/auth/register-doctor` endpoint directly
- Decodes JWT token
- Ensures role is set to "Doctor"
- Stores token and user data
- Updates AppContext with role
- Shows success alert
- Auto-navigates to DoctorDashboard

---

### 2. **PatientStack Screens**

#### HomeScreen (Patient Tasks)
**File**: `src/screens/patient/HomeScreen.js`

**Purpose**: Display patient's daily tasks

**UI Components**:
- Task list (FlatList)
- Task item with:
  - Title
  - Type badge
  - Scheduled time
  - Current status badge
  - "Complete" button
  - "Skip" button

**Functionality**:
- Loads tasks for today using `getDailyTasks(date)`
- Displays formatted list of tasks
- Complete task: calls `completeTask(taskId, scheduledTime)`
- Skip task: calls `skipTask(taskId, scheduledTime)` with confirmation
- Pull-to-refresh functionality
- Automatic reload after task action
- Logout button
- Bottom navigation to other screens

**Data Flow**:
1. Component mounts → load today's tasks
2. User completes/skips task → update backend
3. Success alert → reload task list

**Error Handling**:
- Network errors
- Unauthorized (401) → logout and redirect to login
- Display error messages

---

#### PatientProfileScreen
**File**: `src/screens/patient/PatientProfileScreen.js`

**Purpose**: Display patient's profile and medical information

**Sections**:
- **Personal Information**
  - Name
  - Email
  - Phone
  - Date of Birth
  - Gender
  - Blood Type

- **Medical Information**
  - Current Medical Conditions
  - Known Allergies
  - Current Medications

- **Emergency Contact**
  - Contact name
  - Contact phone

**Functionality**:
- Populates from decoded JWT claims
- Logout button with confirmation dialog
- Data sourced from AppContext user object

---

#### TaskHistoryScreen
**File**: `src/screens/patient/TaskHistoryScreen.js`

**Purpose**: View historical task completion data

**Features**:
- Displays historical tasks with status
- Filter options (date range, status)
- Statistics display

---

#### PatientDetailsScreen
**File**: `src/screens/patient/PatientDetailsScreen.js`

**Purpose**: Comprehensive patient details and diagnostics view

**Sections**:
- Patient demographics
- Diagnostic history
- Current medications
- Care plans
- Task execution history

---

### 3. **DoctorStack Screens**

#### DoctorDashboard
**File**: `src/screens/doctor/DoctorDashboard.js`

**Purpose**: Doctor's main dashboard with patient overview

**UI Components**:
- Metrics cards showing:
  - Total patients
  - Active patients (today)
  - Average adherence %
  - High-risk patient count

- Patient list with:
  - Patient name
  - Adherence percentage
  - Risk indicator (red/green)
  - Missed task count

**Functionality**:
- Loads dashboard using `getDashboard(doctorId)`
- Loads metrics using `getMetrics(doctorId)`
- Displays top-level patient adherence data
- Tap on patient → navigate to PatientAdherenceDetail
- Logout button
- Pull-to-refresh functionality

**Data Loading**:
- Fetches practitionerId from user token (user.practitionerId or user.sub)
- Caches dashboard for 30 seconds (backend)
- Parallel loads for metrics and dashboard data

---

#### PatientList
**File**: `src/screens/doctor/PatientList.js`

**Purpose**: View all patients managed by doctor

**UI Components**:
- Search bar (filter by patient name)
- Patient list with:
  - Patient name
  - Care plan count
  - Last care plan status
  - Last care plan date

- Action menu (tap patient):
  - View Adherence Details
  - Create New Care Plan

**Functionality**:
- Loads doctor's care plans using `getDoctorPlans(doctorId)`
- Extracts unique patients from care plans
- Filters list based on search input
- Navigates to:
  - PatientAdherenceDetail (with patientId and patientName)
  - CreateCarePlan (with patientId)

---

#### PatientAdherenceDetail
**File**: `src/screens/doctor/PatientAdherenceDetail.js`

**Purpose**: Detailed patient adherence analytics

**Route Parameters**:
- `patientId`: Patient's unique identifier
- `patientName`: Patient's display name

**UI Sections**:
- Patient info header
- Current adherence percentage
- Weekly adherence trend
- Monthly adherence trend
- Task statistics:
  - Completed count
  - Skipped count
  - Missed count
  - Pending count

- Daily adherence breakdown (chart or table)
- Risk assessment

**Functionality**:
- Loads adherence data using `getPatientAdherence(patientId)`
- Displays detailed metrics from `PatientDetailedAdherenceDto`
- Shows daily breakdown with adherence percentages
- Visual indicators for risk levels

---

#### CreateCarePlan
**File**: `src/screens/doctor/CreateCarePlan.js`

**Purpose**: Multi-step care plan creation

**Route Parameters**:
- `patientId` (optional): Pre-filled patient

**Steps**:

**Step 1: Care Plan Information**
- Form fields:
  - Title (required)
  - Description
  - Patient ID (required)
  - Start Date (required)
  - End Date (required)
  - Validation: End date > Start date

**Step 2: Select Tasks**
- Task search interface:
  - Search input
  - Search button
  - Results list with:
    - Task title
    - Task type
    - Checkbox to select
    - Medication indicator

- Selected tasks display:
  - List of selected tasks
  - Remove button for each

**Functionality**:
- Step 1: Validates inputs, moves to Step 2
- Step 2: Searches for tasks using `searchTasks()`
- Toggles task selection
- Submits care plan:
  1. Creates care plan using `createCarePlan()`
  2. Assigns tasks using `assignTasksToCarePlan()`
  3. Shows success alert
  4. Navigates back

---

### Context & State Management

#### AppContext
**File**: `src/context/AppContext.js`

**State**:
```javascript
{
  user: {
    sub: string,              // User ID
    email: string,
    role: "Doctor" | "Patient",
    practitionerId?: string,  // If Doctor
    patientId?: string,       // If Patient
    ...otherClaims
  },
  loading: boolean,           // App startup loading
  isLoggedIn: boolean
}
```

**Methods**:
- `login(token, userData)`: Set user and logged-in state
- `logout()`: Clear storage and reset state
- `isDoctor()`: Check if user role is Doctor
- `isPatient()`: Check if user role is Patient
- `isDoctorOrAdmin()`: Check if Doctor or Admin
- `restoreUser()`: Restore user from AsyncStorage on app start

---

## API Integration Points

### HTTP Client Configuration
**File**: `src/api/client.js`

```javascript
// Axios instance with:
// - Base URL: http://localhost:5160/api
// - Default headers: Content-Type: application/json
// - Request interceptor: Adds Authorization header with stored token
// - Response interceptor: Logs requests/responses
// - Error interceptor: Logs error details
```

---

### API Modules

#### authApi.js
```javascript
// POST /auth/login
login(email, password)

// POST /auth/register
register(userData)
```

#### carePlanApi.js
```javascript
// POST /careplans
createCarePlan(dto)

// GET /careplans/{id}
getCarePlan(id)

// GET /careplans/doctor/{doctorId}
getDoctorPlans(doctorId)

// GET /careplans/patient/{patientId}
getPatientPlans(patientId)

// PUT /careplans/{id}
updateCarePlan(id, dto)

// DELETE /careplans/{id}
deleteCarePlan(id)

// POST /careplans/{carePlanId}/assign-tasks
assignTasksToCarePlan(carePlanId, taskIds)
```

#### taskApi.js
```javascript
// GET /patients/daily-tasks?date={date}
getDailyTasks(date)

// POST /execution/complete
completeTask(taskId, scheduledTime)

// POST /execution/skip
skipTask(taskId, scheduledTime)

// GET /tasks/search?{searchType}={searchValue}
searchTasks(searchType, searchValue)

// GET /tasks/{taskId}
getTaskById(taskId)

// PUT /tasks/{taskId}
updateTask(taskId, taskData)

// DELETE /tasks/{taskId}
deleteTask(taskId)
```

#### dashboardApi.js
```javascript
// GET /dashboard/{practitionerId}
getDashboard(practitionerId)

// GET /dashboard/{patientId}/adherence
getPatientAdherence(patientId)

// GET /dashboard/{practitionerId}/high-risk
getHighRiskPatients(practitionerId)

// GET /dashboard/{practitionerId}/metrics
getMetrics(practitionerId)

// GET /dashboard/{patientId}/details
getPatientDetail(patientId)
```

#### notificationApi.js
```javascript
// POST /notifications/preferences
setNotificationPreferences(preferences)

// GET /notifications/preferences
getNotificationPreferences()

// POST /notifications/enable-disable
enableDisableNotifications(enabled)

// GET /notifications/history
getNotificationHistory()
```

---

## Authentication Flow

### Complete JWT Authentication Flow

#### 1. Patient Registration Flow

```
Frontend                              Backend
   |                                    |
   |--- POST /auth/register ---------->|
   |     {email, password, name, ...}  |
   |                                    |
   |                       Create Patient entity
   |                       Create User entity (role="Patient")
   |                       Hash password (BCrypt)
   |                       Generate JWT token (8hr expiry)
   |                       Generate Refresh token (7d expiry)
   |                                    |
   |<--- 200 OK ----------------------|
   |     {accessToken, refreshToken}   |
   |                                    |
   Decode JWT using jwtDecode()
   Store accessToken in AsyncStorage
   Store decoded user in AsyncStorage
   Update AppContext (login)
   Navigate to HomeScreen
```

#### 2. Doctor Registration Flow

```
Frontend                              Backend
   |                                    |
   |--- POST /auth/register-doctor --->|
   |     {email, password,             |
   |      licenseNumber, ...}          |
   |                                    |
   |                       Create Practitioner entity
   |                       Create User entity (role="Doctor")
   |                       Link User to Practitioner
   |                       Hash password (BCrypt)
   |                       Generate JWT token
   |                       Generate Refresh token
   |                                    |
   |<--- 200 OK ----------------------|
   |     {accessToken, refreshToken}   |
   |                                    |
   Decode JWT
   Store tokens
   Update AppContext
   Navigate to DoctorDashboard
```

#### 3. Login Flow

```
Frontend                              Backend
   |                                    |
   |--- POST /auth/login ------------->|
   |     {email, password}             |
   |                                    |
   |                       Fetch User by email
   |                       Verify password hash
   |                       Generate JWT token
   |                       Generate Refresh token
   |                                    |
   |<--- 200 OK ----------------------|
   |     {accessToken, refreshToken}   |
   |                                    |
   Decode JWT
   Store tokens
   Update AppContext
   Navigate to role-based screen
```

#### 4. Token Refresh Flow

```
Frontend                              Backend
   |                                    |
   |--- POST /auth/refresh ----------->|
   |     {refreshToken}                |
   |                                    |
   |                       Find RefreshToken by value
   |                       Check if IsActive
   |                       Get User associated with token
   |                       Create new JWT (8hr expiry)
   |                       Create new RefreshToken (7d expiry)
   |                       Revoke old RefreshToken
   |                       Set ReplacedByToken reference
   |                                    |
   |<--- 200 OK ----------------------|
   |     {accessToken, refreshToken}   |
   |                                    |
   Update AsyncStorage with new token
   Update AppContext
```

#### 5. API Request with Authentication

```
Frontend                              Backend
   |                                    |
   Request Interceptor:
   - Get token from AsyncStorage
   - Add "Authorization: Bearer {token}"
   |                                    |
   |--- GET /api/dashboard/{id} ------->|
   |     Headers: Authorization: Bearer eyJ...
   |                                    |
   |                       Validate JWT signature
   |                       Check expiration
   |                       Extract claims
   |                       Verify role/permissions
   |                       Execute business logic
   |                                    |
   |<--- 200 OK ----------------------|
   |     {data}                        |
   |                                    |
   Response Interceptor:
   - Process response
   - Log success
```

#### 6. Logout Flow

```
Frontend                              Backend
   |                                    |
   |--- POST /auth/logout ------------->|
   |     {refreshToken}                |
   |                                    |
   |                       Find RefreshToken
   |                       Set RevokedAt = DateTime.UtcNow
   |                                    |
   |<--- 200 OK ----------------------|
   |                                    |
   Remove token from AsyncStorage
   Remove user from AsyncStorage
   Update AppContext (logout)
   Navigate to LoginScreen
```

---

### JWT Token Structure

#### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Payload (Claims)
```json
{
  "sub": "00000000-0000-0000-0000-000000000001",  // User ID
  "email": "user@example.com",
  "role": "Doctor",                               // or "Patient"
  "practitionerId": "00000000-0000-0000-0000-000000000002",  // If Doctor
  "patientId": "00000000-0000-0000-0000-000000000003",       // If Patient
  "iat": 1713360000,                              // Issued at
  "exp": 1713388800                               // Expires (8 hours later)
}
```

#### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

#### Configuration (appsettings.json)
```json
{
  "Jwt": {
    "Key": "THIS_IS_A_SUPER_SECURE_KEY_1234567890",
    "Issuer": "CareExecutionAPI",
    "Audience": "CareExecutionApp"
  }
}
```

---

## Role-Based Access Control

### Role Definition

#### **Patient Role**

**User Entity**:
- `role = "Patient"`
- `patientId = <patient-uuid>`
- `practitionerId = null`

**JWT Claims**:
```json
{
  "sub": "user-id",
  "email": "patient@example.com",
  "role": "Patient",
  "patientId": "patient-uuid"
}
```

**Authorized Endpoints**:
- `GET /patients/daily-tasks` ✅ (required)
- `POST /execution/complete` ✅
- `POST /execution/skip` ✅
- `GET /dashboard/{patientId}/adherence` ✅
- `GET /dashboard/{patientId}/details` ✅
- `GET /patients/{patientId}/timeline` ✅
- `GET /tasks/{taskId}` ✅
- `GET /tasks/search` ✅

**Frontend Navigation**:
- HomeScreen (daily tasks)
- PatientProfileScreen
- TaskHistoryScreen
- PatientDetailsScreen

**Permissions**:
- View own tasks
- Complete/skip own tasks
- View own adherence data
- View own diagnostics
- View own profile

---

#### **Doctor Role**

**User Entity**:
- `role = "Doctor"`
- `practitionerId = <practitioner-uuid>`
- `patientId = null`

**JWT Claims**:
```json
{
  "sub": "user-id",
  "email": "doctor@hospital.com",
  "role": "Doctor",
  "practitionerId": "practitioner-uuid"
}
```

**Authorized Endpoints**:
- `GET /practitioners/{id}` ✅
- `PUT /practitioners/{id}` ✅
- `DELETE /practitioners/{id}` ✅
- `POST /careplans` ✅
- `GET /careplans/{id}` ✅
- `GET /careplans/doctor/{doctorId}` ✅
- `GET /careplans/patient/{patientId}` ✅
- `PUT /careplans/{id}` ✅
- `DELETE /careplans/{id}` ✅
- `POST /careplans/{id}/assign-tasks` ✅
- `POST /tasks` ✅
- `POST /tasks/medication` ✅
- `GET /tasks/{id}` ✅
- `PUT /tasks/{id}` ✅
- `DELETE /tasks/{id}` ✅
- `GET /tasks/search` ✅
- `POST /diagnostics` ✅
- `GET /diagnostics/{id}` ✅
- `GET /diagnostics/patient/{id}` ✅
- `PUT /diagnostics` ✅
- `DELETE /diagnostics/{id}` ✅
- `GET /dashboard/{doctorId}` ✅
- `GET /dashboard/{doctorId}/high-risk` ✅
- `GET /dashboard/{doctorId}/metrics` ✅

**Frontend Navigation**:
- DoctorDashboard
- PatientList
- PatientAdherenceDetail
- CreateCarePlan

**Permissions**:
- Create/manage care plans
- Create/manage tasks
- View all assigned patients
- View patient adherence metrics
- Create/manage diagnoses
- View high-risk patients
- Update practitioner profile

---

### Authorization Enforcement

#### Backend Authorization

**JWT Bearer Validation** (Program.cs):
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            
            ValidIssuer = "CareExecutionAPI",
            ValidAudience = "CareExecutionApp",
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });
```

**Controller Authorization**:
```csharp
[Authorize]                              // Requires any valid token
[Authorize(Roles = "Patient")]           // Requires Patient role
[Authorize(Roles = "Doctor")]            // Requires Doctor role
[AllowAnonymous]                         // Public endpoint
```

**Method-Level Authorization**:
```csharp
// Extract claims and verify ownership
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
var patientId = User.FindFirst("PatientId")?.Value;
var role = User.FindFirst(ClaimTypes.Role)?.Value;

if (userId != practitionerId.ToString() && !User.IsInRole("Admin"))
    return Forbid();
```

---

#### Frontend Authorization

**Route Protection** (AppNavigator.js):
```javascript
if (!isLoggedIn) {
    return <AuthStack />;  // Show login
} else if (isDoctor()) {
    return <DoctorStack />;  // Show doctor app
} else {
    return <PatientStack />;  // Show patient app
}
```

**API Client Authorization**:
```javascript
// Request interceptor adds token
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Error Handling**:
```javascript
// If 401 Unauthorized → logout and redirect
if (err.response?.status === 401) {
    Alert.alert("Session Expired", "Please login again");
    await logout();
}
```

---

## Data Models (DTOs)

### Authentication DTOs

#### **AuthResponse**
**File**: `CareExecution.Application/DTOs/AuthResponse.cs`
```csharp
{
  "accessToken": string,      // JWT access token
  "refreshToken": string      // Refresh token
}
```

---

### Patient DTOs

#### **CreatePatientDto**
```csharp
{
  "name": string,
  "age": int?,
  "gender": string,
  "phone": string,
  "practitionerId": Guid
}
```

#### **DailyTaskDto** (Patient)
```csharp
{
  "taskId": Guid,
  "title": string,
  "type": string,            // "Meal", "Medication", "Activity"
  "scheduledTime": DateTime,
  "status": string           // "Pending", "Completed", "Missed", "Skipped"
}
```

#### **PatientDashboardDto**
```csharp
{
  "patientId": Guid,
  "patientName": string,
  "adherencePercentage": double,
  "missedTasks": int,
  "isAtRisk": bool           // true if adherence < 70%
}
```

#### **PatientDetailedAdherenceDto**
```csharp
{
  "patientId": Guid,
  "patientName": string,
  "email": string,
  "phone": string,
  "currentAdherence": double,       // Last 24 hours
  "weeklyAdherence": double,        // Last 7 days
  "monthlyAdherence": double,       // Last 30 days
  "trend": string,                  // "Improving", "Declining", "Stable"
  "completedTasks": int,
  "skippedTasks": int,
  "missedTasks": int,
  "pendingTasks": int,
  "dailyBreakdown": DailyAdherenceDto[]
}
```

#### **DailyAdherenceDto**
```csharp
{
  "date": DateTime,
  "adherence": double,              // 0-100
  "completed": int,
  "skipped": int,
  "missed": int
}
```

---

### Practitioner DTOs

#### **PractitionerRegistrationDto**
```csharp
{
  "email": string,
  "password": string,
  "name": string,
  "licenseNumber": string,
  "specialization": string,
  "hospital": string,
  "department": string,
  "phoneNumber": string
}
```

#### **PractitionerProfileDto**
```csharp
{
  "id": Guid,
  "email": string,
  "name": string,
  "licenseNumber": string,
  "specialization": string,
  "hospital": string,
  "department": string,
  "phoneNumber": string,
  "createdAt": DateTime
}
```

---

### Care Plan DTOs

#### **CreateCarePlanDto**
```csharp
{
  "patientId": Guid,
  "createdBy": Guid,                // Doctor ID
  "startDate": DateTime?,
  "endDate": DateTime?
}
```

#### **UpdateCarePlanDto**
```csharp
{
  "startDate": DateTime,
  "endDate": DateTime,
  "status": string,                 // "Active", "Paused", "Completed"
  "notes": string
}
```

---

### Task DTOs

#### **CreateTaskDto**
```csharp
{
  "carePlanId": Guid,
  "type": string,                   // "Meal", "Medication", "Activity"
  "title": string,
  "description": string,
  "timeSlots": TimeSpan[]          // e.g., ["09:00:00", "21:00:00"]
}
```

#### **CreateMedicationTaskDto** (extends CreateTaskDto)
```csharp
{
  // ... all CreateTaskDto properties
  "medicineName": string,
  "dosage": string,                 // e.g., "500mg"
  "instructions": string
}
```

#### **UpdateTaskDto**
```csharp
{
  "title": string,
  "description": string,
  "type": string,
  "status": string
}
```

---

### Diagnostic DTOs

#### **CreateDiagnosticDto**
```csharp
{
  "patientId": Guid,
  "diagnosisName": string,
  "diagnosisDate": DateTime,
  "severity": string,               // "Critical", "High", "Medium", "Low"
  "notes": string,
  "icd10Code": string,
  "status": string                  // "Active", "Resolved", "Inactive"
}
```

#### **UpdateDiagnosticDto**
```csharp
{
  "id": Guid,
  "diagnosisName": string,
  "severity": string,
  "notes": string,
  "icd10Code": string,
  "status": string
}
```

#### **DiagnosticDto**
```csharp
{
  "id": Guid,
  "patientId": Guid,
  "diagnosisName": string,
  "diagnosisDate": DateTime,
  "severity": string,
  "notes": string,
  "icd10Code": string,
  "status": string,
  "createdAt": DateTime,
  "updatedAt": DateTime?
}
```

---

### Dashboard DTOs

#### **HighRiskPatientsDto**
```csharp
{
  "patientId": Guid,
  "patientName": string,
  "adherencePercentage": double,
  "missedTasksCount": int,
  "lastTaskDate": DateTime,
  "riskLevel": string              // "Low", "Medium", "High"
}
```

#### **DashboardMetricsDto**
```csharp
{
  "totalPatients": int,
  "activePatients": int,            // Patients with tasks today
  "averageAdherence": double,
  "totalTasks": int,
  "completedTasks": int,
  "missedTasks": int,
  "patientList": PatientDashboardDto[]
}
```

---

### Timeline DTOs

#### **PatientTimelineDto**
```csharp
{
  "taskId": Guid,
  "title": string,
  "type": string,
  "scheduledTime": DateTime,
  "status": string
}
```

---

### Adherence DTOs

#### **AdherenceDto**
```csharp
{
  "patientId": Guid,
  "patientName": string,
  "adherencePercentage": double,
  "completedTasks": int,
  "skippedTasks": int,
  "missedTasks": int,
  "pendingTasks": int,
  "startDate": DateTime,
  "endDate": DateTime
}
```

#### **AdherenceMetricsDto**
```csharp
{
  "patientId": Guid,
  "currentAdherence": double,
  "weeklyAdherence": double,
  "monthlyAdherence": double,
  "trend": string,
  "dailyBreakdown": DailyAdherenceDto[]
}
```

---

## System Workflows

### Patient Task Management Workflow

```
1. Doctor Creates Care Plan
   ├─ Doctor registers / logs in
   ├─ Navigates to CreateCarePlan
   ├─ Enters care plan details (patient, dates)
   ├─ Searches for tasks to assign
   ├─ Selects tasks
   └─ Submits care plan
      └─ Backend: CarePlanService.CreateCarePlanAsync()
      └─ Backend: CarePlanService.AssignTasksToCarePlanAsync()

2. System Generates Task Instances
   ├─ TaskSchedules created for each TimeSlot
   └─ TaskLogs created for patient visibility

3. Patient Views Daily Tasks
   ├─ Patient logs in
   ├─ HomeScreen loads
   ├─ GET /patients/daily-tasks?date=today
   ├─ Backend: PatientService.GetDailyTasks()
   └─ Displays tasks with status

4. Patient Completes/Skips Tasks
   ├─ Patient taps "Complete" or "Skip"
   ├─ POST /execution/complete or /execution/skip
   ├─ Backend: ExecutionService updates TaskLog
   │  └─ Sets Status = "Completed" or "Skipped"
   │  └─ Sets ActualTime = DateTime.UtcNow
   └─ Frontend: Reloads task list

5. Doctor Views Patient Adherence
   ├─ Doctor navigates to PatientAdherenceDetail
   ├─ GET /dashboard/{patientId}/adherence
   ├─ Backend: DashboardService.GetPatientDetailAsync()
   │  └─ Calculates adherence percentages
   │  └─ Counts task statuses
   │  └─ Generates daily breakdown
   └─ Displays detailed metrics
```

---

### Doctor Patient Management Workflow

```
1. Doctor Registration
   ├─ Navigate to DoctorRegistrationScreen
   ├─ Fill in credentials and profile info
   ├─ POST /auth/register-doctor
   ├─ Backend: AuthService.RegisterDoctorAsync()
   │  ├─ Create User with role="Doctor"
   │  ├─ Create Practitioner entity
   │  ├─ Generate JWT and Refresh tokens
   └─ Frontend: Navigate to DoctorDashboard

2. Doctor Assigns Patients
   ├─ POST /patients (creates patient records)
   ├─ Doctor can assign patients during care plan creation
   └─ LinkPractitioner to Patient

3. Doctor Monitors Dashboard
   ├─ DoctorDashboard loads metrics
   ├─ GET /dashboard/{doctorId}
   ├─ Backend: Caches for 30 seconds
   └─ Displays patient adherence snapshot

4. Doctor Creates Care Plans
   ├─ Navigate to CreateCarePlan
   ├─ Select patient
   ├─ Choose tasks
   ├─ POST /careplans
   ├─ POST /careplans/{id}/assign-tasks
   └─ Care plan assigned to patient

5. Doctor Manages Diagnostics
   ├─ POST /diagnostics (create)
   ├─ PUT /diagnostics (update)
   ├─ DELETE /diagnostics (delete)
   ├─ GET /diagnostics/patient/{id} (list)
   └─ Track patient's medical history
```

---

### Authentication Session Lifecycle

```
User Registration/Login
        ↓
Generate JWT (8hr) + Refresh Token (7d)
        ↓
Stored in AsyncStorage
        ↓
AppContext Updated (isLoggedIn=true)
        ↓
Role-Based Navigation
        ↓
   Logged In
   ├─ API calls with Bearer token
   ├─ Token auto-added via interceptor
   ├─ If 401 error → logout
   └─ Token expires in 8 hours
        ↓
   (Auto-refresh if available)
   ├─ POST /auth/refresh
   ├─ New JWT (8hr) + New Refresh Token (7d)
   ├─ Old refresh token revoked
   └─ Continue session
        ↓
   User Logout (manual or session timeout)
   ├─ POST /auth/logout (revoke refresh token)
   ├─ Clear AsyncStorage
   ├─ Reset AppContext
   └─ Navigate to LoginScreen
```

---

## Architecture Gaps & Corrections

1. JWT + Dashboard authorization originally compared route `practitionerId` against `NameIdentifier` (user id), which could block valid doctor access. Controller now validates against `PractitionerId` claim.
2. Notification endpoints were documented but implemented as placeholders. They now use `INotificationService` for preference persistence and notification history retrieval.
3. Scheduler notification dispatch had a null navigation risk when reading `Task -> CarePlan` from TaskLogs. Service now eagerly loads related entities and guards nulls.
4. Startup still included sample/weather/debug code. Program bootstrap now only contains API runtime concerns and enforces presence of `Jwt:Key`.
5. Document runtime versions were stale. Backend and frontend runtime versions are corrected to current code targets.

---

## Additional Configuration Files

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CareExecutionDB;Trusted_Connection=true;"
  },
  "Jwt": {
    "Key": "THIS_IS_A_SUPER_SECURE_KEY_1234567890",
    "Issuer": "CareExecutionAPI",
    "Audience": "CareExecutionApp"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### package.json (Frontend)
```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.81.5",
    "@react-navigation/native": "^7.2.2",
    "@react-navigation/stack": "^7.8.10",
    "axios": "^1.15.0",
    "@react-native-async-storage/async-storage": "2.2.0",
    "expo": "~54.0.33"
  }
}
```

---

## Summary

This document provides a comprehensive technical overview of the Care Execution MVP system covering:

- **12 database entities** with clear relationships and constraints
- **14 backend services** implementing business logic
- **10 backend controllers** with 50+ API endpoints
- **7 frontend screens** organized by role
- **Authentication flow** with JWT and refresh token rotation
- **Role-based access control** for Patient and Doctor roles
- **15+ data transfer objects** for API communication
- **Complete system workflows** for patient task management and doctor oversight

The system is built on clean architecture principles with separation of concerns across Domain, Application, Infrastructure, and API layers.

---

**Last Updated**: April 17, 2026  
**Version**: 1.0  
**Status**: MVP Ready
