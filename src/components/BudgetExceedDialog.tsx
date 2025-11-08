/**
 * Budget Exceed Dialog Component
 * Phase 9 - Priority 2: Confirmation dialog for budget exceed
 * 
 * Shows a warning dialog BEFORE saving expense if it will cause budget to exceed limit.
 * User can choose to:
 * - Cancel: Stay in form without saving
 * - Proceed: Continue with save (will trigger toast alert after)
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { formatCurrency } from "../utils/currency";
import { ScrollArea } from "./ui/scroll-area";

export interface BudgetExceedInfo {
  categoryId: string;
  categoryLabel: string;
  currentTotal: number;
  projectedTotal: number;
  limit: number;
  excess: number;
  currentPercent: number;
  projectedPercent: number;
}

interface BudgetExceedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exceedingCategories: BudgetExceedInfo[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Dialog that warns user when expense will exceed budget limit
 * 
 * @example Single Category
 * <BudgetExceedDialog
 *   open={true}
 *   exceedingCategories={[{
 *     categoryId: 'game',
 *     categoryLabel: 'Game',
 *     currentTotal: 450000,
 *     projectedTotal: 600000,
 *     limit: 500000,
 *     excess: 100000,
 *     currentPercent: 90,
 *     projectedPercent: 120
 *   }]}
 *   onConfirm={() => saveExpense()}
 *   onCancel={() => stayInForm()}
 * />
 */
export function BudgetExceedDialog({
  open,
  onOpenChange,
  exceedingCategories,
  onConfirm,
  onCancel,
  isLoading = false,
}: BudgetExceedDialogProps) {
  const isSingle = exceedingCategories.length === 1;
  const first = exceedingCategories[0];

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md pointer-events-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">
            {isSingle ? "⚠️ YAKIN, NIH BOS?" : "⚠️ WADUH! BANYAK BUDGET BAKAL JEBOL!"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              {isSingle ? (
                <>
                  <p className="text-sm text-foreground">
                    Budget <strong className="text-[#EF4444]">'{first.categoryLabel}'</strong> lo bakal JEBOL nih kalo ditambahin!
                  </p>
                  <div className="bg-muted p-3 rounded-md space-y-1.5 text-sm">
                    <p className="font-medium text-foreground">📊 Detail:</p>
                    <p className="text-muted-foreground">
                      • Sekarang: {formatCurrency(first.currentTotal)} / {formatCurrency(first.limit)} 
                      <span className="font-medium text-foreground"> ({first.currentPercent}%)</span>
                    </p>
                    <p className="text-[#EF4444] font-medium">
                      • Bakal jadi: {formatCurrency(first.projectedTotal)} ({first.projectedPercent}%) 🚨
                    </p>
                    <p className="text-muted-foreground">
                      • Lebih: <span className="font-medium text-[#EF4444]">+{formatCurrency(first.excess)}</span> dari limit
                    </p>
                  </div>
                  <p className="text-sm text-foreground">Gimana nih?</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-foreground">Beberapa budget bakal jebol kalo lo tetap nambah:</p>
                  <ScrollArea className="max-h-[240px]">
                    <div className="bg-muted p-3 rounded-md space-y-3 text-sm">
                      {exceedingCategories.map(cat => (
                        <div key={cat.categoryId} className="space-y-1">
                          <p className="font-medium text-foreground">• {cat.categoryLabel}:</p>
                          <p className="ml-4 text-muted-foreground">
                            - Sekarang: {formatCurrency(cat.currentTotal)} 
                            <span className="font-medium text-foreground"> ({cat.currentPercent}%)</span>
                          </p>
                          <p className="ml-4 text-[#EF4444] font-medium">
                            - Bakal jadi: {formatCurrency(cat.projectedTotal)} ({cat.projectedPercent}%) 🚨
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="text-sm text-foreground">Serius mau lanjut?</p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading} className="pointer-events-auto">
            Batal Aja Deh
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground pointer-events-auto"
          >
            Bodo Amat, Tetap Tambah
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
