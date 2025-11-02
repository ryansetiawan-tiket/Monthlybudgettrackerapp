import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { AdditionalIncomeForm } from "./AdditionalIncomeForm";

interface AddAdditionalIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIncome: (income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
    deduction: number;
  }) => void;
  isAdding: boolean;
}

export function AddAdditionalIncomeDialog({
  open,
  onOpenChange,
  onAddIncome,
  isAdding,
}: AddAdditionalIncomeDialogProps) {
  const handleIncomeSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Pemasukan Tambahan</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <AdditionalIncomeForm 
            onAddIncome={onAddIncome} 
            isAdding={isAdding}
            onSuccess={handleIncomeSuccess}
            inDialog={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
