/**
 * Budget calculation utilities
 */

export interface BudgetCalculation {
  totalIncome: number;
  totalExpenses: number;
  totalAdditionalIncome: number;
  deduction: number;
  remainingBudget: number;
  percentUsed: number;
}

export interface Expense {
  amount: number;
  fromIncome?: boolean;
}

export interface AdditionalIncome {
  amount: number;
  deduction?: number;
}

/**
 * Calculate comprehensive budget metrics
 */
export const calculateBudget = (
  initialBudget: number,
  expenses: Expense[],
  additionalIncomes: AdditionalIncome[],
  carryover: number = 0,
  excludedExpenseIds: Set<string> = new Set(),
  excludedIncomeIds: Set<string> = new Set(),
  isDeductionExcluded: boolean = false
): BudgetCalculation => {
  const totalExpenses = expenses
    .filter((e, i) => !excludedExpenseIds.has(i.toString()) && !e.fromIncome)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalAdditionalIncome = additionalIncomes
    .filter((_, i) => !excludedIncomeIds.has(i.toString()))
    .reduce((sum, inc) => sum + inc.amount, 0);

  const deduction = isDeductionExcluded
    ? 0
    : additionalIncomes
        .filter((_, i) => !excludedIncomeIds.has(i.toString()))
        .reduce((sum, inc) => sum + (inc.deduction || 0), 0);

  const totalIncome = initialBudget + carryover + totalAdditionalIncome;
  const remainingBudget = totalIncome - deduction - totalExpenses;
  const percentUsed = totalIncome > 0 ? ((totalExpenses + deduction) / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    totalAdditionalIncome,
    deduction,
    remainingBudget,
    percentUsed,
  };
};

/**
 * ARCHITECTURE FIX: Calculate carry-over assets (positive pocket balances from previous month)
 * 
 * Aset = Uang yang bisa digunakan (Positive balances)
 * This function filters only POSITIVE balances and sums them.
 * 
 * @param balances - Map of pocket balances with availableBalance property
 * @returns Total positive balances (carry-over assets)
 */
export const calculateCarryOverAssets = (
  balances: Map<string, { availableBalance: number }>
): number => {
  let totalAssets = 0;
  
  balances.forEach((balance) => {
    // Only count POSITIVE balances (Assets)
    if (balance.availableBalance > 0) {
      totalAssets += balance.availableBalance;
    }
  });
  
  return totalAssets;
};

/**
 * ARCHITECTURE FIX: Calculate carry-over liabilities (negative pocket balances from previous month)
 * 
 * Kewajiban = Utang yang harus dibayar (Negative balances)
 * This function filters only NEGATIVE balances and returns absolute sum.
 * 
 * @param balances - Map of pocket balances with availableBalance property
 * @returns Total negative balances as positive number (carry-over liabilities/utang)
 */
export const calculateCarryOverLiabilities = (
  balances: Map<string, { availableBalance: number }>
): number => {
  let totalLiabilities = 0;
  
  balances.forEach((balance) => {
    // Only count NEGATIVE balances (Liabilities/Utang)
    if (balance.availableBalance < 0) {
      totalLiabilities += Math.abs(balance.availableBalance);
    }
  });
  
  return totalLiabilities;
};

/**
 * Get category label with fallback
 * Phase 8: Now supports custom categories via settings parameter
 */
export const getCategoryLabel = (category?: string, settings?: any): string => {
  if (!category) return 'Lainnya';
  
  // 🐛 DEBUG: Log category lookup
  console.log('[getCategoryLabel] Looking up category:', category, {
    hasSettings: !!settings,
    hasCustom: !!settings?.custom?.[category],
    hasOverride: !!settings?.overrides?.[category],
    override: settings?.overrides?.[category]
  });
  
  // Phase 8: Check custom categories first
  if (settings?.custom?.[category]) {
    console.log('[getCategoryLabel] Found in custom:', settings.custom[category].label);
    return settings.custom[category].label;
  }
  
  // 🔧 BACKWARD COMPATIBILITY: Create reverse lookup map for legacy numeric IDs
  const LEGACY_CATEGORY_ID_MAP: Record<string, string> = {
    '0': 'food',
    '1': 'transport',
    '2': 'savings',
    '3': 'bills',
    '4': 'health',
    '5': 'loan',
    '6': 'family',
    '7': 'entertainment',
    '8': 'installment',
    '9': 'shopping',
    '10': 'other'
  };
  
  // Create reverse map: 'entertainment' → '7'
  const categoryToLegacyId: Record<string, string> = {};
  Object.entries(LEGACY_CATEGORY_ID_MAP).forEach(([numId, catName]) => {
    categoryToLegacyId[catName] = numId;
  });
  
  // Phase 8: Check overrides for default categories
  // ✅ NEW: Try both string ID and legacy numeric ID
  if (settings?.overrides?.[category]?.label) {
    console.log('[getCategoryLabel] Found override (string key):', settings.overrides[category].label);
    return settings.overrides[category].label;
  }
  
  // 🔧 NEW: Try legacy numeric ID if string lookup failed
  const legacyId = categoryToLegacyId[category];
  if (legacyId && settings?.overrides?.[legacyId]?.label) {
    console.log('[getCategoryLabel] Found override (legacy numeric key):', legacyId, '→', settings.overrides[legacyId].label);
    return settings.overrides[legacyId].label;
  }
  
  // 🔥 BACKWARD COMPATIBILITY: Map old numeric index to category name
  const indexToCategoryMap: Record<string, string> = {
    '0': 'food',
    '1': 'transport',
    '2': 'savings',
    '3': 'bills',
    '4': 'health',
    '5': 'loan',
    '6': 'family',
    '7': 'entertainment',
    '8': 'installment',
    '9': 'shopping',
    '10': 'other'
  };
  
  const categoryName = indexToCategoryMap[category] || category.toLowerCase();
  
  const labelMap: Record<string, string> = {
    food: 'Makanan',
    transport: 'Transportasi',
    savings: 'Tabungan',
    bills: 'Tagihan',
    health: 'Kesehatan',
    loan: 'Pinjaman',
    family: 'Keluarga',
    entertainment: 'Hiburan',
    installment: 'Cicilan',
    shopping: 'Belanja',
    other: 'Lainnya'
  };
  
  const result = labelMap[categoryName] || 'Lainnya';
  console.log('[getCategoryLabel] Default label returned:', result);
  return result;
};

