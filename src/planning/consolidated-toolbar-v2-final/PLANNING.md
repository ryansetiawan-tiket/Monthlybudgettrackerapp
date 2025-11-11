# Consolidated Toolbar V2 - Planning Document

## 📋 Executive Summary
Refactor besar: Menggabungkan 2 toolbar (Aksi + Search) menjadi 1 toolbar konsolidasi yang konsisten di Desktop & Mobile untuk mengurangi clutter dan memperbaiki parity fitur.

---

## 🎯 Objectives
1. **Parity**: Toolbar Aksi (☰ Pilih) yang hilang di desktop kini konsisten di semua platform
2. **Clutter Reduction**: 2 baris toolbar → 1 baris toolbar yang efisien
3. **UX Enhancement**: Expandable search untuk menghemat space tanpa mengorbankan fungsi

---

## 📊 Current State Analysis

### Desktop (Screenshot 1)
```
Row 1: [ 🔍 Cari... ]                              [ ↑↓ ] [ ▽ ]
Row 2: Tab Pengeluaran | Tab Pemasukan
```
- ❌ MISSING: Tombol "☰ Pilih" (fitur bulk actions tidak accessible!)
- ❌ MISSING: Tombol "📊 Breakdown"
- ⚠️ CLUTTER: Search bar memakan 1 baris penuh

### Mobile (Screenshot 2)
```
Row 1: [ ☰ ] [ ✏️ ] [ 📊 ]                         -Rp X.XXX.XXX
Row 2: Tab Pengeluaran | Tab Pemasukan
Row 3: [ 🔍 Cari... ]                              [ ↑↓ ] [ ▽ ]
```
- ✅ HAS: Tombol "☰ Pilih" dan "📊"
- ⚠️ CLUTTER: 3 baris toolbar (Aksi + Tabs + Search)

---

## 🎨 Target Design (Consolidated Toolbar)

### Layout Baru (Desktop & Mobile)
```
┌─────────────────────────────────────────────────────────────┐
│ [ ☰ ] [ 🔍 ]  ...  -Rp 5.456.668  [ ↑↓ ] [ ▽ ] [ 📊 ]    │  ← CONSOLIDATED TOOLBAR
├─────────────────────────────────────────────────────────────┤
│     [ Pengeluaran ]  |  [ Pemasukan ]                       │  ← TABS
├─────────────────────────────────────────────────────────────┤
│  Transaction List...                                        │
└─────────────────────────────────────────────────────────────┘
```

### Breakdown Toolbar Elements

**Left Section (Aksi):**
- `[ ☰ Pilih ]` - Bulk selection mode toggle
- `[ 🔍 ]` - Search trigger (collapsed state)

**Center Section:**
- Spacer (flex-1)

**Right Section (Data & Tools):**
- `[-Rp 5.456.668]` - Total Pengeluaran/Pemasukan (sesuai tab aktif)
- `[ ↑↓ ]` - Sort button
- `[ ▽ ]` - Advanced Filter button
- `[ 📊 ]` - Category Breakdown button

---

## 🔄 Expandable Search Interaction

### State 1: Collapsed (Default)
```
[ ☰ ] [ 🔍 ] ... -Rp 5.456.668 [ ↑↓ ] [ ▽ ] [ 📊 ]
```

### State 2: Expanded (Search Active)
```
[ ← ] [ 🔍 Cari nama, kategori, hari, atau tanggal... ] [ × ]
```
- `[ ← ]` - Back button (exit search)
- Full-width search input (animated expand)
- `[ × ]` - Clear search (jika ada input)
- Semua tombol lain tersembunyi sementara

### Animation Flow:
1. User click `[ 🔍 ]`
2. Animate search input expand dari kanan
3. Hide other buttons dengan fade-out
4. Focus ke search input
5. User click `[ ← ]` atau `ESC` → Collapse back

---

## 🛠️ Implementation Plan

### Phase 1: Component Structure
**File: `/components/ConsolidatedToolbar.tsx` (NEW)**
- Props interface untuk state management
- Left/Right section components
- Expandable search logic
- Animation dengan motion/react

