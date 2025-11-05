# Cleanup Checklist

**Phase**: Cleanup & Removal  
**Priority**: 🔴 Critical  
**Estimated Time**: 2-3 hours

---

## 1. Debug Logs Cleanup

### `/App.tsx`

#### ❌ Remove These Logs (30+ instances):

```typescript
// ✅ Line 247 - Exclude state loading
- console.log('Loaded exclude state from backend:', data);

// ✅ Line 254 - Exclude state application  
- console.log('Applied exclude state - excludedExpenseIds:', data.excludedExpenseIds);

// ✅ Line 256 - Exclude state reset
- console.log('Exclude state not locked, resetting to defaults');

// ✅ Line 698 - Expenses loading
- console.log('Expenses loaded from server:', data);

// ✅ Line 725 - Additional incomes loading
- console.log('Additional incomes loaded from server:', data);

// ✅ Lines 868-942 - Exclude lock toggle (9 logs)
- console.log('Toggle exclude lock - isExcludeLocked:', isExcludeLocked);
- console.log('URL:', `${baseUrl}/exclude-state/${selectedYear}/${selectedMonth}`);
- console.log('Locking with data:', {...});
- console.log('Lock response status:', response.status);
- console.log('Lock success:', result);
- console.log('Unlocking...');
- console.log('Unlock response status:', response.status);
- console.log('Unlock success:', result);

// ✅ Lines 1339-1352 - Move income to expense (3 logs)
- console.log('Moving income to expense - Income data:', income);
- console.log('Moving income to expense - Server response:', result.data);
- console.log('Moving income to expense - Final expense object:', expenseWithFlag);
```

#### 🔄 Convert to Conditional (Realtime logs):

```typescript
// Lines 591, 612, 632 - Add DEBUG flag
if (process.env.NODE_ENV === 'development') {
  console.log('🔄 Realtime update detected:', payload.new.key);
  console.log('🆕 Realtime insert detected:', payload.new.key);
  console.log('🗑️ Realtime delete detected:', payload.old.key);
}
```

#### ✅ Keep (Error logging):

```typescript
// Keep all console.error() and error console.log()
console.log(`Error loading exclude state: ${error}`);
console.log(`Error loading pockets: ${error}`);
// ... etc
```

---

### `/components/PocketsSummary.tsx`

#### ❌ Remove These Logs:

```typescript
// Line 90
- console.log(`[PocketsSummary] Fetching pockets for ${monthKey}...`);

// Line 110
- console.log(`[PocketsSummary] Received data in ${Date.now() - fetchStartTime}ms:`, data);

// Line 118
- console.log(`[PocketsSummary] Successfully loaded ${data.data.pockets.length} pockets`);
```

#### ✅ Keep:

```typescript
// Line 123 - Error logging
console.error(`[PocketsSummary] Error fetching pockets (took ${Date.now() - fetchStartTime}ms):`, error);
```

---

### `/components/PocketTimeline.tsx`

**Action**: Read file and remove debug logs (if any)

---

## 2. Unused Imports Cleanup

### Check All Files For:

```typescript
// Example patterns to find and remove:
import { UnusedComponent } from './unused';
import type { UnusedType } from './types';
```

**Files to Check**:
- [ ] App.tsx
- [ ] All components in `/components/`
- [ ] All UI components (if any unused imports)

---

## 3. Remove Commented Code

### Search for:

```typescript
// Old implementation
// const oldFunction = () => { ... }

/* 
  Commented block
*/
```

**Action**: Remove all commented-out code blocks that are obsolete

---

## 4. Documentation Cleanup

### Root Directory - Remove/Move 11 Files

#### Move to `/docs/archived/`:

