# Mobile Bottom Navigation Bar - Refactor Planning

## 📋 Overview
Implementasi Bottom Navigation Bar untuk meningkatkan Clarity & Usability (CUCUD) pada versi MOBILE saja. Desktop layout TIDAK DIUBAH.

## 🎯 Goals
- ✅ Navigasi mobile yang jelas dengan 3 tab utama
- ✅ Mempertahankan semua fitur existing
- ✅ Meningkatkan user experience dengan dedicated screens

---

## 📦 TUGAS 1: Bottom Navigation Bar Component

### File Baru
- `/components/BottomNavigationBar.tsx`

### Spesifikasi
- **Position**: Fixed bottom, mobile only (`md:hidden`)
- **Height**: 64px (h-16)
- **Background**: White dengan shadow
- **3 Tombol**:
  1. 🏠 Home (Dashboard)
  2. 💰 Kantong (Pockets)
  3. 📅 Kalender (Calendar)

### Props Interface
```typescript
interface BottomNavigationBarProps {
  activeTab: 'home' | 'pockets' | 'calendar';
  onTabChange: (tab: 'home' | 'pockets' | 'calendar') => void;
}
```

### Design
- Active tab: Primary color + label
- Inactive tab: Gray + label
- Smooth transition pada tab switch
- Safe area padding untuk iOS

---

## 📦 TUGAS 2: Refactor Tab 1 (Home/Dashboard)

### Target File
- `/App.tsx`

### Konten (WAJIB - TIDAK BOLEH HILANG)
Layout vertikal lengkap:
1. ✅ Card Total Pemasukan/Pengeluaran
2. ✅ Card Sisa Budget (dengan toggle icon)
3. ✅ Section Ringkasan Kantong (carousel) - **HIDDEN by default**
4. ✅ Section Daftar Transaksi (tabs Pengeluaran/Pemasukan, search, filter)

### Logic Toggle (EXISTING - PASTIKAN TETAP BERFUNGSI)
- `showPockets` state (localStorage persisted)
- Click card Sisa Budget → toggle `showPockets`
- Chevron icon rotasi sesuai state

### Action Items
- [x] Wrap existing dashboard content dalam conditional render `{activeTab === 'home' && (...)}`
- [x] Pastikan semua state dan logic tetap berfungsi
- [x] Verify toggle Ringkasan Kantong masih works

---

## 📦 TUGAS 3: Tab 2 Baru (Kantong/Pockets)

### File Baru
- `/components/PocketsTabView.tsx`

### Layout
- **Grid 2-Column**: `grid grid-cols-2 gap-4`
- **Compact Cards**: Smaller version of existing pocket cards
- **Scrollable**: Full height dengan padding bottom untuk nav bar

### Content Per Card
- Emoji icon (large)
- Pocket name
- Balance amount
- Small progress indicator (optional)

### Interaksi
- **Tap card** → Open Timeline Drawer (existing logic)
- **Long press** → Context menu (edit/archive) - **OPTIONAL phase 2**

### Props Interface
```typescript
interface PocketsTabViewProps {
  pockets: Pocket[];
  balances: Record<string, number>;
  onPocketClick: (pocketId: string) => void;
  currentMonth: string;
  currentYear: number;
}
```

### Action Items
- [x] Extract pocket display logic dari PocketsSummary
- [x] Create new grid layout component
- [x] Connect to existing Timeline Drawer logic
- [x] Add proper spacing untuk bottom nav bar (pb-20)

---

## 📦 TUGAS 4: Tab 3 (Kalender Migration)

### Target Files
- `/App.tsx` - Remove calendar icon from mobile header
- `/components/CalendarView.tsx` - Keep as is

### Migration Steps
1. **Remove**: Calendar icon button dari header mobile
   - Line dengan `setShowCalendarView(true)`
   - Icon button di absolute top-right header mobile
   
2. **Move**: CalendarView render ke tab 3
   - Conditional render: `{activeTab === 'calendar' && <CalendarView ... />}`
   
3. **Verify**: Alur "Tap Day → Drawer" masih berfungsi

