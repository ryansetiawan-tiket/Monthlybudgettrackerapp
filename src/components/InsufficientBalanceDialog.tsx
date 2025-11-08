/**
 * InsufficientBalanceDialog Component
 * 
 * Reactive validation dialog that blocks transactions
 * when pocket balance is insufficient.
 * 
 * This is a fail-safe mechanism in case proactive
 * validation is bypassed due to bugs or race conditions.
 * 
 * @example
 * <InsufficientBalanceDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   pocketName="Game"
 *   availableBalance={500000}
 *   attemptedAmount={750000}
 * />
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { formatCurrency } from "../utils/currency";

interface InsufficientBalanceDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Callback to control dialog state */
  onOpenChange: (open: boolean) => void;
  /** Name of the pocket with insufficient balance */
  pocketName: string;
  /** Available balance in the pocket */
  availableBalance: number;
  /** Amount user attempted to transact */
  attemptedAmount: number;
}

/**
 * Displays a blocking dialog when a transaction exceeds pocket balance
 */
export function InsufficientBalanceDialog({
  open,
  onOpenChange,
  pocketName,
  availableBalance,
  attemptedAmount,
}: InsufficientBalanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">⛔️</span>
            SALDONYA NGGAK CUKUP, BOS!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-neutral-300 leading-relaxed">
            Duit di kantong{' '}
            <span className="font-semibold text-white">'{pocketName}'</span>{' '}
            (sisa{' '}
            <span className="font-semibold text-yellow-500">
              {formatCurrency(availableBalance)}
            </span>
            ) nggak cukup buat transaksi{' '}
            <span className="font-semibold text-red-500">
              {formatCurrency(attemptedAmount)}
            </span>{' '}
            ini.
          </p>
          
          <p className="text-neutral-400 text-sm">
            Coba cek lagi angkanya.
          </p>
        </div>
        
        <DialogFooter>
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Oke, Aku Ngerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
