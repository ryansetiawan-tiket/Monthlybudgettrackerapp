# Phase 2 Roadmap - Custom Pockets & Advanced Features

## Overview

Phase 2 expands the Pockets System dari 2 kantong fixed menjadi unlimited custom pockets dengan fitur advanced seperti goals, auto-transfer, dan analytics.

---

## Goals

### Primary Objectives
1. **User Empowerment**: User bisa create pockets sesuai kebutuhan spesifik
2. **Goal-oriented Saving**: Support savings goals dengan tracking dan suggestions
3. **Automation**: Auto-transfer untuk recurring allocations
4. **Insights**: Analytics dan visualisasi alokasi dana

### Success Metrics
- 50% users create at least 1 custom pocket
- Average 3-5 pockets per active user
- 30% users set up goals
- 20% users enable auto-transfer

---

## Feature Set

### 1. Custom Pocket Creation

#### Description
User dapat membuat kantong baru dengan nama, icon, dan warna custom.

#### User Story
```
As a user
I want to create a custom pocket for "Emergency Fund"
So that I can set aside money for emergencies separately
```

#### Specifications

**Create Pocket Dialog**:
```typescript
interface CustomPocketInput {
  name: string;              // Required, max 50 chars
  description?: string;      // Optional, max 200 chars
  icon: string;              // Lucide icon name
  color: string;             // Tailwind color class
  initialAmount?: number;    // Optional, via transfer from other pockets
  targetAmount?: number;     // Optional goal
  targetDate?: string;       // Optional deadline
}
```

**Limitations**:
- Max 10 pockets per user (including default 2)
- Cannot delete default pockets (Sehari-hari, Uang Dingin)
- Cannot create pocket with duplicate name

**UI Flow**:
```
Click "+ Buat Kantong Baru"
  ↓
Fill name, select icon & color
  ↓
(Optional) Set target & deadline
  ↓
(Optional) Initial transfer from existing pocket
  ↓
Submit → Pocket created
  ↓
Appears in Pockets Summary
```

---

### 2. Pocket Goals & Progress Tracking

#### Description
Set target amount dan deadline untuk setiap custom pocket, dengan visual progress tracking.

#### User Story
```
As a user
I want to set a goal of Rp 10jt for "Liburan Bali" by June 2026
So that I can track my progress and stay motivated
```

#### Specifications

**Goal Interface**:
```typescript
interface PocketGoal {
  targetAmount: number;      // Target to reach
  targetDate: string;        // Deadline (ISO date)
  currentAmount: number;     // Calculated from balance
  progress: number;          // Percentage (0-100)
  daysRemaining: number;     // Calculated
  suggestedMonthly: number;  // Amount needed per month
  onTrack: boolean;          // Is user on track?
}
```

**Progress Calculation**:
```typescript
progress = (currentAmount / targetAmount) * 100
daysRemaining = daysBetween(today, targetDate)
monthsRemaining = daysRemaining / 30
suggestedMonthly = (targetAmount - currentAmount) / monthsRemaining
onTrack = currentAmount >= (targetAmount * (elapsed / totalDuration))
```

**Visual Elements**:
- Progress bar with percentage
- Color coding:
  - Green: On track (≥ expected)
  - Yellow: Slightly behind (75-99% of expected)
  - Red: Significantly behind (< 75% of expected)
- Motivational messages
- Projected completion date

**UI Components**:
```
┌────────────────────────────────────┐
│ 🏖 Tabungan Liburan              │
│                                  │
│ ████████░░░░░░░░░ 45%           │
│ Rp 4.500.000 / Rp 10.000.000    │
│                                  │
│ ✅ On track!                     │
│ 📅 180 hari tersisa              │
│ 💡 Transfer Rp 1.200.000/bulan   │
│                                  │
│ Proyeksi tercapai: Mei 2026     │
└────────────────────────────────────┘
```

---

### 3. Auto-Transfer Rules

#### Description
Automated recurring transfers untuk consistent allocations (misalnya: setiap bulan transfer Rp 1jt ke tabungan).

#### User Story
```
As a user
I want to auto-transfer Rp 1jt from "Sehari-hari" to "Tabungan" every month
So that I save consistently without manual effort
```

#### Specifications

**Auto-Transfer Rule**:
```typescript
interface AutoTransferRule {
  id: string;
  name: string;              // User-defined name
  fromPocketId: string;
  toPocketId: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfExecution: number;    // Day of week/month (1-31 or 0-6)
  enabled: boolean;
  lastExecuted?: string;     // ISO date
  nextExecution: string;     // ISO date
  createdAt: string;
}
```

