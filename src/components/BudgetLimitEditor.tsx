/**
 * Budget Limit Editor Component
 * Phase 8: Set budget limits per category
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from './ui/drawer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { useIsMobile } from './ui/use-mobile';
import { CategoryConfig, CategoryBudget } from '../types';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currency';
import { formatCurrency } from '../utils/currency';
import { AlertCircle } from 'lucide-react';
import { useConfirm } from '../hooks/useConfirm';

interface BudgetLimitEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryConfig;
  onSave: (budget: CategoryBudget) => void;
  onRemove: () => void;
}

export function BudgetLimitEditor({
  open,
  onOpenChange,
  category,
  onSave,
  onRemove
}: BudgetLimitEditorProps) {
  const isMobile = useIsMobile();
  const { confirm, ConfirmDialog } = useConfirm();

  const [enabled, setEnabled] = useState(category.budget?.enabled ?? false);
  const [limit, setLimit] = useState(category.budget?.limit?.toString() || '1000000');
  const [warningAt, setWarningAt] = useState(category.budget?.warningAt ?? 80);
  const [resetDay, setResetDay] = useState(category.budget?.resetDay ?? 1);
  const [errors, setErrors] = useState<{ limit?: string; resetDay?: string }>({});

  // Load budget data
  useEffect(() => {
    if (category.budget) {
      setEnabled(category.budget.enabled);
      setLimit(category.budget.limit.toString());
      setWarningAt(category.budget.warningAt);
      setResetDay(category.budget.resetDay);
    } else {
      setEnabled(false);
      setLimit('1000000');
      setWarningAt(80);
      setResetDay(1);
    }
    setErrors({});
  }, [category, open]);

  // Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      newErrors.limit = 'Budget limit must be greater than 0';
    }

    if (resetDay < 1 || resetDay > 31) {
      newErrors.resetDay = 'Reset day must be between 1 and 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;

    onSave({
      limit: parseInt(limit),
      warningAt,
      enabled,
      resetDay
    });
  };

  // Handle remove
  const handleRemove = async () => {
    const confirmed = await confirm({
      title: "Hapus Budget Limit?",
      description: "Hapus batasan budget untuk kategori ini?",
      confirmText: "Hapus",
      cancelText: "Batal",
      variant: "destructive",
    });
    
    if (confirmed) {
      onRemove();
      onOpenChange(false);
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Category Info */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <span className="text-2xl">{category.emoji}</span>
        <div>
          <p className="font-medium">{category.label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-xs text-muted-foreground">
              {category.isCustom ? 'Custom Category' : 'Default Category'}
            </span>
          </div>
        </div>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Enable Budget Limit</Label>
          <p className="text-sm text-muted-foreground">
            Set a monthly spending limit for this category
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <>
          {/* Budget Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">Monthly Budget Limit *</Label>
            <Input
              id="limit"
              type="text"
              inputMode="numeric"
              value={formatCurrencyInput(limit)}
              onChange={(e) => setLimit(parseCurrencyInput(e.target.value).toString())}
              placeholder="1000000"
            />
            {errors.limit && (
              <p className="text-sm text-destructive">{errors.limit}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formatCurrency(parseInt(limit) || 0)} per bulan
            </p>
          </div>

          {/* Warning Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Warning Threshold</Label>
              <span className="text-sm font-medium">{warningAt}%</span>
            </div>
            <Slider
              value={[warningAt]}
              onValueChange={([value]) => setWarningAt(value)}
              min={50}
              max={95}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50%</span>
              <span>70%</span>
              <span>90%</span>
              <span>95%</span>
            </div>
            <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg text-sm">
              <AlertCircle className="size-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-muted-foreground">
                You'll be warned when spending reaches {warningAt}% of the budget limit (
                {formatCurrency((parseInt(limit) || 0) * warningAt / 100)})
              </p>
            </div>
          </div>

          {/* Reset Day */}
          <div className="space-y-2">
            <Label htmlFor="resetDay">Monthly Reset Day</Label>
            <Input
              id="resetDay"
              type="number"
              value={resetDay}
              onChange={(e) => setResetDay(parseInt(e.target.value) || 1)}
              placeholder="1"
              min="1"
              max="31"
            />
            {errors.resetDay && (
              <p className="text-sm text-destructive">{errors.resetDay}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Budget tracking resets on day {resetDay} of each month
            </p>
          </div>

          {/* Visual Status Examples */}
          <div className="space-y-2">
            <Label>Status Indicators</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Safe (below {warningAt}%)</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">Warning ({warningAt}% - 89%)</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded border border-orange-500/20">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm">Danger (90% - 99%)</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Exceeded (100%+)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const footer = (
    <div className="flex gap-2 justify-between w-full">
      {category.budget && (
        <Button variant="destructive" onClick={handleRemove}>
          Remove Budget
        </Button>
      )}
      <div className="flex gap-2 ml-auto">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Set Budget Limit</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
              {content}
            </div>
            <DrawerFooter>
              {footer}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <ConfirmDialog />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Budget Limit</DialogTitle>
          </DialogHeader>
          {content}
          <DialogFooter>
            {footer}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </>
  );
}
