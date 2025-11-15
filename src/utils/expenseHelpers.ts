/**
 * 📦 ExpenseList Helper Functions
 * 
 * Extracted from ExpenseList.tsx for better modularity and reusability.
 * All helper functions related to expenses and categories.
 */

import { LEGACY_CATEGORY_ID_MAP } from "../constants";

/**
 * 🔧 BACKWARD COMPATIBILITY HELPER
 * Normalizes legacy category IDs (0, 1, 2, etc.) to new string keys (food, transport, etc.)
 * 
 * @param categoryId - The category ID (can be old numeric or new string)
 * @returns Normalized category key
 * 
 * @example
 * normalizeCategoryId('1') → 'transport'
 * normalizeCategoryId('transport') → 'transport'
 * normalizeCategoryId('custom_abc123') → 'custom_abc123'
 */
export function normalizeCategoryId(categoryId: string | undefined): string {
  if (!categoryId) return 'other';
  
  // Check if it's a legacy numeric ID
  if (categoryId in LEGACY_CATEGORY_ID_MAP) {
    return LEGACY_CATEGORY_ID_MAP[categoryId];
  }
  
  // Already normalized or custom category
  return categoryId;
}
