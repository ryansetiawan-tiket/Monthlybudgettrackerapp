import { motion, AnimatePresence } from "motion/react";
import { Lightbulb } from "lucide-react";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import type { Suggestion } from "../utils/smartSuggestions";
import { cn } from "./ui/utils";

interface SmartSuggestionsProps {
  // Data
  suggestions: Suggestion[];
  
  // Visibility
  visible: boolean;
  
  // Handlers
  onSelect: (suggestion: Suggestion) => void;
  onClose?: () => void;
  
  // Optional
  filterQuery?: string;
  loading?: boolean;
}

export function SmartSuggestions({
  suggestions,
  visible,
  onSelect,
  onClose,
  loading = false,
}: SmartSuggestionsProps) {
  if (!visible) return null;

  // No suggestions available (fresh user)
  if (suggestions.length === 0 && !loading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-2"
        >
          <Card className="p-4 bg-muted/50 border-dashed">
            <div className="flex items-start gap-3">
              <Lightbulb className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Belum ada riwayat transaksi
                </p>
                <p className="text-xs text-muted-foreground">
                  Mulai input untuk mendapat saran otomatis berikutnya 🎯
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="mt-2">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="size-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat saran...</p>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Has suggestions
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-2"
      >
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-muted/30 border-b">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-primary" />
              <p className="text-sm font-medium">Sering digunakan:</p>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="max-h-[280px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div key={index}>
                <button
                  type="button"
                  onClick={() => onSelect(suggestion)}
                  className={cn(
                    "w-full px-4 py-3 text-left",
                    "hover:bg-muted/50 active:bg-muted transition-colors",
                    "focus:outline-none focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Category Emoji */}
                    {suggestion.categoryEmoji && (
                      <span className="text-2xl shrink-0 mt-0.5">
                        {suggestion.categoryEmoji}
                      </span>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <p className="font-medium truncate">
                        {suggestion.name}
                      </p>
                      
                      {/* Meta info */}
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {suggestion.categoryLabel} • {suggestion.pocketLabel} • {suggestion.displayAmount}
                      </p>
                      
                      {/* Frequency badge (subtle) */}
                      {suggestion.count > 1 && (
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Digunakan {suggestion.count}× 
                        </p>
                      )}
                    </div>
                  </div>
                </button>
                
                {/* Separator (not for last item) */}
                {index < suggestions.length - 1 && (
                  <Separator className="mx-4" />
                )}
              </div>
            ))}
          </div>

          {/* Footer hint (optional) */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 bg-muted/20 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Ketuk untuk mengisi otomatis semua field
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
