/**
 * Category Management Utilities
 * Phase 8: Custom Categories & Customization
 */

import { ExpenseCategory, CategorySettings, CategoryConfig, CustomCategory, CategoryBudget } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

/**
 * Get color for a default category
 */
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#10B981',         // green-500
  transport: '#3B82F6',    // blue-500
  savings: '#8B5CF6',      // violet-500
  bills: '#F59E0B',        // amber-500
  health: '#EF4444',       // red-500
  loan: '#EC4899',         // pink-500
  family: '#06B6D4',       // cyan-500
  entertainment: '#F97316', // orange-500
  installment: '#6366F1',  // indigo-500
  shopping: '#14B8A6',     // teal-500
  other: '#6B7280',        // gray-500
};

/**
 * Get default category color
 */
export function getCategoryColor(category: ExpenseCategory): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
}

/**
 * Merge default categories with custom categories and overrides
 * Returns all categories in the order specified by settings
 */
export function getAllCategories(settings: CategorySettings | null): CategoryConfig[] {
  const categories: CategoryConfig[] = [];
  
  // Add default categories (with overrides)
  Object.entries(EXPENSE_CATEGORIES).forEach(([key, config]) => {
    const category = key as ExpenseCategory;
    const override = settings?.overrides[category];
    const budget = settings?.budgets[category];
    
    categories.push({
      id: category,
      emoji: override?.emoji || config.emoji,
      label: override?.label || config.label,
      color: override?.color || getCategoryColor(category),
      isCustom: false,
      budget
    });
  });
  
  // Add custom categories
  if (settings?.custom) {
    Object.values(settings.custom).forEach(custom => {
      categories.push({
        ...custom,
        isCustom: true,
        budget: settings.budgets[custom.id]
      });
    });
  }
  
  // Sort by order if provided
  if (settings?.order && settings.order.length > 0) {
    categories.sort((a, b) => {
      const aIndex = settings.order.indexOf(a.id);
      const bIndex = settings.order.indexOf(b.id);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
  
  return categories;
}

/**
 * Get category config by ID (handles default + custom)
 */
export function getCategoryConfig(
  categoryId: string, 
  settings: CategorySettings | null
): CategoryConfig | null {
  const all = getAllCategories(settings);
  return all.find(c => c.id === categoryId) || null;
}

/**
 * Generate unique ID for custom category
 */
export function generateCategoryId(label: string): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}_${random}`;
}

/**
 * Check if a category ID is a default category
 */
export function isDefaultCategory(categoryId: string): boolean {
  return categoryId in EXPENSE_CATEGORIES;
}

/**
 * Calculate budget status for a category
 */
export function calculateBudgetStatus(
  spent: number,
  budget: CategoryBudget | undefined
): {
  percentage: number;
  status: 'safe' | 'warning' | 'danger' | 'exceeded';
  remaining: number;
} {
  if (!budget || !budget.enabled) {
    return {
      percentage: 0,
      status: 'safe',
      remaining: Infinity
    };
  }

  const percentage = (spent / budget.limit) * 100;
  const remaining = budget.limit - spent;

  let status: 'safe' | 'warning' | 'danger' | 'exceeded';
  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 90) {
    status = 'danger';
  } else if (percentage >= budget.warningAt) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  return {
    percentage,
    status,
    remaining
  };
}

/**
 * Get default category settings structure
 */
export function getDefaultCategorySettings(): CategorySettings {
  return {
    version: 1,
    custom: {},
    overrides: {},
    budgets: {},
    order: Object.keys(EXPENSE_CATEGORIES),
    keywords: {},
    aliases: {}
  };
}

/**
 * Validate custom category data
 */
export function validateCustomCategory(data: {
  label: string;
  emoji: string;
  color: string;
}): { valid: boolean; error?: string } {
  if (!data.label || data.label.trim().length === 0) {
    return { valid: false, error: 'Label is required' };
  }

  if (data.label.length > 50) {
    return { valid: false, error: 'Label must be less than 50 characters' };
  }

  if (!data.emoji || data.emoji.trim().length === 0) {
    return { valid: false, error: 'Emoji is required' };
  }

  if (!data.color || !/^#[0-9A-F]{6}$/i.test(data.color)) {
    return { valid: false, error: 'Valid hex color is required (e.g., #FF5733)' };
  }

  return { valid: true };
}

/**
 * Export category settings to JSON
 */
export function exportCategorySettings(settings: CategorySettings): string {
  return JSON.stringify(settings, null, 2);
}

/**
 * Import category settings from JSON
 */
export function importCategorySettings(json: string): {
  success: boolean;
  settings?: CategorySettings;
  error?: string;
} {
  try {
    const parsed = JSON.parse(json);
    
    // Basic validation
    if (!parsed.version || typeof parsed.version !== 'number') {
      return { success: false, error: 'Invalid format: missing version' };
    }

    if (!parsed.custom || typeof parsed.custom !== 'object') {
      return { success: false, error: 'Invalid format: missing custom categories' };
    }

    // Set defaults for missing fields
    const settings: CategorySettings = {
      version: parsed.version,
      custom: parsed.custom || {},
      overrides: parsed.overrides || {},
      budgets: parsed.budgets || {},
      order: parsed.order || Object.keys(EXPENSE_CATEGORIES),
      keywords: parsed.keywords || {},
      aliases: parsed.aliases || {}
    };

    return { success: true, settings };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
}

/**
 * Suggest category based on expense name (auto-categorization)
 */
export function suggestCategory(
  expenseName: string,
  settings: CategorySettings | null
): string | null {
  if (!expenseName) return null;

  const lowerName = expenseName.toLowerCase();
  
  // Check aliases first
  if (settings?.aliases) {
    for (const [alias, categoryId] of Object.entries(settings.aliases)) {
      if (lowerName.includes(alias.toLowerCase())) {
        return categoryId;
      }
    }
  }

  // Check keywords
  if (settings?.keywords) {
    for (const [categoryId, keywords] of Object.entries(settings.keywords)) {
      if (keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
        return categoryId;
      }
    }
  }

  return null;
}
