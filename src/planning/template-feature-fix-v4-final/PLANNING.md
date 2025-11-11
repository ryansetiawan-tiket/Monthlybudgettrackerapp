# 📋 Planning: Template Feature Fix V4 - Final

**Tanggal**: 10 November 2025  
**Status**: Planning Phase  
**Priority**: HIGH (UX Critical - Template Manager hilang dari Desktop & Mobile UX conflict)

---

## 🎯 Tujuan Utama

Memperbaiki workflow 'Template Pengeluaran' yang tidak konsisten dengan:
1. **Desktop**: Entry point Template Manager hilang
2. **Mobile**: Dialog-on-Drawer conflict saat buat template baru
3. **Global**: Form "Buat Template" tidak lengkap (missing Icon/Emoji picker & Item details)

---

## 📦 Scope

### ✅ Yang AKAN Diubah:
- Desktop: Tambah tombol 📄 Template di header Daftar Transaksi
- Mobile: Implementasi internal drawer navigation (slide-in/slide-out)
- Global: Upgrade form "Buat Template" dengan Emoji picker + Category/Pocket dropdowns

### ❌ Yang TIDAK BOLEH Diubah:
- FAB mobile (+, -, ⇆) flow
- Modal 2-tab desktop (Pengeluaran, Pemasukan)
- Fitur "Transfer"
- Existing template data structure (backward compatibility!)

---

## 🏗️ Architecture Overview

### Current State (Problem):

**Desktop**:
```
❌ MASALAH: Template Manager tidak ada entry point!
User harus: FAB → Pengeluaran → Tab "Template" (tersembunyi)
```

**Mobile**:
```
❌ MASALAH: Dialog-on-Drawer conflict!
Drawer "Tambah Pengeluaran" → Tab "Template" → Klik [+ Buat Template]
  → ⚠️ Membuka Dialog baru (ugly UX!)
```

**Form "Buat Template"**:
```
❌ MASALAH: Incomplete!
- Missing: Emoji/Icon picker
- Missing: Category dropdown per item
- Missing: Pocket dropdown per item
```

---

### Target State (Solution):

**Desktop**:
```
✅ SOLUSI: Direct entry point!
Header Daftar Transaksi:
  [+ Tambah Transaksi] [Simulasi] [📊] [📄 Template] ← NEW!
  
Klik [📄] → Modal Dialog → Template Manager
  - List templates
  - [+ Buat Template] button
  - Edit/Delete actions
```

**Mobile**:
```
✅ SOLUSI: Internal navigation (no dialog!)
Drawer "Tambah Pengeluaran" → Tab "Template":
  
STATE 1: List View
  [+ Buat Template] ← Klik ini
  
STATE 2: Form View (slide-in animation)
  [< Kembali] ← NEW! Back to list
  Form "Buat Template Baru"
```

**Form "Buat Template"**:
```
✅ SOLUSI: Complete fields!

┌─────────────────────────────────────┐
│ Buat Template Baru                  │
├─────────────────────────────────────┤
│ Nama Template: [          ]         │
│ Pilih Ikon: 🍔 ← NEW!               │
│ Warna Template: [color picker]      │
│                                      │
│ Item Pengeluaran:                   │
│ ┌─────────────────────────────────┐ │
│ │ Nama: [Nasi Goreng]             │ │
│ │ Nominal: [Rp 15.000]            │ │
│ │ Kategori: [Makanan] ← NEW!      │ │
│ │ Kantong: [Sehari-hari] ← NEW!   │ │
│ │                          [🗑️]   │ │
│ └─────────────────────────────────┘ │
│ [+ Tambah Item]                     │
└─────────────────────────────────────┘
```

---

## 📝 Implementation Tasks

### **TUGAS 1: [FIX DESKTOP] Entry Point "Template Manager"**

**File**: `/App.tsx` (Desktop transaction list header)

