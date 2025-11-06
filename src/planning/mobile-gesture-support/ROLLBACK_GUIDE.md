# Mobile Gesture Support - Rollback Guide

**Tanggal:** 6 November 2025  
**Version:** 1.0  
**Purpose:** Emergency rollback plan jika mobile gesture support menyebabkan masalah kritis

## 🚨 When to Rollback

### Critical Issues (Immediate Rollback)

- ❌ **App crashes on launch**
- ❌ **Dialogs cannot be closed**
- ❌ **Back button exits app immediately** (bypassing dialogs)
- ❌ **Performance degradation > 50%**
- ❌ **Data loss or corruption**

### Major Issues (Consider Rollback)

- ⚠️ **Swipe gesture conflicts with existing interactions**
- ⚠️ **Back button priority incorrect** (wrong dialog closes)
- ⚠️ **Memory leaks detected**
- ⚠️ **Gestures not working on specific devices**

### Minor Issues (Fix Forward)

- ✅ **Haptics not working** (graceful degradation)
- ✅ **Animation performance could be better**
- ✅ **Console warnings** (non-critical)
- ✅ **Minor UX improvements needed**

---

## 🔄 Rollback Methods

### Method 1: Git Revert (Recommended)

**Prerequisite:** Changes committed to git

```bash
# 1. View recent commits
git log --oneline -10

# 2. Find commit BEFORE mobile gesture changes
# Let's say it's: abc1234

# 3. Create new branch for safety
git checkout -b rollback-gestures

# 4. Revert to that commit
git revert abc1234..HEAD

# Or reset (more aggressive):
git reset --hard abc1234

# 5. Force push (if already pushed)
git push origin main --force

# 6. Rebuild
npm run build
npx cap sync
```

### Method 2: Manual File Removal

**If git not available or prefer manual:**

#### Step 1: Remove New Files

Delete these files:

```bash
# Contexts
rm contexts/DialogStackContext.tsx

# Hooks
rm hooks/useMobileBackButton.ts
rm hooks/useDialogRegistration.ts
rm hooks/useSwipeGesture.ts

# Utils
rm utils/capacitor-helpers.ts

# Planning docs (optional)
rm -rf planning/mobile-gesture-support/
```

#### Step 2: Restore Modified Files

Files to restore to pre-gesture state:

**File: `/App.tsx`**

Remove these imports:
```tsx
import { DialogStackProvider } from './contexts/DialogStackContext';
import { useMobileBackButton } from './hooks/useMobileBackButton';
```

Remove this hook call:
```tsx
useMobileBackButton();
```

Remove this wrapper:
```tsx
<DialogStackProvider>
  {/* content */}
</DialogStackProvider>
```

**File: `/constants/index.ts`**

Remove:
```tsx
export const DialogPriority = {
  LOW: 1,
  MEDIUM: 5,
  HIGH: 10,
  CRITICAL: 20
} as const;
```

**File: `/components/ui/dialog.tsx`**

Remove these imports:
```tsx
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { triggerHaptic } from '../../utils/capacitor-helpers';
```

Remove swipe gesture setup:
```tsx
const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({...});
```

Remove touch event handlers:
```tsx
onTouchStart={...}
onTouchMove={...}
onTouchEnd={...}
```

Remove swipe indicator:
```tsx
{enableSwipe && (
  <div className="..." />
)}
```

**Files: All Dialog Components**

Remove from each dialog:
- `AddExpenseDialog.tsx`
- `AddAdditionalIncomeDialog.tsx`
- `WishlistDialog.tsx`
- `TransferDialog.tsx`
- `ManagePocketsDialog.tsx`

Remove these imports:
```tsx
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';
```

Remove this hook call:
```tsx
useDialogRegistration(isOpen, onOpenChange, DialogPriority.MEDIUM, 'dialog-id');
```

#### Step 3: Uninstall Dependencies

```bash
# Remove Capacitor packages (if not used elsewhere)
npm uninstall @capacitor/app @capacitor/haptics

# Or keep but don't import
```

#### Step 4: Test

```bash
# Build
npm run build

# Test in browser
npm run dev

# Test in native (if Capacitor already setup)
npx cap sync
npx cap open android
```

### Method 3: Feature Flag (Graceful Rollback)

**Best for production:** Disable feature without removing code

#### Step 1: Add Feature Flag

**File: `/constants/index.ts`**

```tsx
// Feature flags
export const FEATURE_FLAGS = {
  MOBILE_GESTURES: false, // Set to false to disable
} as const;
```

#### Step 2: Wrap Features

**File: `/App.tsx`**

