# ⚠️ STOP! BEFORE YOU CHANGE DATA SCHEMA!

**📍 This file is in ROOT with ⚠️ prefix so you CAN'T MISS IT!**

---

## 🚨 MANDATORY CHECKLIST

**You are about to change how data is stored. Complete ALL items below:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Are you changing:                                      │
│  ├─ Database schema?                    → YES/NO        │
│  ├─ Data format?                        → YES/NO        │
│  ├─ Type definitions for stored data?  → YES/NO        │
│  ├─ Constants affecting data?           → YES/NO        │
│  └─ Enum values in database?            → YES/NO        │
│                                                         │
│  If ANY answer is YES:                                  │
│  → YOU MUST COMPLETE THIS CHECKLIST!                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ PRE-IMPLEMENTATION CHECKLIST

### 1. Database Audit
```
[ ] 🔍 QUERY DATABASE
    → Run: SELECT DISTINCT [field] FROM [table] LIMIT 10
    → What format is data ACTUALLY in?
    → Don't assume - VERIFY!
    
[ ] 📊 COUNT AFFECTED RECORDS  
    → How many records use old format?
    → What percentage of total data?
    → Document the numbers!
```

### 2. Read Documentation
```
[ ] 📖 READ: /⚠️_BACKWARD_COMPATIBILITY_WARNING.md
    → Critical warning & red flags
    → Takes 3 minutes
    
[ ] 📖 READ: /guidelines/BACKWARD_COMPATIBILITY_RULES.md
    → Complete rules & template
    → Takes 10 minutes
    
[ ] 📖 READ: /planning/expense-categories/AI_CRITICAL_RULES_BACKWARD_COMPAT.md
    → AI checklist & decision tree
    → Takes 5 minutes
    
Total time: 18 minutes to prevent DISASTER!
```

### 3. Plan Backward Compatibility
```
[ ] 🛡️ DESIGN COMPAT LAYER
    → Map old format → new format
    → Write conversion function
    → Add detailed comments
    
[ ] 📝 DOCUMENT THE LAYER
    → Why does it exist?
    → What formats does it handle?
    → When can it be removed? (probably NEVER)
```

### 4. Implementation
```
[ ] 💻 IMPLEMENT COMPAT LAYER
    → Use template from guidelines
    → Add clear comments
    → Follow naming conventions
    
[ ] 🔍 ADD DEBUG LOGGING
    → Log input values
    → Log converted values  
    → Log lookup results
```

---

## ✅ TESTING CHECKLIST

### 5. Test With Old Data
```
[ ] 📥 LOAD DATABASE BACKUP
    → Get backup from last month
    → Load into test database
    
[ ] 🧪 TEST OLD FORMAT
    → Open app with old database
    → Verify old records display correctly
    → Check all features work
    
[ ] 📊 VERIFY STATISTICS
    → Check category breakdown
    → Check timeline
    → Check all views
```

### 6. Test With New Data
```
[ ] ➕ CREATE NEW RECORDS
    → Add new data with new format
    → Verify it saves correctly
    → Verify it displays correctly
```

### 7. Test With Mixed Data
```
[ ] 🔄 TEST COEXISTENCE
    → Old + new data in same database
    → Both formats work simultaneously
    → No conflicts or errors
    
[ ] 🎯 TEST ALL CODE PATHS
    → Default categories
    → Custom categories
    → Category overrides
    → Edge cases
```

---

## ✅ DOCUMENTATION CHECKLIST

### 8. Code Documentation
```
[ ] 💬 ADD CODE COMMENTS
    → Explain WHY compat layer exists
    → What formats it handles
    → When it was added
    → Link to documentation
    
Example:
/**
 * ⚠️ BACKWARD COMPATIBILITY LAYER (November 2025)
 * 
 * Before: Data stored as [OLD FORMAT]
 * After: Data stored as [NEW FORMAT]
 * 
 * This layer handles both formats to prevent breaking
 * existing user data in the database.
 * 
 * DO NOT REMOVE without migrating ALL data!
 * 
 * See: /⚠️_BACKWARD_COMPATIBILITY_WARNING.md
 */
```

