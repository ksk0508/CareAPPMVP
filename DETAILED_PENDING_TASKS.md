# Care Execution Platform - Detailed Pending Tasks

**Last Updated**: April 15, 2026  
**Status**: MVP 70% Complete  
**Backend Code Location**: D:\Personal\CarePortal_V1\MVP

---

## 📋 TABLE OF CONTENTS
1. [Backend Tasks](#backend-tasks)
2. [Frontend Tasks](#frontend-tasks)
3. [Database Tasks](#database-tasks)
4. [Configuration Tasks](#configuration-tasks)
5. [Testing & Deployment](#testing--deployment)

---

## 🔧 BACKEND TASKS

### PHASE 1: CRITICAL (Must Have for MVP)

#### Task 1.1: Extend CarePlanService
**Status**: ❌ NOT IMPLEMENTED  
**Location**: `D:\Personal\CarePortal_V1\MVP\CareExecution.Application\Services\CarePlanService.cs`  
**Current Methods**:
- ✅ `CreateCarePlanAsync()` - Exists (basic implementation)

**Missing Methods** (Add to interface ICarePlanService):
```csharp
// Add to: CareExecution.Application\Services\Interfaces\ICarePlanService.cs
Task<CarePlan> GetCarePlanAsync(Guid carePlanId);
Task<List<CarePlan>> GetDoctorCarePlansAsync(Guid doctorId);
Task<List<CarePlan>> GetPatientCarePlansAsync(Guid patientId);
Task UpdateCarePlanAsync(Guid carePlanId, UpdateCarePlanDto dto);
Task DeleteCarePlanAsync(Guid carePlanId);
Task AssignTasksToCarePlanAsync(Guid carePlanId, List<Guid> taskIds);
```

**DTOs Needed**:
- Create: `UpdateCarePlanDto` - StartDate, EndDate, Status, Notes
- Create: `CarePlanDetailDto` - Include tasks and schedules

**Effort**: 3-4 hours

---

#### Task 1.2: Extend TaskService  
**Status**: ⚠️ PARTIALLY IMPLEMENTED  
**Location**: `D:\Personal\CarePortal_V1\MVP\CareExecution.Application\Services\TaskService.cs`  
**Current Methods**:
- ✅ `CreateTaskAsync()` - Exists
- ✅ `CreateMedicationTaskAsync()` - Exists

**Missing Methods** (Add to interface ITaskService):
```csharp
Task<TaskItem> GetTaskAsync(Guid taskId);
Task<List<TaskItem>> GetCarePlanTasksAsync(Guid carePlanId);
Task UpdateTaskAsync(Guid taskId, UpdateTaskDto dto);
Task DeleteTaskAsync(Guid taskId);
Task<List<TaskItem>> SearchTasksAsync(string title, string type);
```

**DTOs Needed**:
- Create: `UpdateTaskDto` - Title, Description, Type, Status
- Create: `TaskDetailDto` - Include schedules and medication info

**Effort**: 3-4 hours

---

#### Task 1.3: Implement AdherenceService
**Status**: ❌ INTERFACE EXISTS, NO IMPLEMENTATION  
**Location**: 
- Interface: `D:\Personal\CarePortal_V1\MVP\CareExecution.Application\Services\Interfaces\IAdherenceService.cs`
- Implementation: MISSING - Create at `CareExecution.Application\Services\AdherenceService.cs`

**Required Methods** (from interface):
```csharp
// Implement these methods:
Task<AdherenceDto> GetAdherenceAsync(Guid patientId, DateTime startDate, DateTime endDate);
Task<List<AdherenceDto>> GetAllPatientsAdherenceAsync(Guid practitionerId, DateTime startDate, DateTime endDate);
Task<AdherenceMetricsDto> CalculateAdherenceMetricsAsync(Guid patientId);
```

**Business Logic**:
```
Adherence % = (Completed Tasks / Total Tasks) × 100
- Get all TaskLogs for patient in date range
- Count: Completed, Skipped, Missed, Pending
- Calculate adherence score
- Return trends/metrics
```

**DTOs to Create**:
```csharp
public class AdherenceDto
{
    public Guid PatientId { get; set; }
    public double AdherencePercentage { get; set; }
    public int CompletedTasks { get; set; }
    public int SkippedTasks { get; set; }
    public int MissedTasks { get; set; }
    public int PendingTasks { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class AdherenceMetricsDto
{
    public Guid PatientId { get; set; }
    public double CurrentAdherence { get; set; }     // This week %
    public double WeeklyAdherence { get; set; }      // Last 7 days %
    public double MonthlyAdherence { get; set; }     // Last 30 days %
    public List<DailyAdherenceDto> DailyBreakdown { get; set; }
    public string Trend { get; set; }                // "Increasing", "Stable", "Decreasing"
}
```

**Effort**: 4-5 hours

---

#### Task 1.4: Extend DashboardService
**Status**: ⚠️ PARTIALLY IMPLEMENTED  
**Location**: `D:\Personal\CarePortal_V1\MVP\CareExecution.Application\Services\DashboardService.cs`

**Current**:
- ✅ `GetDashboardAsync()` - Returns patient list with today's task status

**Missing Enhancements**:
```csharp
// Add methods:
Task<PatientDetailedAdherenceDto> GetPatientDetailAsync(Guid patientId);
Task<List<HighRiskPatientsDto>> GetHighRiskPatientsAsync(Guid practitionerId);
Task<DashboardMetricsDto> GetGeneralMetricsAsync(Guid practitionerId);
```

**New DTOs**:
- `PatientDetailedAdherenceDto` - Full patient profile + adherence stats
- `HighRiskPatientsDto` - Patients with low adherence
- `DashboardMetricsDto` - Total stats (patients count, avg adherence, etc)

**Effort**: 2-3 hours

---

#### Task 1.5: Complete ExecutionService (Already Created)
**Status**: ✅ CREATED BUT NEEDS AUTHORIZATION CHECK  
**Location**: `D:\Personal\CarePortal_V1\MVP\CareExecution.Application\Services\ExecutionService.cs`

**Updates Needed**:
```csharp
// Add validation:
- Verify task belongs to patient making request
- Verify task is not already completed/skipped
- Verify scheduled time is not in future
- Log who completed the task (for audit)
```

**Effort**: 1-2 hours

---

### PHASE 2: IMPORTANT (Nice to Have for MVP)

#### Task 2.1: Implement NotificationService Properly
**Status**: ⚠️ STUB IMPLEMENTATION  
**Location**: `D:\Personal\CarePortal_V1\MVP\CareExecution.Infrastructure\External\Notification\NotificationService.cs`

**Current**: Generic HTTP client sending to external API  
**Needed**: 
- Firebase Cloud Messaging (FCM) integration
- Task reminder notifications
- Missed task alerts
- Daily summary notifications

**Implementation**:
```csharp
// Create firebase integration
public class FirebaseNotificationService : INotificationService
{
    // Send to FCM topic
    // Handle token refresh
    // Track delivery status
    // Log failed attempts
}
```

**Effort**: 4-5 hours

---

#### Task 2.2: Create NotificationPreferenceService
**Status**: ❌ NOT STARTED

**Services Needed**:
```csharp
public interface INotificationPreferenceService
{
    Task SetNotificationTimesAsync(Guid userId, TimeSpan[] times);
    Task EnableDisableNotificationsAsync(Guid userId, bool enabled);
    Task<NotificationPreferencesDto> GetPreferencesAsync(Guid userId);
}
```

**Effort**: 2-3 hours

---

#### Task 2.3: Enhance TimelineService
**Status**: ⚠️ EXISTS, NEEDS VERIFICATION  
**Location**: `D:\Personal\CarePortal_V1\MVP\CareExecution.Application\Services\TimelineService.cs`

**Check If Methods Exist**:
- Get patient activity timeline
- Get daily task history
- Get adherence timeline

**Effort**: 1-2 hours

---

### PHASE 3: BACKEND API FIXES

#### Task 3.1: Add Authorization to Controllers
**Status**: ⚠️ SOME ENDPOINTS MISSING [Authorize]

**Where**: All controller methods that need auth  
**Add Attributes**:
```csharp
[Authorize]
[HttpGet("{practitionerId}")]
public async Task<IActionResult> Get(Guid practitionerId)
{
    // Verify user is accessing own data or has admin role
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userId != practitionerId.ToString() && !User.IsInRole("Admin"))
        return Forbid();
        
    // ... rest of code
}
```

**Controllers to Check**:
- DashboardController
- CarePlansController
- TimelineController

**Effort**: 1-2 hours

---

#### Task 3.2: Extend DashboardController
**Status**: ⚠️ BASIC IMPLEMENTATION  
**Location**: `D:\Personal\CarePortal_V1\MVP\CareExecution.API\Controller\DashboardController.cs`

**Add Endpoints**:
```csharp
// Already exists:
[HttpGet("{practitionerId}")]
public async Task<IActionResult> Get(Guid practitionerId)

// Add:
[HttpGet("{patientId}/adherence")]
public async Task<IActionResult> GetPatientAdherence(Guid patientId)

[HttpGet("{practitionerId}/high-risk")]
public async Task<IActionResult> GetHighRiskPatients(Guid practitionerId)

[HttpGet("{practitionerId}/metrics")]
public async Task<IActionResult> GetMetrics(Guid practitionerId)

[HttpGet("{patientId}/details")]
public async Task<IActionResult> GetPatientDetails(Guid patientId)
```

**Effort**: 2 hours

---

#### Task 3.3: Create NotificationController
**Status**: ❌ NOT CREATED

**Location**: Create `D:\Personal\CarePortal_V1\MVP\CareExecution.API\Controller\NotificationController.cs`

**Endpoints Needed**:
```csharp
[Authorize]
[HttpPost("preferences")]
public async Task<IActionResult> SetPreferences(NotificationPreferencesDto dto)

[Authorize]
[HttpGet("preferences")]
public async Task<IActionResult> GetPreferences()

[Authorize]
[HttpPost("enable-disable")]
public async Task<IActionResult> EnableDisableNotifications(bool enable)

[Authorize]
[HttpGet("history")]
public async Task<IActionResult> GetNotificationHistory(Guid? userId)
```

**Effort**: 2 hours

---

#### Task 3.4: Extend CarePlansController
**Status**: ⚠️ ONLY CREATE METHOD

**Add Endpoints**:
```csharp
// Exists:
[HttpPost]
public async Task<IActionResult> Create(CreateCarePlanDto dto)

// Add:
[HttpGet("{carePlanId}")]
public async Task<IActionResult> GetById(Guid carePlanId)

[HttpGet("doctor/{doctorId}")]
public async Task<IActionResult> GetDoctorPlans(Guid doctorId)

[HttpGet("patient/{patientId}")]
public async Task<IActionResult> GetPatientPlans(Guid patientId)

[HttpPut("{carePlanId}")]
public async Task<IActionResult> Update(Guid carePlanId, UpdateCarePlanDto dto)

[HttpDelete("{carePlanId}")]
public async Task<IActionResult> Delete(Guid carePlanId)
```

**Effort**: 2 hours

---

## 📱 FRONTEND TASKS

### PHASE 1: CRITICAL (Must Have for MVP)

#### Task F1.1: Implement Role-Based Navigation
**Status**: ❌ NOT IMPLEMENTED  
**Location**: `d:\Personal\CarePortal_V1\Care_UI\care-mobile-clean\src\navigation\AppNavigator.js`  
**Current**: Always shows PatientStack

**Changes Needed**:
```javascript
// In AppContext.js - add role to user object
// In AppNavigator.js - check role:
{user.role === "Doctor" ? <DoctorStack /> : <PatientStack />}
```

**Effort**: 2-3 hours

---

#### Task F1.2: Create Doctor Dashboard Screen
**Status**: ❌ NOT STARTED  
**Location**: Create folder `src/screens/doctor/`

**Screens to Create**:

1. **DoctorDashboard.js** - Main doctor view
   - List of assigned patients
   - Each patient shows: Name, Adherence %, Last activity
   - Filter/search patients
   - Navigate to patient detail

2. **PatientAdherenceDetail.js** - Patient adherence view
   - Patient name & info
   - Current adherence %
   - Weekly/monthly trends
   - Task completion history
   - High-risk indicators

3. **CreateCarePlan.js** - Create care plan wizard
   - Select patient
   - Add tasks (medication, diet, activity)
   - Define schedules
   - Set duration
   - Review & submit

**Effort**: 12-15 hours

---

#### Task F1.3: Create API Integration Modules
**Status**: ⚠️ PARTIAL  
**Location**: Create in `src/api/`

**New Files**:
1. `carePlanApi.js`:
   ```javascript
   export const createCarePlan = (dto) => client.post("/careplans", dto);
   export const getCarePlan = (id) => client.get(`/careplans/${id}`);
   export const getDoctorPlans = (doctorId) => client.get(`/careplans/doctor/${doctorId}`);
   export const getPatientPlans = (patientId) => client.get(`/careplans/patient/${patientId}`);
   export const updateCarePlan = (id, dto) => client.put(`/careplans/${id}`, dto);
   export const deleteCarePlan = (id) => client.delete(`/careplans/${id}`);
   ```

2. `dashboardApi.js`:
   ```javascript
   export const getDashboard = (practitionerId) => client.get(`/dashboard/${practitionerId}`);
   export const getPatientAdherence = (patientId) => client.get(`/dashboard/${patientId}/adherence`);
   export const getHighRiskPatients = (practitionerId) => client.get(`/dashboard/${practitionerId}/high-risk`);
   export const getMetrics = (practitionerId) => client.get(`/dashboard/${practitionerId}/metrics`);
   export const getPatientDetail = (patientId) => client.get(`/dashboard/${patientId}/details`);
   ```

3. `notificationApi.js`:
   ```javascript
   export const setPreferences = (preferences) => client.post("/notifications/preferences", preferences);
   export const getPreferences = () => client.get("/notifications/preferences");
   export const enableDisable = (enabled) => client.post("/notifications/enable-disable", { enabled });
   export const getHistory = () => client.get("/notifications/history");
   ```

**Effort**: 2-3 hours

---

#### Task F1.4: Update AppContext for Doctor Role
**Status**: ⚠️ PARTIAL  
**Location**: `src/context/AppContext.js`

**Add**:
```javascript
// Store doctor-specific data
{
  user: { id, email, role, patientId, doctorId },
  isDcotor: user.role === "Doctor",
  isPatient: user.role === "Patient",
  // ...
}
```

**Effort**: 1 hour

---

### PHASE 2: IMPORTANT

#### Task F2.1: Create Patient Profile Screen
**Status**: ❌ NOT STARTED  
**Location**: Create `src/screens/patient/ProfileScreen.js`

**Display**:
- Patient name, email, phone
- Medical history (if available)
- Current medications
- Adherence statistics
- Settings (notification preferences)
- Logout button

**Effort**: 4-5 hours

---

#### Task F2.2: Create Task History Screen
**Status**: ❌ NOT STARTED  
**Location**: Create `src/screens/patient/TaskHistoryScreen.js`

**Display**:
- Calendar view or list of past tasks
- Filter by status (completed, skipped, missed)
- Filter by date range
- Show adherence % over time

**Effort**: 4-5 hours

---

#### Task F2.3: Implement Push Notifications UI
**Status**: ❌ NOT STARTED

**Components**:
- Notification preference screen
- Set reminder times
- Enable/disable notifications
- View notification history

**Effort**: 3-4 hours

---

#### Task F2.4: Create Adherence Display Component
**Status**: ❌ NOT STARTED  
**Location**: Create `src/components/AdherenceCard.js`

**Show**:
- Current adherence %
- Weekly/monthly trends
- Visual chart (progress bar or graph)
- Status indicator (good/warning/poor)

**Effort**: 2-3 hours

---

## 🗄️ DATABASE TASKS

### Task D1: Create Missing Tables (If Not Exists)

**Check If These Tables Exist**:
- ✅ Users
- ✅ Patients
- ✅ CarePlans
- ✅ Tasks
- ✅ TaskLogs
- ✅ TaskSchedules
- ✅ MedicationDetails
- ✅ RefreshTokens
- ❓ NotificationPreferences - **MAY NEED TO CREATE**
- ❓ NotificationHistory - **MAY NEED TO CREATE**

**If Missing, Create**:

```sql
-- NotificationPreferences Table
CREATE TABLE NotificationPreferences (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(Id),
    ReminderTimes NVARCHAR(MAX), -- JSON array of times [08:00, 12:00, 18:00]
    Enabled BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME DEFAULT GETUTCDATE()
);

-- NotificationHistory Table
CREATE TABLE NotificationHistory (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(Id),
    Type NVARCHAR(50), -- Reminder, Alert, Summary
    Title NVARCHAR(255),
    Message NVARCHAR(MAX),
    Status NVARCHAR(50), -- Sent, Failed, Delivered
    SentAt DATETIME,
    DeliveredAt DATETIME NULL,
    FailureReason NVARCHAR(MAX) NULL
);
```

**Effort**: 1 hour (if needed)

---

### Task D2: Create EF Core Entity Models (If Not Exists)

**Check/Create**:
- `NotificationPreference.cs` - Model for notification prefs
- `NotificationLog.cs` - Model for notification history

**Add DbSet to DbContext**:
```csharp
public DbSet<NotificationPreference> NotificationPreferences { get; set; }
public DbSet<NotificationLog> NotificationLogs { get; set; }
```

**Effort**: 1-2 hours

---

## ⚙️ CONFIGURATION TASKS

### Task C1: Setup Firebase Configuration
**Status**: ❌ NOT STARTED

**Required**:
1. Create Firebase project (if not exists)
2. Get credentials JSON file
3. Add to `appsettings.json`:
   ```json
   "Firebase": {
     "Project": "your-project-id",
     "PrivateKey": "...",
     "ClientEmail": "..."
   }
   ```
4. Setup FCM topic for notifications

**Effort**: 2-3 hours

---

### Task C2: Update appsettings.json
**Status**: ⚠️ VERIFY

**Check If Configured**:
- ✅ JWT settings
- ✅ Database connection
- ✅ CORS
- ❓ Firebase config
- ❓ Notification service config

**Effort**: 30 mins

---

### Task C3: Create Frontend Environment Config
**Status**: ❌ NOT STARTED

**Create**: `.env` file in frontend root
```
REACT_APP_API_BASE_URL=https://localhost:7298/api
REACT_APP_FIREBASE_KEY=...
REACT_APP_ENV=development
```

**Effort**: 30 mins

---

## 🧪 TESTING & DEPLOYMENT

### Task T1: Unit Tests for Services
**Status**: ❌ NOT STARTED

**Tests Needed**:
- CarePlanService tests
- AdherenceService tests
- DashboardService tests
- ExecutionService tests

**Effort**: 4-5 hours

---

### Task T2: Integration Tests for APIs
**Status**: ❌ NOT STARTED

**Test All Endpoints**:
- Authentication endpoints
- Dashboard endpoints
- Care plan endpoints
- Execution endpoints

**Effort**: 4-5 hours

---

### Task T3: End-to-End Testing
**Status**: ❌ NOT STARTED

**Test Workflows**:
1. Doctor creates care plan → Patient sees tasks → Completes task → Doctor sees in dashboard
2. Patient skips task → Dashboard shows skip
3. Notifications sent at scheduled times
4. Adherence calculation works

**Effort**: 3-4 hours

---

### Task T4: Performance Optimization
**Status**: ⚠️ PARTIAL (Caching exists)

**Optimize**:
- Dashboard query performance
- Add database indexes
- Optimize notification queries

**Effort**: 2-3 hours

---

## 📊 TASK SUMMARY & TIMELINE

### Backend Implementation Timeline

| Phase | Tasks | Hours | Completion |
|-------|-------|-------|-----------|
| **Phase 1** | Extend CarePlan, Task, Adherence | 12-13 hrs | Critical |
| **Phase 2** | Notifications, Preferences | 6-8 hrs | Important |
| **Phase 3** | API Fixes, Controllers | 8 hrs | Critical |
| **Total Backend** | | **26-29 hrs** | |

### Frontend Implementation Timeline

| Phase | Tasks | Hours | Completion |
|-------|-------|-------|-----------|
| **Phase 1** | Role routing, Doctor Dashboard, APIs | 17-20 hrs | Critical |
| **Phase 2** | Profile, History, Notifications | 11-14 hrs | Important |
| **Total Frontend** | | **28-34 hrs** | |

### Overall Timeline
- **Backend**: 26-29 hours
- **Frontend**: 28-34 hours
- **Database & Config**: 5-6 hours
- **Testing**: 11-14 hours
- **Total MVP**: **70-83 hours** (~2-2.5 weeks full-time)

---

## ✅ RECOMMENDED IMPLEMENTATION ORDER

### Week 1 (HIGH PRIORITY)
1. Backend: Extend CarePlanService (3 hrs)
2. Backend: Extend TaskService (3 hrs)
3. Backend: Implement AdherenceService (5 hrs)
4. Backend: Extend DashboardService (2 hrs)
5. **Total**: 13 hours

### Week 2 (HIGH PRIORITY)
6. Frontend: Role-based navigation (2 hrs)
7. Frontend: Doctor Dashboard screens (15 hrs)
8. Frontend: API modules (3 hrs)
9. **Total**: 20 hours

### Week 3 (MEDIUM PRIORITY)
10. Backend: Add authorization to controllers (1 hr)
11. Backend: Extend controller endpoints (4 hrs)
12. Frontend: Patient profile screen (4 hrs)
13. Backend: Notifications setup (4 hrs)
14. **Total**: 13 hours

### Week 4+ (NON-CRITICAL)
- Testing & QA
- Performance optimization
- Nice-to-have features

---

## 🎯 CRITICAL PATH (Minimum for MVP)

**Must Complete** (in order):
1. ✅ Patient login - DONE
2. Extend CarePlanService
3. Extend TaskService
4. Implement AdherenceService
5. Role-based navigation
6. Doctor Dashboard UI
7. API integration for doctor features
8. Testing

**Estimated Time**: 40-50 hours (1.5-2 weeks)

---

*For questions or clarifications on any task, refer to file paths provided above.*
