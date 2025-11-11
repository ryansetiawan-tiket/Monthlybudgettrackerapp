# UI Button Implementation - Re-kalkulasi Saldo Awal

**Date:** November 10, 2025  
**Status:** ✅ COMPLETE  
**Component:** `/components/PocketTimeline.tsx`

---

## 🎯 Overview

Added **one-click button** to regenerate December carry-over, fixing the Saldo Awal bug without requiring console scripts or API calls.

---

## 📍 Button Location

```
Timeline → 3-dots menu (⋮) → "Re-kalkulasi Saldo Awal"

Visual:
┌─────────────────────────────────────────┐
│ Timeline PayLater    [≡] [+] [⋮]       │ ← Click [⋮]
├─────────────────────────────────────────┤
│  Menu Dropdown:                         │
│  ┌───────────────────────────────────┐  │
│  │ Info Kantong                      │  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │ 🔄 Re-kalkulasi Saldo Awal        │  │ ← NEW BUTTON!
│  │    (blue, November 2025 only)     │  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │ Edit Kantong                      │  │
│  │ Hapus Kantong                     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## ✅ Changes Made

### 1. **State Management**

**File:** `/components/PocketTimeline.tsx` (Line 107)

```typescript
const [regenerating, setRegenerating] = useState(false);
```

### 2. **Handler Function**

**File:** `/components/PocketTimeline.tsx` (Lines 194-238)

```typescript
// ✅ NEW: Regenerate carry-over for next month (fix December Saldo Awal bug)
const handleRegenerateCarryOver = async () => {
  setRegenerating(true);
  try {
    const [year, month] = monthKey.split('-');
    
    const response = await fetch(`${baseUrl}/carryover/generate/${year}/${month}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to regenerate carry-over');
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Import toast dynamically
      const { toast } = await import('sonner@2.0.3');
      toast.success('✅ Saldo Awal bulan depan berhasil dikalkulasi ulang!', {
        description: 'Silakan cek Desember untuk melihat perubahan.'
      });
      
      // Close timeline and trigger refresh in parent
      onOpenChange(false);
      
      // Force page refresh after short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    const { toast } = await import('sonner@2.0.3');
    toast.error('❌ Gagal mengkalkulasi ulang', {
      description: error instanceof Error ? error.message : 'Terjadi kesalahan'
    });
  } finally {
    setRegenerating(false);
  }
};
```

### 3. **Icon Import**

**File:** `/components/PocketTimeline.tsx` (Line 4)

```typescript
import { ..., RefreshCw } from "lucide-react";
```

### 4. **UI Button (Dropdown Menu)**

**File:** `/components/PocketTimeline.tsx` (Lines 843-856)

```tsx
{/* ✅ UNIVERSAL CARRY-OVER V4: Regenerate button (November 2025 only) */}
{monthKey === '2025-11' && (
  <DropdownMenuItem
    onClick={(e) => {
      e.stopPropagation();
      handleRegenerateCarryOver();
    }}
    disabled={regenerating}
    className="text-blue-600 focus:text-blue-600"
  >
    <RefreshCw className={`size-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
    {regenerating ? 'Mengkalkulasi...' : 'Re-kalkulasi Saldo Awal'}
  </DropdownMenuItem>
)}
```

---

## 🎨 UI States

### State 1: Normal (Idle)
```
🔄 Re-kalkulasi Saldo Awal
   ↑ Blue text, clickable
```

### State 2: Loading
```
⟳ Mengkalkulasi...
  ↑ Spinning icon, disabled
```

### State 3: Success
```
Toast notification:
┌─────────────────────────────────────────┐
│ ✅ Saldo Awal bulan depan berhasil      │
│    dikalkulasi ulang!                   │
│                                         │
│ Silakan cek Desember untuk melihat     │
│ perubahan.                              │
└─────────────────────────────────────────┘

→ Timeline closes
→ Page refreshes after 1.5s
```

### State 4: Error
```
Toast notification:
┌─────────────────────────────────────────┐
│ ❌ Gagal mengkalkulasi ulang            │
│                                         │
│ [Error message]                         │
└─────────────────────────────────────────┘

→ Button re-enables
→ No page refresh
```

---

## 🔄 User Flow

```
1. User navigates to November 2025
   ↓
2. Opens any pocket timeline
   ↓
3. Clicks [⋮] menu button
   ↓
4. Sees "Re-kalkulasi Saldo Awal" (blue)
   ↓
5. Clicks button
   ↓
6. Button shows "Mengkalkulasi..." (spinning)
   ↓
7. Backend generates carry-over for December
   ↓
8. Success toast appears
   ↓
9. Timeline closes
   ↓
10. Page refreshes automatically
   ↓
11. User navigates to December
   ↓
12. Saldo Awal now shows correct value! ✅
```

---

## 🔧 Technical Details

### API Call
```
POST /carryover/generate/2025/11

Headers:
  Authorization: Bearer {publicAnonKey}

Response:
  { success: true, message: "..." }
```

### Backend Logic
1. Parses `2025-11` (current month)
2. Calculates next month: `2025-12`
3. For each active pocket:
   - Calculates November final balance using **projectedBalance**
   - Creates/overwrites December carry-over entry
4. Returns success

### Frontend Logic
1. Sets `regenerating = true` (loading state)
2. Makes POST request to backend
3. If success:
   - Shows success toast
   - Closes timeline
   - Refreshes page after 1.5s delay
4. If error:
   - Shows error toast
   - Button re-enables
5. Finally: Sets `regenerating = false`

---

## 🎯 Why This Works

### Problem:
- December carry-over was generated with OLD logic (`availableBalance`)
- Need to regenerate with NEW logic (`projectedBalance`)
- User can't run console scripts or API calls

### Solution:
- One-click button in UI
- Calls backend regeneration endpoint
- User-friendly with loading states and feedback
- Auto-refresh to show new data

### Result:
- Non-technical users can fix the bug
- No console/terminal knowledge needed
- Clear visual feedback throughout process
- Safe and idempotent operation

---

## ⚠️ Conditional Rendering

**Button ONLY shows when:**
```typescript
monthKey === '2025-11'
```

**Rationale:**
- Bug only affects December 2025 carry-over
- Generated from November 2025
- Future months use fixed logic automatically
- No need for button in other months

**Future Consideration:**
- Can remove condition to make button available for all months
- Useful for debugging or manual regeneration
- Currently scoped to November 2025 for simplicity

---

## 📊 Impact

### Before:
- User needs console script or API call
- Requires technical knowledge
- Error-prone (copy-paste mistakes)
- Poor UX

### After:
- One-click solution
- No technical knowledge needed
- Clear feedback at each step
- Professional UX

---

## 🧪 Testing Checklist

- [x] Button appears in November 2025
- [x] Button hidden in other months
- [x] Click shows loading state
- [x] Icon spins during loading
- [x] Button disabled during loading
- [x] Success shows toast
- [x] Success closes timeline
- [x] Success refreshes page
- [x] Error shows toast
- [x] Error re-enables button
- [x] Multiple clicks safe (disabled during loading)

---

## 📁 Files Modified

1. ✅ `/components/PocketTimeline.tsx`
   - Added state: `regenerating`
   - Added handler: `handleRegenerateCarryOver()`
   - Added icon import: `RefreshCw`
   - Added UI button in dropdown menu

---

## 🎉 User Instructions

**How to Use:**

1. **Navigate to November 2025**
2. **Open any pocket timeline** (e.g., PayLater)
3. **Click [⋮] menu** (top right)
4. **Click "Re-kalkulasi Saldo Awal"** (blue button with 🔄 icon)
5. **Wait for success toast**
6. **Page will refresh automatically**
7. **Navigate to December 2025**
8. **Verify Saldo Awal is now correct** ✅

That's it! No console, no API calls, no technical knowledge needed! 🎯

---

## 🔮 Future Enhancements

### Possible Improvements:

1. **Generalize for All Months**
   ```typescript
   // Remove condition:
   {/* monthKey === '2025-11' && */} // Remove this line
   ```

2. **Confirmation Dialog**
   ```tsx
   // Add confirm before regenerating
   const confirmed = await confirm({
     title: 'Re-kalkulasi Saldo Awal?',
     description: 'Ini akan mengkalkulasi ulang saldo awal bulan depan.'
   });
   
   if (confirmed) {
     handleRegenerateCarryOver();
   }
   ```

3. **Progress Indicator**
   ```tsx
   // Show which pockets are being processed
   toast.loading('Memproses 3 kantong...', { id: 'regen' });
   // Update: toast.success('Selesai!', { id: 'regen' });
   ```

4. **Undo Feature**
   ```tsx
   // Save old carry-over before overwriting
   // Allow user to revert if needed
   ```

---

## 📝 Summary

**What:** One-click button to fix December Saldo Awal bug  
**Where:** Timeline 3-dots menu (November 2025 only)  
**How:** Calls backend regeneration endpoint  
**Why:** User-friendly alternative to console scripts  
**Result:** December Saldo Awal matches November Saldo Proyeksi ✅

**Status:** ✅ IMPLEMENTED & READY TO USE!
