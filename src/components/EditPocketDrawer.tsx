import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useIsMobile } from "./ui/use-mobile";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface Pocket {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type?: 'primary' | 'custom';
  description?: string;
}

interface EditPocketDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pocket: Pocket | null;
  onSave: (pocketId: string, updates: Partial<Pocket>) => Promise<void>;
  isSaving?: boolean;
}

export function EditPocketDrawer({
  open,
  onOpenChange,
  pocket,
  onSave,
  isSaving = false,
}: EditPocketDrawerProps) {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'edit-pocket-drawer'
  );

  // Pre-fill form when pocket changes
  useEffect(() => {
    if (pocket) {
      setName(pocket.name);
      setIcon(pocket.icon || "💰");
      setDescription(pocket.description || "");
    }
  }, [pocket]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setIcon(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pocket || !name.trim()) return;

    const updates: Partial<Pocket> = {
      name: name.trim(),
      icon,
    };

    // Only include description for custom pockets
    if (pocket.type === 'custom') {
      updates.description = description.trim();
    }

    await onSave(pocket.id, updates);
  };

  const isPrimaryPocket = pocket?.type === 'primary';

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Emoji Picker */}
      <div className="space-y-2">
        <Label>Emoji</Label>
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full h-16 text-4xl hover:bg-muted"
            >
              {icon}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 border-0" align="start">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="100%"
              height={350}
              searchPlaceHolder="Cari emoji..."
              previewConfig={{ showPreview: false }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="pocket-name">Nama Kantong</Label>
        <Input
          id="pocket-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama kantong"
          required
        />
      </div>

      {/* Description - Only for custom pockets */}
      {!isPrimaryPocket && (
        <div className="space-y-2">
          <Label htmlFor="pocket-description">Deskripsi (Opsional)</Label>
          <Textarea
            id="pocket-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tambahkan deskripsi kantong..."
            rows={3}
          />
        </div>
      )}

      {/* Info for primary pockets */}
      {isPrimaryPocket && (
        <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          ℹ️ Kantong utama hanya dapat mengubah nama dan emoji
        </p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!name.trim() || isSaving}
      >
        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} dismissible={true}>
        <DrawerContent className="h-[75vh] flex flex-col rounded-t-2xl p-0">
          <DrawerHeader className="px-4 pt-6 pb-4 border-b">
            <DrawerTitle>✏️ Edit Kantong</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>✏️ Edit Kantong</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
