# 🏗️ KANTONG ARCHITECTURE FIX V3 - SAFE REFACTOR

**Status:** 📋 PLANNING COMPLETE - AWAITING APPROVAL  
**Risk Level:** 🔴 **CRITICAL**  
**Estimated Duration:** 3-5 sessions (1 fase per session)

---

## ⚠️ CRITICAL WARNING - READ FIRST

**INI ADALAH REFACTOR ARSITEKTUR CORE!**

Refactor ini menyentuh logic fundamental aplikasi yang menangani:
- ✋ Storage kantong (pocket persistence)
- ✋ Perhitungan saldo (balance calculation)
- ✋ Carry-over logic (month transitions)
- ✋ Timeline display (transaction history)

**JIKA SALAH → 100% DATA SALDO RUSAK! 🔥**

**Wajib baca sebelum mulai:**
1. 📖 [PLANNING.md](./PLANNING.md) - Rencana lengkap 3 fase
2. ⚠️ [BACKWARD_COMPATIBILITY_RULES.md](/guidelines/BACKWARD_COMPATIBILITY_RULES.md)
3. 🔒 [Guidelines.md](/guidelines/Guidelines.md)

---

## 📂 FILE STRUCTURE

```
/planning/kantong-architecture-fix-v3-safe/
├── README.md                    ← YOU ARE HERE
├── PLANNING.md                  ← MAIN PLANNING DOCUMENT (MUST READ!)
│
├── FASE_1_COMPLETE.md          ← Created after Fase 1 done
├── FASE_2_COMPLETE.md          ← Created after Fase 2 done
├── FASE_3_COMPLETE.md          ← Created after Fase 3 done
│
└── FINAL_VERIFICATION.md       ← Created after all phases complete
```

---

## 🎯 PROBLEM SUMMARY

### **Bug 1: Kantong "Hilang" Saat Bulan Berganti** ❌
**Symptom:**
- User membuat kantong "Investasi" di November
- Saat pindah ke Desember → Kantong HILANG
- Harus dibuat ulang setiap bulan

**Root Cause:** Kantong disimpan dengan key per-month (`pocket:2025-11:*`), bukan global.

---

### **Bug 2: Saldo Reset ke 0 Setiap Bulan** ❌
**Symptom:**
- November: Kantong "Uang Dingin" saldo Rp 500K
- Desember: Saldo jadi Rp 0 (harusnya carry over)

**Root Cause:** Tidak ada carry-over logic untuk Tipe 2 & 3.

---

### **Bug 3: Timeline Tidak Filter Per Bulan** ❌
**Symptom:**
- Buka Timeline Desember → Muncul transaksi Oktober, November, Desember (campur aduk)
- Harusnya HANYA transaksi Desember

**Root Cause:** Tidak ada filter `monthKey` di query timeline.

---

## 🚀 SOLUTION: 3 FASE IMPLEMENTATION

### **FASE 1: KANTONG PERSISTENCE** 🔧
**Goal:** Kantong permanen, tidak hilang saat bulan berganti

**Changes:**
- Backend: Global pocket registry (`pocket:global:*`)
- API: Update endpoints untuk fetch dari global
- Migration: One-time data migration

**Duration:** 1 session (~2 hours)  
**Risk:** Medium  
**Rollback:** Easy

