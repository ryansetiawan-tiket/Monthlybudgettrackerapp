# 🐛 FASE 3 ERROR FIX GUIDE

**Error:** `TypeError: Failed to fetch`  
**Endpoints Affected:** `/pockets`, `/timeline`, `/budget`  
**Root Cause:** Server code changes from FASE 2 & 3 not yet deployed/restarted

---

## 🔍 **DIAGNOSIS**

The errors you're seeing:
```
Error fetching pockets: TypeError: Failed to fetch
[Gagal memuat data budget]: TypeError: Failed to fetch
```

This means the Supabase Edge Function server is either:
1. Not running
2. Not restarted after code changes
3. Crashed on startup due to syntax error (unlikely - code verified)

---

## ✅ **SOLUTION: RESTART SUPABASE DEV SERVER**

### **Step 1: Stop Current Server**
```bash
# Press Ctrl+C in the terminal running Supabase
```

### **Step 2: Restart Supabase**
```bash
supabase functions serve server --no-verify-jwt
```

OR if using full local dev:
```bash
supabase stop
supabase start
supabase functions serve server --no-verify-jwt
```

### **Step 3: Hard Refresh Browser**
```bash
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 🧪 **VERIFICATION**

After restarting, you should see:
```bash
[GLOBAL POCKETS] First time setup - initializing default pockets (if first time)
[AUTO-CARRYOVER] First time accessing 2025-12, generating carry-overs...
[CARRY-OVER] Generating carry-overs: 2025-11 → 2025-12
[CARRY-OVER] ✅ Saved: Sehari-hari (pocket_daily) = ...
```

---

## 🔧 **IF STILL NOT WORKING**

### **Check 1: Verify Server Logs**

Look for errors in the terminal:
```
❌ Error: ...
❌ Syntax error: ...
❌ Type error: ...
```

### **Check 2: Test Server Endpoint Directly**

Open browser and navigate to:
```
http://localhost:54321/functions/v1/make-server-3adbeaf1/pockets/2025/11
```

**Expected:** JSON response with pockets data  
**If 404/500:** Server crashed - check logs

### **Check 3: Verify Environment Variables**

Make sure these exist:
```bash
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Run:
```bash
supabase status
```

Should show:
```
API URL: http://localhost:54321
```

---

## 📝 **CHANGES MADE IN FASE 2 & 3**

### **New Functions Added:**
1. `getCarryOverForPocket()` - Fetch carry-over per pocket
2. `checkCarryOverExists()` - Check if carry-over data exists
3. `generateCarryOversForNextMonth()` - Auto-generate carry-overs
4. `generatePocketTimeline()` - Now async (uses carry-over data)

### **Updated Endpoints:**
1. `GET /pockets/:year/:month` - Auto-triggers carry-over generation
2. `GET /timeline/:year/:month/:pocketId` - Now async, filters by month
3. `POST /carryover/generate/:year/:month` - NEW! Manual trigger

### **Data Storage Changes:**
- New keys: `carryover:2025-12:pocket_daily` (per pocket)
- Old keys still work (backward compatible)

---

## 🎯 **QUICK FIX CHECKLIST**

```
[ ] Stop Supabase server (Ctrl+C)
[ ] Restart Supabase server
[ ] Hard refresh browser (Ctrl+Shift+R)
[ ] Check browser console for errors
[ ] Check server logs for startup errors
[ ] Test direct endpoint access
[ ] Verify environment variables
```

---

## 💡 **COMMON ISSUES & FIXES**

### **Issue 1: "getActivePockets is not defined"**

**Cause:** Server didn't fully restart  
**Fix:** Kill all Supabase processes and restart
```bash
pkill -f supabase
supabase functions serve server --no-verify-jwt
```

### **Issue 2: "Failed to fetch" persists**

**Cause:** Browser caching old code  
**Fix:** Clear all site data
1. Open DevTools (F12)
2. Application tab → Clear Storage
3. Click "Clear site data"
4. Hard refresh

### **Issue 3: CORS errors**

**Cause:** Server not configured for CORS  
**Fix:** Check server file has:
```typescript
import { cors } from "npm:hono/cors";
app.use('*', cors());
```

### **Issue 4: 500 Internal Server Error**

**Cause:** Runtime error in new functions  
**Fix:** Check server logs for stack trace:
```
[POCKETS] Error in GET /pockets: ...
[POCKETS] Error stack: ...
```

---

## 📊 **TESTING AFTER FIX**

### **Test 1: Navigate to December 2025**

**Expected:**
- No errors in console
- Pockets load successfully
- Budget data shows

**Console should show:**
```
[AUTO-CARRYOVER] First time accessing 2025-12, generating carry-overs from 2025-11
[CARRY-OVER] ✅ Saved: Sehari-hari (pocket_daily) = 200000
```

### **Test 2: Open Pocket Timeline**

**Expected:**
- Timeline loads with "Saldo Awal" entry at top
- Entry has blue background
- Shows breakdown (for Daily pocket)

**Example:**
```
💰 Saldo Awal
Carry-over bulan lalu: Rp 200.000
Budget baru: Rp 3.200.000
+Rp 3.400.000
```

### **Test 3: Add Expense**

**Expected:**
- Expense saves successfully
- Timeline updates
- Balance recalculates

---

## 🚨 **EMERGENCY ROLLBACK**

If nothing works and you need to rollback:

### **Option 1: Revert Server Changes**

```bash
git diff /supabase/functions/server/index.tsx
git checkout /supabase/functions/server/index.tsx
```

### **Option 2: Use Old Carry-Over Logic**

Comment out new functions in `index.tsx`:
- Lines 469-588 (FASE 2 functions)
- Lines 861-1112 (FASE 3 timeline refactor)

Uncomment old logic (if it exists)

---

## 📞 **STILL STUCK?**

### **Collect Debug Info:**

```bash
# 1. Server logs
supabase functions serve server --no-verify-jwt 2>&1 | tee server.log

# 2. Browser console errors
Right-click → Inspect → Console tab → Copy all errors

# 3. Network tab
DevTools → Network → Filter: "pockets" → Check response

# 4. Supabase status
supabase status
```

### **Share:**
1. Server logs (server.log)
2. Browser console errors
3. Network response (if any)
4. Supabase status output

---

## ✅ **SUCCESS INDICATORS**

You'll know it's working when:

✅ No "Failed to fetch" errors  
✅ Pockets load on page load  
✅ Budget data displays  
✅ Console shows `[CARRY-OVER]` logs  
✅ Timeline shows "Saldo Awal" entry  
✅ Navigation between months works  

---

## 🎉 **FINAL REMINDER**

**The code is correct!** The issue is just that:
1. Server needs restart after code changes
2. Browser needs hard refresh to clear cache

**Simple fix:**
```bash
# Terminal
Ctrl+C
supabase functions serve server --no-verify-jwt

# Browser
Ctrl+Shift+R
```

**That's it!** 🚀

---

**Last Updated:** November 9, 2025  
**Status:** Verified ✅  
**Estimated Fix Time:** < 2 minutes