### Phase 2: State Management
**File: `/App.tsx` (MODIFY)**
- Add state: `isSearchExpanded: boolean`
- Add handlers: `handleSearchToggle()`, `handleSearchClose()`
- Wire ke TransactionList component

### Phase 3: Integration
**File: `/components/TransactionList.tsx` (MODIFY)**
- REMOVE old search bar toolbar
- REMOVE old action buttons row (mobile)
- INTEGRATE new ConsolidatedToolbar
- Maintain existing search/sort/filter logic

### Phase 4: Responsive Behavior
- Desktop: Full layout dengan semua buttons visible
- Mobile: Sama, tapi dengan compact spacing
- Search expanded: Full-width di semua platform

---

## 📝 Technical Specifications

### Props Interface
```typescript
interface ConsolidatedToolbarProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchExpanded: boolean;
  onSearchToggle: () => void;
  
  // Selection
  isSelectionMode: boolean;
  onToggleSelection: () => void;
  
  // Data
  totalAmount: number;
  activeTab: 'expense' | 'income';
  
  // Actions
  onSort: () => void;
  onFilter: () => void;
  onOpenBreakdown: () => void;
  
  // Sort/Filter indicators
  sortOrder: 'newest' | 'oldest';
  hasActiveFilters: boolean;
}
```

### Animation Specs
- Duration: 250ms (smooth tapi tidak lambat)
- Easing: ease-in-out
- Transform: width dari 40px → 100%
- Opacity: 0 → 1 (fade in/out untuk buttons)

---

## ✅ Success Criteria

### Functional
- [ ] Toolbar Aksi (☰ Pilih) accessible di Desktop & Mobile
- [ ] Search expandable berfungsi lancar tanpa glitch
- [ ] Semua tombol (Sort/Filter/Breakdown) tetap accessible
- [ ] Total amount update sesuai tab aktif
- [ ] Existing functionality (search/sort/filter) tetap berfungsi

### Visual
- [ ] 2 baris toolbar berkurang jadi 1 baris (di atas tabs)
- [ ] Consistent layout Desktop ↔ Mobile
- [ ] Smooth animations tanpa layout shift
- [ ] Proper spacing dan alignment
- [ ] Accessibility (keyboard nav, ARIA labels)

### Performance
- [ ] No performance regression
- [ ] Smooth 60fps animation
- [ ] Search input focus instant

---

## 🚨 Risks & Mitigations

### Risk 1: Layout Shift During Animation
**Mitigation:** Use absolute positioning untuk search expanded state

### Risk 2: Existing Search Logic Break
**Mitigation:** Maintain exact same props/handlers, hanya UI wrapper berubah

### Risk 3: Mobile Spacing Too Tight
**Mitigation:** Use icon-only buttons dengan proper touch targets (min 44×44px)

---

## 📦 Files to Modify/Create

### Create:
- `/components/ConsolidatedToolbar.tsx` (NEW component)

### Modify:
- `/App.tsx` (Add isSearchExpanded state)
- `/components/TransactionList.tsx` (Remove old toolbars, integrate new)

### Reference (No Change):
- Search/Sort/Filter logic tetap sama
- Existing handlers reuse

---

## 🎬 Execution Order

1. ✅ Create this planning document
2. ✅ Create ConsolidatedToolbar component
3. ✅ Add state management to ExpenseList.tsx (isSearchExpanded)
4. ✅ Integrate to ExpenseList.tsx
   - ✅ Added ConsolidatedToolbar before tabs
   - ✅ Removed old search bar section
   - ✅ Removed mobile action buttons (now in toolbar)
   - ✅ Removed "Total" row from CardTitle (now in toolbar)
   - ✅ Preserved suggestions dropdown
   - ✅ Added ESC key handler for search collapse
   - ✅ Removed Breakdown button (per user request)
5. ⏳ Test Desktop responsiveness
6. ⏳ Test Mobile responsiveness
7. ⏳ Test expandable search interaction
8. ⏳ Final polish (animations, accessibility)

---

**Status:** Implementation Complete - Ready for Testing
**Next Step:** Test in browser (Desktop & Mobile)