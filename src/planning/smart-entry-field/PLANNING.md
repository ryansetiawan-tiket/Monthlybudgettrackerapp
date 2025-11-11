# 🎯 Smart Entry Field - Planning Document

**Date**: November 10, 2025  
**Status**: Planning Phase  
**Goal**: Quality of Life feature untuk mengatasi entri data tunggal yang berulang

---

## 📋 Problem Statement

**Masalah**:
- User sering input transaksi tunggal yang sama berulang-ulang (misal: "Makan Siang", Kategori "Makanan", Kantong "Sehari-hari")
- Fitur [ 📄 Pilih Template ] saat ini hanya untuk Bulk Entry, tidak menyelesaikan masalah ini
- User harus isi semua field setiap kali, meski transaksinya sama

**Solusi**:
- Buat field Nama (Opsional) menjadi "Smart Field" dengan auto-fill suggestions
- Tampilkan 5-7 kombinasi transaksi yang paling sering/terakhir diinput
- One-tap untuk auto-fill semua field

---

## 🎯 TUGAS 1: Smart Suggestions UI

### **Trigger**
- Saat user tap/focus pada field "Nama (Opsional)"
- Muncul keyboard + daftar suggestions

### **Display Location**
**Option A**: Di bawah field Nama (above keyboard on mobile)
```
┌─────────────────────────────────┐
│ Nama (Opsional)                 │
│ [_________________________]     │ ← Focus here
├─────────────────────────────────┤
│ 💡 Sering digunakan:            │
│ ┌─────────────────────────────┐│
│ │ 🍱 Makan Siang              ││
│ │ Makanan • Sehari-hari • 35K ││
│ ├─────────────────────────────┤│
│ │ ☕ Kopi Pagi                ││
│ │ Makanan • Sehari-hari • 15K ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

### **Suggestion Content**
Each suggestion item shows:
- **Header**: `[emoji] Nama Item`
- **Subtitle**: `Kategori • Kantong • Rp Amount`

Example:
```
🍱 Makan Siang
Makanan • Sehari-hari • Rp 35.000
```

### **Data Source Logic**
Priority order:
1. **Most Frequent** (last 30 days): Top 5 most used combinations
2. **Most Recent** (last 7 days): Latest 2 unique combinations

**Algorithm**:
```typescript
// Get all expenses from last 30 days
const recentExpenses = expenses.filter(
  exp => isWithinLast30Days(exp.date) && exp.name
);

// Group by combination (name + category + pocket)
const combinations = groupByCombination(recentExpenses);

// Sort by frequency
const sortedByFreq = sortByFrequency(combinations).slice(0, 5);

// Get last 7 days unique
const lastWeek = getLastWeekUnique(recentExpenses, 2);

// Merge: frequents + recents (remove duplicates)
const suggestions = mergeUnique([...sortedByFreq, ...lastWeek]).slice(0, 7);
```

### **UI States**

**State 1: No data (fresh user)**
```
┌─────────────────────────────────┐
│ 💡 Belum ada riwayat transaksi  │
│    Mulai input untuk mendapat   │
│    saran otomatis berikutnya 🎯 │
└─────────────────────────────────┘
```

**State 2: Has suggestions (normal)**
```
┌─────────────────────────────────┐
│ 💡 Sering digunakan:            │
│ [List of 5-7 suggestions]       │
└─────────────────────────────────┘
```

**State 3: User typing (filter suggestions)**
```
User types: "Makan"
┌─────────────────────────────────┐
│ 💡 Cocok dengan "Makan":        │
│ ┌─────────────────────────────┐│
│ │ 🍱 Makan Siang              ││
│ │ 🍜 Makan Malam              ││
│ └─────────────���───────────────┘│
└─────────────────────────────────┘
```

---

## 🎯 TUGAS 2: Auto-fill Logic

### **Trigger**
- User taps/clicks any suggestion item

### **Action**
Auto-fill ALL relevant fields:

```typescript
function handleSuggestionClick(suggestion: Suggestion) {
  // 1. Fill Nama
  setEntries(prev => prev.map((entry, idx) => 
    idx === currentIndex 
      ? { ...entry, name: suggestion.name }
      : entry
  ));

  // 2. Fill Kategori
  setEntries(prev => prev.map((entry, idx) => 
    idx === currentIndex 
      ? { ...entry, category: suggestion.category }
      : entry
  ));

  // 3. Fill Nominal
  setEntries(prev => prev.map((entry, idx) => 
    idx === currentIndex 
      ? { ...entry, amount: suggestion.amount.toString() }
      : entry
  ));

  // 4. Fill Kantong
  setEntries(prev => prev.map((entry, idx) => 
    idx === currentIndex 
      ? { ...entry, pocket: suggestion.pocket }
      : entry
  ));

  // 5. Close suggestions
  setShowSuggestions(false);

  // 6. Focus to next field (optional UX improvement)
  // User can now just review and click "Tambah 1 Pengeluaran"
}
```

### **UX Flow**
```
1. User opens "Tambah Transaksi"
   └─> Field Nama (Opsional) auto-focused
   └─> Suggestions appear below

