# Pockets System - Planning Documentation

## Overview
Sistem "Kantong" (Pockets) adalah fitur untuk mengelola multiple saldo yang terpisah dalam satu aplikasi budget tracking. User dapat mengalokasikan dana ke berbagai kantong dan melacak pengeluaran dari setiap kantong secara terpisah.

## Filosofi
- **Budget Awal** = Uang untuk kebutuhan sehari-hari (essentials)
- **Pemasukan Tambahan** = Uang dingin untuk hobby/non-essentials
- **Custom Pockets (Future)** = Kantong virtual untuk goals spesifik (tabungan, emergency fund, dll)

## Implementation Phases

### Phase 1: Fixed Pockets (Current Sprint)
**Status**: 🔨 Planning
**Target**: Implementasi 2 kantong tetap

Fitur:
- ✅ 2 kantong fixed: "Sehari-hari" & "Uang Dingin"
- ✅ Summary section di atas tabs menampilkan saldo kedua kantong
- ✅ Expense bisa pilih dari kantong mana
- ✅ Transfer antar kantong
- ✅ Timeline view per kantong
- ✅ Breakdown saldo (asli vs transfer)

### Phase 1.5: Extended Features ⭐ NEW
**Status**: 🎯 Planning
**Target**: Before Phase 2

Fitur:
- ✅ Carry Over per kantong (automatic)
- ✅ Archive/Delete kantong custom (balance must be 0)
- ✅ Wishlist & Budget Simulation per pocket

### Phase 2: Custom Pockets (Future)
**Status**: 📋 Roadmap
**Target**: TBD

Fitur:
- User bisa create/edit/delete kantong custom
- Transfer multi-source (dari beberapa kantong sekaligus)
- Pocket goals & target
- Visualisasi alokasi dana

## Documentation Structure

1. **[Concept Overview](./01-concept-overview.md)** - Konsep dasar dan use cases
2. **[Phase 1 Implementation](./02-phase1-implementation.md)** - Detail implementasi phase 1
3. **[Data Structure](./03-data-structure.md)** - Database schema dan TypeScript types
4. **[UI/UX Design](./04-ui-ux-design.md)** - Mockups dan user flow
5. **[Phase 2 Roadmap](./05-phase2-roadmap.md)** - Future enhancements
6. **[Extended Features](./06-extended-features.md)** - Carry Over, Archive, & Wishlist ⭐ NEW
7. **[Implementation Roadmap](./07-implementation-roadmap.md)** - Timeline & milestones ⭐ NEW
8. **[Quick Reference](./QUICK_REFERENCE.md)** - Cheatsheet untuk developer

## Key Decisions

### Architecture
- **Scalable from Day 1**: Struktur data dirancang untuk support custom pockets di masa depan
- **Backward Compatible**: Phase 1 implementation harus bisa di-upgrade ke Phase 2 tanpa migration data

### User Experience
- **Timeline-based View**: Opsi B dipilih - chronological timeline per pocket
- **Visual Clarity**: Clear distinction antara saldo asli vs transfer
- **Progressive Disclosure**: Advanced features (custom pockets) di-hide sampai user ready

## Related Files

### Components to be Created/Modified
- `PocketsSummary.tsx` - Summary card di atas tabs (NEW)
- `PocketTimeline.tsx` - Timeline view per pocket (NEW)
- `TransferDialog.tsx` - Dialog untuk transfer antar kantong (NEW)
- `AddExpenseDialog.tsx` - Tambah field pilihan kantong (MODIFY)
- `ExpenseList.tsx` - Show pocket info di setiap expense (MODIFY)
- `BudgetOverview.tsx` - Integration dengan pockets summary (MODIFY)

### Backend/Server
- `kv_store.tsx` - Add pockets data structure (MODIFY)
- New endpoints: transfer, pocket timeline, pocket balance

## Migration Strategy

### From Current to Phase 1
1. Semua existing budget awal → Kantong "Sehari-hari"
2. Semua existing pemasukan tambahan → Kantong "Uang Dingin"
3. Semua existing expenses → Default kantong "Sehari-hari"
4. Add migration flag untuk backward compatibility

### From Phase 1 to Phase 2
1. Convert fixed pockets to database entries
2. Add pocket CRUD operations
3. Enable custom pocket creation

## Quick Start

Untuk mulai implementasi:
1. Baca [Concept Overview](./01-concept-overview.md) untuk memahami konsep
2. Review [Data Structure](./03-data-structure.md) untuk schema
3. Follow [Phase 1 Implementation](./02-phase1-implementation.md) step-by-step
4. Reference [UI/UX Design](./04-ui-ux-design.md) untuk mockups

## Questions & Decisions Log

**Q: Bagaimana user tahu pengeluaran menggunakan dana transfer?**
**A**: Timeline view - user bisa lihat kronologi: transfer masuk → pengeluaran terjadi

**Q: Apakah perlu tracking saldo asli vs transfer?**
**A**: Yes - breakdown ditampilkan di summary untuk transparansi

**Q: Bagaimana handle multi-currency di pockets?**
**A**: Phase 1: Semua dalam IDR. Phase 2: Consider multi-currency per pocket

**Q: Carry over otomatis atau manual?** ⭐ NEW
**A**: Otomatis - saat user akses bulan baru, carry over auto-generated dari bulan lalu

**Q: Archive kantong dengan balance > 0?** ⭐ NEW
**A**: Tidak - balance HARUS 0 dulu. User harus transfer dana ke kantong lain sebelum archive

**Q: Wishlist per pocket atau global?** ⭐ NEW
**A**: Per pocket - setiap kantong punya wishlist sendiri dengan simulasi budget

**Q: Simulation real-time atau separate view?** ⭐ NEW
**A**: Separate view - ada halaman khusus "Simulasi Budget" per kantong

---

**Last Updated**: November 5, 2025
**Contributors**: Planning Team
**Status**: Active Development
