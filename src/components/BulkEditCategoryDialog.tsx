import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "./ui/sheet";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";
import { EXPENSE_CATEGORIES } from "../constants";
import { getCategoryEmoji, getCategoryLabel } from "../utils/calculations";
import type { ExpenseCategory } from "../types";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Kategori</SheetTitle>
          <SheetDescription>
            {selectedExpenseIds.length} pengeluaran dipilih
          </SheetDescription>
        </SheetHeader>
        
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
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
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
                      <span className="text-xs">{getCategoryEmoji(expense.category)}</span>
                    )}
                    <span className="truncate">{expense.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2 sm:gap-0 mt-auto">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">
            Batal
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading || !selectedCategory} className="flex-1">
            {isLoading ? "Mengupdate..." : "Update"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
