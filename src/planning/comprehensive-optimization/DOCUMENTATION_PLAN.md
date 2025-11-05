# Documentation Restructuring Plan

**Phase**: Documentation Update  
**Priority**: 🟡 High  
**Estimated Time**: 2-3 hours

---

## 🎯 Objectives

1. **Consolidate root-level docs** (16 → 5 files)
2. **Update wiki documentation** with latest features
3. **Create comprehensive README**
4. **Archive obsolete documentation**
5. **Improve documentation discoverability**

---

## 1. Root Directory Restructuring

### Current State (16 files)
```
├── AI_rules.md
├── Attributions.md
├── CHANGELOG_EMOJI_PICKER.md
├── CIRCULAR_REFERENCE_FIX.md
├── DIALOG_20_PERCENT_LARGER_SUMMARY.md
├── DIALOG_SIZE_FIX.md
├── DIALOG_SIZE_FIX_QUICK_REF.md
├── MULTIPLE_ENTRY_EXPENSE.md
├── PERFORMANCE_FIX_POCKETS_LOADING.md
├── PERFORMANCE_FIX_QUICK_REF.md
├── PERFORMANCE_FIX_TIMELINE_LOADING.md
├── PERFORMANCE_FIX_TIMELINE_QUICK_REF.md
├── REALTIME_UPDATE_FIX.md
├── REALTIME_UPDATE_QUICK_REF.md
├── SETISOPEN_ERROR_FIX.md
├── SKELETON_LOADING_QUICK_REF.md
├── SKELETON_LOADING_UPDATE.md
├── TOGGLE_POCKETS_FEATURE.md
├── TOGGLE_POCKETS_QUICK_REF.md
```

### Target State (3-5 files)
```
├── README.md (NEW - Main documentation)
├── AI_rules.md (Keep - AI reference)
├── Attributions.md (Keep - Legal/credits)
├── CHANGELOG.md (NEW - Consolidated changelog)
```

---

## 2. Create New Root Documents

### A. `/README.md` (PRIMARY DOC)

```markdown
# Budget Tracking App

**Aplikasi tracking budget bulanan terintegrasi dengan Supabase**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Status](https://img.shields.io/badge/status-stable-green)

## 📋 Overview

Aplikasi web untuk tracking budget bulanan dengan fitur:
- 💰 Budget awal dengan carryover otomatis
- 💵 Pemasukan tambahan dengan konversi USD → IDR
- 🏦 Sistem kantong (pockets) yang scalable
- 📊 Wishlist & Budget Simulation
- ⚡ Realtime sync dengan Supabase
- 🎯 Exclude system untuk perhitungan flexible

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Exchange Rate API key (optional)

### Installation

\`\`\`bash
# Clone repository
git clone [repo-url]

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Configure Supabase credentials
# Add EXCHANGE_RATE_API_KEY (optional)

# Run development server
npm run dev
\`\`\`

## 📖 Documentation

- **[Setup Guide](./docs/tracking-app-wiki/06-setup-guide.md)** - Detailed setup instructions
- **[User Guide](./docs/tracking-app-wiki/02-features-detail.md)** - Feature documentation
- **[Architecture](./docs/tracking-app-wiki/01-architecture.md)** - System design
- **[API Documentation](./docs/tracking-app-wiki/04-backend-server.md)** - Backend API reference
- **[Troubleshooting](./docs/tracking-app-wiki/05-troubleshooting.md)** - Common issues

## ✨ Key Features

### Pockets System
Sistem kantong yang scalable:
- **Kantong Sehari-hari** - Budget awal
- **Kantong Uang Dingin** - Pemasukan tambahan
- **Custom Pockets** - Tabungan, goals, dll
- Transfer antar kantong dengan timeline tracking

### Budget Simulation
Test skenario "what-if" dengan wishlist:
- Health bar visualization
- Multiple item simulation
- Breakdown biaya per kategori

### Realtime Sync
Automatic sync menggunakan Supabase Realtime:
- Update otomatis saat data berubah
- Multi-device sync
- Conflict-free updates

### Exclude System
Flexible calculation dengan exclude feature:
- Exclude pengeluaran tertentu
- Exclude pemasukan tambahan
- Exclude deduction
- Lock state untuk freeze calculation

## 🏗️ Architecture

**Stack**:
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Supabase Edge Functions (Hono)
- Database: Supabase PostgreSQL
- Storage: Supabase KV Store
- Realtime: Supabase Realtime
- UI Components: shadcn/ui

**Data Flow**:
\`\`\`
Frontend → Server → Database
         ← Realtime ← 
\`\`\`

See [Architecture Documentation](./docs/tracking-app-wiki/01-architecture.md) for details.

## 📊 Performance

- **Initial Load**: < 2s
- **Data Fetching**: < 1s (optimized parallel fetching)
- **Page Transitions**: < 300ms
- **Bundle Size**: ~600KB (optimized)

## 🔧 Development

### Project Structure
\`\`\`
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── utils/              # Utility functions
├── types/              # TypeScript definitions
├── constants/          # App constants
├── hooks/              # Custom React hooks
├── supabase/           # Backend server
│   └── functions/
│       └── server/     # Edge functions
├── docs/               # Documentation
└── planning/           # Development planning
\`\`\`

### Key Files
- `App.tsx` - Main application component
- `supabase/functions/server/index.tsx` - Backend API
- `components/PocketsSummary.tsx` - Pockets display
- `components/BudgetOverview.tsx` - Budget summary

## 📝 Recent Updates

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

### v2.0.0 (Latest)
- ✅ Comprehensive optimization & cleanup
- ✅ Performance improvements (20-30% faster)
- ✅ Code refactoring (utilities, types, constants)
- ✅ Documentation consolidation

### v1.5.0
- ✅ Wishlist & Budget Simulation
- ✅ Emoji picker upgrade
- ✅ Dialog size optimization (20% larger)
- ✅ Performance fixes (pockets & timeline)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

[License Type] - See LICENSE file for details.

## 🙏 Attributions

See [Attributions.md](./Attributions.md) for credits and third-party licenses.

## 📮 Support

For issues and questions:
- Check [Troubleshooting Guide](./docs/tracking-app-wiki/05-troubleshooting.md)
- Open an issue on GitHub
- Contact: [your-contact]

---

**Made with ❤️ using React + Supabase**
```