**Steps**:
1. Locate desktop transaction list header section
2. Add new button: `[📄 Template]` next to existing buttons
3. Create state: `const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)`
4. Create new component: `<TemplateManagerDialog>` (modal variant)
   - Reuse `<FixedExpenseTemplates>` component inside
   - Desktop only (check `!isMobile`)
5. Wire up onClick handler to open dialog

**Expected Behavior**:
- Desktop only (hidden on mobile)
- Opens modal dialog with Template Manager
- Can create/edit/delete templates independently from "Tambah Pengeluaran" flow

---

### **TUGAS 2: [FIX MOBILE] Internal Drawer Navigation**

**File**: `/components/AddExpenseDialog.tsx` (Mobile drawer variant)

**Steps**:
1. Add navigation state for mobile drawer:
   ```tsx
   const [drawerView, setDrawerView] = useState<'list' | 'form'>('list')
   const [editingTemplate, setEditingTemplate] = useState<FixedExpenseTemplate | null>(null)
   ```

2. Modify `<FixedExpenseTemplates>` component:
   - Accept new prop: `onOpenForm?: (template?: FixedExpenseTemplate) => void`
   - Replace dialog open logic with callback for mobile
   - Keep dialog for desktop

3. Implement slide animation:
   ```tsx
   // In mobile drawer only
   {drawerView === 'list' && (
     <motion.div
       initial={{ x: 0 }}
       exit={{ x: '-100%' }}
       transition={{ type: 'spring', damping: 20 }}
     >
       <FixedExpenseTemplates onOpenForm={(tpl) => {
         setEditingTemplate(tpl)
         setDrawerView('form')
       }} />
     </motion.div>
   )}
   
   {drawerView === 'form' && (
     <motion.div
       initial={{ x: '100%' }}
       animate={{ x: 0 }}
       transition={{ type: 'spring', damping: 20 }}
     >
       {/* Template Form UI */}
     </motion.div>
   )}
   ```

4. Add back button in drawer header:
   ```tsx
   <DrawerHeader>
     {drawerView === 'form' && (
       <Button variant="ghost" onClick={() => setDrawerView('list')}>
         <ChevronLeft /> Kembali
       </Button>
     )}
     <DrawerTitle>
       {drawerView === 'list' ? 'Tambah Pengeluaran' : 'Buat Template Baru'}
     </DrawerTitle>
   </DrawerHeader>
   ```

**Expected Behavior**:
- Mobile only
- No Dialog-on-Drawer
- Smooth slide-in/slide-out animation
- Back button returns to template list

---

### **TUGAS 3: [UPGRADE GLOBAL] Sempurnakan Form "Buat Template"**

**File**: `/components/FixedExpenseTemplates.tsx`

#### **3A. Add Emoji/Icon Picker**

**Steps**:
1. Import emoji data:
   ```tsx
   import data from '@emoji-mart/data'
   import Picker from '@emoji-mart/react'
   ```

2. Add state:
   ```tsx
   const [selectedEmoji, setSelectedEmoji] = useState("")
   const [showEmojiPicker, setShowEmojiPicker] = useState(false)
   ```

3. Add UI (after "Nama Template", before "Warna Template"):
   ```tsx
   <div className="space-y-2">
     <Label>Pilih Ikon/Emoji</Label>
     <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
       <PopoverTrigger asChild>
         <Button variant="outline" className="w-full justify-start">
           {selectedEmoji || "Pilih emoji..."}
         </Button>
       </PopoverTrigger>
       <PopoverContent>
         <Picker data={data} onEmojiSelect={(e) => {
           setSelectedEmoji(e.native)
           setShowEmojiPicker(false)
         }} />
       </PopoverContent>
     </Popover>
   </div>
   ```

4. Update save handler to include `emoji`
5. Update `FixedExpenseTemplate` type:
   ```tsx
   export interface FixedExpenseTemplate {
     id: string
     name: string
     items: FixedExpenseItem[]
     color?: string
     emoji?: string // ← NEW!
   }
   ```

