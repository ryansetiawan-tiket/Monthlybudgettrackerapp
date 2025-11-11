# Template Emoji Storage Fix - Quick Reference

## 🐛 Bug
Emoji tidak tersimpan saat edit template → saat re-edit emoji hilang!

## 🔍 Root Cause
Backend **tidak load data lama** sebelum update → `kv.set()` REPLACE seluruh object, bukan merge!

## ✅ Fix Applied
**File:** `/supabase/functions/server/index.tsx` - PUT `/templates/:id`

```typescript
// ❌ BEFORE (Broken):
const templateData = {
  id, name, items,
  ...(emoji !== undefined && emoji !== "" ? { emoji } : {}),
};
await kv.set(key, templateData); // ⚠️ REPLACES entire object!

// ✅ AFTER (Fixed):
const existingTemplate = await kv.get(key); // 1. Load old data
const templateData = {
  ...(existingTemplate || {}),              // 2. Preserve all fields
  id, name, items,                          // 3. Override with new
  ...(emoji !== undefined && emoji !== "" ? { emoji } : {}),
  updatedAt: new Date().toISOString(),
};
if (emoji === "") delete templateData.emoji; // 4. Explicit clear
await kv.set(key, templateData);             // 5. Save merged data
```

## 🧪 Quick Test
1. Create template "Test" with emoji 🚗
2. Edit → change emoji to 🏢 → Save
3. Re-edit → emoji 🏢 masih ada? ✅
4. Database preserve `createdAt`? ✅

## 💡 Key Lesson
**KV Store `set()` = REPLACE, NOT merge!**

Always use Load-Merge-Set pattern:
```typescript
const existing = await kv.get(key);
await kv.set(key, { ...existing, ...updates });
```

## 🎯 Status
✅ FIXED - Emoji now persists correctly!