```tsx
import { FEATURE_FLAGS } from './constants';

function App() {
  // Only setup if feature enabled
  if (FEATURE_FLAGS.MOBILE_GESTURES) {
    useMobileBackButton();
  }

  return (
    <>
      {FEATURE_FLAGS.MOBILE_GESTURES ? (
        <DialogStackProvider>
          {/* App content */}
        </DialogStackProvider>
      ) : (
        <>{/* App content */}</>
      )}
    </>
  );
}
```

**File: All Dialog Components**

```tsx
import { FEATURE_FLAGS } from '../constants';

function AddExpenseDialog({ ... }) {
  // Only register if feature enabled
  if (FEATURE_FLAGS.MOBILE_GESTURES) {
    useDialogRegistration(...);
  }

  // Rest of component
}
```

**File: `/components/ui/dialog.tsx`**

```tsx
import { FEATURE_FLAGS } from '../../constants';

const DialogContent = ({ enableSwipe = true, ... }) => {
  const swipeEnabled = FEATURE_FLAGS.MOBILE_GESTURES && enableSwipe;

  const gestures = swipeEnabled 
    ? useSwipeGesture({...})
    : { handleTouchStart: undefined, handleTouchMove: undefined, handleTouchEnd: undefined };

  return (
    <DialogPrimitive.Content
      onTouchStart={gestures.handleTouchStart}
      onTouchMove={gestures.handleTouchMove}
      onTouchEnd={gestures.handleTouchEnd}
      {...props}
    >
      {swipeEnabled && <div className="swipe-indicator" />}
      {children}
    </DialogPrimitive.Content>
  );
};
```

#### Step 3: Deploy with Flag Off

```bash
# Build with feature disabled
npm run build

# Deploy
npx cap sync
```

**Benefits:**
- ✅ Can re-enable quickly if issue resolved
- ✅ Code stays in codebase for future use
- ✅ A/B testing possible
- ✅ Gradual rollout

---

## 📋 Rollback Checklist

### Pre-Rollback

- [ ] **Identify the issue**
  - What's broken?
  - How severe?
  - Reproducible?

- [ ] **Document the problem**
  - Console errors
  - Steps to reproduce
  - Affected devices/browsers

- [ ] **Notify stakeholders** (if applicable)
  - Team members
  - Users (if production)

- [ ] **Backup current state**
  ```bash
  git branch backup-before-rollback
  git push origin backup-before-rollback
  ```

### Rollback Process

- [ ] **Choose rollback method**
  - Git revert
  - Manual removal
  - Feature flag

- [ ] **Execute rollback**
  - Follow steps above
  - Double-check all files

- [ ] **Remove/disable all traces**
  - New files deleted
  - Modified files restored
  - Imports removed
  - Hook calls removed

- [ ] **Test locally**
  - App builds without errors
  - App runs without errors
  - Dialogs work normally
  - No console errors

- [ ] **Test in Capacitor** (if applicable)
  ```bash
  npx cap sync
  npx cap open android
  ```
  - App launches
  - Dialogs work
  - No crashes

### Post-Rollback

- [ ] **Deploy to production**
  - Build
  - Test
  - Deploy

- [ ] **Monitor for issues**
  - Check error logs
  - User feedback
  - Performance metrics

- [ ] **Update documentation**
  - Mark feature as rolled back
  - Document reason
  - Plan for future attempt

- [ ] **Communicate status**
  - Team notification
  - User announcement (if needed)

---

## 🔍 Verification Steps

### After Rollback

**1. Build Verification**

```bash
# Should complete without errors
npm run build
```

Expected: ✅ No TypeScript errors, no build errors

**2. Runtime Verification**

```bash
# Start dev server
npm run dev
```

Test:
- [ ] App loads
- [ ] All pages accessible
- [ ] Dialogs open/close normally
- [ ] No console errors
- [ ] No warnings (except pre-existing)

**3. Dialog Functionality**

Test each dialog:
- [ ] AddExpenseDialog works
- [ ] AddAdditionalIncomeDialog works
- [ ] WishlistDialog works
- [ ] TransferDialog works
- [ ] ManagePocketsDialog works

Close methods:
- [ ] X button closes
- [ ] Backdrop click closes
- [ ] Escape key closes

**4. Mobile Testing** (if Capacitor)

```bash
npx cap sync
npx cap open android
```

Test:
- [ ] App launches on device
- [ ] No crashes
- [ ] Back button works (default Android behavior)
- [ ] All features functional

---

## 🐛 Common Issues During Rollback

### Issue 1: Import Errors

**Symptom:**
```
Cannot find module './contexts/DialogStackContext'
```

