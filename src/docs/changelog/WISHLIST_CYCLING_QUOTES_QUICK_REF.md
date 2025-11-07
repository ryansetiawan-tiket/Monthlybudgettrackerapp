# 🎭 Wishlist Cycling Quotes - Quick Reference

## TL;DR

**What**: Wishlist simulation sekarang punya 60 quotes kocak yang ganti-ganti setiap drawer dibuka!  
**Why**: Bikin lebih fun & engaging, match tone App Header  
**How**: Random quote per state, cycling via quoteKey increment

---

## 🎯 The 3 States

### 1️⃣ **Shortage** (Kurang Dana) 😅
**When**: `currentBalance < totalWishlist`  
**Tone**: Encouraging tapi lucu  
**Example**: *"Budget masih ngos-ngosan Rp 50.000. Nabung dulu gas poll! 🏃‍♂️💨"*

### 2️⃣ **Affordable** (Bisa Beli Semua!) 🎉
**When**: `currentBalance >= totalWishlist`  
**Tone**: Celebratory, hype AF  
**Example**: *"Jackpot! Semua wishlist dalam jangkauan. Let's gooo! 🚀💰"*

### 3️⃣ **Empty** (Belum Ada Wishlist) 📭
**When**: `wishlist.length === 0`  
**Tone**: Playful nudge  
**Example**: *"Blank canvas detected! Paint your dreams here! 🎨"*

**Total**: 20 quotes × 3 states = **60 unique quotes**! 🎭

---

## 🔄 How It Works

```
Open Drawer → Component mounts → quoteKey++ → New random quote! ✨
```

**Code**:
```typescript
// Auto-increment on mount
useEffect(() => {
  setQuoteKey(prev => prev + 1);
}, []);

// Quote updates when quoteKey changes
const randomQuote = useMemo(() => {
  return getRandomWishlistQuote(state, shortage);
}, [state, shortage, quoteKey]); // ← quoteKey dependency!
```

---

## 📁 Files

### **Created**
- `/data/wishlist-quotes.ts` - 60 quotes + helpers

### **Modified**
- `/components/WishlistSimulation.tsx`
  - Import `getRandomWishlistQuote`
  - Add `quoteKey` state
  - useEffect increment on mount
  - Update SummaryHeader
  - Update empty state

---

## 🧪 Quick Test

```
1. Open wishlist drawer → Note the quote
2. Close drawer
3. Open again → Should see DIFFERENT quote
4. Repeat 3x → All should be different! ✅
```

---

## 💡 Quote Style

**Pattern**: `[Situasi lucu] + [Emoji relevant]`

**Examples**:
```
✅ "Dompet bilang: 'Boss, Rp 50.000 lagi ya!' Oke, challenge accepted! 🔥"
✅ "Sultan mode: ACTIVATED. Wishlist mode: COMPLETE! 🤴✨"
✅ "Kosong tapi penuh harapan! Isi sekarang yuk! 💝"

❌ "Saldo Anda tidak mencukupi untuk membeli semua item." (too formal!)
❌ "Uang kurang." (too boring!)
```

---

## 🎨 Tone Match

**App Header Style**:
- 🇮🇩 Casual Indonesia
- 😅 Self-deprecating
- 💯 Super relatable
- 🎭 Contradiction humor

**Wishlist Quotes**: ✅ SAME VIBE!

---

## 📊 Coverage

| State | Quotes | Emoji Vibe | Feel |
|-------|--------|------------|------|
| Shortage | 20 | 😅💪🏃 | "You got this!" |
| Affordable | 20 | 🎉🛒👑 | "Let's gooo!" |
| Empty | 20 | ✨💭🎯 | "Come on, add!" |

---

## 🚀 Result

**Before**: Same boring message setiap waktu  
**After**: 60 unique kocak quotes, beda setiap open! 

**Fun Level**: 📈📈📈 STONKS!

---

**Date**: Nov 7, 2025  
**Status**: ✅ Complete  
**Kocak Level**: MAXIMUM 🔥
