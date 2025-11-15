# 🚦 STOP GATE PROTOCOL - Zero Regression Enforcement

**PURPOSE:** Mandatory blocking mechanism to prevent broken code from progressing to next phase  
**RULE:** If ANY stop gate fails → MUST STOP and fix before proceeding  
**NO EXCEPTIONS!**

---

## 🔴 THE GOLDEN RULE

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🚨 JIKA ADA YANG FAIL → WAJIB STOP!                   │
│                                                         │
│  ❌ TIDAK BOLEH proceed ke fase berikutnya             │
│  ❌ TIDAK BOLEH "nanti fix belakangan"                 │
│  ❌ TIDAK BOLEH "skip dulu testing ini"                │
│                                                         │
│  ✅ WAJIB debug dan fix sampai 100% pass               │
│  ✅ WAJIB re-test setelah fix                          │
│  ✅ WAJIB dokumentasikan issue di INCIDENT_LOG.md      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚦 Stop Gate Levels

### 🔴 RED LIGHT (CRITICAL STOP - No exceptions!)
**If ANY of these fail → STOP IMMEDIATELY**

App akan **completely broken**, user tidak bisa pakai sama sekali.

#### Critical Stop Conditions:
- [ ] ❌ App crashes on load
- [ ] ❌ TypeScript compilation errors
- [ ] ❌ Runtime errors in console (red errors)
- [ ] ❌ ExpenseList doesn't render at all
- [ ] ❌ Cannot add expense (completely broken)
- [ ] ❌ Cannot view expenses (empty or error)
- [ ] ❌ Data corruption detected
- [ ] ❌ Build fails (`npm run build` errors)

**ACTION:** Execute **EMERGENCY ROLLBACK** immediately (< 2 min)  
**DURATION:** No time limit - fix until works  
**NEXT STEP:** Debug, fix, re-test, document incident

---

### 🟠 ORANGE LIGHT (HIGH STOP - Fix before proceed)
**If ANY of these fail → STOP and fix within 30 minutes**

App masih bisa load tapi **major features broken**, user experience jelek.

