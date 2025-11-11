# Unknown Pocket Transfer - Quick Reference

## 🎯 Problem & Solution

**Problem**: Data transfer lama menunjukkan "Transfer ke Unknown Pocket"  
**Solution**: Tampilkan dengan styling khusus + label "Data lama dari sistem sebelumnya"

---

## 🔧 Changes Made

### Server (`/supabase/functions/server/index.tsx`)

```typescript
// Lines 1052-1100 (Transfer OUT & IN)

// ✅ NEW: Detect unknown pocket
const isUnknownPocket = !t.toPocketName && !toPocket;
const toPocketName = t.toPocketName || toPocket?.name || 'Kantong Lama (Tidak Aktif)';

metadata: {
  // ... existing
  isUnknownPocket: isUnknownPocket // ⚠️ New flag
}
```

### Frontend (`/components/PocketTimeline.tsx`)

```typescript
// Lines 408-415: Detection
const isUnknownPocket = entry.type === 'transfer' && entry.metadata?.isUnknownPocket;

// Lines 417-422: Styling
<div className={`... ${isUnknownPocket ? 'opacity-60' : ''}`}>
  <p className={`... ${isUnknownPocket ? 'text-muted-foreground' : ''}`}>
    {entry.description}
  </p>
  
  {/* Lines 438-444: Warning Badge */}
  {isUnknownPocket && (
    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
      <Info className="size-3" />
      <span>Data lama dari sistem sebelumnya</span>
    </p>
  )}
</div>
```

---

## 📸 Visual Result

### Before:
```
→ Transfer ke Unknown Pocket    -Rp 753.261
```

### After:
```
→ Transfer ke Kantong Lama (Tidak Aktif)    -Rp 753.261  (faded 60%)
  ⚠️ Data lama dari sistem sebelumnya (orange warning)
```

---

## 🧪 Quick Test

1. Open timeline dengan data transfer lama ✅
2. Cek "Kantong Lama (Tidak Aktif)" muncul ✅
3. Cek opacity 60% & warning badge orange ✅
4. Test dark mode (orange-400 color) ✅

---

## 📋 Key Points

| Aspect | Value |
|--------|-------|
| **Text** | "Kantong Lama (Tidak Aktif)" |
| **Opacity** | 60% (opacity-60) |
| **Warning Color** | Orange (600 light / 400 dark) |
| **Icon** | Info (size-3) |
| **Label** | "Data lama dari sistem sebelumnya" |
| **Flag** | `metadata.isUnknownPocket` |

---

## ✅ Complete!

- Server: Detects + flags unknown pockets
- Frontend: Displays with special styling
- User: Understands it's old data, not error

**Full Docs**: `/UNKNOWN_POCKET_TRANSFER_HANDLING.md`
