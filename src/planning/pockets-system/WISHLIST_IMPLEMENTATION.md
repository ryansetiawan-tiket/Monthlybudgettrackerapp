# Wishlist & Budget Simulation - Implementation Complete ✅

## Overview

Fitur **Wishlist & Budget Simulation** telah berhasil diimplementasikan sebagai bagian dari **Phase 1.5.4 Extended Features**. Fitur ini memungkinkan user untuk:
- Menambahkan item yang ingin dibeli ke wishlist per kantong
- Melihat simulasi budget dengan affordability analysis
- Mendapatkan rekomendasi smart tentang prioritas pembelian
- Convert wishlist item langsung ke expense dengan one-click

## Implementation Date

**November 5, 2025** - Implemented by AI Assistant

---

## Features Implemented

### 1. ✅ Wishlist Management

**Capabilities:**
- Add wishlist items dengan nama, harga, prioritas (High/Medium/Low)
- Set target date untuk rencana pembelian
- Tambahkan deskripsi, URL produk, dan catatan
- Edit dan delete wishlist items
- Support multiple items per pocket

**Backend API Endpoints:**
- `GET /wishlist/:year/:month/:pocketId` - Get wishlist items
- `POST /wishlist/:year/:month/:pocketId` - Add wishlist item
- `PUT /wishlist/:year/:month/:pocketId/:itemId` - Update item
- `DELETE /wishlist/:year/:month/:pocketId/:itemId` - Delete item

### 2. ✅ Budget Simulation Engine

**Capabilities:**
- Real-time simulation berdasarkan saldo kantong saat ini
- Priority-based ordering (High → Medium → Low)
- Cascading impact analysis: "jika beli A, apakah masih cukup untuk B?"
- Status categorization:
  - **Affordable Now**: Bisa dibeli sekarang dengan saldo cukup
  - **Affordable Soon**: Kurang sedikit, estimasi minggu untuk bisa beli
  - **Not Affordable**: Belum bisa dibeli dalam waktu dekat

**Backend API Endpoint:**
- `POST /wishlist/:year/:month/:pocketId/simulate` - Run simulation

**Simulation Algorithm:**
```typescript
1. Get current pocket balance
2. Get all active wishlist items
3. Sort by priority (1 = High first)
4. Simulate cascading purchases:
   - For each item in priority order:
     - Calculate balance after purchase
     - Determine if affordable, low-balance, or insufficient
     - Track which subsequent items would be blocked
5. Generate smart recommendations
```

### 3. ✅ Smart Recommendations

**Types:**
- **Overall Affordability**: "✅ Saldo cukup untuk semua items" atau "⚠️ Kurang Rp X"
- **Priority Suggestions**: "💡 Bisa beli N item sekarang (prioritas tertinggi)"
- **Savings Plan**: "💰 Transfer Rp X/minggu untuk beli dalam N minggu"
- **Balance Warning**: "⚠️ Jika beli X, sisa hanya Rp Y"

### 4. ✅ One-Click Purchase Conversion

**Capability:**
- Convert wishlist item to expense dengan satu klik
- Automatic expense creation dengan metadata link
- Item status berubah jadi "purchased"
- Seamless integration dengan expense system

**Backend API Endpoint:**
- `POST /wishlist/:year/:month/:pocketId/:itemId/purchase` - Convert to expense

### 5. ✅ Savings Plan Generator (API Only)

**Capability:**
- Generate personalized savings plan untuk item tertentu
- Calculate weekly/monthly transfer needed
- Estimate weeks needed to reach target
- Projected completion date

**Backend API Endpoint:**
- `POST /wishlist/:year/:month/:pocketId/:itemId/savings-plan` - Generate plan

---

## UI Components

### 1. `WishlistDialog.tsx`

Dialog component untuk add/edit wishlist item.

**Features:**
- Form fields: name, amount, priority, target date, description, URL, notes
- Priority dropdown dengan visual labels (⭐ High, 🟡 Medium, 🔵 Low)
- Validation untuk required fields
- Loading states

### 2. `WishlistSimulation.tsx`

Main simulation view dengan full affordability analysis.

**Features:**
- **Summary Section**:
  - Current balance vs total wishlist
  - Affordability progress bar
  - Smart recommendations alerts
  - Priority breakdown (High/Medium/Low counts)

- **Wishlist Items List**:
  - Individual item cards dengan priority badge
  - Affordability status indicators:
    - ✅ Green: Bisa dibeli sekarang
    - 🕐 Yellow: Affordable soon dengan estimasi waktu
    - ❌ Red: Belum bisa dibeli
  - Balance after purchase preview
  - Warning alerts untuk low balance scenarios
  - Action buttons: Edit, Delete, Beli Sekarang (jika affordable)
  - External link button jika ada URL produk