#### High Priority Stop Conditions:
- [ ] ⚠️ Major UI layout broken (elements overlapping, missing sections)
- [ ] ⚠️ Multiple features broken (2+ features)
- [ ] ⚠️ Performance degradation > 50% (use Chrome DevTools)
- [ ] ⚠️ Modal system not working (can't open/close)
- [ ] ⚠️ Forms not submitting
- [ ] ⚠️ Delete/Edit actions not working
- [ ] ⚠️ Pull-to-refresh broken (mobile)
- [ ] ⚠️ Long-press gestures broken (mobile)
- [ ] ⚠️ Category filter completely broken

**ACTION:** Attempt fix in place OR partial rollback  
**DURATION:** 30 minutes max  
**NEXT STEP:** If not fixed in 30 min → Execute rollback

---

### 🟡 YELLOW LIGHT (MEDIUM CAUTION - Document and assess)
**If ANY of these fail → Assess severity before proceed**

App works tapi ada **minor issues**, bisa proceed dengan caution.

#### Medium Priority Caution Conditions:
- [ ] 🟡 Single feature broken (1 feature only)
- [ ] 🟡 Minor UI inconsistencies (spacing, colors)
- [ ] 🟡 Performance degradation 20-50%
- [ ] 🟡 Console warnings (not errors)
- [ ] 🟡 Some edge cases broken
- [ ] 🟡 Specific category not filtering correctly

**ACTION:** Document issue, assess if blocking  
**DECISION:**
- If critical to UX → Fix before proceed
- If minor cosmetic → Can defer to Phase 6 cleanup

**DURATION:** 15 minutes max for assessment  
**NEXT STEP:** Make conscious decision to fix now or defer

---

### 🟢 GREEN LIGHT (SAFE TO PROCEED)
**All tests pass → Safe to proceed to next phase**

#### Green Light Criteria (ALL must pass):
- [x] ✅ App loads without errors
- [x] ✅ TypeScript compiles (0 errors)
- [x] ✅ Build succeeds (`npm run build`)
- [x] ✅ ExpenseList renders correctly
- [x] ✅ Can add/edit/delete expenses
- [x] ✅ Can add/edit/delete incomes
- [x] ✅ All modals open/close
- [x] ✅ Category filtering works
- [x] ✅ Search works
- [x] ✅ Sorting works
- [x] ✅ Mobile gestures work
- [x] ✅ Performance same or better
- [x] ✅ No console errors (red)
- [x] ✅ Backward compatibility maintained

**ACTION:** Commit changes, proceed to next phase  
**CELEBRATE:** Phase complete! Take 5 min break 🎉

---

## 📋 Stop Gate Checklist (Run EVERY Phase!)

Copy this checklist and run it **AFTER EVERY PHASE**:

```markdown
## Stop Gate Check - Phase [X]

Date: ________ Time: ________
Tester: ________

### 🔴 CRITICAL CHECKS (MUST ALL PASS)
- [ ] App loads without crash
- [ ] TypeScript compiles (0 errors)
- [ ] ExpenseList renders
- [ ] Can add expense
- [ ] Can view expenses
- [ ] No runtime errors (red in console)
- [ ] Build succeeds

**Result:** ☐ RED (STOP) ☐ GREEN (PASS)

### 🟠 HIGH PRIORITY CHECKS (MUST ALL PASS)
- [ ] Desktop layout correct
- [ ] Mobile layout correct
- [ ] All modals work
- [ ] Forms submit correctly
- [ ] Edit/Delete work
- [ ] Category filter works
- [ ] Search works
- [ ] Sorting works
- [ ] Long-press works (mobile)

**Result:** ☐ ORANGE (FIX) ☐ GREEN (PASS)

### 🟡 MEDIUM CHECKS (ASSESS IF FAIL)
- [ ] UI spacing consistent
- [ ] Performance same or better
- [ ] No console warnings (yellow)
- [ ] All edge cases work

**Result:** ☐ YELLOW (ASSESS) ☐ GREEN (PASS)

### ✅ FINAL DECISION
- [ ] 🟢 ALL GREEN → Safe to proceed
- [ ] 🔴 ANY RED → MUST ROLLBACK
- [ ] 🟠 ANY ORANGE → MUST FIX
- [ ] 🟡 ANY YELLOW → ASSESS & DECIDE

**Approved to Proceed:** ☐ YES ☐ NO

**Signature:** __________ Time: __________
```

---

## 🎯 Phase-Specific Stop Gates

### Phase 0: Preparation
**No stop gate** (just setup)

---

### Phase 1: Types & Helpers

#### Before Proceeding to Phase 2:
```
🔴 CRITICAL:
- [ ] TypeScript compiles without errors
- [ ] All type imports resolve correctly
- [ ] ExpenseList still renders
- [ ] Can add/view expenses

🟠 HIGH:
- [ ] No type errors in IDE
- [ ] Autocomplete works for new types
- [ ] Helper functions work correctly

🟢 GREEN: All pass → Proceed to Phase 2
```

**Time Limit:** 5 minutes testing  
**If Fail:** Rollback Phase 1 (very low risk)

---

### Phase 2: Lazy Loading

#### Before Proceeding to Phase 3:
```
🔴 CRITICAL:
- [ ] App loads without crash
- [ ] All modals still open
- [ ] No dynamic import errors
- [ ] BulkEditCategoryDialog opens
- [ ] AdvancedFilterDrawer opens
- [ ] SimulationSandbox opens
- [ ] ItemActionSheet opens

🟠 HIGH:
- [ ] Loading states appear briefly
- [ ] No delay > 1 second
- [ ] Bundle size reduced (check build output)

🟢 GREEN: All pass → Proceed to Phase 3
```

**Time Limit:** 10 minutes testing  
**If Fail:** Rollback lazy imports (restore direct imports)

---

### Phase 3: Custom Hooks (⚠️ HIGH RISK)

**⚠️ WARNING:** This is the HIGHEST RISK phase!

#### 🚨 MANDATORY CANARY TESTING:
**DO NOT extract all hooks at once!**

**Step 1:** Extract ONE hook first (useExpenseFiltering)
- [ ] Test extensively (15 min)
- [ ] Verify filtering works identically
- [ ] Check no infinite re-renders
- [ ] Commit if pass

**Step 2:** Extract SECOND hook (useBulkSelection)
- [ ] Test extensively (15 min)
- [ ] Verify bulk mode works identically
- [ ] Commit if pass

**Step 3:** Extract THIRD hook (useExpenseActions)
- [ ] Test extensively (15 min)
- [ ] Verify CRUD works identically
- [ ] Commit if pass

**Step 4:** Extract FOURTH hook (useExpenseListModals)
- [ ] Test extensively (15 min)
- [ ] Verify modals work identically
- [ ] Commit if pass

#### Before Proceeding to Phase 4:
```
🔴 CRITICAL (MUST ALL PASS):
- [ ] Filtering works (search, category, date range)
- [ ] Sorting works (date, amount)
- [ ] Bulk select mode works
- [ ] Bulk delete works
- [ ] Bulk category edit works
- [ ] Edit expense works
- [ ] Delete expense works
- [ ] All modals open/close correctly
- [ ] No infinite re-render loops
- [ ] No stale state issues

🟠 HIGH:
- [ ] Performance same or better
- [ ] No console warnings about dependencies
- [ ] useEffect dependency arrays correct
- [ ] No memory leaks (check React DevTools)

🟢 GREEN: All pass → Proceed to Phase 4
```

**Time Limit:** 60 minutes testing (this is critical!)  
**If Fail:** Rollback Phase 3 OR fix specific hook

---

### Phase 4: Render Components (⚠️ HIGH RISK)

**⚠️ WARNING:** Second highest risk phase!

#### 🚨 MANDATORY CANARY TESTING:
**DO NOT extract all components at once!**

**Step 1:** Extract ExpenseListItem ONLY
- [ ] Test extensively (20 min)
- [ ] Desktop rendering correct
- [ ] Mobile rendering correct
- [ ] Category emojis display
- [ ] Template emojis display
- [ ] Long-press works (mobile)
- [ ] Commit if pass

**Step 2:** Extract IncomeListItem ONLY
- [ ] Test extensively (15 min)
- [ ] Income rows render correctly
- [ ] Currency badges display
- [ ] Commit if pass

**Step 3:** Extract ExpenseListHeader ONLY
- [ ] Test extensively (15 min)
- [ ] Header controls work
- [ ] Sort/filter/search work
- [ ] Commit if pass

**Step 4:** Extract BulkActionToolbar ONLY
- [ ] Test extensively (15 min)
- [ ] Bulk toolbar works
- [ ] Commit if pass

#### Before Proceeding to Phase 5:
```
🔴 CRITICAL (MUST ALL PASS):
- [ ] Desktop expense list renders identically
- [ ] Mobile expense list renders identically
- [ ] Desktop income list renders identically
- [ ] Mobile income list renders identically
- [ ] All emojis display correctly
- [ ] All badges display correctly
- [ ] All hover states work
- [ ] All click handlers work
- [ ] Long-press works (mobile)
- [ ] Bulk mode UI works
- [ ] Header controls work

🟠 HIGH:
- [ ] Performance same or better (check scroll smoothness)
- [ ] No prop drilling issues
- [ ] No missing keys in lists
- [ ] No over-rendering (use React DevTools Profiler)

🟢 GREEN: All pass → Proceed to Phase 5
```

**Time Limit:** 90 minutes testing (very critical!)  
**If Fail:** Rollback Phase 4 OR rollback specific component

---

### Phase 5: Memoization

#### Before Proceeding to Phase 6:
```
🔴 CRITICAL:
- [ ] All features still work (no stale data from memo)
- [ ] Forms still submit
- [ ] State updates still trigger re-renders

🟠 HIGH:
- [ ] Performance improved (check React DevTools Profiler)
- [ ] No over-memoization (causing stale UI)
- [ ] Dependency arrays correct

🟢 GREEN: All pass → Proceed to Phase 6
```

**Time Limit:** 20 minutes testing  
**If Fail:** Remove problematic memo/useMemo/useCallback

---

### Phase 6: Cleanup

#### Before Marking Complete:
```
🔴 CRITICAL:
- [ ] Full regression test passes (all features)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Bundle size reduced (check output)

🟠 HIGH:
- [ ] Code formatted consistently
- [ ] No unused imports
- [ ] No commented code
- [ ] Documentation updated

🟢 GREEN: All pass → REFACTORING COMPLETE! 🎉
```

**Time Limit:** 30 minutes final testing

---

## 🛑 Emergency Stop Procedure

If you hit a **RED LIGHT** at any point:

### Immediate Actions (< 2 minutes):
1. **STOP all work immediately**
2. **Do NOT make more changes**
3. **Do NOT try to "fix quickly"**
4. **Take screenshot of error**
5. **Copy console output**

### Assessment (2-5 minutes):
1. **Read error message carefully**
2. **Check INCIDENT_LOG.md for similar issues**
3. **Check ROLLBACK.md for severity level**
4. **Decide: Fix in place OR Rollback**

### Decision Tree:
```
Is error obvious and quick fix (< 5 min)?
├─ YES → Fix, test, proceed
└─ NO → Is this first attempt to fix?
    ├─ YES → Try debugging (15 min max)
    └─ NO → ROLLBACK NOW (already wasted time)
```

### After Rollback:
1. **Document incident in INCIDENT_LOG.md**
2. **Analyze root cause**
3. **Update MASTER_PLAN.md risk assessment**
4. **Add prevention to TESTING_CHECKLIST.md**
5. **Take break (10 min) before retry**

---

## 📊 Stop Gate Metrics

Track these after each phase:

| Phase | Red Lights Hit | Orange Lights Hit | Yellow Lights Hit | Rollbacks | Time Lost |
|-------|---------------|-------------------|-------------------|-----------|-----------|
| 1 | - | - | - | - | - |
| 2 | - | - | - | - | - |
| 3 | - | - | - | - | - |
| 4 | - | - | - | - | - |
| 5 | - | - | - | - | - |
| 6 | - | - | - | - | - |

**Target:** 0 red lights, 0 rollbacks, 0 time lost

---

## 🎓 Stop Gate Best Practices

### DO ✅
- Test immediately after each change
- Test on BOTH desktop AND mobile
- Test on REAL device (mobile) if possible
- Use React DevTools to check performance
- Document every failed stop gate
- Take breaks between phases (fresh eyes catch bugs)

### DON'T ❌
- Skip testing "because it's small change"
- Test only on desktop (mobile issues missed)
- Proceed with yellow lights without assessment
- Ignore console warnings
- Rush through stop gates
- Work when tired (bugs multiply)

---

## 🔍 Debugging Checklist (When Stop Gate Fails)

```markdown
### Quick Debug Checklist:

#### TypeScript Errors:
- [ ] Check import paths (relative vs absolute)
- [ ] Check file actually exists
- [ ] Check export matches import
- [ ] Restart TypeScript server

#### Runtime Errors:
- [ ] Check console for stack trace
- [ ] Check if component renders
- [ ] Check props passed correctly
- [ ] Check state updates

#### Infinite Re-renders:
- [ ] Check useEffect dependency arrays
- [ ] Check if creating new objects in render
- [ ] Check if callbacks are memoized
- [ ] Use React DevTools Profiler

#### Stale Data:
- [ ] Check if over-memoized
- [ ] Check useCallback dependencies
- [ ] Check React.memo comparison
- [ ] Force re-render to test

#### Performance Issues:
- [ ] Use Chrome DevTools Performance tab
- [ ] Use React DevTools Profiler
- [ ] Check for expensive operations in render
- [ ] Check list keys are unique and stable
```

---

## 🎯 Success Stories vs Failure Examples

### ✅ Success Story Example:
```
Phase 3 - Extract useExpenseFiltering hook
✅ Extracted hook
✅ Ran stop gate check
✅ Found: Filtering works but search has 100ms delay
🟡 YELLOW LIGHT - assessed as minor
✅ Documented for Phase 6 optimization
✅ Proceeded to next hook
Result: Zero regression, smooth progress
```

### ❌ Failure Example (What NOT to do):
```
Phase 4 - Extract components
❌ Extracted all 4 components at once (big commit)
❌ Ran quick test, looked OK
❌ Skipped mobile testing (was tired)
❌ Proceeded to Phase 5
❌ Next day: Discovered mobile layout completely broken
❌ Hard to debug (which component caused it?)
❌ Wasted 2 hours debugging
❌ Had to rollback entire Phase 4
Result: Time wasted, frustration high
```

**Lesson:** Stop gates exist for a reason. Follow them STRICTLY!

---

## 📝 Stop Gate Sign-Off Template

After each phase, fill this out:

```markdown
## Stop Gate Sign-Off - Phase [X]

**Date:** ________
**Time:** ________
**Duration:** ______ minutes

### Pre-Phase State:
- Git commit: [hash]
- All tests: ☐ PASS

### Post-Phase State:
- Git commit: [hash]
- Stop Gate Result: ☐ 🟢 GREEN ☐ 🟡 YELLOW ☐ 🟠 ORANGE ☐ 🔴 RED

### Issues Found:
1. [Description] - Severity: [🔴/🟠/🟡] - Status: [Fixed/Deferred/Blocked]

### Sign-Off:
- [ ] All critical checks pass (🔴)
- [ ] All high priority checks pass (🟠)
- [ ] All yellow lights assessed and documented
- [ ] Performance same or better
- [ ] No console errors
- [ ] Mobile tested
- [ ] Desktop tested
- [ ] Incident logged (if any)
- [ ] Ready for next phase

**Signed:** __________ **Time:** __________
```

---

**REMEMBER: Stop gates save time, not waste time!**

**Better to spend 10 minutes testing now than 2 hours debugging later.** ⏱️

---

**Last Updated:** November 15, 2025  
**Status:** ✅ Active Protocol