```bash
PERFORMANCE_FIX_POCKETS_LOADING.md
PERFORMANCE_FIX_QUICK_REF.md
PERFORMANCE_FIX_TIMELINE_LOADING.md
PERFORMANCE_FIX_TIMELINE_QUICK_REF.md
MULTIPLE_ENTRY_EXPENSE.md
TOGGLE_POCKETS_FEATURE.md
TOGGLE_POCKETS_QUICK_REF.md
REALTIME_UPDATE_FIX.md
REALTIME_UPDATE_QUICK_REF.md
SKELETON_LOADING_UPDATE.md
SKELETON_LOADING_QUICK_REF.md
CHANGELOG_EMOJI_PICKER.md
CIRCULAR_REFERENCE_FIX.md
DIALOG_SIZE_FIX.md
SETISOPEN_ERROR_FIX.md
```

#### Create New Consolidated Docs:

1. **`/docs/PERFORMANCE_FIXES.md`** (consolidate 4 files)
2. **`/docs/BUG_FIXES_ARCHIVE.md`** (consolidate 3 files)
3. **`/docs/FEATURES_CHANGELOG.md`** (consolidate 8 files)

#### Keep in Root:

```bash
AI_rules.md
Attributions.md
README.md (to be created)
```

---

### `/planning/pockets-system/` - Consolidate 20+ Files

#### Archive Completed Phase Docs:

Move to `/planning/pockets-system/archived/`:
```bash
PHASE1_IMPLEMENTATION_COMPLETE.md
PHASE1.5_COMPLETE.md
PHASE1.5.1_CARRYOVER_COMPLETE.md
PHASE1.5.2_PREFILL_INCOME_COMPLETE.md
IMPLEMENTATION_SUMMARY.md
COMPLETION_REPORT.md
AUDIT_COMPLETE.md
VERIFICATION_REPORT.md
WISHLIST_API_TEST.md
WISHLIST_IMPLEMENTATION.md
EMOJI_PICKER_UPGRADE.md
EMOJI_PICKER_AND_EDIT_FEATURE.md
STATUS_IMPLEMENTATION.md
```

#### Keep Active Docs:

```bash
README.md
QUICK_REFERENCE.md
TESTING_GUIDE.md
01-concept-overview.md (reference)
02-phase1-implementation.md (reference)
03-data-structure.md (reference)
```

---

## 5. Remove Debug Features (if any)

### Check for:

- Debug panels
- Test buttons
- Development-only features
- Hardcoded test data

**Status**: None identified yet (pending full audit)

---

## 6. Clean Up Temporary Files

### Search for:

```bash
*.tmp
*.backup
*.old
*-copy.*
```

**Status**: None visible in current structure

---

## Execution Order

### Step 1: Backup
```bash
# Create backup branch/commit before cleanup
```

### Step 2: Debug Logs (Priority 1)
1. ✅ App.tsx - Remove 30+ console.log
2. ✅ PocketsSummary.tsx - Remove 3 console.log
3. ✅ PocketTimeline.tsx - Check & remove
4. ✅ Add DEBUG flag for dev logs

### Step 3: Documentation (Priority 2)
1. ✅ Create `/docs/archived/` folder
2. ✅ Move 15 files from root
3. ✅ Create 3 consolidated docs
4. ✅ Create README.md in root
5. ✅ Archive planning docs

### Step 4: Code Cleanup (Priority 3)
1. ✅ Remove unused imports
2. ✅ Remove commented code
3. ✅ Clean up console.error (format consistently)

---

## Validation Checklist

After cleanup, verify:

- [ ] App runs without errors
- [ ] No console.log in production (except errors)
- [ ] All imports resolve correctly
- [ ] Documentation is accessible
- [ ] Root directory is clean (max 5 files)
- [ ] Planning folders are organized

---

## Rollback Plan

**If issues arise**:
1. Restore from git commit before cleanup
2. Or manually restore from audit report (all removed code documented)

---

**Estimated LOC Reduction**: -200 lines  
**Estimated File Reduction**: -15 files  
**Estimated Time**: 2-3 hours

**Next**: After cleanup complete, proceed to REFACTORING_PLAN.md
