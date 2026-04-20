# 🧪 TESTING GUIDE - Care Portal MVP

## 📌 Quick Reference

**Backend**: `https://localhost:7298/api`
**Frontend**: `http://localhost:19006` (press 'w' when running npm start)
**Test Duration**: ~30-45 minutes for full end-to-end suite

---

## ✅ Pre-Test Checklist

Run these commands before starting tests:

```powershell
# Terminal 1: Backend
cd D:\Personal\CarePortal_V1\MVP\CareExecution.API
dotnet run

# Wait for: "Now listening on: https://localhost:7298"
# Then open Terminal 2

# Terminal 2: Frontend  
cd D:\Personal\CarePortal_V1\Care_UI\care-mobile-clean
npm start
# Press 'w' or visit http://localhost:19006
```

**Verify Both Are Running:**
- Backend shows no errors in logs
- Frontend shows no red errors in console
- Browser opens to login screen

---

## 🧑‍🦱 TEST FLOW 1: PATIENT JOURNEY

**Goal**: Verify patient can complete full workflow
**Estimated Time**: 10 minutes
**Test User**: Patient credentials from database

### Step 1.1: Login
- [ ] Open `http://localhost:19006`
- [ ] Enter patient email
- [ ] Enter patient password
- [ ] Click "Login" button
- **Expected**: Redirects to "Today's Tasks" screen in 2-3 seconds
- **Check**: No "Buffer is not defined" error

### Step 1.2: View Daily Tasks
- [ ] Should see list of tasks
- [ ] Each task shows: title, type, scheduled time, status badge
- **Expected**: At least 1-2 tasks visible (if created in database)
- **If empty**: Create tasks in database with TODAY's date

### Step 1.3: Complete a Task
- [ ] Click "✓ Complete" button on any task
- [ ] If prompted, confirm completion
- **Expected**: Success alert appears
- **Expected**: Task status changes to "Completed"
- **Expected**: Button becomes disabled

### Step 1.4: Skip a Task
- [ ] Click "✕ Skip" button on another task
- [ ] Confirm "Skip" in dialog
- **Expected**: Success alert appears
- **Expected**: Task status changes to "Skipped"
- **Expected**: Button becomes disabled

### Step 1.5: Refresh Tasks
- [ ] Click "Refresh" button
- **Expected**: Task list reloads
- **Expected**: Completed/skipped tasks still show updated status
- **Check**: No errors in console

### Step 1.6: View Profile
- [ ] Click "View Profile" button
- **Expected**: Navigates to "My Profile" screen
- [ ] Should show:
  - Personal info: Name, Email, Phone
  - Medical info: Blood type, Conditions, Allergies, Medications
  - Emergency contact information
- **Expected**: No empty fields (if data in JWT)
- **Check**: Can scroll all content

### Step 1.7: View Task History
- [ ] Click back to "Today's Tasks"
- [ ] Click "Task History" button
- **Expected**: Navigates to "Task History" screen
- [ ] Should see statistics: Completed, Pending, Skipped, Missed counts
- [ ] Filter buttons visible: All, Completed, Pending, Skipped
- [ ] Should see tasks from past 7 days

### Step 1.8: Filter Task History
- [ ] Click "Completed" filter
- **Expected**: Shows only completed tasks
- [ ] Click "Pending" filter
- **Expected**: Shows only pending tasks
- [ ] Click "All" filter
- **Expected**: Shows all tasks again
- **Check**: Task counts match filter results