**Solution:**
1. Search project for all imports:
   ```bash
   grep -r "DialogStackContext" .
   ```
2. Remove all found imports
3. Rebuild

### Issue 2: TypeScript Errors

**Symptom:**
```
Property 'DialogPriority' does not exist
```

**Solution:**
1. Find all usages:
   ```bash
   grep -r "DialogPriority" .
   ```
2. Remove or replace with default values
3. Rebuild

### Issue 3: App Won't Build

**Symptom:**
```
Build failed with errors
```

**Solution:**
1. Clear cache:
   ```bash
   rm -rf node_modules/.vite
   rm -rf dist
   ```
2. Reinstall:
   ```bash
   npm install
   npm run build
   ```
3. If still failing, check console output for specific errors

### Issue 4: Dialogs Still Have Swipe Indicator

**Symptom:** Swipe indicator visible but swipe doesn't work

**Solution:**
1. Check `/components/ui/dialog.tsx`
2. Remove swipe indicator JSX:
   ```tsx
   {/* Remove this: */}
   {enableSwipe && (
     <div className="md:hidden w-12 h-1 ..." />
   )}
   ```
3. Rebuild

### Issue 5: Capacitor Sync Fails

**Symptom:**
```
Capacitor sync failed
```

**Solution:**
1. Remove imports from MainActivity if added
2. Sync again:
   ```bash
   npx cap sync --force
   ```
3. If still failing, rebuild native project:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx cap sync
   ```

---

## 📊 Rollback Decision Matrix

| Severity | User Impact | Rollback? | Method |
|----------|-------------|-----------|--------|
| **Critical** | All users can't use app | ✅ YES | Git revert (immediate) |
| **High** | Core features broken | ✅ YES | Git revert or Feature flag |
| **Medium** | Some features broken | ⚠️ MAYBE | Feature flag (investigate first) |
| **Low** | Minor issues | ❌ NO | Fix forward |
| **Cosmetic** | Visual only | ❌ NO | Fix forward |

---

## 📝 Post-Rollback Analysis

### Questions to Answer

1. **What went wrong?**
   - Technical issue?
   - Design flaw?
   - Testing gap?

2. **Why wasn't it caught earlier?**
   - Missing test case?
   - Device-specific issue?
   - Edge case?

3. **How to prevent in future?**
   - Better testing?
   - Gradual rollout?
   - Feature flags by default?

4. **Should we try again?**
   - Fix the issue?
   - Redesign approach?
   - Abandon feature?

### Document Learnings

**File: `/planning/mobile-gesture-support/ROLLBACK_LOG.md`**

```markdown
# Rollback Log

## Date: [Date]

### Issue Description
[What went wrong]

### Impact
- Users affected: [Number/percentage]
- Duration: [How long]
- Severity: [Critical/High/Medium/Low]

### Root Cause
[Technical explanation]

### Rollback Method
[Which method used]

### Resolution Time
[How long to rollback]

### Learnings
[What we learned]

### Next Steps
[Plan for future]
```

---

## 🎯 Prevention for Next Attempt

### Before Re-implementing

1. **Fix identified issues**
   - Address root cause
   - Add tests for edge cases
   - Review code thoroughly

2. **Improve testing**
   - More devices
   - More scenarios
   - Automated tests

3. **Gradual rollout**
   - Feature flag by default
   - Enable for 10% users first
   - Monitor closely
   - Scale up gradually

4. **Better monitoring**
   - Error tracking
   - Performance metrics
   - User feedback

---

## 📞 Emergency Contacts

### If Rollback Fails

1. **Check backups**
   ```bash
   git branch -a
   # Find backup branch
   git checkout backup-branch
   ```

2. **Last resort: Fresh start**
   ```bash
   git clone <repository>
   # Start from clean state
   ```

3. **Seek help**
   - Team members
   - Documentation
   - Community forums

---

## ✅ Rollback Complete Checklist

- [ ] Issue identified and documented
- [ ] Rollback method chosen
- [ ] Changes reverted (files/code)
- [ ] Dependencies cleaned up
- [ ] Build successful
- [ ] Tests passed
- [ ] Manual testing complete
- [ ] Deployed to production (if needed)
- [ ] Monitoring active
- [ ] Team notified
- [ ] Documentation updated
- [ ] Post-mortem scheduled

---

**Status:** Ready for emergency use 🚨  
**Last Updated:** 6 November 2025  
**Maintained By:** Development Team

## 🔗 Related Documents

- [Planning Document](./PLANNING.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)
- [Technical Specs](./TECHNICAL_SPECS.md)
