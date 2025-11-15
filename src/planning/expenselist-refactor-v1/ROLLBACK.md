# 🔄 ExpenseList Refactoring - Rollback Plan

**Purpose:** Quick recovery if refactoring introduces critical bugs  
**Activation:** When any smoke test fails or critical bug discovered  
**Recovery Time:** < 5 minutes

---

## 🚨 When to Rollback

### Immediate Rollback (CRITICAL)
Execute rollback **immediately** if:
- ❌ App crashes on load
- ❌ TypeScript compilation fails
- ❌ ExpenseList doesn't render at all
- ❌ Data corruption detected
- ❌ Cannot add/edit/delete expenses
- ❌ Cannot add/edit/delete incomes
- ❌ Critical runtime errors in console

### Scheduled Rollback (HIGH)
Execute rollback **within 30 min** if:
- ⚠️ Major UI regressions (layout broken)
- ⚠️ Performance degradation (> 2x slower)
- ⚠️ Multiple features broken
- ⚠️ Pull-to-refresh completely broken
- ⚠️ Modal system not working

### Defer Rollback (MEDIUM)
Fix forward instead of rollback if:
- 🟡 Minor UI inconsistencies (spacing, colors)
- 🟡 Single feature broken (can be disabled)
- 🟡 Performance slightly worse (< 20%)
- 🟡 Non-critical console warnings

---

## 📦 Rollback Procedures

### 🔥 EMERGENCY ROLLBACK (< 2 minutes)

**Scenario:** App is completely broken, need immediate recovery

**Steps:**

1. **Stop any running processes**
   ```bash
   # Ctrl+C in terminal to stop dev server
   ```

2. **Restore original ExpenseList.tsx**
   ```bash
   # Copy from backup (if created) OR from git
   git checkout HEAD -- components/ExpenseList.tsx
   ```

3. **Delete all new files created during refactor**
   ```bash
   # Delete types
   rm -f types/expense.ts
   
   # Delete helpers
   rm -f utils/expenseHelpers.ts
   
   # Delete hooks
   rm -f hooks/useExpenseFiltering.ts
   rm -f hooks/useBulkSelection.ts
   rm -f hooks/useExpenseActions.ts
   rm -f hooks/useExpenseListModals.ts
   
   # Delete components
   rm -rf components/expense-list/
   ```

4. **Restart dev server**
   ```bash
   npm run dev
   # OR
   yarn dev
   ```

5. **Verify app works**
   - Open browser
   - Check ExpenseList renders
   - Check no console errors
   - Do quick smoke test (add/edit/delete expense)

**Expected Recovery Time:** 2 minutes  
**Expected State:** Fully working app (pre-refactor state)

---

### 🔧 PARTIAL ROLLBACK (< 10 minutes)

**Scenario:** Only specific phase is broken, want to keep previous phases' work

#### Rollback Phase 5 & 6 Only (Keep Phases 1-4)
```bash
# Undo memoization changes
git checkout HEAD -- components/ExpenseList.tsx
git checkout HEAD -- components/expense-list/ExpenseListItem.tsx
git checkout HEAD -- components/expense-list/IncomeListItem.tsx
git checkout HEAD -- hooks/useExpenseFiltering.ts
# ... (checkout other modified files)
```

#### Rollback Phase 4 Only (Keep Phases 1-3)
```bash
# Delete component extractions
rm -rf components/expense-list/

# Restore ExpenseList.tsx to pre-Phase-4 state
git checkout <commit-hash-after-phase-3> -- components/ExpenseList.tsx
```

#### Rollback Phase 3 Only (Keep Phases 1-2)
```bash
# Delete custom hooks
rm -f hooks/useExpenseFiltering.ts
rm -f hooks/useBulkSelection.ts
rm -f hooks/useExpenseActions.ts
rm -f hooks/useExpenseListModals.ts

# Restore ExpenseList.tsx to pre-Phase-3 state
git checkout <commit-hash-after-phase-2> -- components/ExpenseList.tsx
```

#### Rollback Phase 2 Only (Keep Phase 1)
```bash
# Remove React.lazy() imports
# Edit ExpenseList.tsx manually to restore direct imports

# OR restore from git
git checkout <commit-hash-after-phase-1> -- components/ExpenseList.tsx
```

#### Rollback Phase 1 Only (Complete Rollback)
```bash
# Delete types and helpers
rm -f types/expense.ts
rm -f utils/expenseHelpers.ts

# Restore original ExpenseList.tsx
git checkout HEAD -- components/ExpenseList.tsx
```

---

### 🛡️ DATA SAFETY ROLLBACK

**Scenario:** Refactoring caused data corruption or loss

**Steps:**

1. **STOP ALL OPERATIONS IMMEDIATELY**
   - Don't save any more data
   - Don't reload the page (localStorage might still be intact)

2. **Check localStorage backup**
   ```javascript
   // Open browser console
   console.log(localStorage.getItem('expenses'));
   console.log(localStorage.getItem('incomes'));
   console.log(localStorage.getItem('pockets'));
   
   // Copy to safe place if data looks good
   const backup = {
     expenses: localStorage.getItem('expenses'),
     incomes: localStorage.getItem('incomes'),
     pockets: localStorage.getItem('pockets')
   };
   console.log(JSON.stringify(backup));
   // Copy output to text file
   ```

