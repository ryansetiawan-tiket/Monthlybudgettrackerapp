# ExpenseList Revamp - Planning Document

## 🎯 Objective
Update ExpenseList component untuk match design Figma dengan:
1. ✅ Title "Daftar Pengeluaran" → "Daftar Transaksi"
2. ✅ CategoryBreakdown pindah ke Drawer (dibuka via icon button)
3. ✅ Tab Pengeluaran/Pemasukan di atas search bar
4. ✅ Hapus tombol "Tambah Pengeluaran" & "Tambah Pemasukan" (sudah ada di FAB)

## 📋 Design Analysis

### Current vs New Design

#### **HEADER SECTION**
**Current:**
```
Daftar Pengeluaran
[CategoryBreakdown component here]
[Search bar]
[Expense items...]
```

**New (Figma):**
```
┌─────────────────────────────────────┐
│ Daftar Transaksi            [📊]    │  ← Title + Icon Button
└─────────────────────────────────────┘
```

#### **TAB SYSTEM (NEW!)**
**New (Figma):**
```
┌──────────────────┬──────────────────┐
│  Pengeluaran ●   │   Pemasukan      │  ← Tabs di atas search
└──────────────────┴──────────────────┘
```
- Tab "Pengeluaran": Active dengan red accent
- Tab "Pemasukan": Show income entries
- No "Kategori" tab - itu jadi icon button!

#### **SEARCH BAR**
```
🔍 Cari nama, hari, atau tanggal...
```
- Dark background with border
- Search icon inside

#### **COLLAPSIBLE SECTIONS**
```
▼ Hari Ini & Mendatang (5)    Rp 2.440.469
```
- Chevron icon (up/down)
- Item count
- Total amount

#### **EXPENSE ITEMS**
**New Design:**
```
┌─────────────────────────────────────┐
│ ● 📦 Nindya                         │
│   Jumat, 7 Nov • [Uang Dingin]     │
│   -Rp 100.000        [👁️] [✏️] [🗑️]  │
└─────────────────────────────────────┘
```
- Blue dot (●) = selected indicator
- Emoji kategori
- Date + pocket badge
- 3 action buttons (view, edit, delete)
- Blue border when selected

## 🔧 Technical Requirements

### 1. **Changes to Make**

#### A. **Title Update**
```diff
- <h2>Daftar Pengeluaran</h2>
+ <h2>Daftar Transaksi</h2>
```

#### B. **Category Breakdown → Drawer**
```tsx
// Move CategoryBreakdown from inline to Drawer
<Button onClick={() => setShowCategoryDrawer(true)}>
  <BarChart3 /> {/* Icon dari lucide-react */}
</Button>

<Drawer open={showCategoryDrawer} onOpenChange={setShowCategoryDrawer}>
  <DrawerContent>
    <CategoryBreakdown ... />
  </DrawerContent>
</Drawer>
```

#### C. **Add Tabs (Pengeluaran/Pemasukan)**
```tsx
<div className="flex gap-2 mb-4">
  <Button 
    variant={activeTab === 'expense' ? 'default' : 'ghost'}
    onClick={() => setActiveTab('expense')}
  >
    Pengeluaran
  </Button>
  <Button 
    variant={activeTab === 'income' ? 'default' : 'ghost'}
    onClick={() => setActiveTab('income')}
  >
    Pemasukan
  </Button>
</div>
```

### 2. **New State Management**
```typescript
// Tab state
const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

// Drawer state
const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
```

### 3. **Filtering Logic**
```typescript
// Filter berdasarkan tab
const displayedExpenses = useMemo(() => {
  return expenses.filter(expense => {
    if (activeTab === 'expense') {
      return !expense.fromIncome; // Show pengeluaran
    } else {
      return expense.fromIncome; // Show pemasukan
    }
  });
}, [expenses, activeTab]);
```

### 4. **Styling Updates**
```css
/* Key colors from Figma */
--expense-red: #E7000B
--selection-blue: #2B7FFF
--dark-bg-1: rgba(38,38,38,0.3)
--dark-bg-2: rgba(38,38,38,0.5)
--border-gray: #262626
```

## 📐 Implementation Steps

### **Step 1: Update Title** (2 min)
```tsx
// ExpenseList.tsx - Line ~200
- <h2 className="...">Daftar Pengeluaran</h2>
+ <h2 className="...">Daftar Transaksi</h2>
```

### **Step 2: Extract CategoryBreakdown to Drawer** (10 min)
1. Import Drawer dari shadcn
2. Add state `const [showCategoryDrawer, setShowCategoryDrawer] = useState(false)`
3. Replace CategoryBreakdown section dengan icon button
4. Wrap CategoryBreakdown di dalam Drawer component

### **Step 3: Add Expense/Income Tabs** (15 min)
1. Add state `const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')`
2. Create tab buttons di atas search bar
3. Filter expenses berdasarkan activeTab
4. Style tabs dengan Figma design (spacing, colors)