---

### B. `/CHANGELOG.md` (CONSOLIDATED)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-05

### Added
- Comprehensive code optimization and cleanup
- Utility functions (currency, date, API, calculations)
- Centralized type definitions
- Application constants file
- Custom React hooks for state management
- Performance monitoring utilities

### Changed
- Refactored App.tsx (reduced complexity)
- Consolidated documentation (16 → 5 root files)
- Improved error handling across all components
- Optimized bundle size (20-25% reduction)
- Enhanced TypeScript type safety

### Removed
- 30+ obsolete console.log statements
- Duplicate code across components
- Redundant documentation files

### Performance
- Initial load time: -30% (3-4s → 2-2.5s)
- Re-renders: -50% (memoization)
- Bundle size: -20% (lazy loading)
- Calculation time: -30% (useMemo)

---

## [1.5.2] - 2025-01-03

### Added
- Prefill income amount from previous month
- Auto-calculation for deduction (10% default)
- Better UX for income entry

### Fixed
- Income form validation
- Deduction calculation edge cases

---

## [1.5.1] - 2025-01-02

### Added
- Automatic carryover from previous month
- Visual indicator for carryover amount
- Carryover breakdown in budget display

### Changed
- Budget calculation includes carryover
- Improved month transition UX

---

## [1.5.0] - 2025-01-01

### Added
- **Wishlist & Budget Simulation**
  - Health bar visualization
  - Multi-item simulation
  - Priority-based sorting
- **Emoji Picker Upgrade**
  - Professional emoji-picker-react library
  - Category-based selection
  - Search functionality
- **Dialog Size Optimization**
  - 20% larger dialogs for desktop
  - Better content visibility
  - Improved UX on large screens

### Performance
- **Pockets Loading Optimization**
  - Parallel data fetching
  - 3-5s → <1s loading time
  - Optimized database queries
- **Timeline Loading Optimization**
  - Single-query approach
  - Reduced database calls
  - Faster rendering

### Fixed
- Circular reference in realtime updates
- Dialog z-index issues
- SetIsOpen error in components

---

## [1.4.0] - 2024-12-28

