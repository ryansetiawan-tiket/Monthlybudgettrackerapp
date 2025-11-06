# Circular Reference Error Fix

## 🐛 Error
```
TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'HTMLButtonElement'
    at App.tsx:1691:24 in onTransferClick
```

## 🔍 Root Cause

### Problem 1: Console.log with Event Object
Di `App.tsx` line 1691, ada console.log yang mencoba stringify object yang berisi circular reference:

```tsx
onTransferClick={(fromPocket, toPocket) => {
  console.log('onTransferClick called with:', { fromPocket, toPocket });
  // ❌ fromPocket/toPocket bisa berisi event object dengan circular refs
}}
```

### Problem 2: Direct onClick Callback
Di `PocketsSummary.tsx` line 322, button onClick langsung reference function tanpa wrapper:

```tsx
<Button onClick={onTransferClick} />
// ❌ Event object diteruskan sebagai parameter pertama
```

Ketika button diklik, browser memanggil `onTransferClick(event)`, dimana `event` adalah HTMLButtonElement dengan circular reference.

## ✅ Solution

### 1. Remove Problematic Console.log
```tsx
// ❌ Before
onTransferClick={(fromPocket, toPocket) => {
  console.log('onTransferClick called with:', { fromPocket, toPocket });
  setDefaultFromPocket(fromPocket);
  // ...
}}

// ✅ After
onTransferClick={(fromPocket, toPocket) => {
  setDefaultFromPocket(fromPocket);
  setDefaultToPocket(toPocket);
  setIsTransferDialogOpen(true);
}}
```

### 2. Wrap onClick with Arrow Function
```tsx
// ❌ Before - event object diteruskan
<Button onClick={onTransferClick} />

// ✅ After - call tanpa parameter
<Button onClick={() => onTransferClick()} />
```

### 3. Clean Up Similar Patterns
Diterapkan pattern yang sama di semua callback untuk konsistensi:

```tsx
// ✅ Safe pattern
<Button onClick={() => callback?.()} />
<Button onClick={() => callback(arg1, arg2)} />
```

## 📁 Files Fixed

1. **App.tsx** - Removed console.log with potential circular refs
2. **TransferDialog.tsx** - Removed console.log with potential circular refs  
3. **PocketsSummary.tsx** - Fixed 2 onClick handlers:
   - Transfer button: `onClick={onTransferClick}` → `onClick={() => onTransferClick()}`
   - Manage button: `onClick={onManagePocketsClick}` → `onClick={() => onManagePocketsClick?.()}`
4. **BudgetOverview.tsx** - Fixed 2 onClick handlers:
   - Toggle pockets: `onClick={onTogglePockets}` → `onClick={() => onTogglePockets?.()}`
   - Settings: `onClick={onOpenBudgetSettings}` → `onClick={() => onOpenBudgetSettings()}`
5. **ExpenseList.tsx** - Fixed exclude lock toggle:
   - `onClick={onToggleExcludeLock}` → `onClick={() => onToggleExcludeLock()}`
6. **AdditionalIncomeList.tsx** - Fixed exclude lock toggle:
   - `onClick={onToggleExcludeLock}` → `onClick={() => onToggleExcludeLock()}`

## 🎯 Impact

### Before:
- ❌ App crashes when clicking Transfer button
- ❌ Console error: "Converting circular structure to JSON"
- ❌ Event objects potentially logged to console

### After:
- ✅ Transfer button works correctly
- ✅ No circular reference errors
- ✅ Clean console output
- ✅ All callbacks called with correct parameters
- ✅ Optional chaining prevents undefined errors

## 🛡️ Best Practices

### ✅ DO:
```tsx
// Always wrap callbacks in arrow functions
<Button onClick={() => handleClick()} />
<Button onClick={() => handleClick(id, name)} />

// Use optional chaining for optional callbacks
<Button onClick={() => onCallback?.()} />

// Log only primitives or safe objects
console.log('Action completed:', id, status);
```

### ❌ DON'T:
```tsx
// Don't pass callback directly (event will be first param)
<Button onClick={handleClick} />

// Don't log objects that might have circular refs
console.log('Event:', event); // ❌
console.log('Element:', element); // ❌

// Don't assume callback parameters from event
onClick={(e) => callback(e.target)} // ❌ Unless you need the event
```

## 📝 Notes

1. **Event Objects**: HTML events contain circular references through their `target`, `currentTarget`, and React fiber properties
2. **Optional Chaining**: Using `?.()` prevents errors when callback is undefined
3. **Console Safety**: Only log primitives (strings, numbers, booleans) or plain data objects
4. **Arrow Functions**: Always wrap onClick callbacks to control parameters passed

## ✅ Testing

- [x] Transfer button works without errors
- [x] Manage Pockets button works
- [x] Toggle buttons work (Budget Overview, Exclude Lock)
- [x] No console errors
- [x] All dialogs open correctly
- [x] Parameters passed correctly to callbacks

---

**Status**: ✅ COMPLETE  
**Date**: 2025-11-05  
**Files Modified**: 6 total  
**Error Resolved**: Circular structure JSON error
