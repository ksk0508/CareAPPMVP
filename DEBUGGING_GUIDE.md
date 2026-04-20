# 🐛 Debugging Guide - Logout & Navigation Issues

## Quick Fix: Clear Stale Data

If the app is showing the task page directly without login, there's likely stale data in AsyncStorage.

### Option 1: Use the Debug Button (In App)
1. Open the app at `http://localhost:8081/`
2. Look for the **🧹 "Clear All Data"** button at the top of the screen
3. Click it to clear all stored authentication data
4. The app should automatically redirect to the Login screen
5. Try logging in again

### Option 2: Use Browser Dev Tools
1. Open `http://localhost:8081/`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this command:
   ```javascript
   await AsyncStorage.removeItem('token'); 
   await AsyncStorage.removeItem('user');
   location.reload();
   ```
5. Press Enter to execute
6. The page will reload and show the Login screen

### Option 3: Manual Logout Flow Test
1. Look for the **👤 User** field at the top showing your email
2. Click the red **Logout** button
3. Open **Console** (F12 → Console tab)
4. You should see logs like:
   - `🎯 HomeScreen: Logout button pressed`
   - `⏳ HomeScreen: Confirming logout...`
   - `🚪 AppContext: Logout initiated`
   - `🗑️ AppContext: Storage cleared`
   - `✅ AppContext: Logout complete`
5. If you see these logs and then get redirected to login, logout is working!

## Console Logs to Check

**Look for these debug messages in the Browser Console:**

### Startup Logs (should appear when app loads)
```
🔍 AppContext: Attempting to restore user...
🔑 Token exists: true/false
👤 User data exists: true/false
```

### Logout Flow (should appear when you click logout)
```
🎯 HomeScreen: Logout button pressed
⏳ HomeScreen: Confirming logout...
🚪 AppContext: Logout initiated
🗑️ AppContext: Storage cleared
✅ AppContext: Logout complete
🧭 AppNavigator: Rendering - isLoggedIn: false
📱 AppNavigator: Showing AuthStack
```

### Error Logs (if something goes wrong)
```
❌ HomeScreen Logout error: [error details]
❌ AppContext Logout error: [error details]
```

## Common Issues & Solutions

### Problem: "Nothing happens when I click Logout"
**Solution:**
1. Check the Console tab for error logs
2. Make sure you're looking at the **Browser Console** (F12), not mobile console
3. Click "Clear All Data" button to reset and try again
4. Check your internet connection

### Problem: "I'm already on the Tasks page when opening the app"
**Reason:** This is normal! You were already logged in. AsyncStorage saves your session.
**Solution:** Click the Logout button or clear data using the debug button

### Problem: "No console or network calls visible"
**Solution:**
1. On Web: Press F12 to open Dev Tools
2. Make sure you're on the **Console** tab (not Network)
3. Look at Network tab to see API calls (should see GET `/patients/daily-tasks`)
4. If no network calls, check your backend is running on port 7298

## Network Debugging

To see API calls:
1. Open Browser Dev Tools (F12)
2. Go to **Network** tab
3. Click Logout button
4. You should see calls to:
   - `GET /patients/daily-tasks` (loading tasks)
   - `POST /auth/logout` (if implemented) - NOT REQUIRED yet
5. If no calls appear, backend might not be running

## Step-by-Step Logout Test

1. **Start the app** at `http://localhost:8081/`
2. **Wait** for tasks to load (should see task cards)
3. **Open Console** (F12 → Console)
4. **Clear existing logs** for clarity
5. **Click Logout button** (red button at top)
6. **Confirm** "Are you sure you want to logout?"
7. **Observe** console logs appearing
8. **Expected result:**
   - Console shows logout sequence
   - App redirects to Login screen
   - You can log in with different credentials

## Backend Logout Endpoint

⚠️ **Note:** The `/auth/logout` endpoint exists but is optional. The logout works purely through clearing local data.

```
POST /api/auth/logout
Body: { refreshToken: "string" }
Response: { success: true }
```

If you want to also notify the backend on logout (recommended for production), uncomment this in authApi.js:
```javascript
export const logout = (refreshToken) => {
  return client.post("/auth/logout", { refreshToken });
};
```

## Debug Buttons Explained

**📊 Debug Storage Button:**
- Shows current token and user data
- Check Console to see what's stored
- Helps verify AsyncStorage state

**🧹 Clear All Data Button:**
- Removes token and user from AsyncStorage
- Forces app to show Login screen
- Use when you want to start fresh

## Still Having Issues?

1. Make sure backend is running: `dotnet run` in `D:\Personal\CarePortal_V1\MVP\CareExecution.API`
2. Check backend is on port 7298 (verify in browser Network tab)
3. Verify you can see API calls in Network tab
4. Look for error messages in Console
5. Try clearing browser cache: Ctrl+Shift+Delete (Chrome)

## Notes

- Debug section can be removed by deleting the debug JSX block in `HomeScreen.js`
- Console logs use emojis for easy identification
- In production, remove the debug section and console.log statements
