import { Pencil, Trash2 } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { Button } from "./ui/button";

interface ItemActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: 'expense' | 'income';
  onEdit: () => void;
  onDelete: () => void;
  showMoveToIncome?: boolean;
  onMoveToIncome?: () => void;
}

/**
 * Bottom sheet for mobile actions (Edit, Delete, Move to Income)
 * Triggered by long-press on expense/income items
 */
export function ItemActionSheet({
  open,
  onOpenChange,
  itemName,
  itemType,
  onEdit,
  onDelete,
  showMoveToIncome = false,
  onMoveToIncome,
}: ItemActionSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerTitle className="sr-only">
          Aksi untuk {itemName}
        </DrawerTitle>
        
        <div className="px-4 pb-6 pt-4">
          {/* Item Preview */}
          <div className="text-center mb-4 pb-4 border-b">
            <p className="text-muted-foreground text-sm">Aksi untuk</p>
            <p className="font-medium truncate">{itemName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ({itemType === 'expense' ? 'Pengeluaran' : 'Pemasukan'})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Move to Income (if applicable) */}
            {showMoveToIncome && onMoveToIncome && (
              <Button
                variant="outline"
                className="w-full h-14 text-base justify-start gap-3"
                onClick={() => {
                  onMoveToIncome();
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                  ↩
                </div>
                <span>Kembalikan ke Pemasukan</span>
              </Button>
            )}

            {/* Edit Button */}
            <Button
              variant="outline"
              className="w-full h-14 text-base justify-start gap-3"
              onClick={() => {
                onEdit();
                onOpenChange(false);
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                <Pencil className="size-4" />
              </div>
              <span>Edit</span>
            </Button>

            {/* Delete Button */}
            <Button
              variant="outline"
              className="w-full h-14 text-base justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                onDelete();
                onOpenChange(false);
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                <Trash2 className="size-4" />
              </div>
              <span>Hapus</span>
            </Button>
          </div>

          {/* Cancel Button */}
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
