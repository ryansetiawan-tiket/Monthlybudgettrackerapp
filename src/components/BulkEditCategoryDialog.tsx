import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";
import { EXPENSE_CATEGORIES } from "../constants";
import { getCategoryEmoji, getCategoryLabel } from "../utils/calculations";
import type { ExpenseCategory } from "../types";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { getAllCategories } from "../utils/categoryManager";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";
import { useIsMobile } from "./ui/use-mobile";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category?: string;
}

interface BulkEditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExpenseIds: string[];
  expenses: Expense[];
  onUpdate: (ids: string[], category: ExpenseCategory) => Promise<void>;
}

export function BulkEditCategoryDialog({
  open,
  onOpenChange,
  selectedExpenseIds,
  expenses,
  onUpdate
}: BulkEditCategoryDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  
  // Register drawer for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'bulk-edit-category'
  );
  
  // Phase 8: Get custom categories
  const { settings } = useCategorySettings();
  const allCategories = useMemo(() => getAllCategories(settings), [settings]);

  const selectedExpenses = expenses.filter(e => selectedExpenseIds.includes(e.id));

  const handleUpdate = async () => {
    if (!selectedCategory) {
      toast.error("Pilih kategori terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(selectedExpenseIds, selectedCategory);
      toast.success(`${selectedExpenseIds.length} pengeluaran berhasil diupdate`);
      onOpenChange(false);
      setSelectedCategory(undefined);
    } catch (error) {
      console.error("Error updating categories:", error);
      toast.error("Gagal update kategori");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCategory(undefined);
    onOpenChange(false);
  };

  const isMobile = useIsMobile();

  // Content component (reused for both Dialog and Drawer)
  const content = (
    <div className="flex-1 space-y-6 py-6 overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="category">Kategori Baru</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as ExpenseCategory)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {allCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  {cat.isCustom && <span className="text-xs text-muted-foreground">(Custom)</span>}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedExpenses.length > 0 && (
        <div className="space-y-2">
          <Label>Yang akan diupdate:</Label>
          <div className="max-h-96 overflow-y-auto border rounded-md p-3 space-y-1.5">
            {selectedExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-2 text-sm">
                {expense.category && (
                  <span className="text-xs">{getCategoryEmoji(expense.category, settings)}</span>
                )}
                <span className="truncate">{expense.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const footer = (
    <>
      <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">
        Batal
      </Button>
      <Button onClick={handleUpdate} disabled={isLoading || !selectedCategory} className="flex-1">
        {isLoading ? "Mengupdate..." : "Update"}
      </Button>
    </>
  );

  // Mobile: Drawer
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col px-4">
          <SheetHeader>
            <SheetTitle>Edit Kategori</SheetTitle>
            <SheetDescription>
              {selectedExpenseIds.length} pengeluaran dipilih
            </SheetDescription>
          </SheetHeader>
          
          {content}

          <SheetFooter className="gap-2 sm:gap-0 mt-auto">
            {footer}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
          <DialogDescription>
            {selectedExpenseIds.length} pengeluaran dipilih
          </DialogDescription>
        </DialogHeader>
        
        {content}

        <DialogFooter className="gap-2 sm:gap-0">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}