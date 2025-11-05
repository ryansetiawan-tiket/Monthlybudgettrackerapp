# Implementation Roadmap - Complete Pockets System

## Overview

Roadmap komprehensif untuk implementasi complete Pockets System dari Phase 1 sampai Phase 2 dengan extended features.

---

## Phase Breakdown

### Phase 1: Core Pockets (2-3 Weeks)
**Goal**: 2 fixed pockets dengan transfer & timeline

**Week 1: Backend Foundation**
- [ ] Day 1-2: TypeScript types & interfaces
- [ ] Day 3-4: Balance calculation logic
- [ ] Day 5-6: Transfer endpoints (create, delete)
- [ ] Day 7: Timeline generation logic

**Week 2: Frontend Components**
- [ ] Day 1-2: PocketsSummary component
- [ ] Day 3-4: TransferDialog component
- [ ] Day 5-6: PocketTimeline component
- [ ] Day 7: Integration testing

**Week 3: Polish & Integration**
- [ ] Day 1-2: Modify ExpenseList & AddExpenseDialog
- [ ] Day 3-4: UI polish & responsive design
- [ ] Day 5-6: Testing & bug fixes
- [ ] Day 7: Documentation & deployment

**Deliverables**:
- ✅ 2 fixed pockets working
- ✅ Transfer between pockets
- ✅ Timeline per pocket
- ✅ Balance tracking

---

### Phase 1.5: Extended Features (3-4 Weeks)

#### Sprint 1: Carry Over System (1 Week)

**Backend (Days 1-3)**
- [ ] CarryOverEntry interface & schema
- [ ] Auto-generate carry over logic
- [ ] Modify balance calculation to include carry over
- [ ] API endpoints: GET carryover, POST generate, PUT recalculate

**Frontend (Days 4-6)**
- [ ] Carry over display in timeline
- [ ] Carry over breakdown in summary
- [ ] Detail modal for carry over
- [ ] Warning for editing past months

**Testing (Day 7)**
- [ ] Test first month (no carry over)
- [ ] Test subsequent months
- [ ] Test negative balance carry over
- [ ] Test recalculation

**Deliverables**:
- ✅ Automatic carry over per pocket
- ✅ Carry over tracking & breakdown
- ✅ Recalculation when past month changes

---

#### Sprint 2: Archive Kantong (1 Week)

**Backend (Days 1-3)**
- [ ] Extended Pocket interface (status, archivedAt)
- [ ] Calculate source history for auto-return
- [ ] Archive pocket logic with validation
- [ ] Unarchive pocket logic
- [ ] API endpoints: archive, unarchive, get archived

**Frontend (Days 4-6)**
- [ ] Archive dialog with balance check
- [ ] Return strategy UI (auto/manual/split)
- [ ] Archived pockets section
- [ ] Archived badge in expense list
- [ ] Restore pocket flow

**Testing (Day 7)**
- [ ] Test archive with balance = 0
- [ ] Test archive with balance > 0 (should fail)
- [ ] Test auto-return calculation
- [ ] Test manual return
- [ ] Test unarchive

**Deliverables**:
- ✅ Archive custom pockets (balance = 0 required)
- ✅ Smart return balance to source pockets
- ✅ View & restore archived pockets
- ✅ Historical expenses preserved

---

#### Sprint 3-4: Wishlist & Simulation (2 Weeks)

**Week 1: Basic Wishlist**

**Backend (Days 1-3)**
- [ ] WishlistItem interface & schema
- [ ] CRUD endpoints: GET, POST, PUT, DELETE
- [ ] Purchase wishlist item (convert to expense)

**Frontend (Days 4-6)**
- [ ] Add wishlist item dialog
- [ ] Wishlist list view (per pocket)
- [ ] Edit/delete wishlist item
- [ ] Quick access from pockets summary

**Testing (Day 7)**
- [ ] Test CRUD operations
- [ ] Test per-pocket isolation
- [ ] Test convert to expense

**Week 2: Simulation & Savings Plan**

**Backend (Days 1-4)**
- [ ] Simulation calculation logic
- [ ] Scenarios generation (cascading)
- [ ] Recommendations engine
- [ ] Savings plan generator
- [ ] API endpoints: simulate, create savings plan