- **Interactive Elements**:
  - "+ Tambah Item" button di header
  - Scroll area untuk long lists
  - Empty state dengan CTA

### 3. Integration in `PocketsSummary.tsx`

**Added:**
- "Simulasi Wishlist" button di setiap pocket card
- Opens full-screen dialog dengan WishlistSimulation
- Seamless navigation between pockets

---

## Data Structure

### WishlistItem Interface

```typescript
interface WishlistItem {
  id: string;
  pocketId: string;
  name: string;
  amount: number;
  priority: 1 | 2 | 3;          // 1=High, 2=Medium, 3=Low
  
  // Optional metadata
  description?: string;
  url?: string;                  // Product URL
  imageUrl?: string;             // Product image
  targetDate?: string;           // When planning to buy (ISO date)
  tags?: string[];               // ['gaming', 'electronics']
  
  // Status tracking
  status: 'planned' | 'saving' | 'ready' | 'purchased';
  purchasedAt?: string;          // ISO date
  purchasedExpenseId?: string;   // Link to expense
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string;
}
```

### SimulationResult Interface

```typescript
interface SimulationResult {
  pocketId: string;
  pocketName: string;
  currentBalance: number;
  
  wishlist: {
    total: number;
    count: number;
    byPriority: {
      high: { count: number; total: number };
      medium: { count: number; total: number };
      low: { count: number; total: number };
    };
  };
  
  affordableNow: string[];       // Item IDs
  affordableSoon: Array<{
    itemId: string;
    amountNeeded: number;
    estimatedWeeks: number;
  }>;
  notAffordable: string[];
  
  scenarios: SimulationScenario[];
  recommendations: Array<{
    type: 'warning' | 'info' | 'suggestion';
    message: string;
    actionable: boolean;
  }>;
}
```

### Database Storage

**KV Store Keys:**
```typescript
`wishlist:${monthKey}:${pocketId}` → WishlistItem[]

// Example:
`wishlist:2025-11:pocket_daily` → [
  {
    id: "wishlist_123456789_abc",
    pocketId: "pocket_daily",
    name: "Gaming Console",
    amount: 8000000,
    priority: 1,
    status: "planned",
    createdAt: "2025-11-05T10:00:00Z",
    updatedAt: "2025-11-05T10:00:00Z"
  }
]
```

---

## User Flow

### Flow 1: Adding Wishlist Item

```
1. User clicks "Simulasi Wishlist" di pocket card
2. Dialog opens dengan WishlistSimulation
3. Click "+ Tambah Item"
4. Fill form: name, amount, priority, etc.
5. Click "Tambah"
6. Item added to wishlist
7. Simulation automatically recalculates
8. Shows affordability status
```

### Flow 2: Viewing Simulation

```
1. User opens wishlist simulation
2. Sees current balance vs total wishlist
3. Views affordability progress bar
4. Reads smart recommendations
5. Scrolls through items to see:
   - Which items can be bought now
   - Which need more saving
   - Estimated time to afford each
6. Makes informed decision
```

### Flow 3: Purchasing Item

```
1. User sees item dengan ✅ "Bisa dibeli sekarang"
2. Clicks "Beli Sekarang" button
3. Confirm dialog: "Tandai sebagai dibeli?"
4. Backend creates expense automatically
5. Item status → 'purchased'
6. Item removed from active wishlist
7. Expense appears in pengeluaran list
8. Balance updates
```

---

## Technical Implementation

### Backend Functions

**1. `simulateWishlist(pocketId, monthKey)`**
- Calculates current balance
- Gets and sorts wishlist by priority
- Simulates cascading purchases
- Generates affordability categorization
- Returns comprehensive simulation result

**2. `generateWishlistRecommendations(...)`**
- Analyzes simulation scenarios
- Generates contextual recommendations
- Prioritizes actionable insights
- Returns user-friendly messages

**3. `generateSavingsPlan(pocketId, itemId, monthKey)`**
- Calculates amount needed
- Estimates time to save
- Suggests weekly/monthly transfers
- Projects completion date

### Frontend State Management

**WishlistSimulation Component:**
```typescript
const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
const [simulation, setSimulation] = useState<SimulationResult | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [showDialog, setShowDialog] = useState(false);
const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
```

**Data Fetching:**
- `fetchWishlist()`: Loads all active wishlist items
- `fetchSimulation()`: Runs simulation and gets recommendations
- `loadData()`: Combines both, runs on mount and after changes

---

## Edge Cases Handled

### 1. Empty Wishlist
- Shows empty state dengan icon dan CTA
- Encourages user to add first item
- No simulation errors

