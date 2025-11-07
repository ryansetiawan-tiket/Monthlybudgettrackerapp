import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import { ExpenseCategory } from "../types";
import { getCategoryEmoji, getCategoryLabel } from "../utils/calculations";
import { motion } from "motion/react";
import { useCategorySettings } from "../hooks/useCategorySettings";

interface CategoryFilterBadgeProps {
  activeCategories: Set<ExpenseCategory>;
  onClear: () => void;
  itemCount: number;
}

export function CategoryFilterBadge({ 
  activeCategories, 
  onClear, 
  itemCount 
}: CategoryFilterBadgeProps) {
  // Phase 8: Get custom category settings
  const { settings } = useCategorySettings();
  
  if (activeCategories.size === 0) return null;

  const categories = Array.from(activeCategories);
  
  // Single category filter
  if (categories.length === 1) {
    const category = categories[0];
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 p-3 bg-accent rounded-lg border border-border"
      >
        <span className="text-sm flex-1">
          🔍 Filter: {getCategoryEmoji(category, settings)} {getCategoryLabel(category, settings)}
        </span>
        <Badge variant="secondary" className="shrink-0">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </Badge>
        <button
          onClick={onClear}
          className="ml-auto p-1 hover:bg-background rounded-full transition-colors shrink-0"
          aria-label="Clear filter"
        >
          <X className="size-4" />
        </button>
      </motion.div>
    );
  }
  
  // Multiple categories filter (for future multi-select)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 p-3 bg-accent rounded-lg border border-border flex-wrap"
    >
      <span className="text-sm">🔍 Filter:</span>
      {categories.map(cat => (
        <Badge key={cat} variant="secondary">
          {getCategoryEmoji(cat, settings)} {getCategoryLabel(cat, settings)}
        </Badge>
      ))}
      <Badge variant="secondary">{itemCount} items</Badge>
      <button
        onClick={onClear}
        className="ml-auto p-1 hover:bg-background rounded-full transition-colors"
        aria-label="Clear filter"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}
