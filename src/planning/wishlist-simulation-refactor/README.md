# 🎯 Wishlist Simulation - Major UX Refactor

## 📋 Executive Summary

Refactor signifikan untuk mengubah Wishlist Simulation dari **"Panic Mode"** menjadi **"Constructive Insight Mode"**.

### 🎨 Design Philosophy
- ❌ **Sebelum**: Feedback negatif agresif (merah, "0% health", "Saldo tidak cukup!")
- ✅ **Sesudah**: Insight netral & konstruktif dengan actionable filters

### 🎯 Primary Goals
1. **Reduce Panic** → Ganti feedback negatif dengan insight konstruktif
2. **Increase Clarity** → Konsolidasi data terkait (Saldo, Total, Sisa) di satu tempat
3. **Make it Interactive** → Ubah summary statis menjadi interactive filter tools
4. **Declutter List** → Hilangkan informasi redundan dari setiap card item

---

## 📊 Current State Analysis (dari Screenshot)

### ❌ Problems Identified:

**1. Header Area - "Panic Inducing"**
- ❌ "Health Saldo 0%" → Menakutkan, tidak konstruktif
- ❌ "Saldo tidak cukup!" (merah agresif) → Membuat user panik
- ❌ Card "SISA SALDO SETELAH WISHLIST" terpisah → Information scattered
- ❌ Progress bar merah penuh → Visual anxiety

**2. Insight Area - "Static & Non-Actionable"**
- ℹ️ "Bisa beli 3 item sekarang" → Hanya informasi, tidak bisa di-klik
- ℹ️ Three cards (High/Medium/Low) → Takes space, tidak interaktif

**3. Items List - "Information Overload"**
- 🔁 "Bisa dibeli sekarang" → Redundant (sudah ada di insight)
- 🔁 "Sisa saldo: Rp X" → Redundant (berulang di setiap item)
- 🔘 "Beli Sekarang" button → Selalu aktif meski saldo tidak cukup

**4. Edit/Delete Actions - "Platform Issues"**
- 📱 Mobile: Icons always visible → Memakan space
- 🖥️ Desktop: Bisa lebih elegant dengan hover

---

## 🎨 Proposed Solution

### 1️⃣ **HEADER: Centralized Summary Block**

```
┌─────────────────────────────────────────────────┐
│  RINGKASAN BUDGET                               │
│                                                 │
│  💰 Saldo Kantong: Rp 14.581.434               │
│  🎯 Total Wishlist: Rp 15.209.000 (4 items)   │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  ⚠️ Anda perlu Rp 627.565 lagi          │  │
│  │     untuk semua wishlist                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Progress: ████████████░░  96%                 │
│            (Rp 14.581.434 / Rp 15.209.000)     │
└─────────────────────────────────────────────────┘
```

**Design Specs:**
- **If Insufficient**: 
  - Icon: `⚠️` (neutral warning, NOT red cross)
  - Message: "Anda perlu Rp X lagi untuk semua wishlist"
  - Color: Amber/Orange (neutral, not red)
  
- **If Sufficient**:
  - Icon: `✅`
  - Message: "Saldo Anda cukup untuk semua wishlist"
  - Color: Green (positive reinforcement)

