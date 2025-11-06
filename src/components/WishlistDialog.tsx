import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";

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
          targetDate: item.targetDate?.split('T')[0] || '',
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
        priority: formData.priority || 2
      });
      onOpenChange(false);
      // Form will be reset by useEffect when dialog closes and item becomes null
    } catch (error) {
      console.error('Error saving wishlist item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const dialogTitle = item ? 'Edit Item Wishlist' : 'Tambah ke Wishlist';
  const dialogDescription = `Tambahkan item yang ingin dibeli ke ${pocketName}`;

  const formFields = (
    <form onSubmit={handleSubmit}>
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
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
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
              <Label htmlFor="targetDate">Target Tanggal (opsional)</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate || ''}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : item ? 'Update' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent 
        className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto z-[150]" 
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {formFields}
      </DialogContent>
    </Dialog>
  );
}