**Frontend (Days 5-7)**
- [ ] Simulation view (separate page)
- [ ] Preview simulation modal
- [ ] Savings plan dialog
- [ ] Integration with auto-transfer (from Phase 2)

**Testing (Throughout)**
- [ ] Test simulation accuracy
- [ ] Test priority ordering
- [ ] Test recommendations
- [ ] Test savings plan calculation

**Deliverables**:
- ✅ Wishlist per pocket with priorities
- ✅ Budget simulation showing affordability
- ✅ Convert wishlist to expense
- ✅ Savings plan generation
- ✅ Recommendations engine

---

### Phase 2: Custom Pockets (4-6 Weeks)

**Sprint 1: Pocket CRUD (2 Weeks)**
- [ ] Custom pocket creation
- [ ] Pocket edit/delete
- [ ] Icon & color picker
- [ ] Templates
- [ ] Pocket ordering

**Sprint 2: Goals & Progress (1 Week)**
- [ ] Goal setting UI
- [ ] Progress calculation
- [ ] Visual progress indicators
- [ ] Projections & suggestions

**Sprint 3: Auto-Transfer (1 Week)**
- [ ] Auto-transfer rule CRUD
- [ ] Cron job setup
- [ ] Execution logic
- [ ] Error handling & notifications

**Sprint 4: Analytics (2 Weeks)**
- [ ] Allocation chart
- [ ] Spending charts
- [ ] Trend analysis
- [ ] Insights generation

**Deliverables**:
- ✅ Unlimited custom pockets
- ✅ Goals & progress tracking
- ✅ Auto-transfer automation
- ✅ Analytics & insights

---

## Implementation Order

### Recommended Sequence

```
Phase 1 (Core)
    ↓
Phase 1.5.1 (Carry Over) ← Essential for multi-month
    ↓
Phase 1.5.2 (Archive) ← Needed before custom pockets
    ↓
Phase 2 (Custom Pockets)
    ↓
Phase 1.5.3 (Wishlist) ← Can be done in parallel with Phase 2
    ↓
Phase 2 (Advanced Features)
```

**Rationale**:
1. **Carry Over First**: Essential for accurate multi-month tracking
2. **Archive Second**: Needed for lifecycle management of custom pockets
3. **Custom Pockets**: Now safe to let users create unlimited pockets
4. **Wishlist Parallel**: Can develop alongside custom pockets (no dependency)

---

## Dependencies Matrix

```
Feature                 | Depends On
------------------------|------------------
Phase 1: Core          | -
Carry Over             | Phase 1
Archive                | Phase 1
Custom Pockets         | Phase 1 + Archive
Wishlist               | Phase 1
Auto-Transfer          | Phase 1 + Custom Pockets
Goals                  | Custom Pockets
Analytics              | Custom Pockets
Multi-Source Transfer  | Phase 1
```

---

## Resource Allocation

### Backend Developer
- Phase 1: 50% time (1.5 weeks)
- Phase 1.5: 60% time (2 weeks)
- Phase 2: 50% time (3 weeks)

### Frontend Developer
- Phase 1: 80% time (2 weeks)
- Phase 1.5: 70% time (2.5 weeks)
- Phase 2: 60% time (3.5 weeks)

### Designer/UX
- Phase 1: 30% time (design system)
- Phase 1.5: 20% time (extend components)
- Phase 2: 40% time (new visualizations)

---

## Testing Strategy

### Unit Tests
```typescript
// Backend
- Balance calculation logic
- Carry over generation
- Simulation engine
- Transfer validation
- Source history calculation

// Frontend
- Component rendering
- Form validation
- State management
```

### Integration Tests
```typescript
- Transfer → Balance update
- Archive → Return transfers
- Wishlist purchase → Expense creation
- Carry over → Next month balance
- Auto-transfer → Scheduled execution
```

### E2E Tests
```typescript
- Complete user journey: Add expense from pocket
- Transfer between pockets
- View timeline
- Archive pocket with returns
- Create wishlist → Simulate → Purchase
```

---

## Risk Management