### 2. Insufficient Balance
- Clear warning messages
- Shows amount needed
- Estimated weeks to save
- Suggestions for transfer

### 3. Negative Balance (after expenses)
- Simulation still runs
- Shows all items as "not affordable"
- Recommends reducing expenses or transfer in

### 4. Multiple Items Same Priority
- Maintains stable sort order (by creation date)
- Consistent simulation results

### 5. Large Wishlist
- Scroll area untuk performance
- Lazy rendering (future optimization opportunity)

### 6. Item Already Purchased
- Cannot purchase again
- Status validation on backend
- Error handling dengan toast

---

## Testing Scenarios

### Scenario 1: Add Item & Simulate

**Steps:**
1. Open wishlist for "Kantong Uang Dingin" (Rp 2.000.000)
2. Add item: "Gaming Console" - Rp 800.000 - High priority
3. Add item: "Gaming Keyboard" - Rp 1.500.000 - Medium priority
4. View simulation

**Expected Result:**
- Gaming Console: ✅ Affordable (Rp 1.200.000 left)
- Gaming Keyboard: 🕐 Affordable Soon (Kurang Rp 300.000)
- Recommendation: "💡 Bisa beli 1 item sekarang"
- Recommendation: "💰 Transfer Rp X/minggu untuk beli Keyboard"

### Scenario 2: Purchase Item

**Steps:**
1. Click "Beli Sekarang" on Gaming Console
2. Confirm purchase
3. Check expense list

**Expected Result:**
- Gaming Console → status "purchased"
- New expense created: "Gaming Console" - Rp 800.000
- Expense metadata contains wishlist link
- New balance: Rp 1.200.000
- Simulation recalculates: Keyboard now shows different estimate

### Scenario 3: Insufficient Funds

**Steps:**
1. Current balance: Rp 500.000
2. Add item: "Laptop" - Rp 15.000.000 - High priority
3. View simulation

**Expected Result:**
- Status: ❌ Belum bisa dibeli
- Warning: "Kurang Rp 14.500.000"
- Recommendation: "⚠️ Kurang Rp 14.5jt untuk beli semua items"
- No "Beli Sekarang" button

---

## Future Enhancements (Not Implemented)

### 1. Global Wishlist
- Wishlist items yang span multiple months
- Long-term savings goals
- Auto-carry over items to next month

### 2. Auto-Transfer Integration
- Link savings plan to auto-transfer rules
- Automatic weekly/monthly transfers to build up balance
- Goal tracking over time

### 3. Wishlist Templates
- Pre-defined wishlist untuk common items
- Curated lists (gaming setup, traveling, etc.)
- Community sharing (future)

### 4. Price Tracking
- Auto-update prices from URL (web scraping)
- Price drop alerts
- Best time to buy recommendations

### 5. Multi-Pocket Funding
- Split item cost across multiple pockets
- "Fund from Kantong A and B together"
- More complex funding strategies

### 6. Visual Charts
- Pie chart: budget breakdown
- Timeline: savings progress over time
- Comparison: priority distribution

---

## Success Metrics

### Adoption Metrics (To Track)
- % users who open wishlist simulation
- % users who add at least 1 item
- Average items per pocket
- % items that get purchased (conversion rate)

### Engagement Metrics
- Time spent in simulation view
- Number of simulations per session
- Edit/delete frequency
- Purchase button clicks

### Financial Impact
- Total wishlist amounts
- Average item price
- Purchased vs planned ratio
- Budget accuracy improvement

---

## Known Limitations

1. **No Cross-Pocket Simulation**: Each pocket's wishlist simulates independently. Future: show combined view.

2. **Static Income Assumption**: Estimated weeks assume fixed Rp 250k/week income. Future: use actual income patterns.

3. **No Recurring Items**: Wishlist items are one-time. Future: support recurring purchases.

4. **No Multi-User**: Wishlist per device/session only. Future: sync with auth.

5. **No Image Upload**: Product images via URL only. Future: allow image upload to storage.

---

## Conclusion

Fitur **Wishlist & Budget Simulation** successfully implemented dengan **full feature parity** sesuai planning document. Backend API robust dengan proper validation dan error handling. Frontend UI intuitive dengan real-time simulation dan visual affordability indicators.

User sekarang bisa:
✅ Plan pembelian dengan lebih baik
✅ Understand budget impact sebelum beli
✅ Get smart recommendations untuk prioritas
✅ Track wishlist items per kantong
✅ Convert wishlist to expense seamlessly

**Status: COMPLETE ✅**

---

**Implementation Version**: 1.0  
**Date**: November 5, 2025  
**Implemented By**: AI Assistant  
**Documentation**: Complete
