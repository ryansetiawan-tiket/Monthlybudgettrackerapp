import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "./ui/drawer";
import { useIsMobile } from "./ui/use-mobile";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { usePreventPullToRefresh } from "../hooks/usePreventPullToRefresh";
import { DialogPriority } from "../constants";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBudget: number;
  notes: string;
  onBudgetChange: (field: string, value: string | number) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function BudgetForm({
  open,
  onOpenChange,
  initialBudget,
  notes,
  onBudgetChange,
  onSave,
  isSaving,
}: BudgetFormProps) {
  const isMobile = useIsMobile();
  
  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'budget-form'
  );
  
  // Prevent pull to refresh on mobile
  usePreventPullToRefresh(open);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        <DrawerContent className="h-[90vh] flex flex-col rounded-t-2xl p-0">
          <DrawerHeader className="px-4 pt-6 pb-4 border-b">
            <DrawerTitle>Budget Bulanan</DrawerTitle>
            <DrawerDescription>
              Atur budget awal dan catatan untuk bulan ini
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
      <DialogContent className="sm:max-w-[600px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Budget Bulanan</DialogTitle>
          <DialogDescription>
            Atur budget awal dan catatan untuk bulan ini
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}