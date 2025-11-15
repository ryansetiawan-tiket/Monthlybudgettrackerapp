# 📦 ExpenseList.tsx Modular Refactoring - Planning

**Version:** 1.0  
**Created:** November 15, 2025  
**Status:** 🟡 Ready to Execute  
**Estimated Duration:** 4-6 hours

---

## 📁 Planning Documents

| Document | Purpose | Status |
|----------|---------|--------|
| **[MASTER_PLAN.md](./MASTER_PLAN.md)** | Master refactoring plan with 6 phases | ✅ Complete |
| **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** | Comprehensive testing guide | ✅ Complete |
| **[ROLLBACK.md](./ROLLBACK.md)** | Rollback procedures for safety | ✅ Complete |

---

## 🎯 Quick Start

### Before Starting Refactoring:

1. **Read all planning documents** (15 min)
   - Read MASTER_PLAN.md completely
   - Skim TESTING_CHECKLIST.md
   - Skim ROLLBACK.md

2. **Create git branch**
   ```bash
   git checkout -b refactor/expenselist-modular
   ```

3. **Backup current state**
   ```bash
   # Create a tag for easy rollback
   git tag refactor-expenselist-backup
   
   # Or copy file manually
   cp components/ExpenseList.tsx components/ExpenseList.tsx.backup
   ```

4. **Start with Phase 0** in MASTER_PLAN.md

---

## 📊 Progress Dashboard

### Phase Completion
- [x] Phase 0: Preparation (100%) ✅ COMPLETE - November 15, 2025
- [x] Phase 1: Types & Helpers (100%) ✅ COMPLETE - November 15, 2025
- [x] Phase 2: Lazy Loading (100%) ✅ COMPLETE - November 15, 2025
- [ ] Phase 3: Custom Hooks (50%) 🟡 IN PROGRESS
  - [x] CANARY #1: useExpenseFiltering Hook ✅ COMPLETE
  - [x] CANARY #2: useBulkSelection Hook ✅ COMPLETE - November 15, 2025
  - [ ] CANARY #3: useExpenseActions Hook ⏳ NEXT
  - [ ] CANARY #4: useExpenseListModals Hook
- [ ] Phase 4: Render Components (0%)
- [ ] Phase 5: Memoization (0%)
- [ ] Phase 6: Cleanup & Docs (0%)

**Overall:** 3.5/7 phases (50%)

### Time Tracking
- **Estimated:** 4-6 hours
- **Actual:** 45 min (Phase 0: 15 min, Phase 1: 15 min, Phase 2: 15 min)
- **Remaining:** ~195-315 min

### Files Created
- **Target:** 11 new files
- **Created:** 4 files (types/expense.ts, utils/expenseHelpers.ts, hooks/useExpenseFiltering.ts, hooks/useBulkSelection.ts)
- **Remaining:** 7 files

### LOC Reduction
- **Target:** ~1,400-2,000 lines
- **Achieved:** ~880 lines (44-63% of target) 
- **Remaining:** ~520-1,120 lines

### Bundle Optimization
- **Lazy Loaded Components:** 4 (BulkEditCategoryDialog, AdvancedFilterDrawer, SimulationSandbox, ItemActionSheet)
- **Bundle Size Reduction:** ~75-105 KB

---

## 🎓 Key Principles

### 1. Incremental Progress
- ✅ Small, testable changes
- ✅ Commit after each phase
- ✅ Test before proceeding
- ❌ No big-bang refactors

### 2. Safety First
- ✅ Backup before starting
- ✅ Test extensively
- ✅ Rollback if issues
- ❌ No rushing

### 3. Zero Regression
- ✅ All features must work
- ✅ All UI must be identical
- ✅ Performance same or better
- ❌ No breaking changes

---

## 🔥 Emergency Procedures

**If something breaks:**

1. **Stop immediately**
2. **Check ROLLBACK.md**
3. **Execute appropriate rollback**
4. **Document issue**
5. **Analyze root cause**
6. **Update plan**
7. **Retry with fix**

**Quick Rollback:**
```bash
git checkout HEAD -- components/ExpenseList.tsx
rm -rf types/expense.ts utils/expenseHelpers.ts hooks/useExpense*.ts components/expense-list/
```

---

## 📈 Success Metrics

