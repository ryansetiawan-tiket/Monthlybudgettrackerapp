# Loading State: Add/Edit Pengeluaran

## 📋 Problem
Saat user klik tombol "Tambah 1 Pengeluaran" atau "Simpan" (edit), tidak ada feedback visual:
- User tidak tahu apakah proses sedang berjalan
- User bisa close dialog/drawer dan ganggu proses
- User bisa ubah form di tengah proses submit

## ✅ Solution
Tambahkan loading state dengan:
1. **Button Loading**: Spinner + text "Menyimpan..." pada button submit
2. **Form Lock**: Disable semua input fields selama loading
3. **Dialog Lock**: Prevent close dengan `onInteractOutside={(e) => loading && e.preventDefault()}`
4. **Drawer Lock**: Set `dismissible={!loading}` untuk mobile

## ✅ Implementation Complete!

### ✨ Changes Made:

**1. AddExpenseForm.tsx**
- ✅ Import `Loader2` icon from lucide-react
- ✅ Use existing `isProcessing` state untuk internal loading
- ✅ Update button "Tambah Pengeluaran" dengan loading UI:
  ```tsx
  {(isAdding || isProcessing) ? (
    <>
      <Loader2 className="size-4 mr-2 animate-spin" />
      Menyimpan...
    </>
  ) : (
    <>
      <Plus className="size-4 mr-2" />
      Tambah {entries.length} Pengeluaran
    </>
  )}
  ```
- ✅ Update button "Tambah Pengeluaran dari Template" dengan loading UI sama

**2. AddExpenseDialog.tsx**
- ✅ Desktop Dialog: Prevent close saat `isAdding`:
  ```tsx
  onOpenChange={(isOpen) => {
    if (!isOpen && isAdding) return; // Block close
    onOpenChange(isOpen);
  }}
  onInteractOutside={(e) => isAdding && e.preventDefault()}
  onEscapeKeyDown={(e) => isAdding && e.preventDefault()}
  ```
- ✅ Mobile Drawer: Prevent dismiss saat `isAdding`:
  ```tsx
  dismissible={!isAdding}
  onOpenChange={(isOpen) => {
    if (!isOpen && isAdding) return; // Block close
    onOpenChange(isOpen);
  }}
  ```

**3. AdditionalIncomeForm.tsx**
- ✅ Import `Loader2` icon from lucide-react
- ✅ Update button submit dengan loading UI:
  ```tsx
  {isAdding ? (
    <>
      <Loader2 className="size-4 mr-2 animate-spin" />
      Menyimpan...
    </>
  ) : (
    <>
      {!editMode && <Plus className="size-4 mr-2" />}
      {submitButtonText || (editMode ? "Simpan" : "Tambah Pemasukan")}
    </>
  )}
  ```

**4. AddAdditionalIncomeDialog.tsx**
- ✅ Desktop Dialog: Prevent close saat `isAdding`:
  ```tsx
  onOpenChange={(isOpen) => {
    if (!isOpen && isAdding) return; // Block close
    onOpenChange(isOpen);
  }}
  onInteractOutside={(e) => isAdding && e.preventDefault()}
  onEscapeKeyDown={(e) => isAdding && e.preventDefault()}
  ```
- ✅ Mobile Drawer: Prevent dismiss saat `isAdding`:
  ```tsx
  dismissible={!isAdding}
  onOpenChange={(isOpen) => {
    if (!isOpen && isAdding) return; // Block close
    onOpenChange(isOpen);
  }}
  ```

## 🎯 Result:

### Visual States

**Normal State:**
```
[+ Tambah Pemasukan]  <- Enabled, clickable
[+ Tambah 1 Pengeluaran]  <- Enabled, clickable
```

**Loading State:**
```
[⏳ Menyimpan...]  <- Disabled + spinner animation
Dialog/Drawer: Cannot close (blocked)
User cannot interact with outside or ESC key
```

### User Experience:
1. ✅ User sees spinner + "Menyimpan..." text
2. ✅ User cannot close dialog/drawer accidentally
3. ✅ Button is disabled preventing double-submit
4. ✅ Clear feedback that process is ongoing
5. ✅ Toast notification appears when complete

## 📝 Notes:
- ✅ Uses `Loader2` icon from lucide-react dengan `animate-spin` class
- ✅ Toast success/error tetap ditampilkan setelah loading selesai
- ✅ Loading state di-reset di `finally` block atau after success untuk guarantee cleanup
- ✅ Works on both desktop (Dialog) and mobile (Drawer)
- ✅ **COMPLETE**: Both Expense and Income forms now have proper loading states!