### High Risk Items

**1. Carry Over Recalculation**
- **Risk**: Editing past month after carry over generated
- **Mitigation**: Show warning, optional recalc, audit trail

**2. Archive with Expenses**
- **Risk**: Archived pocket but expenses still reference it
- **Mitigation**: Soft archive only, show archived badge, allow restore

**3. Simulation Performance**
- **Risk**: Complex calculation for many items
- **Mitigation**: Cache results, limit items per pocket, optimize algorithm

**4. Auto-Transfer Reliability**
- **Risk**: Cron job fails, insufficient balance
- **Mitigation**: Error logging, retry mechanism, user notification

---

## Performance Targets

### API Response Times
```
GET /pockets               < 200ms
POST /transfer             < 300ms
GET /timeline              < 500ms
GET /wishlist/simulate     < 800ms
POST /carryover/generate   < 1000ms
```

### Frontend Rendering
```
Initial page load          < 2s
Component render           < 100ms
Dialog open/close          < 200ms
Timeline expand            < 300ms
Simulation calculation     < 500ms
```

### Database Operations
```
Read operation             < 50ms
Write operation            < 100ms
Batch operation            < 500ms
```

---

## Milestones & Checkpoints

### Milestone 1: Phase 1 Complete
**Date**: Week 3
**Criteria**:
- [ ] 2 pockets working
- [ ] Can transfer between pockets
- [ ] Timeline shows transactions
- [ ] Balance accurate
- [ ] All tests passing

### Milestone 2: Carry Over Working
**Date**: Week 4
**Criteria**:
- [ ] Auto-generate carry over
- [ ] Timeline shows carry over
- [ ] Balance includes carry over
- [ ] Recalculation working

### Milestone 3: Archive System Complete
**Date**: Week 5
**Criteria**:
- [ ] Can archive pocket (balance = 0)
- [ ] Smart return balance
- [ ] Can restore archived
- [ ] Historical data preserved

### Milestone 4: Wishlist MVP
**Date**: Week 7
**Criteria**:
- [ ] Can add/edit/delete wishlist items
- [ ] Simulation shows affordability
- [ ] Can convert to expense
- [ ] Recommendations working

### Milestone 5: Phase 2 Complete
**Date**: Week 11-13
**Criteria**:
- [ ] Custom pockets working
- [ ] Goals & progress tracking
- [ ] Auto-transfer enabled
- [ ] Analytics dashboard

---

## Go-Live Checklist

### Pre-Launch (Phase 1)
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Security review complete
- [ ] Documentation complete
- [ ] Migration script tested
- [ ] Rollback plan ready
- [ ] User communication prepared

### Launch Day
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] User feedback channel open
- [ ] Support team ready

### Post-Launch (Week 1)
- [ ] Daily monitoring
- [ ] Bug triage & fixes
- [ ] User feedback review
- [ ] Performance optimization
- [ ] Documentation updates

---

## Success Metrics

### Phase 1
- [ ] 80% users use both pockets
- [ ] Average 2-3 transfers per user per month
- [ ] < 5% error rate
- [ ] < 2s average page load

### Phase 1.5
- [ ] 90% users have carry over working
- [ ] < 1% archive errors
- [ ] 50% users create wishlist
- [ ] Average 3 wishlist items per pocket

### Phase 2
- [ ] 60% users create custom pocket
- [ ] Average 4 pockets per user
- [ ] 30% users set goals
- [ ] 20% enable auto-transfer

---

## Continuous Improvement

### Monthly Reviews
- Performance metrics review
- User feedback analysis
- Bug prioritization
- Feature request evaluation

### Quarterly Releases
- New features based on feedback
- Performance optimizations
- UI/UX improvements
- Security updates

---

## Communication Plan

### Stakeholders
- **Weekly**: Progress update, blockers
- **Sprint End**: Demo, retrospective
- **Milestone**: Release notes, documentation

### Users
- **Pre-Launch**: Feature announcement
- **Launch**: Tutorial, help docs
- **Post-Launch**: Tips & tricks, best practices

---

**Version**: 1.0  
**Last Updated**: November 5, 2025  
**Status**: Active Roadmap