- **Progress Bar**:
  - Visual bar: `progress` component from shadcn
  - Formula: `(currentBalance / totalWishlist) * 100`
  - Max 100% (don't overflow)

---

### 2️⃣ **FILTERS: Interactive Tabs & Quick Insights**

```
┌─────────────────────────────────────────────────┐
│  💡 QUICK INSIGHTS                              │
│  ┌──────────────────────────────────────────┐  │
│  │ 💡 Tampilkan 3 item yang bisa dibeli     │  │
│  │    sekarang (prioritas tertinggi)  👆🏻   │  │
│  └───────────��──────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  FILTER BY PRIORITY:                            │
│  [ Semua (4) ] [ ⭐ High (2) ] [ 🟡 Medium (2) ] [ 🔵 Low (0) ] │
└─────────────────────────────────────────────────┘
```

**Design Specs:**

**Quick Insight Button:**
- Type: `Button` variant="outline"
- Icon: `💡` (lightbulb)
- Text: "Tampilkan X item yang bisa dibeli sekarang"
- Action: Filter list to show only affordable items
- State: Toggle on/off (active state visual)

**Priority Filter Tabs:**
- Type: `Tabs` from shadcn/ui
- Layout: Horizontal tabs
- Items:
  - "Semua (4)" → Show all
  - "⭐ High (2)" → Filter by high priority
  - "🟡 Medium (2)" → Filter by medium priority
  - "🔵 Low (0)" → Filter by low priority
- Active state: Highlighted tab
- Count: Show item count in each category

---

### 3️⃣ **ITEMS LIST: Clean & Smart CTA**

```
┌──────────────────────────────────────────────────┐
│  Onyx Boox  ⭐ High                    [🖊] [🗑]  │
│  Rp 5.800.000                                    │
│                                                  │
│  [ 🛒 Beli Sekarang ]  ✅ Enabled               │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Gamakay PMG                          [🖊] [🗑]  │
│  Rp 7.909.000                                    │
│                                                  │
│  [ 🛒 Beli Sekarang ]  ❌ Disabled               │
│  (Hover: "Kurang Rp 1.727.565 untuk item ini")  │
└──────────────────────────────────────────────────┘
```

**Design Specs:**

**Card Layout:**
- Title + Priority badge (top)
- Amount (below title)
- CTA button (bottom)
- Edit/Delete icons (platform specific)

**Removed Elements:**
- ❌ "Bisa dibeli sekarang" text
- ❌ "Sisa saldo: Rp X" text

**CTA Button States:**

1. **Affordable (Enabled)**
   - Variant: `default` (primary color)
   - Icon: `ShoppingCart` from lucide-react
   - Text: "Beli Sekarang"
   - Action: Execute purchase

2. **Not Affordable (Disabled)**
   - Variant: `outline` or `ghost`
   - Disabled: `true`
   - Icon: `ShoppingCart` (grayed out)
   - Text: "Beli Sekarang"
   - Tooltip: "Kurang Rp X untuk item ini"

**Tooltip Implementation:**
- Component: `Tooltip` from shadcn/ui
- Trigger: Hover (desktop) / Tap (mobile)
- Content: Calculate shortage: `itemPrice - currentBalance`
- Format: "Kurang {formatRupiah(shortage)} untuk item ini"

---

### 4️⃣ **EDIT/DELETE: Platform-Specific Interactions**

#### 🖥️ **Desktop (Modal)**

```
Default State:          Hover State:
┌───────────────┐      ┌───────────────┐
│  Onyx Boox    │      │  Onyx Boox [🖊][🗑]│
│  Rp 5.800.000 │      │  Rp 5.800.000 │
└───────────────┘      └───────────────┘
```

**Implementation:**
- Icons: Hidden by default
- On card hover: Fade in icons
- Transition: `transition-opacity duration-200`
- Position: Top-right corner

#### 📱 **Mobile (Drawer)**

```
Default State:          Swipe Left:
┌───────────────┐      ┌─────────┬──────┐
│  Onyx Boox    │      │ Onyx Bo │ 🖊 🗑│
│  Rp 5.800.000 │ <<<  │ Rp 5.80 │      │
└───────────────┘      └─────────┴──────┘
```

**Implementation:**
- Use `react-swipeable` or custom gesture handler
- Swipe left: Reveal action buttons
- Actions: Edit + Delete buttons (full height)
- Swipe back: Reset to default
- Alternative: Long press to reveal (if swipe is complex)

---

## 📁 File Structure

```
/planning/wishlist-simulation-refactor/
├── README.md                      ← You are here
├── IMPLEMENTATION_GUIDE.md        ← Step-by-step implementation
├── COMPONENT_SPECS.md             ← Detailed component breakdown
├── VISUAL_MOCKUPS.md              ← ASCII mockups & design tokens
├── STATE_MANAGEMENT.md            ← State hooks & logic
├── PLATFORM_DIFFERENCES.md        ← Desktop vs Mobile handling
└── TESTING_CHECKLIST.md           ← QA checklist
```

---

## 🔄 Implementation Phases

### **Phase 1: Header Refactor** (30 min)
- [ ] Remove panic elements
- [ ] Create centralized summary block
- [ ] Implement progress bar
- [ ] Add conditional messaging

### **Phase 2: Interactive Filters** (45 min)
- [ ] Convert insight to button
- [ ] Implement filter logic
- [ ] Create priority tabs
- [ ] Wire up state management

### **Phase 3: Items List Declutter** (1 hour)
- [ ] Remove redundant text
- [ ] Redesign CTA button
- [ ] Implement affordability logic
- [ ] Add tooltip for disabled state

### **Phase 4: Platform-Specific Actions** (1.5 hours)
- [ ] Desktop: Hover reveal icons
- [ ] Mobile: Swipe-to-reveal
- [ ] Test on both platforms

### **Phase 5: Polish & Testing** (30 min)
- [ ] Animation polish
- [ ] Responsive testing
- [ ] Accessibility check

---

## 🎨 Design Tokens

### Colors
```typescript
// Panic → Constructive
const colors = {
  panic: {
    OLD: 'text-red-500',        // ❌ Aggressive red
    NEW: 'text-amber-500'       // ✅ Neutral warning
  },
  success: {
    OLD: 'text-green-500',
    NEW: 'text-emerald-500'     // More pleasant green
  },
  neutral: {
    info: 'text-neutral-400',
    muted: 'text-neutral-500'
  }
}
```

### Icons
```typescript
const icons = {
  insufficient: '⚠️',  // NOT ❌
  sufficient: '✅',
  insight: '💡',
  shopping: '<ShoppingCart />' // lucide-react
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Insufficient Balance
- Current: Rp 14.581.434
- Total: Rp 15.209.000
- Expected: Amber warning, "Perlu Rp 627.565 lagi"

### Scenario 2: Sufficient Balance
- Current: Rp 20.000.000
- Total: Rp 15.209.000
- Expected: Green success, "Saldo cukup"

### Scenario 3: Filter Interaction
- Click "Tampilkan 3 item yang bisa dibeli"
- Expected: List shows only 3 affordable items

### Scenario 4: Priority Filter
- Click "High (2)" tab
- Expected: List shows only 2 high-priority items

### Scenario 5: CTA Button
- Affordable item: Button enabled, executes purchase
- Unaffordable item: Button disabled, shows tooltip

---

## 📱 Responsive Considerations

### Desktop (>= 768px)
- Modal dialog
- Hover interactions
- Icons fade in on card hover
- Tooltip on hover

### Mobile (< 768px)
- Drawer (slide up)
- Touch interactions
- Swipe-to-reveal actions
- Tooltip on tap (with delay)

---

## 🚀 Next Steps

1. ✅ Read this planning document
2. 📄 Read implementation guide
3. 👁️ Review visual mockups
4. 💻 Start Phase 1 implementation
5. 🧪 Test each phase
6. ✨ Polish & ship!

---

## 📚 References

- Current file: `/components/WishlistSimulation.tsx`
- Related: `/components/WishlistDialog.tsx`
- Hook: `/hooks/useBudgetData.ts` (for balance calculations)
- Utils: `/utils/currency.ts` (for Rupiah formatting)

---

**Status**: 📋 Planning Complete - Ready for Implementation
**Owner**: AI Code Agent
**Priority**: High
**Estimated Time**: 4 hours total
