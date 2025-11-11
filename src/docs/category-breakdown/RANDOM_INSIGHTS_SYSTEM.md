# Random Rolling Insights System

**Goal:** Display 3 random insights from pool of 12 every time user opens CategoryBreakdown

---

## 📊 12 Insights Pool

### ✅ Existing (3)
- [x] 🏆 Juara Ngabisin Duit - Highest total spending category
- [x] 🔥 Paling Rajin Swipe - Most frequent transactions category
- [x] 💎 Sultan Transaksi - Highest average per transaction

### 🆕 New Insights (9)

#### Budget & Savings Themed
- [x] 💰 **Paling Hemat** - Category with lowest spending (min 1 transaction)
- [x] 🎯 **Budget Hero** - Category paling jauh dari limit (highest remaining %)
- [x] ⚠️ **Budget Alert** - Category closest to limit / exceeded

#### Trend & Time Themed
- [x] 📈 **Naik Daun** - Biggest increase vs last month (MoM %)
- [x] 📉 **Turun Drastis** - Biggest decrease vs last month (MoM %)
- [x] 🌅 **Early Bird Spender** - Most spending in first 10 days of month
- [x] 🌙 **Night Owl Spender** - Most spending in last 10 days of month

#### Behavior Themed
- [x] 🎲 **Paling Random** - Highest variance in transaction amounts
- [x] 🤖 **Paling Konsisten** - Lowest variance (most consistent spending)

---

## 🔧 Implementation Tasks

### Phase 1: Data Structure
- [x] Create `INSIGHTS_POOL` array with 12 insight configs
- [x] Each config: `{ id, icon, title, color, calculate(), getExpenses() }`
- [x] Add `selectedInsights` state to store 3 random IDs

### Phase 2: Random Selection Logic
- [x] Function: `getRandomInsights()` - picks 3 unique random insights
- [x] Run on component mount / dialog open
- [x] Store in state to prevent re-shuffle during same session

### Phase 3: Render Dynamic Cards
- [x] Map `selectedInsights` to render 3 cards dynamically
- [x] Reuse existing card structure (gradient, onClick, expand)
- [x] Reuse transaction list grid (4-col, largest = col-span-2)

### Phase 4: Edge Case Handling
- [x] Handle insights with no data (skip or show empty state)
- [x] Handle insights requiring prev month data (MoM)
- [x] Handle insights requiring budget settings

---

## 📋 Progress Tracker

**Current Status:** ✅ ALL PHASES COMPLETE!  
**Next:** Testing & Refinement  
**Target:** Complete all phases ✅

---

## 🎯 Success Criteria

✅ User sees 3 different insights every time they open dialog  
✅ All 12 insights work correctly with real data  
✅ Smooth animations and interactions maintained  
✅ No performance impact from calculations  
✅ Edge cases handled gracefully