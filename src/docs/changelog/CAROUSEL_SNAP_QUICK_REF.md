# 🎯 Carousel Snap Behavior - Quick Reference

**Status:** ✅ Complete | **Date:** Nov 7, 2025

---

## 🎯 What Changed

Pocket carousel sekarang **snap to card positions** saat di-scroll.

---

## 🔧 Configuration

**File:** `/components/PocketsSummary.tsx`

```typescript
<Carousel
  opts={{
    align: "start",
    loop: false,
    dragFree: false,           // ✅ Enable snap
    containScroll: "trimSnaps", // ✅ Trim edge snaps
    skipSnaps: false,           // ✅ All items snap
  }}
/>
```

---

## 📱 Behavior

**Before:**
- Card berhenti di posisi random
- Card terpotong saat scroll

**After:**
- Card selalu snap sempurna
- Smooth animation ke posisi snap
- Threshold otomatis (50% card width)

---

## ✅ Testing

```bash
# Scroll carousel → Should:
✓ Snap ke card terdekat
✓ Tidak ada card terpotong
✓ Smooth snap animation
✓ Works on mobile & desktop
```

---

**Full Docs:** `CAROUSEL_SNAP_BEHAVIOR.md`
