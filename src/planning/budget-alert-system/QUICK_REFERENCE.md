# Budget Alert System - Quick Reference

**Fast lookup guide for developers** ⚡

---

## 🎯 WHAT IT DOES

Two features for budget monitoring:
1. **Toast Alerts** - Passive feedback after save (Warning/Danger/Exceeded)
2. **Confirmation Dialog** - Active blocker before save (if will exceed)

---

## 📁 NEW FILES

```
/utils/budgetAlerts.ts           - Toast alert logic
/components/BudgetExceedDialog.tsx  - Confirmation dialog
```

## 📝 MODIFIED FILES

```
/components/AddExpenseForm.tsx   - Integration of both features
/components/AddExpenseDialog.tsx - Pass expenses data (if needed)
```

---

## 🔑 KEY FUNCTIONS

### `showBudgetAlertIfNeeded()`
```typescript
// Location: /utils/budgetAlerts.ts
// Purpose: Show toast if budget status increased

showBudgetAlertIfNeeded({
  categoryId: 'game',
  categoryLabel: 'Game',
  oldTotal: 350000,      // Before this expense
  newTotal: 450000,      // After this expense
  limit: 500000,
  warningAt: 80
});

// Shows toast only if status changed (e.g., Safe → Warning)
```

### `calculateCategoryTotal()`
```typescript
// Location: /utils/budgetAlerts.ts
// Purpose: Sum all expenses for a category

const total = calculateCategoryTotal('game', expenses);
// Returns: number (sum of all game expenses)
```

### `BudgetExceedDialog`
```typescript
// Location: /components/BudgetExceedDialog.tsx
// Purpose: Show warning before budget exceeds

<BudgetExceedDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  exceedingCategories={[
    {
      categoryId: 'game',
      categoryLabel: 'Game',
      currentTotal: 450000,
      projectedTotal: 600000,
      limit: 500000,
      excess: 100000,
      currentPercent: 90,
      projectedPercent: 120
    }
  ]}
  onConfirm={() => proceedWithSave()}
  onCancel={() => stayInForm()}
  isLoading={false}
/>
```

---

## 🎨 STATUS LEVELS

| Status | Range | Color | Toast |
|--------|-------|-------|-------|
| **Safe** | 0-79% | Green | No alert |
| **Warning** | 80-89% | Amber | 😅 "Hati-hati, Bos!" |
| **Danger** | 90-99% | Orange | 😱 "Awas!" |
| **Exceeded** | 100%+ | Red | 🚨 "WADUH!" |

**Hierarchy:** Safe (0) < Warning (1) < Danger (2) < Exceeded (3)

**Alert Rule:** Only show if level **increases**
- Safe → Warning = Show ✅
- Warning → Warning = Don't show ❌

---

## 🔄 USER FLOW

### With Dialog (Exceed)
```
Click "Simpan" → Check projection
                      ↓
                 Will exceed?
                      ↓
                     YES
                      ↓
              Show Dialog
                      ↓
           User chooses:
           ├─ Batal → Stay in form
           └─ Tetap Tambah → Save → Toast
```

### Without Dialog (Safe/Warning/Danger)
```
Click "Simpan" → Save → Success toast
                            ↓
                    Budget status changed?
                            ↓
                           YES
                            ↓
                      Show alert toast
```

---

## 🧪 QUICK TESTS

### Test 1: Warning Toast
```bash
Budget: Rp 500K, Current: Rp 350K (70%)
Add: Rp 75K
Expected: New total 85% → Show warning toast ✅
```

### Test 2: Confirmation Dialog
```bash
Budget: Rp 500K, Current: Rp 450K (90%)
Add: Rp 100K
Expected: Projection 110% → Show dialog ✅
```

### Test 3: No Alert
```bash
Budget: Rp 500K, Current: Rp 425K (85% Warning)
Add: Rp 20K
Expected: New total 89% (still Warning) → No toast ❌
```

---

## 🐛 COMMON ISSUES

### Issue: Toast not showing
**Check:**
- [ ] Budget limit set for category?
- [ ] Status actually changed?
- [ ] `showBudgetAlertIfNeeded()` called after save?

### Issue: Dialog not showing
**Check:**
- [ ] Budget limit set?
- [ ] Projection > limit?
- [ ] Check called BEFORE save?
- [ ] `exceedingCategories` populated?

### Issue: Expenses not calculating correctly
**Check:**
- [ ] Expenses data passed to form?
- [ ] Current month expenses only?
- [ ] Category IDs matching?

---

## 📊 DATA REQUIREMENTS

**Needs access to:**
1. Category budget settings (`settings.budgets`)
2. Current month expenses (for total calculation)
3. Category labels (`getCategoryLabel()`)

**Budget config structure:**
```typescript
settings.budgets = {
  'game': {
    limit: 500000,
    warningAt: 80
  }
}
```

---

## 💡 TIPS

1. **Performance:** Cache category totals if recalculating often
2. **Testing:** Use dev tools to mock different budget scenarios
3. **Debugging:** Add console logs in `shouldShowAlert()` to see status changes
4. **UX:** Toast duration increases with severity (5s/6s/8s)
5. **Mobile:** Toast appears above FAB, dialog is scrollable

---

## 📝 TONE OF VOICE

**Keep it casual and friendly!**

✅ Good examples:
- "Hati-hati, Bos!"
- "Woy! Budget lo udah..."
- "WADUH! Budget JEBOL!"
- "Bodo Amat, Tetap Tambah"

❌ Avoid:
- Formal: "Peringatan: Anggaran terlampaui"
- Robotic: "Budget limit exceeded. Confirm?"
- Too casual: "Yolo aja lah!"

---

## 🔗 RELATED FILES

- `/utils/calculations.ts` - `getBudgetStatus()`, `getBudgetPercentage()`
- `/utils/currency.ts` - `formatCurrency()`
- `/hooks/useCategorySettings.ts` - Budget settings data
- `/constants/index.ts` - `EXPENSE_CATEGORIES`

---

## 📚 FULL DOCS

- [PLANNING.md](PLANNING.md) - Complete feature specification
- [VISUAL_MOCKUPS.md](VISUAL_MOCKUPS.md) - UI designs
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Step-by-step code guide

---

**Quick reference complete!** 📖  
For details, see full planning docs.
