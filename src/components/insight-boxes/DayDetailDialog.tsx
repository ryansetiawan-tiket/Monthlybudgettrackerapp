/**
 * 📋 Day Detail Dialog Component
 * 
 * Shows all transactions for a specific day
 * Platform-aware: Dialog (desktop) vs Drawer (mobile)
 * 
 * Created: 2025-11-09
 * Part of: Hybrid Insight Boxes v3 feature
 */

import { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer';
import { useIsMobile } from '../ui/use-mobile';
import { formatCurrency } from '../../utils/currency';
import { formatDayName } from '../../utils/insightEngine';
import type { BusiestDayData } from '../../utils/insightEngine';

interface DayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: BusiestDayData | null;
}

interface ExpenseCardProps {
  name: string;
  amount: number;
  category?: string;
  compact?: boolean;
}

const ExpenseCard = memo(function ExpenseCard({
  name,
  amount,
  category,
  compact = false,
}: ExpenseCardProps) {
  if (compact) {
    // Mobile compact version
    return (
      <div className="p-3 bg-card border border-border rounded-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {name}
            </p>
            {category && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {category}
              </p>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground flex-shrink-0">
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {name}
          </p>
          {category && (
            <p className="text-xs text-muted-foreground mt-1">
              {category}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground flex-shrink-0">
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
});

export const DayDetailDialog = memo(function DayDetailDialog({
  open,
  onOpenChange,
  data,
}: DayDetailDialogProps) {
  const isMobile = useIsMobile();

  if (!data) return null;

  const dayName = formatDayName(data.date);
  const sortedExpenses = [...data.expenses].sort((a, b) => b.amount - a.amount);

  if (isMobile) {
    // Mobile: Drawer
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent aria-describedby={undefined}>
          <DrawerHeader>
            <DrawerTitle>Transaksi {dayName}</DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 pb-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {sortedExpenses.map((expense, index) => (
              <ExpenseCard
                key={expense.id || index}
                name={expense.name}
                amount={expense.amount}
                category={expense.category}
                compact
              />
            ))}
          </div>

          {/* Footer with total */}
          <div className="px-4 py-3 border-t bg-muted/30 sticky bottom-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {sortedExpenses.length} transaksi
              </p>
              <p className="text-sm font-semibold text-foreground">
                Total: {formatCurrency(data.total)}
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Transaksi Hari {dayName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {sortedExpenses.map((expense, index) => (
            <ExpenseCard
              key={expense.id || index}
              name={expense.name}
              amount={expense.amount}
              category={expense.category}
            />
          ))}
        </div>

        {/* Footer with total */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {sortedExpenses.length} transaksi
            </p>
            <p className="text-sm font-semibold text-foreground">
              Total: {formatCurrency(data.total)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