**Execution Logic**:
```typescript
// Run daily cron job
async function executeAutoTransfers() {
  const today = new Date();
  const rules = await getActiveAutoTransferRules();
  
  for (const rule of rules) {
    if (shouldExecute(rule, today)) {
      try {
        await createTransfer({
          fromPocketId: rule.fromPocketId,
          toPocketId: rule.toPocketId,
          amount: rule.amount,
          date: today.toISOString(),
          note: `Auto-transfer: ${rule.name}`
        });
        
        await updateRuleLastExecuted(rule.id, today);
      } catch (error) {
        // Log error, notify user
        await notifyAutoTransferFailed(rule, error);
      }
    }
  }
}
```

**Validation**:
- Check sufficient balance before execution
- If insufficient, skip and notify user
- Option to disable rule if fails 3 times consecutively

**UI Management**:
```
┌─────────────────────────────────────┐
│ Auto-Transfer Rules                 │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✅ Tabungan Bulanan            │ │
│ │ Sehari-hari → Tabungan         │ │
│ │ Rp 1.000.000 setiap tanggal 1  │ │
│ │ Terakhir: 1 Nov 2025           │ │
│ │ Berikutnya: 1 Des 2025         │ │
│ │                   [Edit] [🗑]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Tambah Rule Baru]                │
└─────────────────────────────────────┘
```

---

### 4. Multi-Source Transfers

#### Description
Transfer dari beberapa kantong sekaligus ke 1 kantong tujuan (atau sebaliknya).

#### User Story
```
As a user
I want to transfer Rp 500k from "Sehari-hari" and Rp 300k from "Uang Dingin"
To "Emergency Fund" in one transaction
So that I don't have to do multiple transfers
```

#### Specifications

**Multi-Transfer Interface**:
```typescript
interface MultiSourceTransfer {
  id: string;
  type: 'multi-source' | 'multi-destination';
  sources?: Array<{
    pocketId: string;
    amount: number;
  }>;
  destination?: string;        // For multi-source
  destinations?: Array<{       // For multi-destination
    pocketId: string;
    amount: number;
  }>;
  totalAmount: number;
  date: string;
  note?: string;
}
```

**UI Flow**:
```
┌─────────────────────────────────────┐
│ Transfer Multi-Sumber               │
├─────────────────────────────────────┤
│                                     │
│ Dari (pilih beberapa):              │
│ ☑ Sehari-hari      Rp 500.000      │
│ ☑ Uang Dingin      Rp 300.000      │
│ ☐ Emergency Fund   Rp 0            │
│                   ───────────       │
│ Total:             Rp 800.000      │
│                                     │
│ Ke:                                 │
│ [ Tabungan Liburan          ▼]     │
│                                     │
│ [Batal]  [Transfer]                 │
└─────────────────────────────────────┘
```

**Implementation**:
```typescript
// Creates multiple single transfers internally
async function executeMultiSourceTransfer(transfer: MultiSourceTransfer) {
  const transfers = [];
  
  for (const source of transfer.sources) {
    const singleTransfer = await createTransfer({
      fromPocketId: source.pocketId,
      toPocketId: transfer.destination,
      amount: source.amount,
      date: transfer.date,
      note: `${transfer.note} (Batch: ${transfer.id})`
    });
    transfers.push(singleTransfer);
  }
  
  return transfers;
}
```

---

### 5. Pocket Analytics & Insights

#### Description
Visual analytics untuk melihat alokasi dana, spending patterns, dan recommendations.

#### Features

**5.1. Allocation Chart**
```
Pie chart showing distribution across pockets:

┌──────────────────────┐
│  💰 Alokasi Dana     │
├──────────────────────┤
│       ╱─────╲       │
│      ╱   1   ╲      │
│     │    2    │     │
│      ╲   3   ╱      │
│       ╲─────╱       │
│                      │
│ 1. Sehari-hari 50%  │
│ 2. Uang Dingin 30%  │
│ 3. Tabungan 20%     │
└──────────────────────┘
```

**5.2. Spending by Pocket (Bar Chart)**
```
Monthly spending comparison per pocket

Sehari-hari  ████████████░░ Rp 3.5jt
Uang Dingin  ████░░░░░░░░░░ Rp 1.2jt
Tabungan     ██░░░░░░░░░░░░ Rp 500k
```

**5.3. Balance Trend (Line Chart)**
```
Balance over time for each pocket

Rp
8M │     ╱────────
   │    ╱         ╲
6M │   ╱           ╲
   │  ╱             ╲
4M │ ╱
   └─────────────────── Time
   Nov  Dec  Jan  Feb
```