2. User taps "🍱 Makan Siang"
   └─> All fields auto-filled:
       ✅ Nama: "Makan Siang"
       ✅ Kategori: "Makanan"
       ✅ Nominal: "35000"
       ✅ Kantong: "Sehari-hari"

3. User reviews (can edit if needed)

4. User taps "Tambah 1 Pengeluaran"
   └─> Done! ✨
```

---

## 🚧 Implementation Strategy

### **Phase 1: Data Layer** (30 mins)
1. Create utility function: `getSuggestions(expenses): Suggestion[]`
2. Define type: `Suggestion { name, category, pocket, amount, emoji, count }`
3. Implement grouping & sorting logic
4. Test with mock data

### **Phase 2: UI Component** (45 mins)
1. Create `<SmartSuggestions>` component
2. Props: `{ suggestions, onSelect, onClose, visible }`
3. Styling: Mobile-first, above keyboard
4. Add filter logic (when user types)
5. Add loading state

### **Phase 3: Integration** (30 mins)
1. Add state to `AddExpenseForm.tsx`:
   ```tsx
   const [showSuggestions, setShowSuggestions] = useState(false);
   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
   ```
2. Hook to field focus event
3. Implement auto-fill handler
4. Test complete flow

### **Phase 4: Polish & Edge Cases** (15 mins)
1. Handle: No suggestions available
2. Handle: User clears field after auto-fill
3. Handle: Keyboard covers suggestions (mobile)
4. Add smooth transitions
5. Accessibility: Keyboard navigation

---

## 🔍 Data Structure

### **Suggestion Type**
```typescript
interface Suggestion {
  // Core data
  name: string;           // "Makan Siang"
  category: string;       // "makanan" (ID)
  categoryLabel: string;  // "Makanan" (Display)
  categoryEmoji: string;  // "🍱"
  pocket: string;         // "sehari-hari"
  pocketLabel: string;    // "Sehari-hari"
  amount: number;         // 35000
  
  // Metadata
  count: number;          // Frequency (how many times used)
  lastUsed: string;       // ISO date of last usage
  
  // Computed
  displayAmount: string;  // "Rp 35.000"
}
```

### **Storage**
No additional storage needed! We compute suggestions on-the-fly from existing expenses data.

---

## 🎨 Visual Design

### **Mobile View** (Screenshot reference)
```
┌─────────────────────────────────────┐
│ Tambah Transaksi              [X]   │
├─────────────────────────────────────┤
│ [Pengeluaran] [Pemasukan]           │
├─────────────────────────────────────┤
│ Tanggal                             │
│ Senin, 10 Nov 2025            [<][>]│
├─────────────────────────────────────┤
│ Pengeluaran (1)                     │
│ ┌─────────────────────────────────┐ │
│ │ ▼ Entry 1                  [X]  │ │
│ │                                 │ │
│ │ Nama (Opsional)                 │ │
│ │ [Kosongkan untuk otomatis...] ← │ │ ← FOCUS HERE
│ │                                 │ │
│ │ ┌─ Smart Suggestions ─────────┐ │ │ ← NEW!
│ │ │ 💡 Sering digunakan:        │ │ │
│ │ │                             │ │ │
│ │ │ ┌─────────────────────────┐ │ │ │
│ │ │ │ 🍱 Makan Siang          │ │ │ │
│ │ │ │ Makanan • Sehari-hari   │ │ │ │
│ │ │ │ Rp 35.000               │ │ │ │
│ │ │ ├─────────────────────────┤ │ │ │
│ │ �� │ ☕ Kopi Pagi            │ │ │ │
│ │ │ │ Makanan • Sehari-hari   │ │ │ │
│ │ │ │ Rp 15.000               │ │ │ │
│ │ │ ├─────────────────────────┤ │ │ │
│ │ │ │ 🚗 Bensin               │ │ │ │
│ │ │ │ Transport • Sehari-hari │ │ │ │
│ │ │ │ Rp 50.000               │ │ │ │
│ │ │ └─────────────────────────┘ │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ Kategori (Opsional)             │ │
│ │ Nominal                         │ │
│ │ Ambil dari Kantong              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
      ┌──────────────────┐
      │ [Keyboard Area]  │
      └──────────────────┘
```

### **Component Hierarchy**
```
AddExpenseForm
├─ Entry 1 (Collapsible)
│  ├─ Input: Nama (Opsional) ← Focus trigger
│  ├─ SmartSuggestions ← NEW COMPONENT!
│  │  ├─ Header: "💡 Sering digunakan:"
│  │  └─ SuggestionList
│  │     ├─ SuggestionItem (clickable)
│  │     ├─ SuggestionItem
│  │     └─ ...
│  ├─ Select: Kategori
│  ├─ Input: Nominal
│  └─ Select: Kantong
```

---

## ⚠️ Critical Constraints

### **1. NO Conflict with "Pilih Template"**
```
[ 📄 Pilih Template ] = Bulk Entry (multiple expenses)
[ 💡 Smart Suggestions ] = Single Entry (auto-fill current entry)