### **Step 4: Pixel Perfect Styling** (10 min)
1. Match spacing antara tabs dan search bar
2. Match button styling dari Figma
3. Align icon button di header
4. Test responsive behavior

**Total Time**: ~40 minutes

## 🎨 Key Visual Elements from Figma

### Tab Styling
```tsx
// Active Tab (Pengeluaran)
className="bg-red-600 text-white rounded-lg px-4 py-2"

// Inactive Tab (Pemasukan)
className="bg-transparent text-gray-400 rounded-lg px-4 py-2"
```

### Icon Button (Category)
```tsx
// Chart icon button di header
<Button variant="ghost" size="icon">
  <BarChart3 className="h-5 w-5" />
</Button>
```

### Spacing & Alignment
```css
/* Dari Figma inspection */
Header: padding-bottom: 16px
Tabs: margin-bottom: 12px  
Tab gap: gap: 8px
```

### Colors from Figma
- Active Tab Red: `#E7000B` atau `#DC2626` (red-600)
- Inactive Text: `#A1A1A1` (gray-400)
- Background: Dark theme existing

## 🔄 Component Structure

**BEFORE:**
```
ExpenseList
  ├─ Header: "Daftar Pengeluaran"
  ├─ CategoryBreakdown (inline)
  ├─ Search Bar
  └─ Expense Items
```

**AFTER:**
```
ExpenseList
  ├─ Header: "Daftar Transaksi" + [📊 Icon Button]
  ├─ Tabs: [Pengeluaran] [Pemasukan]
  ├─ Search Bar
  ├─ Expense Items (filtered by tab)
  └─ Drawer:
      └─ CategoryBreakdown (when opened)
```

## ✅ Implementation Checklist

### Step 1: Title Update
- [x] Change "Daftar Pengeluaran" → "Daftar Transaksi" ✅

### Step 2: Category Drawer
- [x] Import Drawer, DrawerContent from shadcn ✅
- [x] Import BarChart3 from lucide-react ✅
- [x] Add `showCategoryDrawer` state ✅
- [x] Create icon button di header ✅
- [x] Move CategoryBreakdown ke dalam Drawer ✅
- [x] Test drawer open/close ✅

### Step 3: Expense/Income Tabs
- [x] Add `activeTab` state ('expense' | 'income') ✅
- [x] Create tab buttons di atas search bar ✅
- [x] Style tabs match Figma (red active, gray inactive) ✅
- [x] Filter expenses by `expense.fromIncome` ✅
- [x] Update collapsible section totals ✅

### Step 4: Remove Old Buttons
- [x] Remove "Tambah Pengeluaran" button from App.tsx ✅
- [x] Remove "Tambah Pemasukan" button from App.tsx ✅

### Step 5: Styling
- [x] Match spacing dari Figma (gaps, padding, margins) ✅
- [x] Align icon button di header ✅
- [x] Update tab styling (neutral-800 container, red border active) ✅
- [x] Update button styling (Lock, Pilih with bg and border) ✅
- [x] Update search input styling (match Figma colors) ✅
- [x] Update category icon button (emoji with bg) ✅
- [ ] Test responsive di mobile (need user testing)
- [ ] Verify pixel-perfect match (need user testing)

## 📝 Notes

### Important Considerations:
1. **Backward Compatibility**: Existing data structure must work
2. **Performance**: Keep useMemo/useCallback optimizations
3. **Mobile First**: Design is mobile-focused
4. **Category Integration**: Must work with Phase 8 custom categories
5. **Real-time Updates**: Maintain Supabase subscription

### SVG Icons Available:
- Lock icon: Available in Figma import
- Edit icon: Available in Figma import
- Delete icon: Available in Figma import
- Sort icon: Available in Figma import
- Search icon: Available in Figma import
- Chevron: Available in Figma import

## 🎯 Success Criteria

✅ **Title**: "Daftar Transaksi" displayed ✅ DONE
✅ **Category Drawer**: Opens via icon button, shows CategoryBreakdown ✅ DONE
✅ **Tabs**: Pengeluaran/Pemasukan switch properly ✅ DONE
✅ **Filtering**: Expenses filtered by tab (fromIncome field) ✅ DONE
✅ **Remove Buttons**: Old "Tambah Pengeluaran/Pemasukan" buttons removed ✅ DONE
⏳ **Styling**: Pixel perfect match dengan Figma (spacing, colors, alignment) - NEEDS TESTING
⏳ **Mobile**: Works perfectly di mobile - NEEDS TESTING
⏳ **No Regression**: Existing features tetap berfungsi - NEEDS TESTING

---

## 🎉 Implementation Complete!

**Status**: ✅ All code changes implemented
**Next Step**: User testing & refinement

**Actual Time**: ~45 minutes
**Priority**: High
**Complexity**: Low-Medium (mostly layout changes)