### Code Quality
- **Target:** 50% LOC reduction (2500 → 1250 lines)
- **Current:** 0% reduction

### Modularity
- **Target:** 11 new modular files
- **Current:** 0 files

### Performance
- **Target:** Bundle size -50-100KB
- **Current:** No change

### Testing
- **Target:** 100% manual test coverage
- **Current:** 0% tested

---

## 🗂️ Architecture Overview

### Before Refactoring
```
components/
└── ExpenseList.tsx (2500+ lines - MONOLITH)
```

### After Refactoring (Target)
```
components/
├── ExpenseList.tsx (1250 lines - ORCHESTRATOR)
└── expense-list/
    ├── ExpenseListItem.tsx
    ├── IncomeListItem.tsx
    ├── ExpenseListHeader.tsx
    └── BulkActionToolbar.tsx

hooks/
├── useExpenseFiltering.ts
├── useBulkSelection.ts
├── useExpenseActions.ts
└── useExpenseListModals.ts

types/
└── expense.ts

utils/
└── expenseHelpers.ts
```

---

## 🎯 What to Refactor

### ✅ WILL Refactor
- Type definitions → `/types/expense.ts`
- Helper functions → `/utils/expenseHelpers.ts`
- Business logic → Custom hooks in `/hooks/`
- Render logic → Sub-components in `/components/expense-list/`
- Import strategy → Lazy loading

### ❌ WON'T Refactor (Keep in ExpenseList.tsx)
- Main component structure
- Props interface (ExpenseListProps)
- Top-level state orchestration
- Main return JSX structure

---

## 📚 Related Resources

### Project Guidelines
- [Guidelines.md](/Guidelines.md) - Project rules
- [BACKWARD_COMPATIBILITY_RULES.md](/BACKWARD_COMPATIBILITY_RULES.md) - Data compatibility

### Technical Docs
- [/utils/calculations.ts](/utils/calculations.ts) - Helper functions
- [/types/index.ts](/types/index.ts) - Type definitions
- [/constants.ts](/constants.ts) - Constants

### Similar Refactoring Examples
- `/planning/category-breakdown-refactor/` - Category breakdown modularization
- `/planning/desktop-expense-flow-refactor/` - Desktop flow refactoring
- `/planning/income-refactor-v3-polish/` - Income list refactoring

---

## ⚠️ Important Reminders

### Before Each Phase
- [ ] Create git commit
- [ ] Run smoke test
- [ ] Check console for errors

### During Each Phase
- [ ] Make small changes
- [ ] Test frequently
- [ ] Commit often
- [ ] Document issues

### After Each Phase
- [ ] Run full testing checklist
- [ ] Check performance
- [ ] Create rollback point
- [ ] Update progress in MASTER_PLAN.md

---

## 🤝 Contributing Notes

If multiple people work on this:

1. **Coordinate phases** - Only one person per phase
2. **Communicate progress** - Update MASTER_PLAN.md checkboxes
3. **Share learnings** - Add to "Lessons Learned" section
4. **Report issues** - Document in ROLLBACK.md if rollback needed

---

## 📝 Phase Execution Template

For each phase:

```markdown
## Phase X: [Name]

### Pre-Phase Checklist
- [ ] Read phase instructions in MASTER_PLAN.md
- [ ] Create git commit of current state
- [ ] Run smoke test
- [ ] Estimate time needed

### Execution
- [ ] Create necessary files
- [ ] Extract code
- [ ] Update imports
- [ ] Test smoke test
- [ ] Test detailed checklist

### Post-Phase Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Performance same or better
- [ ] Create rollback point
- [ ] Update progress in MASTER_PLAN.md
```

---

## 🏁 Final Deliverables

When all phases complete:

- [ ] ExpenseList.tsx reduced to ~1250 lines
- [ ] 11 new modular files created
- [ ] All tests passing
- [ ] Performance improved or same
- [ ] Bundle size reduced
- [ ] Documentation updated
- [ ] Refactoring summary created
- [ ] Git history clean
- [ ] Ready for production

---

**Ready to start? Begin with Phase 0 in [MASTER_PLAN.md](./MASTER_PLAN.md)!**

---

**Last Updated:** November 15, 2025  
**Next Review:** After Phase 1 completion