/**
 * Get category emoji with fallback
 * Phase 8: Now supports custom categories via settings parameter
 * 🔧 BACKWARD COMPATIBILITY: Supports both string and legacy numeric category IDs
 */
export const getCategoryEmoji = (category?: string, settings?: any): string => {
  if (!category) return '📦';
  
  // 🐛 DEBUG: Log category lookup
  console.log('[getCategoryEmoji] Looking up category:', category, {
    hasSettings: !!settings,
    hasCustom: !!settings?.custom?.[category],
    hasOverride: !!settings?.overrides?.[category],
    override: settings?.overrides?.[category]
  });
  
  // Phase 8: Check custom categories first
  if (settings?.custom?.[category]) {
    console.log('[getCategoryEmoji] Found in custom:', settings.custom[category].emoji);
    return settings.custom[category].emoji;
  }
  
  // 🔧 BACKWARD COMPATIBILITY: Create reverse lookup map for legacy numeric IDs
  const LEGACY_CATEGORY_ID_MAP: Record<string, string> = {
    '0': 'food',
    '1': 'transport',
    '2': 'savings',
    '3': 'bills',
    '4': 'health',
    '5': 'loan',
    '6': 'family',
    '7': 'entertainment',
    '8': 'installment',
    '9': 'shopping',
    '10': 'other'
  };
  
  // Create reverse map: 'entertainment' → '7'
  const categoryToLegacyId: Record<string, string> = {};
  Object.entries(LEGACY_CATEGORY_ID_MAP).forEach(([numId, catName]) => {
    categoryToLegacyId[catName] = numId;
  });
  
  // Phase 8: Check overrides for default categories
  // ✅ NEW: Try both string ID and legacy numeric ID
  if (settings?.overrides?.[category]?.emoji) {
    console.log('[getCategoryEmoji] Found override (string key):', settings.overrides[category].emoji);
    return settings.overrides[category].emoji;
  }
  
  // 🔧 NEW: Try legacy numeric ID if string lookup failed
  const legacyId = categoryToLegacyId[category];
  if (legacyId && settings?.overrides?.[legacyId]?.emoji) {
    console.log('[getCategoryEmoji] Found override (legacy numeric key):', legacyId, '→', settings.overrides[legacyId].emoji);
    return settings.overrides[legacyId].emoji;
  }
  
  // 🔥 BACKWARD COMPATIBILITY: Map old numeric index to category name
  const indexToCategoryMap: Record<string, string> = {
    '0': 'food',
    '1': 'transport',
    '2': 'savings',
    '3': 'bills',
    '4': 'health',
    '5': 'loan',
    '6': 'family',
    '7': 'entertainment',
    '8': 'installment',
    '9': 'shopping',
    '10': 'other'
  };
  
  const categoryName = indexToCategoryMap[category] || category.toLowerCase();
  
  const emojiMap: Record<string, string> = {
    food: '🍔',
    transport: '🚗',
    savings: '💰',
    bills: '📄',
    health: '🏥',
    loan: '💳',
    family: '👨‍👩‍👧‍👦',
    entertainment: '🎬',
    installment: '💸',
    shopping: '🛒',
    other: '📦'
  };
  
  const result = emojiMap[categoryName] || '📦';
  console.log('[getCategoryEmoji] Default emoji returned:', result);
  return result;
};

/**
 * Calculate budget percentage for a category
 */
export const getBudgetPercentage = (spent: number, limit: number): number => {
  if (!limit || limit === 0) return 0;
  return (spent / limit) * 100;
};

/**
 * Get budget status for a category
 */
export const getBudgetStatus = (
  spent: number, 
  limit: number, 
  warningAt: number = 75
): 'safe' | 'warning' | 'danger' | 'exceeded' => {
  const percentage = getBudgetPercentage(spent, limit);
  
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'danger';
  if (percentage >= warningAt) return 'warning';
  return 'safe';
};

/**
 * Get color for budget status
 */
export const getBudgetStatusColor = (status: 'safe' | 'warning' | 'danger' | 'exceeded'): string => {
  const colorMap = {
    safe: '#10B981',      // green-500
    warning: '#F59E0B',   // amber-500
    danger: '#EF4444',    // red-500
    exceeded: '#DC2626'   // red-600
  };
  
  return colorMap[status];
};