✅ They are INDEPENDENT features
✅ Both can coexist without conflict
```

### **2. Data Privacy**
- Only show suggestions from user's OWN expenses
- Filter by current month context (optional)

### **3. Performance**
- Compute suggestions only on focus (lazy)
- Cache for session (avoid recomputation)
- Max 7 items (keep list short)

### **4. Mobile UX**
- Suggestions appear ABOVE keyboard
- Tap outside to close
- Smooth slide-in animation
- Don't block other fields

---

## 🧪 Test Scenarios

### **Scenario 1: Fresh user (no data)**
```
1. Open "Tambah Transaksi"
2. Focus "Nama (Opsional)"
3. ✅ Show: "Belum ada riwayat transaksi"
4. ✅ No suggestions list
```

### **Scenario 2: User with history**
```
1. Open "Tambah Transaksi"
2. Focus "Nama (Opsional)"
3. ✅ Show: "💡 Sering digunakan:"
4. ✅ Display 5-7 suggestions
5. ✅ Sorted by frequency + recency
```

### **Scenario 3: Auto-fill from suggestion**
```
1. Focus "Nama (Opsional)"
2. Tap "🍱 Makan Siang"
3. ✅ Nama = "Makan Siang"
4. ✅ Kategori = "Makanan"
5. ✅ Nominal = "35000"
6. ✅ Kantong = "Sehari-hari"
7. ✅ Suggestions close
8. User can review and submit
```

### **Scenario 4: Filter suggestions**
```
1. Focus "Nama (Opsional)"
2. Type: "Makan"
3. ✅ Suggestions filter to matching items
4. ✅ Show: "🍱 Makan Siang", "🍜 Makan Malam"
5. ✅ Hide: "☕ Kopi Pagi", "🚗 Bensin"
```

### **Scenario 5: No conflict with Template**
```
1. Use "Smart Suggestions" for single entry ✅
2. Use "Pilih Template" for bulk entry ✅
3. ✅ Both work independently
```

---

## 📊 Success Metrics

**User Impact**:
- ⏱️ **50% faster** data entry for recurring expenses
- 🎯 **Zero typing** for common transactions
- 😊 **Better UX** = less frustration

**Technical**:
- ✅ Computed on-the-fly (no extra storage)
- ✅ <100ms suggestion generation
- ✅ Mobile-optimized UI
- ✅ Fully accessible

---

## 🚀 Implementation Roadmap

### **Step 1: Create Utility Function** (utils/smartSuggestions.ts)
```typescript
export function getSuggestions(
  expenses: Expense[],
  limit = 7
): Suggestion[] {
  // Implementation here
}
```

### **Step 2: Create Component** (components/SmartSuggestions.tsx)
```typescript
export function SmartSuggestions({
  suggestions,
  onSelect,
  visible,
}: Props) {
  // Implementation here
}
```

### **Step 3: Integrate to AddExpenseForm**
```typescript
// Add state
const [showSuggestions, setShowSuggestions] = useState(false);

// Add event handlers
const handleNameFocus = () => {
  const suggestions = getSuggestions(expenses);
  setSuggestions(suggestions);
  setShowSuggestions(true);
};

const handleSuggestionSelect = (suggestion) => {
  // Auto-fill logic
};
```

### **Step 4: Polish & Test**
- Add transitions
- Test on mobile
- Test keyboard navigation
- Fix edge cases

---

## 📝 Component API Design

### **SmartSuggestions Component**
```typescript
interface SmartSuggestionsProps {
  // Data
  suggestions: Suggestion[];
  
  // Visibility
  visible: boolean;
  
  // Handlers
  onSelect: (suggestion: Suggestion) => void;
  onClose: () => void;
  
  // Optional
  filterQuery?: string;  // For live filtering
  loading?: boolean;     // Show skeleton
}
```

### **Usage**
```tsx
<SmartSuggestions
  suggestions={suggestions}
  visible={showSuggestions}
  onSelect={handleSuggestionSelect}
  onClose={() => setShowSuggestions(false)}
  filterQuery={entry.name}
/>
```

---

## ✅ Checklist Before Implementation

- [x] Planning document created
- [x] Data structure defined
- [x] UI mockup designed
- [x] Algorithm planned
- [x] Test scenarios listed
- [x] No conflict with existing features verified
- [ ] Ready for implementation!

---

**Status**: ✅ Planning Complete - Ready for Implementation  
**Next Step**: Create utility function + component  
**Estimated Time**: 2 hours total