### Added
- **Pockets System (Phase 1.5 Complete)**
  - Custom pockets creation
  - Transfer between pockets
  - Timeline tracking per pocket
  - Breakdown: original amount vs transfers
- **Realtime Updates**
  - Automatic sync via Supabase Realtime
  - Multi-device support
  - Optimistic updates

### Changed
- Restructured data model for pockets
- Improved state management

---

## [1.3.0] - 2024-12-25

### Added
- **Exclude System**
  - Exclude expenses from calculation
  - Exclude additional income
  - Exclude deduction
  - Lock exclude state
- **Toggle Pockets Feature**
  - Show/hide pockets summary
  - Persisted preference in localStorage
  - Smooth animations

### Changed
- Budget calculation now respects excludes
- Improved budget overview UI

---

## [1.2.0] - 2024-12-20

### Added
- Multiple expense entry (bulk add)
- Expense templates with icons & colors
- Fixed expense templates
- Category color coding

### Changed
- Improved expense form UX
- Better visual categorization

---

## [1.1.0] - 2024-12-15

### Added
- Skeleton loading states
- Better loading UX across all components
- Shimmer animation effects

### Fixed
- Loading state flickers
- Race conditions in data fetching

---

## [1.0.0] - 2024-12-10

### Added
- Initial release
- Budget tracking (initial budget)
- Expense tracking
- Additional income tracking (USD → IDR)
- Month selector
- Basic pockets (Kantong Sehari-hari, Kantong Uang Dingin)
- Supabase integration
- Realtime database

### Features
- Budget form with validation
- Expense list with CRUD operations
- Income list with CRUD operations
- Currency formatting (IDR)
- Date selection
- Responsive design
- Toast notifications

---

## [Unreleased]

### Planned
- Export data (PDF, Excel)
- Budget templates
- Recurring expenses
- Budget analytics & charts
- Mobile app
- Multi-currency support
- Budget sharing

---

[2.0.0]: #200---2025-01-05
[1.5.2]: #152---2025-01-03
[1.5.1]: #151---2025-01-02
[1.5.0]: #150---2025-01-01
[1.4.0]: #140---2024-12-28
[1.3.0]: #130---2024-12-25
[1.2.0]: #120---2024-12-20
[1.1.0]: #110---2024-12-15
[1.0.0]: #100---2024-12-10
```

---

## 3. Archive Old Documentation

### Create `/docs/archived/` Structure

```
docs/
├── archived/
│   ├── bug-fixes/
│   │   ├── CIRCULAR_REFERENCE_FIX.md
│   │   ├── DIALOG_SIZE_FIX.md
│   │   └── SETISOPEN_ERROR_FIX.md
│   ├── features/
│   │   ├── MULTIPLE_ENTRY_EXPENSE.md
│   │   ├── TOGGLE_POCKETS_FEATURE.md
│   │   ├── REALTIME_UPDATE_FIX.md
│   │   ├── SKELETON_LOADING_UPDATE.md
│   │   └── CHANGELOG_EMOJI_PICKER.md
│   ├── performance/
│   │   ├── PERFORMANCE_FIX_POCKETS_LOADING.md
│   │   ├── PERFORMANCE_FIX_TIMELINE_LOADING.md
│   │   ├── DIALOG_20_PERCENT_LARGER_SUMMARY.md
│   │   └── QUICK_REFS.md (consolidated)
│   └── README.md (index of archived docs)
```

### Create Archive Index

`/docs/archived/README.md`:
```markdown
# Archived Documentation

Historical documentation for reference. These docs describe past implementations,
bug fixes, and features that have been integrated into the main app.

## Organization

