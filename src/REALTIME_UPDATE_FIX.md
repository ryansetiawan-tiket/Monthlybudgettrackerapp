# Fix: Realtime Update untuk Timeline Kantong dan Card Kantong

## Masalah yang Diperbaiki

### 1. Timeline tidak update setelah perubahan expense
Ketika user melakukan edit, hapus, atau operasi lain pada expense, timeline di setiap kantong tidak langsung ter-update.

### 2. Card kantong tidak update setelah transfer
Ketika transfer berhasil dilakukan, saldo di card kantong tidak ter-update secara realtime.

## Solusi yang Diimplementasikan

Menambahkan trigger refresh menggunakan `setPocketsRefreshKey(prev => prev + 1)` dan `loadPockets()` pada semua operasi yang mempengaruhi data kantong dan timeline.

## Perubahan pada `/App.tsx`

### State yang Digunakan
```tsx
const [pocketsRefreshKey, setPocketsRefreshKey] = useState(0);
```

State ini sudah ada sebelumnya dan digunakan sebagai key untuk component PocketsSummary:
```tsx
<PocketsSummary
  key={`pockets-${selectedYear}-${selectedMonth}-${pocketsRefreshKey}`}
  // ...props lainnya
/>
```

### Fungsi-fungsi yang Di-update

Semua fungsi berikut telah ditambahkan dengan:
1. `loadPockets()` - untuk reload balance data
2. `setPocketsRefreshKey(prev => prev + 1)` - untuk trigger re-render PocketsSummary dan refresh timeline

#### 1. **handleTransfer** ✅
Setelah transfer berhasil, card kantong dan timeline akan langsung update.

#### 2. **handleAddExpense** ✅
Setelah menambah expense, timeline akan menampilkan entry baru.

#### 3. **handleEditExpense** ✅  
Setelah edit expense, perubahan langsung terlihat di timeline.

#### 4. **handleDeleteExpense** ✅
Setelah hapus expense, entry akan hilang dari timeline.

#### 5. **handleBulkDeleteExpenses** ✅
Setelah bulk delete, semua entry yang dihapus akan hilang dari timeline.

#### 6. **handleAddIncome** ✅
Setelah menambah income (pemasukan tambahan), timeline akan update.

#### 7. **handleDeleteIncome** ✅
Setelah hapus income, timeline akan update.

#### 8. **handleUpdateIncome** ✅
Setelah edit income, timeline akan update dengan data terbaru.

#### 9. **handleMoveIncomeToExpense** ✅
Setelah memindahkan income ke expense, kedua timeline (kantong asal dan tujuan) akan update.

#### 10. **handleMoveExpenseToIncome** ✅
Setelah mengembalikan expense ke income, timeline akan update.

## Cara Kerja

### Flow Update Timeline:

1. **User melakukan action** (add/edit/delete expense/income/transfer)
2. **Server di-update** via API call
3. **Local state di-update** (expenses, additionalIncomes, balances)
4. **Cache di-invalidate** via `invalidateCache()`
5. **Balances di-reload** via `loadPockets()`
6. **Refresh key di-increment** via `setPocketsRefreshKey(prev => prev + 1)`
7. **React re-render PocketsSummary** karena key berubah
8. **PocketsSummary fetch ulang data** termasuk timeline entries
9. **Timeline ter-update** dengan data terbaru

### Mengapa Menggunakan Key-based Refresh?

Dengan menggunakan key yang berubah, React akan:
- Unmount komponen PocketsSummary yang lama
- Mount komponen PocketsSummary yang baru
- Trigger semua useEffect di PocketsSummary, termasuk `fetchPockets()`
- PocketTimeline juga akan di-remount dan fetch data terbaru

Ini lebih reliable daripada hanya mengandalkan props changes atau manual refresh.

## Testing Checklist

### Timeline Update
- [x] Tambah expense → Timeline langsung menampilkan entry baru
- [x] Edit expense → Timeline langsung update dengan data baru
- [x] Hapus expense → Entry hilang dari timeline
- [x] Bulk delete expense → Semua entry terhapus dari timeline
- [x] Transfer antar kantong → Timeline kedua kantong update

### Balance Update  
- [x] Transfer → Card kantong menampilkan saldo terbaru
- [x] Tambah expense → Saldo kantong berkurang
- [x] Hapus expense → Saldo kantong bertambah
- [x] Tambah income → Saldo kantong bertambah
- [x] Hapus income → Saldo kantong berkurang

### Move Operations
- [x] Move income to expense → Timeline update di kedua kantong
- [x] Move expense to income → Timeline update di kedua kantong

## Catatan Teknis

### Performance Consideration
Setiap kali `pocketsRefreshKey` berubah, seluruh PocketsSummary component akan di-remount. Ini optimal karena:

1. **Data consistency**: Memastikan semua data (balance, timeline, pockets) 100% sinkron
2. **Prefetch timeline**: Timeline entries di-prefetch saat fetch pockets, jadi tidak ada double fetch
3. **Minimal re-renders**: Hanya PocketsSummary yang re-mount, bukan seluruh App

### Alternative Approaches (Tidak Digunakan)

#### ❌ Props-based update
```tsx
<PocketsSummary refreshTrigger={pocketsRefreshKey} />
```
Kurang reliable karena component mungkin tidak detect props change dengan benar.

#### ❌ Callback-based refresh
```tsx
onRefresh={() => fetchPockets()}
```
Memerlukan additional prop passing dan manual management.

#### ✅ Key-based remount (YANG DIGUNAKAN)
```tsx
<PocketsSummary key={`pockets-${year}-${month}-${refreshKey}`} />
```
Paling reliable dan simple, React automatically handle lifecycle.

## Status
✅ **COMPLETE** - Semua fungsi yang mempengaruhi timeline dan balance sudah di-update dengan refresh trigger.

## Tanggal
5 November 2025
