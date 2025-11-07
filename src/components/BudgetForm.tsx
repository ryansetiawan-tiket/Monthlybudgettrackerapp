import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowDownToLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "./ui/drawer";
import { useIsMobile } from "./ui/use-mobile";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBudget: number;
  carryover: number;
  notes: string;
  onBudgetChange: (field: string, value: string | number) => void;
  onSave: () => void;
  isSaving: boolean;
  suggestedCarryover: number | null;
  isLoadingCarryover: boolean;
}

export function BudgetForm({
  open,
  onOpenChange,
  initialBudget,
  carryover,
  notes,
  onBudgetChange,
  onSave,
  isSaving,
  suggestedCarryover,
  isLoadingCarryover,
}: BudgetFormProps) {
  const isMobile = useIsMobile();
  
  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'budget-form'
  );
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAutoFill = () => {
    if (suggestedCarryover !== null) {
      onBudgetChange("carryover", suggestedCarryover);
    }
  };

  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  const formContent = (
    <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="initialBudget">Budget Awal</Label>
            <Input
              id="initialBudget"
              type="text"
              inputMode="numeric"
              value={formatCurrencyInput(initialBudget || "")}
              onChange={(e) => onBudgetChange("initialBudget", parseCurrencyInput(e.target.value).toString())}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="carryover">Carryover Bulan Sebelumnya (Opsional)</Label>
              {suggestedCarryover !== null && suggestedCarryover !== 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoFill}
                  disabled={isLoadingCarryover}
                  className="h-auto py-1 px-2"
                >
                  <ArrowDownToLine className="size-3 mr-1" />
                  Auto-fill
                </Button>
              )}
            </div>
            <Input
              id="carryover"
              type="text"
              inputMode="numeric"
              value={formatCurrencyInput(carryover || "")}
              onChange={(e) => onBudgetChange("carryover", parseCurrencyInput(e.target.value).toString())}
              placeholder="0"
            />
            {suggestedCarryover !== null && (
              <p className="text-xs text-muted-foreground">
                {isLoadingCarryover ? (
                  "Memuat sisa bulan lalu..."
                ) : (
                  <>
                    Sisa bulan lalu: {" "}
                    <span className={suggestedCarryover >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(suggestedCarryover)}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => onBudgetChange("notes", e.target.value)}
              placeholder="Tulis catatan untuk bulan ini..."
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Menyimpan..." : "Simpan Budget"}
          </Button>
        </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} dismissible={true}>
        <DrawerContent className="h-[75vh] flex flex-col rounded-t-2xl p-0">
          <DrawerHeader className="px-4 pt-6 pb-4 border-b">
            <DrawerTitle>Budget Bulanan</DrawerTitle>
            <DrawerDescription>
              Atur budget awal, carryover, dan catatan untuk bulan ini
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Budget Bulanan</DialogTitle>
          <DialogDescription>
            Atur budget awal, carryover, dan catatan untuk bulan ini
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
