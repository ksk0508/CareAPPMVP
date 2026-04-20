# Task Creation Troubleshooting Guide

## Issue
User cannot create task template on localhost:8081 (web version)
Error message: "Care plan not found"

---

## ✅ VERIFIED: What Should Work

The entire workflow is correctly implemented:
- ✅ CreateTaskScreen form is standalone (no care plan references)
- ✅ Backend POST /tasks doesn't require care plans
- ✅ Navigation is proper
- ✅ API calls are correct

---

## 🔍 DEBUGGING STEPS

### Step 1: Check if Backend is Running
```bash
# Open terminal/PowerShell
# Navigate to backend folder
cd backend

# Check if backend is running
curl http://localhost:5160/api/tasks

# Expected response (should not error):
# [] or [list of tasks]
# If error: Backend not running
```

### Step 2: Check Browser Network Tab (MOST IMPORTANT)
1. Open browser (localhost:8081)
2. Press F12 to open DevTools
3. Click "Network" tab
4. **Clear all requests** (small circle with line icon)
5. Click "✏️ Create Task" button on dashboard
6. Watch for HTTP requests
7. **Expected request:**
   - Method: `POST`
   - URL: `http://localhost:5160/api/tasks`
   - Status: `201` (success) or `400`/`401`/`403` (error)

### Step 3: Check Actual Error Response
1. Still in Network tab
2. Click on the POST request to `/api/tasks`
3. Click "Response" tab
4. Look at the error message
5. **What error do you see?**
   - "Title and category are required" → Form not sending data
   - "Only doctors can create tasks" → Not logged in as doctor
   - "Care plan not found" → Backend returning wrong error (BUG)
   - Other error → Report it

### Step 4: Check Browser Console
1. Open DevTools (F12)
2. Click "Console" tab
3. Look for logs that say:
   - `Request: POST http://localhost:5160/api/tasks`
   - `Payload: { title, category, description, instructions }`
   - `Response: 201` or error status
   - `❌ Error creating task:` with error message

### Step 5: Verify You're Logged In as Doctor
```bash
# In browser console, run:
await AsyncStorage.getItem("user")

# Expected response:
# {"id":"...", "email":"doctor@example.com", "role":"Doctor", "practitionerId":"..."}

# If response is null or shows "Patient": NOT logged in as doctor
```

---

## 🚨 IF YOU SEE "Care plan not found"

This error comes from `/api/careplans` endpoint, NOT `/api/tasks`.

**Possible causes:**
1. ❌ WRONG: Wrong route being called
2. ❌ WRONG: Cached error from previous operation
3. ❌ WRONG: Backend bug returning wrong error message
4. ✅ CORRECT: Actually hitting wrong endpoint somehow

**To fix:**
1. Refresh the page (Ctrl+R or Cmd+R)
2. Log out and log back in
3. Try again from Dashboard
4. Check Network tab to confirm POST /tasks is called

If error persists, it means a different endpoint is being called.

---

## 📊 Complete Debug Checklist

Run through these steps in order:

- [ ] Backend running? `curl http://localhost:5160/api/tasks`
- [ ] Logged in? `await AsyncStorage.getItem("user")`
- [ ] Role is "Doctor"? Check above output
- [ ] Form has data? Check TaskData:
  - [ ] title: "BP Check" ✓
  - [ ] category: "Medication" ✓
  - [ ] description: "BP" ✓
  - [ ] instructions: "BP" ✓
- [ ] Click "CREATE TASK" button
- [ ] Network tab shows POST /tasks? (refresh first)
- [ ] Response status is 201 or 4xx?
- [ ] What's the response body?

---

## 🔧 If All Else Fails: Manual Test

1. Open terminal/PowerShell
2. Create auth token:
```bash
curl -X POST http://localhost:5160/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"password123"}'

# Copy the accessToken from response
```

3. Create task manually:
```bash
# Replace TOKEN with token from step above
curl -X POST http://localhost:5160/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title":"BP Check",
    "category":"Monitoring",
    "description":"Daily blood pressure",
    "instructions":"Use BP cuff"
  }'

# Check response:
# Success: { "id": "...", "title": "BP Check", ... }
# Error: { "message": "..." }
```

If manual test works → Frontend issue
If manual test fails → Backend issue

---

## 🐛 Known Issues & Fixes

### Issue: "Care plan not found" on Task Creation Screen

**Status:** Under investigation

**Current findings:**
- POST /tasks route doesn't validate care plans ✓
- CreateTaskScreen doesn't reference care plans ✓
- Form is correctly configured ✓

**Most likely cause:**
- Stale error state from DoctorDashboard
- Or error from unrelated API call

**Solution:**
- Refresh page
- Check Network tab to see actual request

---

## 📋 Expected Behavior

### Correct Flow
```
Doctor Dashboard
  ↓ (Click "✏️ Create Task")
CreateTaskScreen
  ↓ (Fill form + click "CREATE TASK")
POST /api/tasks with { title, category, description, instructions }
  ↓ (Backend creates task)
201 Response { task data }
  ↓ (Frontend shows success alert)
Navigate back to Dashboard
  ↓
Task is now in task library
```

### Error Flow
```
CreateTaskScreen
  ↓ (Missing required fields)
Show error: "Task title is required"
  ↓ (User fills in)
Click "CREATE TASK"
  ↓
POST /api/tasks fails
  ↓ (401 Unauthorized)
Show error: "Only doctors can create tasks"
  ↓
User checks if logged in as Doctor
```

---

## 📞 For Support

When reporting the issue, provide:
1. Screenshot of Network tab showing request/response
2. Console log output (copy from F12 → Console)
3. What error message appears in the red text?
4. Are you logged in as a Doctor?
5. Backend running on 5160?

---

## 🚀 Quick Commands to Run

**Check backend:**
```bash
ps aux | grep node  # Check if node is running
curl http://localhost:5160/api/tasks  # Test endpoint
```

**Check frontend logs:**
```
F12 → Console → Look for:
- 📤 TaskAPI: Sending POST /tasks with data:
- Request: POST http://localhost:5160/api/tasks
- Response: [status code]
```

**Check frontend state:**
```
F12 → Console → Run:
await AsyncStorage.getItem("user")
await AsyncStorage.getItem("token")
```

---

## Next Steps

1. **Immediate:** Check Network tab to see actual request/response
2. **Verify:** Backend is running and /tasks endpoint responds
3. **Confirm:** You're logged in as Doctor (role: "Doctor")
4. **Test:** Form submission with complete data
5. **Report:** What exact error appears in Network response

Once we see the actual Network response, we can fix the real issue.
