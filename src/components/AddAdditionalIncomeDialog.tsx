import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { AdditionalIncomeForm } from "./AdditionalIncomeForm";
import { useIsMobile } from "./ui/use-mobile";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { usePreventPullToRefresh } from "../hooks/usePreventPullToRefresh";
import { DialogPriority } from "../constants";

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
  balances?: Map<string, {availableBalance: number}>;
  defaultTargetPocket?: string;
}

export function AddAdditionalIncomeDialog({
  open,
  onOpenChange,
  onAddIncome,
  isAdding,
  pockets = [],
  balances,
  defaultTargetPocket,
}: AddAdditionalIncomeDialogProps) {
  const isMobile = useIsMobile();

  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'add-income-dialog'
  );
  
  // Prevent pull-to-refresh on mobile
  usePreventPullToRefresh(open);
  
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
      balances={balances}
      defaultTargetPocket={defaultTargetPocket}
    />
  );

  if (isMobile) {
    return (
      <Drawer 
        open={open} 
        onOpenChange={(isOpen) => {
          // 🔒 Prevent closing during submission
          if (!isOpen && isAdding) {
            return; // Block close attempt
          }
          onOpenChange(isOpen);
        }}
        dismissible={!isAdding} // 🔒 Disable swipe-to-dismiss during submission
      >
        <DrawerContent className="h-[90vh] flex flex-col rounded-t-2xl p-0">
          <DrawerHeader className="px-4 pt-6 pb-4 border-b">
            <DrawerTitle>Tambah Pemasukan Tambahan</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // 🔒 Prevent closing during submission
        if (!isOpen && isAdding) {
          return; // Block close attempt
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto" 
        aria-describedby={undefined}
        onInteractOutside={(e) => {
          // 🔒 Prevent outside click close during submission
          if (isAdding) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // 🔒 Prevent ESC key close during submission
          if (isAdding) {
            e.preventDefault();
          }
        }}
      >
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