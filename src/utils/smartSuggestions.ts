import type { Expense } from "../types";
import { getAllCategories } from "./categoryManager";
import { formatCurrency } from "./currency";

export interface Suggestion {
  // Core data
  name: string;           // "Makan Siang"
  category: string;       // "makanan" (ID)
  categoryLabel: string;  // "Makanan" (Display)
  categoryEmoji: string;  // "🍱"
  pocket: string;         // "sehari-hari"
  pocketLabel: string;    // "Sehari-hari"
  amount: number;         // 35000
  
  // Metadata
  count: number;          // Frequency (how many times used)
  lastUsed: string;       // ISO date of last usage
  
  // Computed
  displayAmount: string;  // "Rp 35.000"
}

interface CombinationKey {
  name: string;
  category: string;
  pocket: string;
  amount: number;
}

interface CombinationData {
  combination: CombinationKey;
  count: number;
  lastUsed: string;
}

/**
 * Get smart suggestions for expense entry based on user's history
 * 
 * Algorithm:
 * 1. Get expenses from last 30 days with names
 * 2. Group by combination (name + category + pocket + amount)
 * 3. Sort by frequency (most used first)
 * 4. Get top 5 most frequent
 * 5. Get last 2 unique from last 7 days
 * 6. Merge and deduplicate, limit to 7 items
 */
export function getSuggestions(
  expenses: Expense[],
  pockets: any[],
  limit = 7
): Suggestion[] {
  // Filter: only expenses with names from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentExpenses = expenses.filter((exp) => {
    if (!exp.name || exp.name.trim() === "") return false;
    const expDate = new Date(exp.date);
    return expDate >= thirtyDaysAgo;
  });

  if (recentExpenses.length === 0) {
    return [];
  }

  // Get all categories for lookup
  const allCategories = getAllCategories();
  
  // Group by combination
  const combinationMap = new Map<string, CombinationData>();
  
  recentExpenses.forEach((exp) => {
    // Create unique key
    const key = `${exp.name}|${exp.category || "uncategorized"}|${exp.pocket}|${exp.amount}`;
    
    if (combinationMap.has(key)) {
      const existing = combinationMap.get(key)!;
      existing.count++;
      // Update lastUsed if this expense is more recent
      if (new Date(exp.date) > new Date(existing.lastUsed)) {
        existing.lastUsed = exp.date;
      }
    } else {
      combinationMap.set(key, {
        combination: {
          name: exp.name,
          category: exp.category || "uncategorized",
          pocket: exp.pocket,
          amount: exp.amount,
        },
        count: 1,
        lastUsed: exp.date,
      });
    }
  });

  // Convert to array and sort by count (frequency)
  const sortedByFrequency = Array.from(combinationMap.values())
    .sort((a, b) => b.count - a.count);

  // Get top 5 most frequent
  const topFrequent = sortedByFrequency.slice(0, 5);

  // Get last 7 days unique (most recent)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const lastWeekExpenses = recentExpenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= sevenDaysAgo;
  });

  // Group last week expenses by combination
  const lastWeekMap = new Map<string, CombinationData>();
  lastWeekExpenses.forEach((exp) => {
    const key = `${exp.name}|${exp.category || "uncategorized"}|${exp.pocket}|${exp.amount}`;
    if (!lastWeekMap.has(key)) {
      lastWeekMap.set(key, {
        combination: {
          name: exp.name,
          category: exp.category || "uncategorized",
          pocket: exp.pocket,
          amount: exp.amount,
        },
        count: 1,
        lastUsed: exp.date,
      });
    }
  });

  // Sort by most recent
  const lastWeekSorted = Array.from(lastWeekMap.values())
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 2);

  // Merge: frequent + recent, remove duplicates
  const merged = [...topFrequent];
  const existingKeys = new Set(topFrequent.map(item => 
    `${item.combination.name}|${item.combination.category}|${item.combination.pocket}|${item.combination.amount}`
  ));

  lastWeekSorted.forEach((item) => {
    const key = `${item.combination.name}|${item.combination.category}|${item.combination.pocket}|${item.combination.amount}`;
    if (!existingKeys.has(key)) {
      merged.push(item);
      existingKeys.add(key);
    }
  });

  // Limit to requested amount
  const limited = merged.slice(0, limit);

  // Convert to Suggestion format with validation
  const suggestions: Suggestion[] = limited
    .map((item) => {
      const { combination, count, lastUsed } = item;
      
      // Skip if name is missing (shouldn't happen, but safety check)
      if (!combination.name) {
        return null;
      }
      
      // Get category info
      const categoryInfo = allCategories.find((cat) => cat.id === combination.category);
      const categoryLabel = categoryInfo?.label || "Tanpa Kategori";
      const categoryEmoji = categoryInfo?.emoji || "";

      // Get pocket info
      const pocketInfo = pockets.find((p) => p.id === combination.pocket);
      const pocketLabel = pocketInfo?.name || combination.pocket || "Unknown";

      return {
        name: combination.name,
        category: combination.category,
        categoryLabel,
        categoryEmoji,
        pocket: combination.pocket,
        pocketLabel,
        amount: combination.amount,
        count,
        lastUsed,
        displayAmount: formatCurrency(combination.amount),
      };
    })
    .filter((suggestion): suggestion is Suggestion => suggestion !== null);

  return suggestions;
}

/**
 * Filter suggestions based on search query
 */
export function filterSuggestions(
  suggestions: Suggestion[],
  query?: string
): Suggestion[] {
  // Return all suggestions if query is empty/undefined
  if (!query || query.trim() === "") {
    return suggestions;
  }

  const lowerQuery = query.toLowerCase().trim();

  return suggestions.filter((suggestion) => {
    // Safely check each field (handle potential undefined values)
    const nameMatch = suggestion.name?.toLowerCase().includes(lowerQuery) || false;
    const categoryMatch = suggestion.categoryLabel?.toLowerCase().includes(lowerQuery) || false;
    const pocketMatch = suggestion.pocketLabel?.toLowerCase().includes(lowerQuery) || false;
    
    return nameMatch || categoryMatch || pocketMatch;
  });
}
