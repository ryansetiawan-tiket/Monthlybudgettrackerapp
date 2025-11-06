import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { cn } from "./ui/utils";
import { useIsMobile } from "./ui/use-mobile";
import { formatCurrency } from "../utils/currency";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";

interface Pocket {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface PocketBalance {
  pocketId: string;
  availableBalance: number;
}

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pockets: Pocket[];
  balances: Map<string, PocketBalance>;
  onTransfer: (transfer: {
    fromPocketId: string;
    toPocketId: string;
    amount: number;
    date: string;
    note?: string;
  }) => Promise<void>;
  defaultFromPocket?: string;
  defaultToPocket?: string;
}

export function TransferDialog({ 
  open, 
  onOpenChange, 
  pockets, 
  balances,
  onTransfer,
  defaultFromPocket,
  defaultToPocket
}: TransferDialogProps) {
  const [fromPocketId, setFromPocketId] = useState('');
  const [toPocketId, setToPocketId] = useState('');
  const [amount, setAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'transfer-dialog'
  );

  // Watch for changes in default props and update state when dialog is open
  useEffect(() => {
    if (open) {
      if (defaultFromPocket) {
        setFromPocketId(defaultFromPocket);
      }
      if (defaultToPocket) {
        setToPocketId(defaultToPocket);
      }
    }
  }, [open, defaultFromPocket, defaultToPocket]);

  // Evaluate math expression
  const evaluateExpression = (expression: string): number | null => {
    try {
      // Remove spaces and validate characters
      const cleaned = expression.replace(/\s/g, '');
      if (!cleaned) return null;
      
      // Only allow numbers, operators, decimal point, and parentheses
      if (!/^[0-9+\-*/.()%]+$/.test(cleaned)) {
        return null;
      }

      // Handle percentage calculations
      // Convert expressions like "100-20%" to "100-(100*0.20)"
      let processed = cleaned;
      
      // Match pattern: number followed by operator followed by number followed by %
      const percentPattern = /([0-9.]+)([\+\-\*\/])([0-9.]+)%/g;
      processed = processed.replace(percentPattern, (match, base, operator, percent) => {
        // Calculate the percentage of the base value
        return `${base}${operator}(${base}*${percent}/100)`;
      });
      
      // Match pattern: just number followed by %
      const simplePercentPattern = /([0-9.]+)%/g;
      processed = processed.replace(simplePercentPattern, (match, num) => {
        return `(${num}/100)`;
      });

      // Safely evaluate using Function constructor (safer than eval)
      const result = new Function('return ' + processed)();
      
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Math.round(result); // Round to nearest integer
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Calculate amount when expression changes
  useEffect(() => {
    const result = evaluateExpression(amount);
    setCalculatedAmount(result);
  }, [amount]);

  const selectedFromBalance = fromPocketId ? balances.get(fromPocketId) : null;
  const amountNum = calculatedAmount || 0;
  const isValid = fromPocketId && toPocketId && fromPocketId !== toPocketId && amountNum > 0;
  const insufficientBalance = selectedFromBalance && amountNum > selectedFromBalance.availableBalance;
  const showCalculation = amount.trim() !== '' && calculatedAmount !== null && amount !== calculatedAmount.toString();

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      await onTransfer({
        fromPocketId,
        toPocketId,
        amount: amountNum,
        date: date.toISOString(),
        note: note.trim() || undefined
      });

      // Reset form
      setFromPocketId('');
      setToPocketId('');
      setAmount('');
      setCalculatedAmount(null);
      setDate(new Date());
      setNote('');
      onOpenChange(false);
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFromPocketId('');
      setToPocketId('');
      setAmount('');
      setCalculatedAmount(null);
      setDate(new Date());
      setNote('');
    }
  }, [open]);

  const formContent = (
    <div className="space-y-4 py-4">
          {/* From Pocket */}
          <div className="space-y-2">
            <Label>Dari Kantong</Label>
            <Select value={fromPocketId} onValueChange={setFromPocketId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kantong sumber" />
              </SelectTrigger>
              <SelectContent>
                {pockets.map(pocket => {
                  const balance = balances.get(pocket.id);
                  return (
                    <SelectItem key={pocket.id} value={pocket.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{pocket.name}</span>
                        {balance && (
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(balance.availableBalance)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedFromBalance && (
              <p className="text-xs text-muted-foreground">
                Saldo tersedia: {formatCurrency(selectedFromBalance.availableBalance)}
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="size-5 text-muted-foreground" />
          </div>

          {/* To Pocket */}
          <div className="space-y-2">
            <Label>Ke Kantong</Label>
            <Select value={toPocketId} onValueChange={setToPocketId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kantong tujuan" />
              </SelectTrigger>
              <SelectContent>
                {pockets
                  .filter(p => p.id !== fromPocketId)
                  .map(pocket => (
                    <SelectItem key={pocket.id} value={pocket.id}>
                      {pocket.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0 atau 100000+50000-20%"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {showCalculation && (
              <div className="p-2 bg-accent rounded-md">
                <p className="text-xs text-muted-foreground">Hasil perhitungan:</p>
                <p className="text-primary">{formatCurrency(calculatedAmount)}</p>
              </div>
            )}
            {insufficientBalance && (
              <p className="text-xs text-red-600">
                Saldo tidak cukup
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left")}>
                  <CalendarIcon className="mr-2 size-4" />
                  {format(date, "d MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Catatan (opsional)</Label>
            <Textarea
              id="note"
              placeholder="Contoh: Untuk bayar tagihan"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
  );

  const footerButtons = (
    <>
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Batal
      </Button>
      <Button 
        onClick={handleSubmit} 
        disabled={!isValid || insufficientBalance || loading}
      >
        {loading ? 'Memproses...' : 'Transfer'}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} dismissible={true}>
        <DrawerContent 
          className="h-[75vh] flex flex-col rounded-t-2xl p-0"
          aria-describedby={undefined}
        >
          <DrawerHeader className="px-4 pt-6 pb-4 border-b">
            <DrawerTitle>Transfer Antar Kantong</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">
            {formContent}
          </div>
          <div className="flex gap-2 p-4 border-t">
            {footerButtons}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Transfer Antar Kantong</DialogTitle>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
