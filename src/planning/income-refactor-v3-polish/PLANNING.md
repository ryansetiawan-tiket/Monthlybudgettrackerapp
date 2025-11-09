# Income Tab Visual Polish - V3

**Date:** 2025-11-09  
**Status:** Planning  
**Priority:** Visual Polish (Non-Breaking)

---

## 🎯 Objective

Sempurnakan sub-line metadata pada income items (collapsed view) untuk mengurangi visual noise dan menampilkan informasi mata uang asli.

---

## 📋 Changes Required

### 1. **Show Original Currency Amount**

**Target:** Sub-line metadata (gray text below item name)

**Implementation:**
- Display original currency amount (e.g., $3.00) IF it exists
- Format: `{date} • {originalAmount}`
- Only show if `income.currency === "USD"` and `income.amount` exists

**Example Output:**
```
19 Nov 2025 • $3.00
```

---

### 2. **Reverse Conversion Type Label Logic**

**Problem:** Label "(Manual)" appears too often and creates visual noise (it's the default behavior).

**Solution:** Invert the logic
- **Manual** → HIDE label (default behavior, no need to show)
- **Auto** → SHOW label "• (Auto)" (exception, worth highlighting)

**Before:**
```
19 Nov 2025 • (Manual)  ← Noisy, appears everywhere
1 Nov 2025 • (Auto)     ← Important exception
```

**After:**
```
19 Nov 2025 • $3.00     ← Clean, Manual is implied
1 Nov 2025 • (Auto) • $53.08  ← Highlight exception
```

---

## 🎨 Expected Visual Results

### Scenario A: Manual USD Conversion (Common)
```
v  CGTrader
   19 Nov 2025 • $3.00
   +Rp 48.000 [👁️][...]
```

### Scenario B: Auto USD Conversion (Exception)
```
v  Fiverr
   1 Nov 2025 • (Auto) • $53.08
   +Rp 831.172 [👁️][...]
```

### Scenario C: IDR Only (No conversion)
```
v  Pulsa
   25 Okt 2025
   +Rp 50.000 [👁️][...]
```

---

## 🔍 Implementation Target

**File:** `/components/ExpenseList.tsx`

**Section:** Income items rendering (around line 2190-2220)

**Current Code Pattern:**
```tsx
<span className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
  {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(income.date))} • ({income.conversionType === "auto" ? "Auto" : "Manual"})
</span>
```

**New Logic:**
```tsx
<span className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
  {formatDate(income.date)}
  {income.conversionType === "auto" && " • (Auto)"}
  {income.currency === "USD" && income.amount && ` • ${formatUSD(income.amount)}`}
</span>
```

---

## ✅ Success Criteria

- [x] Planning created
- [ ] Original USD amount displayed when available
- [ ] "(Manual)" label removed from all items
- [ ] "(Auto)" label shown ONLY for auto conversions
- [ ] No breaking changes to functionality
- [ ] Clean, readable metadata line

---

## 📝 Notes

- This is a **visual polish only** - no data schema changes
- No backward compatibility concerns
- Purely presentation layer modification
- Should improve UX by reducing noise and adding useful currency info

---

**End of Planning Document**
