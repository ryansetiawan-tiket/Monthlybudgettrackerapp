import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { AdditionalIncomeForm } from "./AdditionalIncomeForm";
import { useIsMobile } from "./ui/use-mobile";

interface Pocket {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

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
    pocketId: string;
  }) => void;
  isAdding: boolean;
  pockets?: Pocket[];
  defaultTargetPocket?: string;
}

export function AddAdditionalIncomeDialog({
  open,
  onOpenChange,
  onAddIncome,
  isAdding,
  pockets = [],
  defaultTargetPocket,
}: AddAdditionalIncomeDialogProps) {
  const isMobile = useIsMobile();
  
  const handleIncomeSuccess = () => {
    onOpenChange(false);
  };

  const content = (
    <AdditionalIncomeForm 
      onAddIncome={onAddIncome} 
      isAdding={isAdding}
      onSuccess={handleIncomeSuccess}
      inDialog={true}
      pockets={pockets}
      defaultTargetPocket={defaultTargetPocket}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[75vh] flex flex-col rounded-t-2xl p-0"
        >
          <SheetHeader className="px-4 pt-6 pb-4 border-b">
            <SheetTitle>Tambah Pemasukan Tambahan</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Tambah Pemasukan Tambahan</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
