import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";
import { useIsMobile } from "./ui/use-mobile";
import { cn } from "./ui/utils";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { getLocalDateFromISO } from "../utils/date-helpers";

interface WishlistItem {
  id: string;
  pocketId: string;
  name: string;
  amount: number;
  priority: 1 | 2 | 3;
  description?: string;
  url?: string;
  targetDate?: string;
  tags?: string[];
  notes?: string;
}

interface WishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pocketId: string;
  pocketName: string;
  item?: WishlistItem | null;
  onSave: (item: Partial<WishlistItem>) => Promise<void>;
}

const PRIORITY_OPTIONS = [
  { value: '1', label: '⭐ High', color: 'destructive' },
  { value: '2', label: '🟡 Medium', color: 'default' },
  { value: '3', label: '🔵 Low', color: 'secondary' }
];

export function WishlistDialog({
  open,
  onOpenChange,
  pocketId,
  pocketName,
  item,
  onSave
}: WishlistDialogProps) {
  const [formData, setFormData] = useState<Partial<WishlistItem>>({
    name: '',
    amount: 0,
    priority: 2,
    description: '',
    url: '',
    targetDate: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();

  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'wishlist-dialog'
  );

  // Update form data when item prop changes (for edit mode)
  useEffect(() => {
    if (open) {
      if (item) {
        setFormData({
          name: item.name || '',
          amount: item.amount || 0,
          priority: item.priority || 2,
          description: item.description || '',
          url: item.url || '',
          targetDate: item.targetDate ? getLocalDateFromISO(item.targetDate) : '',
          notes: item.notes || ''
        });
      } else {
        // Reset form when no item (add mode)
        setFormData({
          name: '',
          amount: 0,
          priority: 2,
          description: '',
          url: '',
          targetDate: '',
          notes: ''
        });
      }
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave({
        ...formData,
        pocketId,
        priority: formData.priority || 2,
        targetDate: formData.targetDate || undefined
      });
      
      // Always close the dialog after successful save
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving wishlist item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const dialogTitle = item ? 'Edit Item Wishlist' : 'Tambah ke Wishlist';
  const dialogDescription = `Tambahkan item yang ingin dibeli ke ${pocketName}`;

  const formContent = (
    <div className="space-y-5 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Item *</Label>
        <Input
          id="name"
          placeholder="Contoh: Gaming Console"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Harga *</Label>
        <Input
          id="amount"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={formatCurrencyInput(formData.amount || '')}
          onChange={(e) => setFormData({ ...formData, amount: parseCurrencyInput(e.target.value) })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Prioritas</Label>
        <Select
          value={formData.priority?.toString() || '2'}
          onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) as 1 | 2 | 3 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Simulasi akan mengurutkan berdasarkan prioritas
        </p>
      </div>

      <div className="space-y-2">
        <Label>Target Tanggal (opsional)</Label>
        <Popover modal={true}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-start text-left",
                !formData.targetDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {formData.targetDate ? format(new Date(formData.targetDate), "d MMMM yyyy") : "Pilih tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[60]" align="start">
            <Calendar 
              mode="single" 
              selected={formData.targetDate ? new Date(formData.targetDate) : undefined}
              onSelect={(date) => setFormData({ ...formData, targetDate: date ? format(date, 'yyyy-MM-dd') : '' })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi (opsional)</Label>
        <Textarea
          id="description"
          placeholder="Deskripsi singkat tentang item ini..."
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Link Produk (opsional)</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://..."
          value={formData.url || ''}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Textarea
          id="notes"
          placeholder="Catatan tambahan..."
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );

  const footerButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSaving}
      >
        {item ? 'Batal' : 'Tutup'}
      </Button>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Menyimpan...' : item ? 'Update' : 'Tambah'}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} dismissible={true}>
        <DrawerContent 
          className="h-[90vh] flex flex-col rounded-t-2xl p-0"
          aria-describedby={undefined}
        >
          <DrawerHeader className="px-4 pt-6 pb-4 border-b shrink-0">
            <DrawerTitle>{dialogTitle}</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-4 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              {formContent}
            </div>
            <div className="flex gap-2 p-4 border-t shrink-0">
              {footerButtons}
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {formContent}
          <DialogFooter className="gap-2 sm:gap-0">
            {footerButtons}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