### Action Items
- [x] Remove calendar button dari mobile header (Line ~1479)
- [x] Add CalendarView ke tab 3 render
- [x] Verify `showDayDrawer` state masih works
- [x] Test interaction flow

---

## 🔧 State Management Changes

### New State di App.tsx
```typescript
const [activeTab, setActiveTab] = useState<'home' | 'pockets' | 'calendar'>('home');
```

### Persist to localStorage (OPTIONAL)
```typescript
// Save last active tab
useEffect(() => {
  localStorage.setItem('mobile-active-tab', activeTab);
}, [activeTab]);
```

---

## 🎨 Layout Considerations

### Bottom Padding Adjustment
All scrollable content MUST have `pb-20` (80px) untuk avoid content tertutup bottom nav bar.

### FAB Position
FAB sudah di `bottom-26` (104px). Dengan bottom nav 64px, jarak FAB dari nav bar = 40px. **PERFECT, no change needed**.

### Hide Bottom Nav When?
- ❌ TIDAK perlu hide saat scroll (selalu visible)
- ❌ TIDAK perlu hide saat dialog open
- ✅ HANYA mobile (`md:hidden`)

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- ✅ Show Bottom Navigation Bar
- ✅ Hide desktop sidebar/multi-column
- ✅ Single column layout per tab

### Desktop (≥ 768px)
- ❌ Hide Bottom Navigation Bar
- ✅ Show existing multi-column layout
- ✅ NO CHANGES to desktop

---

## ✅ Testing Checklist

### Tab 1 (Home)
- [ ] All cards visible
- [ ] Toggle Ringkasan Kantong works
- [ ] Transaction list scrollable
- [ ] Search & filter works
- [ ] FAB actions work

### Tab 2 (Pockets)
- [ ] Grid layout 2 columns
- [ ] All pockets displayed
- [ ] Tap pocket → Timeline drawer
- [ ] Scrollable content
- [ ] Balance amounts correct

### Tab 3 (Calendar)
- [ ] Calendar renders correctly
- [ ] Tap day → Drawer opens
- [ ] Drawer shows correct transactions
- [ ] No calendar icon in header
- [ ] Month navigation works

### Bottom Nav
- [ ] Active tab highlighted
- [ ] Smooth transitions
- [ ] Persists across actions
- [ ] Fixed position stable
- [ ] Icons + labels clear

---

## 📂 File Structure Summary

```
/components/
  ├── BottomNavigationBar.tsx    [NEW]
  ├── PocketsTabView.tsx         [NEW]
  ├── CalendarView.tsx           [EXISTING - No change]
  ├── PocketsSummary.tsx         [EXISTING - Keep for Tab 1]
  └── ...

/App.tsx                         [MODIFIED]
  - Add activeTab state
  - Add tab switching logic
  - Conditional render per tab
  - Remove calendar icon mobile
  - Add BottomNavigationBar component

/planning/mobile-bottom-nav-refactor-v2-final/
  └── PLANNING.md                [THIS FILE]
```

---

## 🚀 Implementation Order

1. ✅ Create `/components/BottomNavigationBar.tsx`
2. ✅ Add state & bottom nav to `App.tsx`
3. ✅ Wrap Tab 1 content (existing dashboard)
4. ✅ Create `/components/PocketsTabView.tsx`
5. ✅ Move CalendarView to Tab 3
6. ✅ Remove old calendar icon
7. ✅ Test all interactions
8. ✅ Verify desktop unchanged

---

## ⚠️ Important Notes

1. **Desktop MUST NOT change** - All changes `md:hidden` atau dalam mobile conditional
2. **Backward compatibility** - All existing features must work
3. **State preservation** - Toggle states must persist across tab switches
4. **Performance** - Lazy load tab content if needed (Phase 2)
5. **Accessibility** - Proper ARIA labels for nav buttons

---

## 🎯 Success Criteria

✅ Bottom nav visible dan functional di mobile
✅ 3 tab berfungsi dengan content yang benar
✅ Semua fitur existing tetap bekerja
✅ Desktop layout 100% unchanged
✅ No regresi bugs
✅ Smooth transitions & UX