3. **Check Supabase database**
   ```bash
   # If using Supabase backend
   # Check database directly via Supabase Dashboard
   # OR query via API
   ```

4. **Restore from backup** (if available)
   - If you have database backup → restore from there
   - If you have localStorage export → restore from there
   - If you have git commit with working data → cherry-pick that commit

5. **Execute Emergency Rollback** (see above)

6. **Verify data integrity**
   - Check all expenses display
   - Check all incomes display
   - Check all pockets display
   - Check totals are correct

**⚠️ IMPORTANT:** If data corruption detected:
- DO NOT COMMIT ANY CHANGES
- DO NOT PUSH TO PRODUCTION
- INVESTIGATE ROOT CAUSE BEFORE RETRY

---

## 📋 Pre-Rollback Checklist

Before executing rollback, verify:

- [ ] Have you tried quick debugging first? (Sometimes it's just a typo)
- [ ] Have you checked console errors for obvious fixes?
- [ ] Have you confirmed the issue is from refactoring, not other changes?
- [ ] Have you documented the issue for post-mortem?
- [ ] Have you saved any important console logs/screenshots?

**If all YES → Proceed with rollback**  
**If any NO → Try debugging first**

---

## 🔍 Post-Rollback Actions

After successful rollback:

### 1. Document the Issue
- [ ] Create incident report in `/planning/expenselist-refactor-v1/INCIDENT_LOG.md`
- [ ] Document what broke
- [ ] Document how it was detected
- [ ] Document rollback steps taken
- [ ] Document recovery time

### 2. Root Cause Analysis
- [ ] Identify exact line/change that caused issue
- [ ] Understand why it broke
- [ ] Identify what test would have caught it
- [ ] Add test to TESTING_CHECKLIST.md

### 3. Update Plan
- [ ] Update MASTER_PLAN.md with lessons learned
- [ ] Update risk assessment if needed
- [ ] Adjust timeline if needed
- [ ] Add additional safeguards if needed

### 4. Communication
- [ ] Update team (if applicable)
- [ ] Update stakeholders (if applicable)
- [ ] Document in git commit message

---

## 🧪 Rollback Testing

After rollback, verify:

### Smoke Test
- [ ] App loads without errors
- [ ] ExpenseList renders correctly
- [ ] Can add new expense
- [ ] Can edit expense
- [ ] Can delete expense
- [ ] Can add new income
- [ ] Can edit income
- [ ] Can delete income
- [ ] No console errors
- [ ] No TypeScript errors

### Data Integrity
- [ ] All expenses visible
- [ ] All incomes visible
- [ ] All pockets visible
- [ ] Totals calculate correctly
- [ ] Balances calculate correctly
- [ ] No duplicate entries
- [ ] No missing entries

**Only mark rollback as COMPLETE when all tests pass**

---

## 📊 Rollback Decision Matrix

| Issue Severity | Impact | Action | Timeline |
|---------------|--------|--------|----------|
| **CRITICAL** | App crash, data loss | Emergency Rollback | < 2 min |
| **HIGH** | Major features broken | Emergency Rollback | < 5 min |
| **MEDIUM** | Minor features broken | Partial Rollback or Fix Forward | < 30 min |
| **LOW** | UI inconsistencies | Fix Forward | < 2 hours |
| **TRIVIAL** | Minor warnings | Fix Forward | Next session |

---

## 🎯 Prevention Strategies

To minimize need for rollback:

### Before Each Phase
- [ ] Create git commit with working state
- [ ] Tag commit with phase number (e.g., `refactor-phase-2-complete`)
- [ ] Run full smoke test
- [ ] Document current state

### During Each Phase
- [ ] Make small, incremental changes
- [ ] Test after every 50 lines changed
- [ ] Commit frequently with descriptive messages
- [ ] Don't mix multiple changes in one commit

### After Each Phase
- [ ] Run full testing checklist
- [ ] Check console for errors/warnings
- [ ] Check performance metrics
- [ ] Test on both desktop and mobile
- [ ] Create rollback point (git tag)

---

## 🆘 Emergency Contacts

If rollback fails or unclear what to do:

1. **Check Documentation:**
   - `/planning/expenselist-refactor-v1/MASTER_PLAN.md`
   - `/BACKWARD_COMPATIBILITY_RULES.md`
   - `/Guidelines.md`

2. **Check Git History:**
   ```bash
   git log --oneline --graph --all
   git reflog  # See all recent HEAD positions
   ```

3. **Nuclear Option (Last Resort):**
   ```bash
   # Restore entire project to last known good state
   git reset --hard <last-good-commit-hash>
   
   # Clean all untracked files
   git clean -fd
   
   # Reinstall dependencies
   npm install
   ```

**⚠️ WARNING:** Nuclear option will lose ALL uncommitted changes!

---

## 📝 Rollback Log Template

When rollback executed, document here:

```markdown
## Rollback #1

**Date:** YYYY-MM-DD HH:MM
**Phase:** Phase X
**Trigger:** [What went wrong]
**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Type:** Emergency / Partial / Data Safety
**Recovery Time:** X minutes
**Data Loss:** Yes / No
**Root Cause:** [Brief description]
**Resolution:** [What was done]
**Lessons Learned:** [Key takeaways]
**Prevention:** [How to prevent in future]
```

---

**Remember:** Rollback is NOT failure. It's safety mechanism.  
Better to rollback quickly than push broken code to production!
