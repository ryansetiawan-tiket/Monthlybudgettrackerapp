# Quick Reference: Pre-fill Income Dialog

## 🎯 Tujuan
Membuat dialog pemasukan tambahan otomatis ter-set ke kantong target ketika dibuka dari tombol "Tambah Dana" di card kantong.

## 🔑 Key Components

### 1. App.tsx - State & Handler
```typescript
// State
const [defaultTargetPocket, setDefaultTargetPocket] = useState<string | undefined>(undefined);

// Handler
const handleOpenIncomeDialog = (targetPocketId?: string) => {
  setDefaultTargetPocket(targetPocketId);
  setIsIncomeDialogOpen(true);
};

// Pass to PocketsSummary
<PocketsSummary
  onAddIncomeClick={handleOpenIncomeDialog}
  // ... other props
/>

// Pass to Dialog
<AddAdditionalIncomeDialog 
  defaultTargetPocket={defaultTargetPocket}
  pockets={pockets}
  onOpenChange={(open) => {
    setIsIncomeDialogOpen(open);
    if (!open) setDefaultTargetPocket(undefined); // Reset on close
  }}
  // ... other props
/>
```

### 2. PocketsSummary.tsx - Tombol Trigger
```typescript
// Props Interface
interface PocketsSummaryProps {
  onAddIncomeClick?: (targetPocketId?: string) => void;
  // ... other props
}

// Button Implementation
<Button onClick={() => {
  if (onAddIncomeClick) {
    onAddIncomeClick(pocket.id);
  }
}}>
  <Plus className="size-4 mr-2" />
  Tambah Dana
</Button>
```

### 3. AdditionalIncomeForm.tsx - Auto-fill Logic
```typescript
// Props
interface AdditionalIncomeFormProps {
  defaultTargetPocket?: string;
  pockets?: Pocket[];
  // ... other props
}

// Auto-fill Effect
useEffect(() => {
  if (defaultTargetPocket) {
    setTargetPocketId(defaultTargetPocket);
  } else if (pockets.length > 0) {
    setTargetPocketId(pockets[0].id);
  }
}, [defaultTargetPocket, pockets]);
```

## 📊 Data Flow

```
User Action → PocketsSummary → App State → Dialog Props → Form State → Auto-fill
```

1. User klik "Tambah Dana" → `onAddIncomeClick(pocket.id)`
2. App set state → `setDefaultTargetPocket(targetPocketId)`
3. Dialog buka → Props: `defaultTargetPocket={pocketId}`
4. Form effect → `setTargetPocketId(defaultTargetPocket)`
5. Dropdown ter-set otomatis

## 🧪 Testing

### Scenario 1: Pre-fill dari Card Kantong
1. Klik "Tambah Dana" di card kantong "Uang Dingin"
2. ✅ Dialog terbuka dengan dropdown "Ke Kantong" = "Uang Dingin"

### Scenario 2: Tambah Biasa (No Pre-fill)
1. Klik tab "Pemasukan Tambahan"
2. Klik "Tambah Pemasukan"
3. ✅ Dialog terbuka dengan dropdown = kantong pertama (default)

### Scenario 3: Switch Context
1. Klik "Tambah Dana" di kantong "Sehari-hari"
2. Close dialog tanpa submit
3. Klik "Tambah Dana" di kantong "Uang Dingin"
4. ✅ Dropdown ter-update ke "Uang Dingin"

## 🔧 Backend Integration

### Request to `/additional-income/:year/:month`
```typescript
{
  // ... other fields
  pocketId: string  // NEW: ID kantong tujuan
}
```

### handleAddIncome Interface
```typescript
const handleAddIncome = async (income: {
  name: string;
  amount: number;
  currency: string;
  exchangeRate: number | null;
  amountIDR: number;
  conversionType: string;
  date: string;
  deduction: number;
  pocketId: string;  // NEW
}) => { ... }
```

## 📝 Important Notes

1. **Reset State**: `defaultTargetPocket` MUST be reset saat dialog close
2. **Fallback**: Jika `defaultTargetPocket` undefined, form default ke kantong pertama
3. **Context-aware**: Pre-fill hanya aktif saat dibuka dari card kantong
4. **Backend Ready**: API endpoint sudah support `pocketId` parameter

## 🎨 UI/UX Highlights

- ✅ Pre-fill seamless tanpa flash/jump
- ✅ State reset otomatis saat dialog close
- ✅ Fallback ke default jika tidak ada context
- ✅ Support multiple pockets
- ✅ Consistent behavior dengan TransferDialog

## 📦 Modified Files

```
/App.tsx                                 - State & handler management
/components/PocketsSummary.tsx           - Tombol trigger
/components/AddAdditionalIncomeDialog.tsx - Props passing (verified)
/components/AdditionalIncomeForm.tsx     - Auto-fill logic (verified)
```

---

**Status**: ✅ COMPLETE | **Date**: 5 November 2024