**[Read Full Details in PLANNING.md](./PLANNING.md#fase-1-kantong-persistence-)**

---

### **FASE 2: CARRY-OVER LOGIC** 💰
**Goal:** Saldo carry-over akurat untuk semua tipe kantong

**Logic:**
- **Tipe 1 (Sehari-hari):** Saldo = Carry-over + Budget Baru ✅
- **Tipe 2 (Uang Dingin):** Saldo = Carry-over only ✅
- **Tipe 3 (Custom):** Saldo = Carry-over only ✅

**Changes:**
- Backend: Refactor `calculatePocketBalance()`
- Backend: Auto-generate carry-over on month navigation
- Auto-trigger: On first access of new month

**Duration:** 1-2 sessions (~3 hours)  
**Risk:** HIGH  
**Rollback:** Medium difficulty

**[Read Full Details in PLANNING.md](./PLANNING.md#fase-2-carry-over-logic-)**

---

### **FASE 3: TIMELINE UI REFACTOR** 🎨
**Goal:** Timeline clean, filter per bulan, tampilkan "Saldo Awal"

**Changes:**
- Backend: Filter timeline by `monthKey`
- Backend: Add "Saldo Awal" entry at top
- Frontend: Special styling untuk initial balance
- UX: Badge "Saldo Awal", breakdown display

**Duration:** 1 session (~2 hours)  
**Risk:** Low  
**Rollback:** Easy

**[Read Full Details in PLANNING.md](./PLANNING.md#fase-3-timeline-ui-refactor-)**

---

## 📋 EXECUTION WORKFLOW

### **Before Starting:**
1. ✅ Read [PLANNING.md](./PLANNING.md) in full (MANDATORY!)
2. ✅ Backup all production data
3. ✅ Test on staging environment first
4. ✅ Have rollback scripts ready

### **During Implementation:**
1. **Implement FASE 1**
   - Follow steps in PLANNING.md
   - Complete all verification steps
   - Create FASE_1_COMPLETE.md
   - ⚠️ DO NOT proceed to Fase 2 until Fase 1 verified!

2. **Implement FASE 2**
   - Follow steps in PLANNING.md
   - Complete all verification steps
   - Create FASE_2_COMPLETE.md
   - ⚠️ DO NOT proceed to Fase 3 until Fase 2 verified!

3. **Implement FASE 3**
   - Follow steps in PLANNING.md
   - Complete all verification steps
   - Create FASE_3_COMPLETE.md

4. **Final Verification**
   - Run end-to-end tests (in PLANNING.md)
   - Test all edge cases
   - Create FINAL_VERIFICATION.md

### **After Completion:**
1. ✅ Monitor error logs
2. ✅ Watch user feedback
3. ✅ Update documentation
4. ✅ Archive old code

---

## ✅ VERIFICATION REQUIREMENTS

**Each fase MUST pass these checks:**

### **FASE 1:**
- [ ] Kantong tetap ada saat bulan berganti
- [ ] Kantong tidak hilang saat saldo = 0
- [ ] Archive/delete works correctly
- [ ] No regressions in existing features

### **FASE 2:**
- [ ] Tipe 1: Saldo = Carry-over + Budget Baru
- [ ] Tipe 2: Saldo = Carry-over only
- [ ] Tipe 3: Saldo = Carry-over only
- [ ] Auto-generation works on month navigation
- [ ] No calculation errors

### **FASE 3:**
- [ ] Timeline filtered per month
- [ ] "Saldo Awal" displayed correctly
- [ ] Running balance accurate
- [ ] Mobile responsive
- [ ] No display bugs

---

## 🚨 EMERGENCY PROCEDURES

### **If Major Issues Occur:**

1. **STOP IMMEDIATELY** ✋
   - Don't proceed to next fase
   - Don't try to "fix quickly"

2. **Assess Damage** 🔍
   - Check error logs
   - Test with real data
   - Document what went wrong

3. **Execute Rollback** ⏮️
   - Use rollback scripts in PLANNING.md
   - Restore from backup if needed
   - Verify rollback successful

4. **Post-Mortem** 📝
   - Document root cause
   - Update planning document
   - Fix issues before retry

### **Emergency Contacts:**
- **AI Code Agent:** Available for debugging
- **Planning Document:** [PLANNING.md](./PLANNING.md) has rollback scripts
- **Backup Location:** (specify your backup location)

---

## 📊 SUCCESS CRITERIA

### **Must Have (P0):**
- ✅ Kantong tidak hilang saat bulan berganti
- ✅ Saldo carry-over akurat untuk semua tipe
- ✅ Timeline filter per bulan
- ✅ No data loss
- ✅ No regression in existing features

### **Should Have (P1):**
- ✅ "Saldo Awal" entry di timeline
- ✅ Special styling for initial balance
- ✅ Auto-generate carry-over

### **Nice to Have (P2):**
- ⭕ Carry-over history API
- ⭕ Manual carry-over adjustment UI

---

## 📚 RELATED DOCUMENTATION

- **Main Planning:** [PLANNING.md](./PLANNING.md)
- **Backward Compatibility:** [/guidelines/BACKWARD_COMPATIBILITY_RULES.md](/guidelines/BACKWARD_COMPATIBILITY_RULES.md)
- **Type Definitions:** [/types/index.ts](/types/index.ts)
- **Server Code:** [/supabase/functions/server/index.tsx](/supabase/functions/server/index.tsx)
- **Hooks:** [/hooks/usePockets.ts](/hooks/usePockets.ts)
- **Timeline Component:** [/components/PocketTimeline.tsx](/components/PocketTimeline.tsx)

---

## 🎯 CURRENT STATUS

**Phase:** Planning Complete  
**Next Action:** Review & Approval  
**Awaiting:** User approval to start FASE 1

---

## 💬 QUESTIONS & ANSWERS

### **Q: Kenapa harus 3 fase? Kenapa tidak sekaligus?**
A: Karena ini refactor CORE yang sangat berisiko. Jika ada error, kita bisa rollback per fase tanpa kehilangan semua progress.

### **Q: Apakah data lama akan hilang?**
A: TIDAK. Ada migration script untuk preserve semua data existing.

### **Q: Berapa lama total waktu implementasi?**
A: Estimasi 3-5 sessions (~7-10 jam total) dengan testing menyeluruh.

### **Q: Apa yang terjadi jika gagal?**
A: Ada rollback plan di setiap fase. Worst case: restore dari backup.

### **Q: Apakah perlu testing di staging dulu?**
A: SANGAT DIREKOMENDASIKAN! Jangan langsung production.

---

## ✨ READY TO START?

**Before you execute ANY code:**

1. [ ] Read [PLANNING.md](./PLANNING.md) in FULL
2. [ ] Backup all data
3. [ ] Prepare staging environment
4. [ ] Have rollback scripts ready
5. [ ] Clear your schedule (no interruptions during implementation)

**Once ready, start with FASE 1 in [PLANNING.md](./PLANNING.md).**

**Good luck, and BE CAREFUL! 🛡️**

---

**Created:** November 9, 2025  
**Last Updated:** November 9, 2025  
**Maintainer:** AI Code Agent  
**Status:** 📋 AWAITING APPROVAL