#### **3B. Add Category & Pocket Dropdowns to Items**

**Steps**:
1. Update `FixedExpenseItem` type:
   ```tsx
   export interface FixedExpenseItem {
     name: string
     amount: number
     category?: string // ← NEW!
     pocketId?: string // ← NEW!
   }
   ```

2. Import category constants:
   ```tsx
   import { EXPENSE_CATEGORIES } from '../types'
   ```

3. Accept new props in `FixedExpenseTemplates`:
   ```tsx
   interface FixedExpenseTemplatesProps {
     templates: FixedExpenseTemplate[]
     onAddTemplate: (name: string, items: FixedExpenseItem[], color?: string, emoji?: string) => void
     onUpdateTemplate: (id: string, name: string, items: FixedExpenseItem[], color?: string, emoji?: string) => void
     onDeleteTemplate: (id: string) => void
     pockets?: Array<{id: string; name: string; emoji?: string}> // ← NEW!
   }
   ```

4. Update item form UI:
   ```tsx
   {items.map((item, index) => (
     <div key={index} className="space-y-2 p-3 border rounded-md">
       <Input
         placeholder="Nama item"
         value={item.name}
         onChange={(e) => handleItemChange(index, "name", e.target.value)}
       />
       <Input
         type="text"
         inputMode="numeric"
         placeholder="Nominal"
         value={formatCurrencyInput(item.amount || "")}
         onChange={(e) => handleItemChange(index, "amount", parseCurrencyInput(e.target.value))}
       />
       
       {/* NEW: Category Dropdown */}
       <Select
         value={item.category || ""}
         onValueChange={(val) => handleItemChange(index, "category", val)}
       >
         <SelectTrigger>
           <SelectValue placeholder="Pilih kategori" />
         </SelectTrigger>
         <SelectContent>
           {EXPENSE_CATEGORIES.map(cat => (
             <SelectItem key={cat.id} value={cat.id}>
               {cat.emoji} {cat.label}
             </SelectItem>
           ))}
         </SelectContent>
       </Select>
       
       {/* NEW: Pocket Dropdown */}
       <Select
         value={item.pocketId || ""}
         onValueChange={(val) => handleItemChange(index, "pocketId", val)}
       >
         <SelectTrigger>
           <SelectValue placeholder="Pilih kantong" />
         </SelectTrigger>
         <SelectContent>
           {pockets?.map(pocket => (
             <SelectItem key={pocket.id} value={pocket.id}>
               {pocket.emoji} {pocket.name}
             </SelectItem>
           ))}
         </SelectContent>
       </Select>
       
       <Button
         type="button"
         variant="ghost"
         size="icon"
         onClick={() => handleRemoveItem(index)}
         disabled={items.length === 1}
       >
         <Trash2 className="size-4 text-destructive" />
       </Button>
     </div>
   ))}
   ```

5. Update validation in `handleSave`:
   ```tsx
   const validItems = items.filter(item => 
     item.name.trim() && 
     item.amount > 0 &&
     item.category && // ← Required!
     item.pocketId    // ← Required!
   )
   
   if (validItems.length === 0) {
     toast.error("Setiap item harus memiliki nama, nominal, kategori, dan kantong!")
     return
   }
   ```

**Expected Behavior**:
- Template now stores emoji
- Each item has category & pocket pre-selected
- When using template → auto-fill category & pocket for each expense item
- Validation ensures completeness

---

## 🔄 Data Migration

### **Backward Compatibility Requirements**:

**CRITICAL**: Existing templates must still work!

```tsx
// Old format (still supported):
{
  id: "template-1",
  name: "Ngantor",
  color: "#3b82f6",
  items: [
    { name: "Bensin", amount: 50000 },
    { name: "Parkir", amount: 5000 }
  ]
}

// New format:
{
  id: "template-1",
  name: "Ngantor",
  color: "#3b82f6",
  emoji: "🚗", // ← Optional for backward compat
  items: [
    { 
      name: "Bensin", 
      amount: 50000,
      category: "transportasi", // ← Optional for backward compat
      pocketId: "pocket-sehari-hari" // ← Optional for backward compat
    }
  ]
}
```