**5.4. Insights & Recommendations**
```
🔍 Insights untuk bulan ini:

• 💡 Pengeluaran sehari-hari turun 15% vs bulan lalu
• ⚠️  Tabungan belum on track (-Rp 300k dari target)
• ✅ Uang dingin masih cukup untuk 2 bulan
• 💪 Tambah transfer Rp 150k/minggu untuk capai goal
```

---

### 6. Pocket Templates

#### Description
Pre-configured pocket templates untuk common use cases.

#### Templates

**6.1. Emergency Fund**
```
Name: Emergency Fund
Icon: Shield
Color: Red
Recommended: 3-6 months of expenses
Auto-transfer: 10% of monthly income
```

**6.2. Vacation Savings**
```
Name: Liburan
Icon: Plane
Color: Blue
Time-bound goal
Recommended: Set target date & amount
```

**6.3. Investment Fund**
```
Name: Investasi
Icon: TrendingUp
Color: Green
Long-term growth
Auto-transfer: Fixed monthly amount
```

**6.4. Bill Payment**
```
Name: Tagihan Bulanan
Icon: Receipt
Color: Yellow
For recurring bills
Auto-transfer from main pocket
```

**UI**:
```
┌─────────────────────────────────────┐
│ Buat dari Template                  │
├─────────────────────────────────────┤
│                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 🛡️  │ │ ✈️  │ │ 📈  │ │ 🧾  │   │
│ │Emrg │ │Vctn │ │Invst│ │Bill │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│ ┌─────┐ ┌─────┐                    │
│ │ 🎓  │ │ 🏠  │                    │
│ │Edu  │ │Home │                    │
│ └─────┘ └─────┘                    │
│                                     │
│ [ Atau buat custom ]                │
└─────────────────────────────────────┘
```

---

### 7. Pocket Archiving

#### Description
Archive inactive pockets tanpa menghapus data (for historical reference).

#### Specifications

```typescript
interface Pocket {
  // ... existing fields
  status: 'active' | 'archived';
  archivedAt?: string;
  archiveReason?: string;
}
```

**Rules**:
- Archived pockets tidak muncul di active list
- Balance harus 0 sebelum archive (atau transfer ke pocket lain)
- Masih bisa view history via "Archived Pockets" section
- Bisa unarchive kapan saja

**UI**:
```
┌─────────────────────────────────────┐
│ Archive Pocket                      │
├─────────────────────────────────────┤
│                                     │
│ Kantong: Liburan Bali               │
│ Saldo: Rp 0                         │
│                                     │
│ ⚠️  Pocket akan di-archive dan tidak│
│    muncul di daftar aktif.          │
│                                     │
│ Alasan (opsional):                  │
│ ┌─────────────────────────────────┐ │
│ │ Liburan sudah selesai           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Batal]  [Archive]                  │
└─────────────────────────────────────┘
```

---

### 8. Pocket Sharing & Collaboration (Future)

#### Description
Share pocket dengan family members atau partners untuk joint savings.

#### Specifications

```typescript
interface SharedPocket extends Pocket {
  sharedWith: Array<{
    userId: string;
    role: 'owner' | 'contributor' | 'viewer';
    permissions: {
      canDeposit: boolean;
      canWithdraw: boolean;
      canViewHistory: boolean;
      canManageGoal: boolean;
    };
  }>;
}
```

**Use Cases**:
- Family emergency fund
- Couple's vacation savings
- Group gift contribution

**Note**: This requires multi-user authentication system (Phase 3+)

---

## Technical Architecture Changes

### Database Schema Updates

**New Collections/Keys**:
```typescript
// Custom pockets (user-specific)
`custom_pockets:${userId}` → Pocket[]

// Auto-transfer rules
`auto_transfer_rules:${userId}` → AutoTransferRule[]

// Analytics cache
`pocket_analytics:${userId}:${monthKey}` → PocketAnalytics

// Archived pockets
`archived_pockets:${userId}` → Pocket[]
```

### API Endpoints (New)

```typescript
// Pocket CRUD
POST   /pocket                  // Create custom pocket
PUT    /pocket/:id              // Update pocket
DELETE /pocket/:id              // Archive pocket
GET    /pockets/archived        // Get archived pockets

// Goals
PUT    /pocket/:id/goal         // Set/update goal
GET    /pocket/:id/progress     // Get progress

// Auto-transfer
POST   /auto-transfer           // Create rule
PUT    /auto-transfer/:id       // Update rule
DELETE /auto-transfer/:id       // Delete rule
GET    /auto-transfers          // List all rules
POST   /auto-transfer/execute   // Manual trigger (testing)

// Analytics
GET    /analytics/allocation    // Allocation breakdown
GET    /analytics/spending      // Spending by pocket
GET    /analytics/trends        // Balance trends
GET    /analytics/insights      // AI-generated insights

// Multi-transfer
POST   /transfer/multi          // Multi-source/dest transfer
```