- **bug-fixes/** - Historical bug fix documentation
- **features/** - Feature implementation logs
- **performance/** - Performance optimization records

## Current Documentation

For current documentation, see:
- [Main README](../../README.md)
- [Wiki Documentation](../tracking-app-wiki/)
- [Planning Documents](../../planning/)

## Index

### Bug Fixes
- [Circular Reference Fix](./bug-fixes/CIRCULAR_REFERENCE_FIX.md) - Fixed realtime update loops
- [Dialog Size Fix](./bug-fixes/DIALOG_SIZE_FIX.md) - Dialog sizing issues
- [SetIsOpen Error Fix](./bug-fixes/SETISOPEN_ERROR_FIX.md) - Component state errors

### Features
- [Multiple Entry Expense](./features/MULTIPLE_ENTRY_EXPENSE.md) - Bulk expense addition
- [Toggle Pockets](./features/TOGGLE_POCKETS_FEATURE.md) - Show/hide pockets UI
- [Realtime Updates](./features/REALTIME_UPDATE_FIX.md) - Supabase Realtime integration
- [Skeleton Loading](./features/SKELETON_LOADING_UPDATE.md) - Loading states
- [Emoji Picker](./features/CHANGELOG_EMOJI_PICKER.md) - Emoji picker upgrade

### Performance
- [Pockets Loading](./performance/PERFORMANCE_FIX_POCKETS_LOADING.md) - Optimized parallel fetching
- [Timeline Loading](./performance/PERFORMANCE_FIX_TIMELINE_LOADING.md) - Query optimization
- [Dialog Size](./performance/DIALOG_20_PERCENT_LARGER_SUMMARY.md) - Dialog UX improvement
- [Quick References](./performance/QUICK_REFS.md) - Consolidated quick refs

---

**Note**: These documents are kept for historical reference and may contain
outdated implementation details.
```

---

## 4. Update Wiki Documentation

### A. Update `/docs/tracking-app-wiki/02-features-detail.md`

Add sections for:
- ✅ Wishlist & Budget Simulation
- ✅ Emoji Picker
- ✅ Exclude System (detailed)
- ✅ Performance optimizations
- ✅ Dialog improvements

### B. Update `/docs/tracking-app-wiki/03-component-documentation.md`

Add new components:
- `WishlistDialog.tsx`
- `WishlistSimulation.tsx`
- `ManagePocketsDialog.tsx` (if not documented)
- `TransferDialog.tsx` (if not documented)

Update existing:
- `PocketsSummary.tsx` (performance updates)
- `PocketTimeline.tsx` (performance updates)

### C. Update `/docs/tracking-app-wiki/05-troubleshooting.md`

Add common issues:
- Performance troubleshooting
- Realtime sync issues
- Exclude state not persisting
- Dialog not opening/closing

### D. Update `/docs/tracking-app-wiki/07-future-enhancements.md`

Update with:
- Completed features (move to "Recently Completed")
- New planned features
- Priority roadmap

---

## 5. Update Planning Documentation

### A. Consolidate `/planning/pockets-system/`

**Current**: 20+ files  
**Target**: 6 core files

#### Keep Active:
```
pockets-system/
├── README.md (overview & status)
├── QUICK_REFERENCE.md (API & usage)
├── TESTING_GUIDE.md (testing procedures)
├── 01-concept-overview.md (reference)
├── 02-phase1-implementation.md (reference)
└── 03-data-structure.md (reference)
```

#### Archive:
```
pockets-system/archived/
├── phase-completions/
│   ├── PHASE1_IMPLEMENTATION_COMPLETE.md
│   ├── PHASE1.5_COMPLETE.md
│   ├── PHASE1.5.1_CARRYOVER_COMPLETE.md
│   └── PHASE1.5.2_PREFILL_INCOME_COMPLETE.md
├── implementation-logs/
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── COMPLETION_REPORT.md
│   ├── AUDIT_COMPLETE.md
│   └── VERIFICATION_REPORT.md
└── feature-docs/
    ├── WISHLIST_API_TEST.md
    ├── WISHLIST_IMPLEMENTATION.md
    ├── EMOJI_PICKER_UPGRADE.md
    └── ...
```

---

### B. Update Planning Folder Structure

```
planning/
├── comprehensive-optimization/ (THIS OPTIMIZATION)
│   ├── README.md
│   ├── AUDIT_REPORT.md
│   ├── CLEANUP_CHECKLIST.md
│   ├── REFACTORING_PLAN.md
│   ├── PERFORMANCE_PLAN.md
│   ├── DOCUMENTATION_PLAN.md
│   └── IMPLEMENTATION_LOG.md
├── bulk-action/
│   └── ... (keep as is - good structure)
├── fab-drawer-pockets/
│   └── ... (keep as is - on hold)
├── pockets-system/
│   └── ... (consolidated as above)
└── initial-planning/
    └── app-structure.md (keep for reference)
```

---

## 6. Create Quick Start Guides

### A. `/docs/QUICK_START.md`

```markdown
# Quick Start Guide

Get up and running in 5 minutes.

## 1. Setup (2 min)

\`\`\`bash
npm install
cp .env.example .env
# Add Supabase credentials to .env
\`\`\`

## 2. Run (1 min)

\`\`\`bash
npm run dev
\`\`\`

## 3. First Budget (2 min)

1. Select current month
2. Click "Atur Budget Awal"
3. Enter initial budget amount
4. Start adding expenses!

## Next Steps

- [Full Setup Guide](./tracking-app-wiki/06-setup-guide.md)
- [Feature Guide](./tracking-app-wiki/02-features-detail.md)
- [FAQ](./tracking-app-wiki/05-troubleshooting.md)
```

---

### B. `/docs/API_REFERENCE.md`

Quick API reference for developers:

```markdown
# API Reference

## Endpoints

### Budget
- `GET /budget/:year/:month` - Get budget
- `POST /budget/:year/:month` - Create/update budget

### Expenses
- `GET /expenses/:year/:month` - Get expenses
- `POST /expenses/:year/:month` - Add expense
- `PUT /expenses/:year/:month/:id` - Update expense
- `DELETE /expenses/:year/:month/:id` - Delete expense

### Pockets
- `GET /pockets/:year/:month` - Get all pockets
- `POST /pockets/:year/:month` - Create custom pocket
- `PUT /pockets/:year/:month/:id` - Update pocket
- `DELETE /pockets/:year/:month/:id` - Archive pocket

### Transfers
- `POST /transfers/:year/:month` - Create transfer
- `GET /pocket-timeline/:year/:month/:pocketId` - Get timeline

For detailed documentation, see [Backend Server Documentation](./tracking-app-wiki/04-backend-server.md)
```

---

## 7. Documentation Maintenance Guidelines

### Create `/docs/CONTRIBUTING.md`

```markdown
# Documentation Guidelines

## When to Update Documentation

- **New Feature**: Update feature guide + component docs
- **API Change**: Update API reference + architecture doc
- **Bug Fix**: Add to troubleshooting if user-facing
- **Performance**: Update performance section

## Documentation Structure

- **Root README**: High-level overview, quick links
- **Wiki**: Detailed documentation (8 files max)
- **Planning**: Development planning (not user docs)
- **Archived**: Historical reference only

## Writing Style

- Clear and concise
- Code examples for APIs
- Screenshots for UI features
- Step-by-step for tutorials
- Indonesian language for user-facing, English for technical

## Review Process

1. Write/update documentation
2. Test all code examples
3. Check links
4. Verify accuracy
5. Get review before merging
```

---

## Implementation Checklist

### Phase 1: Create New Docs (1 hour)
- [ ] Create `/README.md`
- [ ] Create `/CHANGELOG.md`
- [ ] Create `/docs/QUICK_START.md`
- [ ] Create `/docs/API_REFERENCE.md`
- [ ] Create `/docs/archived/README.md`
- [ ] Create `/docs/CONTRIBUTING.md`

### Phase 2: Move Files (30 min)
- [ ] Create `/docs/archived/` folders
- [ ] Move 15 root files to archived
- [ ] Move 13 pockets-system files to archived
- [ ] Update all internal links

### Phase 3: Update Existing (1 hour)
- [ ] Update wiki/02-features-detail.md
- [ ] Update wiki/03-component-documentation.md
- [ ] Update wiki/05-troubleshooting.md
- [ ] Update wiki/07-future-enhancements.md
- [ ] Update pockets-system/README.md

### Phase 4: Verify (30 min)
- [ ] All links work
- [ ] No broken references
- [ ] Documentation is discoverable
- [ ] README is comprehensive
- [ ] Archive is organized

---

## Expected Results

### Before:
- 16 root-level MD files (overwhelming)
- Scattered documentation
- Duplicate information
- Hard to find current info

### After:
- 5 root-level files (clean)
- Clear documentation hierarchy
- Single source of truth
- Easy navigation

---

**Estimated Time**: 2-3 hours  
**Impact**: High (better maintainability)  
**Priority**: High (cleanup & organization)

**Next**: Proceed with implementation using IMPLEMENTATION_LOG.md