### 9. Project Documentation
```
[ ] 📝 UPDATE CHANGELOG
    → /docs/changelog/[YOUR_CHANGE].md
    → Explain what changed
    → Explain backward compatibility
    
[ ] 📝 UPDATE TROUBLESHOOTING
    → Add to troubleshooting guide
    → Common issues & solutions
    
[ ] 📝 ADD TO AI RULES (if needed)
    → Update AI behavior rules
    → Prevent future mistakes
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 10. Final Verification
```
[ ] ✅ ALL TESTS PASS
    → Old data works
    → New data works
    → Mixed data works
    
[ ] ✅ NO BREAKING CHANGES
    → Existing features still work
    → No data loss
    → No visual regressions
    
[ ] ✅ PERFORMANCE CHECK
    → No slowdown
    → Compat layer is fast
    
[ ] ✅ DOCUMENTATION COMPLETE
    → Code comments added
    → Changelog updated
    → Troubleshooting updated
```

---

## 🚨 STOP CONDITIONS - DO NOT DEPLOY IF:

```
❌ You haven't read the documentation
❌ You haven't queried the database
❌ You haven't implemented backward compatibility
❌ You haven't tested with old data
❌ You haven't tested with new data
❌ You haven't documented why compat layer exists
❌ Any test is failing
❌ You're not sure if it will break existing data
```

**If ANY of above is ❌ → DO NOT DEPLOY!**

---

## ✅ DEPLOYMENT READY WHEN:

```
✅ All documentation read
✅ Database format verified
✅ Backward compatibility implemented
✅ Tested with old data - PASS
✅ Tested with new data - PASS
✅ Tested with mixed data - PASS
✅ All code paths tested
✅ Code comments added
✅ Changelog updated
✅ No breaking changes
✅ Performance verified
```

**Only deploy when ALL items are ✅**

---

## 📚 DOCUMENTATION REFERENCES

**Quick Access:**
- [⚠️_BACKWARD_COMPATIBILITY_WARNING.md](/⚠️_BACKWARD_COMPATIBILITY_WARNING.md) - Critical warning
- [BACKWARD_COMPATIBILITY_MUST_READ.md](/BACKWARD_COMPATIBILITY_MUST_READ.md) - Overview
- [/guidelines/BACKWARD_COMPATIBILITY_RULES.md](/guidelines/BACKWARD_COMPATIBILITY_RULES.md) - Complete rules
- [/planning/expense-categories/AI_CRITICAL_RULES_BACKWARD_COMPAT.md](/planning/expense-categories/AI_CRITICAL_RULES_BACKWARD_COMPAT.md) - AI checklist

**Complete Documentation:**
- [/docs/changelog/BACKWARD_COMPAT_MASTER_INDEX.md](/docs/changelog/BACKWARD_COMPAT_MASTER_INDEX.md) - All 9+ docs

---

## 💡 REMEMBER

**Real Disaster - November 8, 2025:**
- Changed category from `"0"` to `"food"`
- Forgot backward compatibility
- **70% of data broke!**
- 2 hours debugging
- 4 hours documentation
- User confusion

**Could have been prevented with 18 minutes of reading + 30 minutes of implementation!**

---

## 🎯 YOUR RESPONSIBILITY

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  "Changing code is easy.                                 ║
║   Changing data is forever."                             ║
║                                                           ║
║  "If you change data format,                             ║
║   you MUST handle old data."                             ║
║                                                           ║
║  "JIKA ADA YANG BUTUH BACKWARD COMPATIBILITY,            ║
║   ITU HARUS DI-HANDLE! JANGAN DIABAIKAN!"               ║
║                                                           ║
��  NO EXCEPTIONS. NO SHORTCUTS.                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

**Now that you've read this checklist:**

1. ✅ Complete ALL items above
2. ✅ Test thoroughly
3. ✅ Document completely
4. ✅ Deploy with confidence

**Good luck! 🚀**

---

**Status:** MANDATORY CHECKLIST ⚠️  
**Created:** November 8, 2025  
**Purpose:** Prevent backward compatibility disasters  
**Compliance:** REQUIRED before ANY data format changes