### Step 1.9: Logout
- [ ] Click back to "Today's Tasks"
- [ ] Click "Logout" button
- [ ] Confirm logout in dialog
- **Expected**: Returns to login screen
- **Expected**: All credentials cleared (can't see previous user data)

### Step 1.10: Session Persistence
- [ ] Go back and login again
- [ ] Click "Refresh" on browser (F5)
- **Expected**: Stays on "Today's Tasks" (doesn't logout)
- [ ] Close browser completely and reopen
- **Expected**: Auto-logs in to patient account
- **Check**: Session persists in AsyncStorage

---

## 👨‍⚕️ TEST FLOW 2: DOCTOR JOURNEY

**Goal**: Verify doctor can manage patients and create plans
**Estimated Time**: 15 minutes
**Test User**: Doctor credentials from database

### Step 2.1: Login as Doctor
- [ ] Open `http://localhost:19006` (or already there from previous test)
- [ ] Logout if needed (follow Step 1.9)
- [ ] Enter doctor email
- [ ] Enter doctor password
- [ ] Click "Login" button
- **Expected**: Redirects to "Doctor Dashboard" NOT "Today's Tasks"
- **Check**: Confirms role-based routing working

### Step 2.2: View Doctor Dashboard
- [ ] Should see metrics cards:
  - Total Patients count
  - Active Today count
  - Average Adherence %
  - Completed Tasks count
- [ ] Should see "Today's Task Status" section with patient list
- [ ] Each patient card shows: name, adherence %, missed tasks
- **Expected**: At least 1 patient visible (if assigned to doctor)
- **Check**: Adherence colors: Green (≥75%), Orange (50-74%), Red (<50%)

### Step 2.3: View Patient List
- [ ] Click "View My Patients" button
- **Expected**: Navigates to "My Patients" screen
- [ ] Should see searchable list of assigned patients
- [ ] Each patient shows: name, care plan count, last status

### Step 2.4: Search for Patient
- [ ] Type patient name in search box
- **Expected**: List filters to matching patients
- [ ] Clear search (click ✕)
- **Expected**: Shows all patients again
- **Check**: Search is case-insensitive

### Step 2.5: Select Patient & View Adherence
- [ ] Click on a patient
- [ ] Click "View Adherence" in popup menu
- **Expected**: Navigates to patient detail screen
- [ ] Should see large adherence circle (%)
- [ ] Should show: "Excellent", "Moderate", or "Poor" status
- [ ] Should show task breakdown: Completed, Pending, Skipped, Missed counts

### Step 2.6: View Adherence Trends
- [ ] Scroll down on patient adherence screen
- [ ] Should see "Trends" section with:
  - Current Adherence %
  - 7-day average %
  - Monthly average %
  - Trend direction (Improving/Declining/Stable)
- **Expected**: Trend indicator has appropriate color

### Step 2.7: View Daily Breakdown
- [ ] Continue scrolling
- [ ] Should see "Daily Breakdown" section
- [ ] Each day shows a progress bar with adherence %
- **Expected**: Bar color matches adherence level
- **Check**: 7 days of history visible

### Step 2.8: Create Care Plan - Step 1
- [ ] Go back to dashboard (click back button)
- [ ] Click "Create Care Plan" button
- **Expected**: Navigates to care plan creation screen
- [ ] Should see form with:
  - Care Plan Title (required)
  - Description (optional)
  - Patient ID (required)
  - Start Date
  - End Date
- [ ] Fill in form:
  - Title: "Hypertension Management"
  - Description: "Initial care plan"
  - Patient ID: (select a patient or enter ID)
  - Start Date: (today's date)
  - End Date: (7 days from today)
- [ ] Click "Next: Select Tasks"
- **Expected**: Validates form, proceeds to step 2

### Step 2.9: Create Care Plan - Step 2
- [ ] Should see "Search and Select Tasks" section
- [ ] Search box visible
- [ ] Type task name in search (e.g., "medication")
- [ ] Click "Search" button
- **Expected**: Task list appears with matching tasks
- [ ] Each task shows: title, type, checkbox

### Step 2.10: Assign Tasks to Care Plan
- [ ] Click checkbox on 2-3 tasks
- **Expected**: Tasks highlighted in blue
- **Expected**: Summary shows "X tasks selected"
- [ ] Click checkbox again to deselect
- **Expected**: Task deselected and summary updates

### Step 2.11: Finalize Care Plan
- [ ] Select 2-3 tasks (keep checkboxes checked)
- [ ] Click "Create Care Plan" button
- **Expected**: Success alert appears
- **Expected**: Screen closes and returns to dashboard
- **Check**: "Care plan created successfully with tasks assigned" message

---

## 🔄 TEST FLOW 3: END-TO-END WORKFLOW

**Goal**: Complete workflow from doctor creating plan to patient executing
**Estimated Time**: 10 minutes
**Prerequisite**: Both doctor and patient test accounts

### Step 3.1: Doctor Creates Care Plan
- [ ] Login as doctor (follow Step 2.1)
- [ ] Click "Create Care Plan"
- [ ] Fill form (Step 2.8)
  - Assign to a test patient
  - Use today's date for start date
- [ ] Select 2-3 tasks
- [ ] Click "Create Care Plan"
- **Expected**: Success alert

### Step 3.2: Verify Tasks Created
- [ ] Note the task names selected
- [ ] Click back several times or logout

### Step 3.3: Patient Sees New Tasks
- [ ] Logout (follow Step 1.9)
- [ ] Login as the patient you assigned tasks to (Step 1.1)
- [ ] Should see "Today's Tasks" with NEW tasks visible
- **Expected**: Task titles match what doctor selected
- **Expected**: Scheduled times match task configuration

### Step 3.4: Patient Completes Tasks
- [ ] Complete 1-2 of the new tasks (Step 1.3)
- [ ] Click "Refresh" to confirm completion
- **Expected**: Task statuses update

### Step 3.5: Doctor Checks Updated Adherence
- [ ] Logout (Step 1.9)
- [ ] Login as doctor (Step 2.1)
- [ ] Go to patient detail (Step 2.5)
- **Expected**: Adherence % increased
- **Expected**: Completed task count increased
- **Expected**: Task breakdown updated to reflect new completion

### Step 3.6: End-to-End Verified ✅
- Completion Status: Doctor → Patient → Task → Completion → Adherence Update

---

## 🚨 ERROR SCENARIOS TO TEST

### Scenario E1: Network Error
- [ ] Disconnect WiFi/internet
- [ ] Try to login
- **Expected**: Error message displays: "Network error" or similar
- [ ] Reconnect internet
- [ ] Click "Retry"
- **Expected**: Login succeeds

### Scenario E2: Invalid Credentials
- [ ] Enter wrong email or password
- [ ] Click "Login"
- **Expected**: Error message displays
- **Expected**: Not allowed to proceed
- **Expected**: Can try again

### Scenario E3: Session Expired
- [ ] Login as patient (Step 1.1)
- [ ] Open browser console (F12)
- [ ] In console, run: `await AsyncStorage.removeItem('token')`
- [ ] Try to complete a task
- **Expected**: 401 error OR logout screen appears
- **Expected**: Must login again

### Scenario E4: Logout While Viewing
- [ ] Login as patient (Step 1.1)
- [ ] Click "View Profile"
- [ ] Click "Logout"
- [ ] Confirm logout
- **Expected**: Returns to login screen immediately
- **Expected**: Profile screen doesn't show data

### Scenario E5: Empty Care Plan List (No Patients)
- [ ] Doctor with no assigned patients
- [ ] Click "View My Patients"
- **Expected**: Empty state message shows
- **Expected**: Can still click "Create Care Plan"

---

## ✅ TEST SUCCESS CRITERIA

### Patient Flow Complete When:
- [x] Can login
- [x] Can see daily tasks
- [x] Can complete task
- [x] Can skip task
- [x] Can view profile
- [x] Can view task history with filtering
- [x] Can logout
- [x] Session persists

### Doctor Flow Complete When:
- [x] Can login to doctor dashboard
- [x] Can see patient list
- [x] Can search patients
- [x] Can view patient adherence
- [x] Can create care plan
- [x] Can select and assign tasks

### End-to-End Complete When:
- [x] Doctor creates plan
- [x] Patient sees tasks
- [x] Patient completes tasks
- [x] Doctor sees adherence update

### All Scenarios Pass When:
- [x] No JavaScript errors in console
- [x] No red error boxes on screen
- [x] API calls complete in <3 seconds
- [x] No "500 Internal Server Error"
- [x] Navigation works correctly
- [x] Role-based access enforced

---

## 📊 Test Results Template

```
PATIENT FLOW: [PASS/FAIL]
- Login: [PASS/FAIL]
- View Tasks: [PASS/FAIL]
- Complete Task: [PASS/FAIL]
- Skip Task: [PASS/FAIL]
- View Profile: [PASS/FAIL]
- View History: [PASS/FAIL]
- Logout: [PASS/FAIL]

DOCTOR FLOW: [PASS/FAIL]
- Login: [PASS/FAIL]
- Dashboard: [PASS/FAIL]
- Patient List: [PASS/FAIL]
- View Adherence: [PASS/FAIL]
- Create Plan: [PASS/FAIL]

END-TO-END: [PASS/FAIL]
- Doctor → Patient: [PASS/FAIL]
- Patient Executes: [PASS/FAIL]
- Adherence Updates: [PASS/FAIL]

ERRORS: [PASS/FAIL]
- Network Error: [PASS/FAIL]
- Invalid Login: [PASS/FAIL]
- Session Expired: [PASS/FAIL]
```

---

## 🔧 Common Test Issues & Fixes

### Issue: "No tasks visible"
**Cause**: No tasks created for today's date in database
**Fix**: Create tasks in database with today's date
**SQL**: Insert into TaskSchedules with `ScheduledDate = CAST(GETDATE() AS DATE)`

### Issue: "Patient list empty"
**Cause**: Doctor has no assigned patients
**Fix**: Create CarePlan linking doctor to patient
**SQL**: Insert into CarePlans with PractitionerId and PatientId

### Issue: "Adherence shows 0%"
**Cause**: No TaskLogs created (no task completions)
**Fix**: Complete a task first (Step 1.3)
**Verify**: TaskLogs table has entries after completion

### Issue: Browser won't load
**Cause**: Frontend not running or wrong port
**Fix**: 
```bash
ps aux | grep npm  # check if running
npm start  # restart
```

### Issue: Backend returns 500 error
**Cause**: Database connection, JWT key, or exception
**Fix**: 
1. Check backend logs for exception
2. Check database connection string
3. Verify JWT key in appsettings.json

---

## 📝 Logging & Debugging

### Enable Console Logging
- [ ] Open browser F12 (Developer Tools)
- [ ] Go to Console tab
- [ ] Perform test action
- [ ] Read all logs (Request, Response, Errors)

### Check Network Requests
- [ ] Open F12 → Network tab
- [ ] Perform action (login, complete task)
- [ ] Check request/response:
  - Status should be 200, 201, or 400
  - Should NOT be 500
  - Should have Bearer token in header

### Backend Logs
- [ ] Check terminal where `dotnet run` is running
- [ ] Should show request logs
- [ ] Watch for ERROR or Exception messages

---

## 🎯 Testing Checklist Summary

**Before Testing**:
- [ ] Backend running: `https://localhost:7298`
- [ ] Frontend running: `http://localhost:19006`
- [ ] No errors on screens
- [ ] Browser console clean

**Patient Tests** (10 min):
- [ ] Login → Tasks → Profile → History → Logout
- [ ] Complete task works
- [ ] Skip task works
- [ ] Session persists

**Doctor Tests** (15 min):
- [ ] Login → Dashboard → Patients → Adherence → Create Plan
- [ ] All metrics display
- [ ] Search works
- [ ] Plan creation works

**End-to-End** (10 min):
- [ ] Doctor creates plan
- [ ] Patient sees task
- [ ] Patient completes
- [ ] Doctor sees update

**Error Handling** (5 min):
- [ ] Network error handled
- [ ] Invalid login handled
- [ ] Session expiry handled

---

## 📞 Don't Hesitate to Check

**Database Issues**:
- Query Users table to verify test accounts exist
- Query CarePlans to verify assignments
- Query TaskSchedules to verify tasks have today's date

**Backend Issues**:
- Check appsettings.json for JWT key
- Check connection string
- Look at backend logs for exceptions

**Frontend Issues**:
- F12 Console for JavaScript errors
- F12 Network tab for API issues
- Check npm start output for warnings

---

## ✨ Success!

When all test flows pass:
- ✅ MVP is working end-to-end
- ✅ Role-based access verified
- ✅ Data flows correctly
- ✅ Ready for Phase 3 (Notifications)

**Time to celebrate!** 🎉