**Implementation**:
- All new fields are **OPTIONAL**
- Use safe access: `template.emoji ?? "📄"`
- Default category: `item.category ?? "lainnya"`
- Default pocket: `item.pocketId ?? pockets[0]?.id`

---

## 🧪 Testing Checklist

### **Desktop Tests**:
- [ ] Button [📄 Template] visible di header (desktop only)
- [ ] Klik button membuka modal Template Manager
- [ ] Modal berisi list templates + [+ Buat Template]
- [ ] Bisa create/edit/delete template dari modal
- [ ] Modal close tidak affect main app state

### **Mobile Tests**:
- [ ] Tab "Template" di drawer "Tambah Pengeluaran"
- [ ] Klik [+ Buat Template] → slide-in form (NO dialog!)
- [ ] Klik [< Kembali] → slide-out kembali ke list
- [ ] Animation smooth (spring damping)
- [ ] Form submission → kembali ke list otomatis

### **Form Upgrade Tests**:
- [ ] Emoji picker opens & works
- [ ] Selected emoji displayed in button
- [ ] Category dropdown per item works
- [ ] Pocket dropdown per item works
- [ ] Validation: reject incomplete items
- [ ] Saved template includes emoji + item details

### **Backward Compatibility Tests**:
- [ ] Old templates without emoji still work
- [ ] Old items without category/pocket still work
- [ ] Edit old template → add new fields → save works
- [ ] Mix of old/new templates in list displays correctly

---

## 📁 Files to Modify

### **Primary Files**:
1. `/App.tsx` - Desktop template manager button
2. `/components/AddExpenseDialog.tsx` - Mobile internal navigation
3. `/components/FixedExpenseTemplates.tsx` - Form upgrade (emoji + item fields)
4. `/types/index.ts` - Update `FixedExpenseTemplate` & `FixedExpenseItem` types

### **Supporting Files** (if needed):
- `/components/ui/popover.tsx` - For emoji picker
- `/utils/api.ts` - Template save/load (ensure backward compat)

---

## 🚨 Critical Notes

### **Accessibility**:
- Desktop modal: Must have `<DialogTitle>` & `aria-describedby={undefined}`
- Mobile drawer: Must have `<DrawerTitle>` (can use `sr-only` if visual title exists)
- Emoji picker: Ensure keyboard navigation works

### **Performance**:
- Lazy load emoji picker: `const Picker = lazy(() => import('@emoji-mart/react'))`
- Memoize template list rendering
- Debounce form input changes

### **UX Details**:
- Animation duration: 200-300ms (feels instant)
- Spring damping: 20 (not too bouncy)
- Back button: ChevronLeft icon + "Kembali" text
- Form validation: Show error toast with specific missing fields

---

## 📊 Success Criteria

✅ **Desktop**: Template Manager accessible from main UI (not hidden in FAB flow)  
✅ **Mobile**: No Dialog-on-Drawer conflicts, smooth internal navigation  
✅ **Form**: Complete template data (emoji + category/pocket per item)  
✅ **Compatibility**: Old templates still work without migration  
✅ **Performance**: No lag, animations smooth on low-end devices  
✅ **Accessibility**: All dialogs/drawers properly labeled  

---

## 🎯 Next Steps

1. **Review planning** dengan user
2. **Execute TUGAS 1** (Desktop entry point)
3. **Execute TUGAS 2** (Mobile internal navigation)
4. **Execute TUGAS 3** (Form upgrade)
5. **Testing & polish**
6. **Documentation update**

---

**Planning Complete** ✅  
**Ready for Implementation**: YES  
**Estimated Time**: 2-3 hours  
**Risk Level**: MEDIUM (requires careful state management for mobile navigation)