---

## Implementation Phases

### Phase 2.1: Custom Pockets (Month 1-2)
- [ ] Pocket CRUD operations
- [ ] Updated UI with dynamic pocket list
- [ ] Pocket icon & color picker
- [ ] Basic validation & limits

### Phase 2.2: Goals & Progress (Month 3)
- [ ] Goal setting UI
- [ ] Progress calculation logic
- [ ] Visual progress indicators
- [ ] Suggestions & projections

### Phase 2.3: Auto-Transfer (Month 4)
- [ ] Auto-transfer rule creation
- [ ] Cron job for execution
- [ ] Error handling & notifications
- [ ] Manual trigger for testing

### Phase 2.4: Analytics (Month 5-6)
- [ ] Allocation chart
- [ ] Spending charts
- [ ] Trend analysis
- [ ] Insights generation

### Phase 2.5: Templates & Polish (Month 7)
- [ ] Pocket templates
- [ ] Multi-source transfers
- [ ] Archiving
- [ ] Performance optimization

---

## Migration from Phase 1 to Phase 2

### Data Migration
```typescript
// No migration needed!
// Default pockets remain the same
// New features are additive

// Just add new fields to Pocket interface
interface Pocket {
  // Phase 1 fields (unchanged)
  id: string;
  name: string;
  type: 'primary' | 'custom';
  // ...
  
  // Phase 2 fields (new, optional)
  targetAmount?: number;
  targetDate?: string;
  status?: 'active' | 'archived';
  // ...
}
```

### Backward Compatibility
- Phase 1 users see default 2 pockets
- Phase 2 features opt-in (progressive enhancement)
- Existing data structure unchanged

---

## UX Considerations

### Onboarding
```
For new Phase 2 users:

1. Default 2 pockets created (like Phase 1)
2. Show tooltip: "💡 Tip: Buat kantong custom untuk goals spesifik"
3. After 1 week: Suggest popular templates
4. After 1 month: Show analytics insights
```

### Progressive Disclosure
```
Complexity levels:
Level 1: Just use default 2 pockets (Phase 1)
Level 2: Create 1-2 custom pockets
Level 3: Set goals for pockets
Level 4: Enable auto-transfers
Level 5: Use analytics for optimization
```

### Power User Features
- Keyboard shortcuts (e.g., 'N' for new pocket)
- Bulk operations (archive multiple)
- Export pocket history to CSV
- Custom dashboard layout

---

## Success Metrics

### Adoption Metrics
- % users creating custom pockets
- Average # pockets per user
- % users setting goals
- % users enabling auto-transfer

### Engagement Metrics
- Daily/weekly active users
- Transfers per user per month
- Goal completion rate
- Time to achieve goals

### Financial Metrics
- Average savings per pocket type
- Total money managed via app
- Goal amounts (aggregate)

---

## Risks & Mitigation

### Risk 1: Feature Overload
**Mitigation**: Progressive disclosure, simple defaults, optional advanced features

### Risk 2: Performance Issues
**Mitigation**: Pagination, lazy loading, caching, optimization

### Risk 3: User Confusion
**Mitigation**: Clear onboarding, tooltips, help documentation, templates

### Risk 4: Data Integrity
**Mitigation**: Validation, transaction logging, backup & restore

---

## Future Beyond Phase 2

### Phase 3: Multi-User & Collaboration
- User authentication
- Shared pockets
- Family accounts
- Permissions & roles

### Phase 4: AI-Powered Insights
- Spending pattern analysis
- Predictive budgeting
- Personalized recommendations
- Anomaly detection

### Phase 5: Integrations
- Bank account sync
- Investment tracking
- Bill payment integration
- Receipt scanning (OCR)

---

## Conclusion

Phase 2 transforms the app dari simple 2-pocket tracker menjadi powerful personal finance management tool dengan unlimited customization dan automation.

**Key Principles**:
- Start simple (Phase 1 compatibility)
- Progressive enhancement
- User empowerment
- Data-driven insights

**Timeline**: 6-7 months total
**Priority**: High (user demand)
**Dependencies**: Phase 1 must be stable

---

**Version**: 1.0  
**Last Updated**: November 5, 2025  
**Status**: Roadmap - Pending Phase 1 Completion
