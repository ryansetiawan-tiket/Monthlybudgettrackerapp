# Setup & Installation Guide

## Prerequisites

### Required Tools
- Node.js v18 or higher
- npm or yarn
- Supabase account
- ExchangeRate-API account (free tier)

### Required Knowledge
- Basic React understanding
- Basic TypeScript
- Basic Git

---

## Initial Setup

### 1. Supabase Project Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Fill in project details:
   - Name: "Budget Tracker" (or your choice)
   - Database Password: (secure password)
   - Region: (closest to you)
5. Wait for project to be provisioned (~2 minutes)

#### Get Project Credentials
1. Go to Project Settings → API
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (public key for frontend)
   - **Service Role Key** (secret key for backend)

#### Setup Environment Variables
Create file: `/utils/supabase/info.tsx`
```typescript
export const projectId = 'your-project-id'; // From URL: https://[THIS-PART].supabase.co
export const publicAnonKey = 'your-anon-key';
```

---

### 2. Exchange Rate API Setup

#### Get API Key
1. Go to [exchangerate-api.com](https://www.exchangerate-api.com/)
2. Sign up for free account (1,500 requests/month)
3. Copy your API key from dashboard

#### Configure in Supabase
1. Go to Supabase Dashboard
2. Navigate to: Project Settings → Edge Functions → Manage Secrets
3. Add secret:
   - Name: `EXCHANGE_RATE_API_KEY`
   - Value: (your API key)

---

### 3. Database Setup

The KV Store table is already configured. No manual setup needed.

**Table:** `kv_store_3adbeaf1`

**Columns:**
- `key` (TEXT, PRIMARY KEY)
- `value` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Note:** Do not modify this table structure.

---

### 4. Deploy Edge Functions

#### Install Supabase CLI
```bash
npm install -g supabase
```

#### Login to Supabase
```bash
supabase login
```

#### Link Project
```bash
supabase link --project-ref your-project-id
```

#### Deploy Server Function
```bash
supabase functions deploy make-server-3adbeaf1
```

#### Verify Deployment
```bash
supabase functions list
```

You should see:
```
┌─────────────────────────┬─────────┬─────────────────┐
│ NAME                    │ VERSION │ CREATED AT      │
├─────────────────────────┼─────────┼─────────────────┤
│ make-server-3adbeaf1    │ 1       │ 2 minutes ago   │
└─────────────────────────┴─────────┴─────────────────┘
```

---

### 5. Configure Environment Secrets

#### Via Supabase Dashboard
1. Go to: Project Settings → Edge Functions → Manage Secrets
2. Add the following secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `SUPABASE_URL` | Your project URL | Project Settings → API |
| `SUPABASE_ANON_KEY` | Your anon key | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Project Settings → API |
| `EXCHANGE_RATE_API_KEY` | Your exchange rate API key | ExchangeRate-API dashboard |

#### Via CLI
```bash
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-key
supabase secrets set EXCHANGE_RATE_API_KEY=your-exchange-key
```

---

## Local Development Setup

### 1. Install Dependencies

**If using Figma Make environment:**
- Dependencies are auto-installed on import
- No manual installation needed

**If running locally:**
```bash
npm install
```

---

### 2. Configure Local Environment

#### Update Supabase Info
Edit `/utils/supabase/info.tsx`:
```typescript
export const projectId = 'your-actual-project-id';
export const publicAnonKey = 'your-actual-anon-key';
```

---

### 3. Run Development Server

**Figma Make:**
- Auto-runs on save
- Preview updates in real-time

**Local:**
```bash
npm run dev
```

---

## Verify Installation

### Test Checklist

#### 1. Basic Rendering
- [ ] App loads without errors
- [ ] Month selector displays current month
- [ ] All form fields visible

#### 2. Budget Input
- [ ] Can input budget awal
- [ ] Can toggle auto-carryover
- [ ] Can input manual carryover

#### 3. Additional Income
- [ ] Can add IDR income
- [ ] Can add USD income
- [ ] Exchange rate fetches automatically
- [ ] If exchange rate fails, manual input shows

#### 4. Expenses
- [ ] Can add single expense
- [ ] Can add expense with items (template)
- [ ] Can view expense list
- [ ] Can edit expense
- [ ] Can delete expense

#### 5. Templates
- [ ] Can create template
- [ ] Can edit template
- [ ] Can delete template
- [ ] Can use template in expense

#### 6. Search & Filter
- [ ] Search box works
- [ ] Autocomplete shows suggestions
- [ ] Can filter by name, day, or date

#### 7. Data Persistence
- [ ] Data saves automatically
- [ ] Data persists after refresh
- [ ] Data loads correctly when changing month

#### 8. Dark Mode
- [ ] App looks good in light mode
- [ ] App looks good in dark mode
- [ ] No contrast issues

---

## Common Setup Issues

### Issue: "Project not found"
**Cause:** Wrong project ID
**Solution:**
1. Check `/utils/supabase/info.tsx`
2. Verify project ID matches dashboard
3. Format: just the ID part, not full URL

---

### Issue: "Unauthorized" error
**Cause:** Wrong or missing API keys
**Solution:**
1. Verify `publicAnonKey` in `info.tsx`
2. Check it matches Project Settings → API
3. Make sure you copied "anon/public" key, not service role

---

### Issue: "Exchange rate API failed"
**Cause:** Missing or wrong API key
**Solution:**
1. Check Supabase secrets: `EXCHANGE_RATE_API_KEY`
2. Verify key is correct on exchangerate-api.com
3. Check API quota (free tier: 1,500/month)

---

### Issue: "Function not found"
**Cause:** Edge function not deployed
**Solution:**
```bash
supabase functions deploy make-server-3adbeaf1
```

---

### Issue: Data not saving
**Cause:** Multiple possible causes
**Debug Steps:**
1. Open browser console (F12)
2. Check for errors
3. Go to Network tab
4. Look for failed requests
5. Check request/response details

**Common causes:**
- Wrong server URL
- Missing authorization header
- Server function error (check logs)
- Database permission issue

**Check server logs:**
```bash
supabase functions logs make-server-3adbeaf1
```

---

### Issue: Blank screen
**Cause:** JavaScript error
**Solution:**
1. Open console (F12)
2. Look for error message
3. Common errors:
   - Import path wrong
   - Missing component
   - TypeScript error
4. Fix error and refresh

---

## Security Checklist

Before deploying to production:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` NEVER exposed to frontend
- [ ] `EXCHANGE_RATE_API_KEY` only in server environment variables
- [ ] Public keys (anon key, project ID) are safe to expose
- [ ] CORS configured properly for your domain
- [ ] No sensitive data in git repository
- [ ] Environment variables properly set in Supabase

---

## Deployment Checklist

### Before Launch
- [ ] All environment secrets configured
- [ ] Edge function deployed
- [ ] Database accessible
- [ ] Exchange rate API working
- [ ] Test on multiple devices
- [ ] Test on multiple browsers
- [ ] Dark mode tested
- [ ] Mobile responsiveness verified
- [ ] All features tested end-to-end

### After Launch
- [ ] Monitor server logs
- [ ] Check error rates
- [ ] Monitor API quota usage
- [ ] User feedback collected
- [ ] Performance metrics tracked

---

## Updating the Application

### Code Changes
1. Make changes to code
2. Test locally
3. Push to git (if using version control)
4. If edge function changed:
   ```bash
   supabase functions deploy make-server-3adbeaf1
   ```
5. Frontend changes auto-deploy in Figma Make

### Database Changes
**⚠️ WARNING:** 
- KV Store structure should not be changed
- If absolutely necessary, plan migration carefully
- Test on separate project first
- Back up data before changes

---

## Monitoring & Maintenance

### Daily Checks
- Exchange rate API quota usage
- Error logs for unusual patterns
- User-reported issues

### Weekly Checks
- Database size
- Performance metrics
- API response times

### Monthly Checks
- Review and clean old data (if needed)
- Update dependencies
- Security patches
- Feature requests review

---

## Getting Help

### Debug Process
1. Check browser console for errors
2. Check network tab for failed requests
3. Check Supabase function logs
4. Review this troubleshooting guide
5. Check documentation

### Resources
- [Supabase Docs](https://supabase.com/docs)
- [ExchangeRate-API Docs](https://www.exchangerate-api.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Docs](https://ui.shadcn.com)

### Error Logging
Enable detailed logging:
```typescript
// In server code
console.log('Debug info:', { variable, data });

// In frontend
console.log('State:', { budget, expenses });
```

---

## Backup & Recovery

### Export Data
**Future Enhancement:** Add export feature
```typescript
const exportData = async () => {
  // Get all budget data from all months
  const allData = await kv.getByPrefix('budget:');
  
  // Convert to JSON
  const json = JSON.stringify(allData, null, 2);
  
  // Download
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'budget-backup.json';
  a.click();
};
```

### Import Data
**Future Enhancement:** Add import feature
```typescript
const importData = async (file: File) => {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Validate data structure
  // Save to database
  for (const [key, value] of Object.entries(data)) {
    await kv.set(key, value);
  }
};
```

---

## Performance Optimization

### Current Optimizations
- ✅ Exchange rate caching (1 hour)
- ✅ Debounced auto-save (1 second)
- ✅ Memoized calculations (useMemo)
- ✅ Efficient sorting and filtering

### Future Optimizations
- [ ] Lazy loading for large expense lists
- [ ] Virtual scrolling for 100+ expenses
- [ ] Image optimization (if images added)
- [ ] Code splitting
- [ ] Service worker for offline support
- [ ] React Query for better caching
