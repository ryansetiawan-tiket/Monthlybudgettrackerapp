import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Wallet, Sparkles, Plus, Trash2, Archive, ArchiveRestore, AlertCircle, Pencil } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { useIsMobile } from "./ui/use-mobile";

interface Pocket {
  id: string;
  name: string;
  type: 'primary' | 'custom';
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  status?: 'active' | 'archived';
  archivedAt?: string;
  archivedReason?: string;
  enableWishlist?: boolean;
}

interface PocketBalance {
  availableBalance: number;
}

interface ManagePocketsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pockets: Pocket[];
  balances: Map<string, PocketBalance>;
  onCreatePocket: (pocket: { name: string; description?: string; icon?: string; color?: string; enableWishlist?: boolean }) => Promise<void>;
  onEditPocket?: (pocketId: string, pocket: { name: string; description?: string; icon?: string; color?: string }) => Promise<void>;
  onArchivePocket: (pocketId: string, reason?: string) => Promise<void>;
  onUnarchivePocket: (pocketId: string) => Promise<void>;
  archivedPockets: Pocket[];
  loading?: boolean;
  editPocket?: Pocket | null;
}

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Biru', hex: '#3b82f6' },
  { value: 'purple', label: 'Ungu', hex: '#a855f7' },
  { value: 'green', label: 'Hijau', hex: '#22c55e' },
  { value: 'orange', label: 'Oranye', hex: '#f97316' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
  { value: 'yellow', label: 'Kuning', hex: '#eab308' },
];

export function ManagePocketsDialog({
  open,
  onOpenChange,
  pockets,
  balances,
  onCreatePocket,
  onEditPocket,
  onArchivePocket,
  onUnarchivePocket,
  archivedPockets,
  loading = false,
  editPocket = null,
}: ManagePocketsDialogProps) {
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'archive'>('create');
  const [editingPocketId, setEditingPocketId] = useState<string | null>(null);
  const [newPocketName, setNewPocketName] = useState('');
  const [newPocketDescription, setNewPocketDescription] = useState('');
  const [newPocketIcon, setNewPocketIcon] = useState('💰');
  const [newPocketColor, setNewPocketColor] = useState('blue');
  const [archiveReason, setArchiveReason] = useState('');
  const [selectedPocketToArchive, setSelectedPocketToArchive] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Handle edit pocket from props
  useEffect(() => {
    if (open && editPocket) {
      setMode('edit');
      setEditingPocketId(editPocket.id);
      setNewPocketName(editPocket.name);
      setNewPocketDescription(editPocket.description || '');
      setNewPocketIcon(editPocket.icon || '💰');
      setNewPocketColor(editPocket.color || 'blue');
    } else if (open && !editPocket) {
      setMode('create');
      setEditingPocketId(null);
      // Reset form fields
      setNewPocketName('');
      setNewPocketDescription('');
      setNewPocketIcon('💰');
      setNewPocketColor('blue');
    }
  }, [open, editPocket]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreatePocket = async () => {
    if (!newPocketName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreatePocket({
        name: newPocketName.trim(),
        description: newPocketDescription.trim() || undefined,
        icon: newPocketIcon,
        color: newPocketColor,
        enableWishlist: true, // Default true for custom pockets
      });

      // Reset form
      setNewPocketName('');
      setNewPocketDescription('');
      setNewPocketIcon('💰');
      setNewPocketColor('blue');
      setMode('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPocket = async () => {
    if (!newPocketName.trim() || !editingPocketId || !onEditPocket) return;

    setIsSubmitting(true);
    try {
      await onEditPocket(editingPocketId, {
        name: newPocketName.trim(),
        description: newPocketDescription.trim() || undefined,
        icon: newPocketIcon,
        color: newPocketColor,
      });

      // Reset form
      setNewPocketName('');
      setNewPocketDescription('');
      setNewPocketIcon('💰');
      setNewPocketColor('blue');
      setEditingPocketId(null);
      setMode('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchivePocket = async (pocketId: string) => {
    setIsSubmitting(true);
    try {
      await onArchivePocket(pocketId, archiveReason || undefined);
      setArchiveReason('');
      setSelectedPocketToArchive(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnarchivePocket = async (pocketId: string) => {
    setIsSubmitting(true);
    try {
      await onUnarchivePocket(pocketId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (iconName?: string) => {
    // If it's an emoji, render it directly
    if (iconName && iconName.length <= 2 && /[\u{1F300}-\u{1F9FF}]/u.test(iconName)) {
      return <span className="text-xl">{iconName}</span>;
    }
    // Fallback for old Lucide icon names
    const IconComponent = iconName === 'Wallet' ? Wallet : iconName === 'Sparkles' ? Sparkles : Wallet;
    return <IconComponent className="size-5" />;
  };

  const customPockets = pockets.filter(p => p.type === 'custom');
  const primaryPockets = pockets.filter(p => p.type === 'primary');

  const dialogTitle = mode === 'create' ? 'Tambah Kantong Baru' : mode === 'edit' ? 'Edit Kantong' : 'Kelola Kantong';
  const dialogDescription = mode === 'create' 
    ? 'Buat kantong custom untuk mengatur dana khusus seperti tabungan atau dana darurat'
    : mode === 'edit'
    ? 'Ubah informasi kantong custom Anda'
    : 'Buat kantong custom, atau archive kantong yang tidak digunakan';

  const content = (
    <>

        {mode === 'list' && (
          <div className="space-y-4">
            {/* Primary Pockets */}
            <div>
              <h3 className="font-medium mb-2">Kantong Utama</h3>
              <div className="space-y-2">
                {primaryPockets.map(pocket => {
                  const balance = balances.get(pocket.id);
                  return (
                    <div
                      key={pocket.id}
                      className="border rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-${pocket.color || 'blue'}-600`}>
                          {getIcon(pocket.icon)}
                        </div>
                        <div>
                          <p className="font-medium">{pocket.name}</p>
                          {pocket.description && (
                            <p className="text-xs text-muted-foreground">{pocket.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {balance && (
                          <p className="text-sm font-medium">{formatCurrency(balance.availableBalance)}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Tidak dapat dihapus</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Pockets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Kantong Custom</h3>
                <Button onClick={() => setMode('create')} size="sm" variant="outline">
                  <Plus className="size-4 mr-2" />
                  Buat Kantong Baru
                </Button>
              </div>
              {customPockets.length === 0 ? (
                <div className="border rounded-lg p-6 text-center text-muted-foreground">
                  Belum ada kantong custom. Buat kantong baru untuk mulai!
                </div>
              ) : (
                <div className="space-y-2">
                  {customPockets.map(pocket => {
                    const balance = balances.get(pocket.id);
                    const canArchive = balance?.availableBalance === 0;
                    return (
                      <div
                        key={pocket.id}
                        className="border rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`text-${pocket.color || 'blue'}-600`}>
                            {getIcon(pocket.icon)}
                          </div>
                          <div>
                            <p className="font-medium">{pocket.name}</p>
                            {pocket.description && (
                              <p className="text-xs text-muted-foreground">{pocket.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-3">
                            {balance && (
                              <p className="text-sm font-medium">{formatCurrency(balance.availableBalance)}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => {
                              setEditingPocketId(pocket.id);
                              setNewPocketName(pocket.name);
                              setNewPocketDescription(pocket.description || '');
                              setNewPocketIcon(pocket.icon || '💰');
                              setNewPocketColor(pocket.color || 'blue');
                              setMode('edit');
                            }}
                            size="sm"
                            variant="ghost"
                            disabled={isSubmitting}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              if (canArchive) {
                                setSelectedPocketToArchive(pocket.id);
                              }
                            }}
                            size="sm"
                            variant={canArchive ? "outline" : "ghost"}
                            disabled={!canArchive || isSubmitting}
                          >
                            <Archive className="size-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Archived Pockets */}
            {archivedPockets.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Kantong Diarsipkan</h3>
                </div>
                <div className="space-y-2">
                  {archivedPockets.map(pocket => (
                    <div
                      key={pocket.id}
                      className="border rounded-lg p-3 flex items-center justify-between opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-${pocket.color || 'blue'}-600`}>
                          {getIcon(pocket.icon)}
                        </div>
                        <div>
                          <p className="font-medium">{pocket.name}</p>
                          {pocket.archivedReason && (
                            <p className="text-xs text-muted-foreground">
                              Alasan: {pocket.archivedReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUnarchivePocket(pocket.id)}
                        size="sm"
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        <ArchiveRestore className="size-4 mr-2" />
                        Pulihkan
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Archive Confirmation Dialog */}
            {selectedPocketToArchive && (
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium">
                      Archive kantong "{pockets.find(p => p.id === selectedPocketToArchive)?.name}"?
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="archiveReason">Alasan (opsional)</Label>
                      <Textarea
                        id="archiveReason"
                        value={archiveReason}
                        onChange={(e) => setArchiveReason(e.target.value)}
                        placeholder="Misal: Tabungan sudah selesai"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleArchivePocket(selectedPocketToArchive)}
                        size="sm"
                        variant="destructive"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Mengarsipkan...' : 'Ya, Archive'}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedPocketToArchive(null);
                          setArchiveReason('');
                        }}
                        size="sm"
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {(mode === 'create' || mode === 'edit') && (
          <div className="space-y-4">
            {/* Show "Lihat Semua Kantong" button */}
            {(customPockets.length > 0 || archivedPockets.length > 0) && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => setMode('list')} 
                  variant="outline" 
                  size="sm"
                  type="button"
                >
                  Lihat Semua Kantong
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pocketName">Nama Kantong</Label>
              <Input
                id="pocketName"
                value={newPocketName}
                onChange={(e) => setNewPocketName(e.target.value)}
                placeholder="Misal: Tabungan Liburan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pocketDescription">Deskripsi (Opsional)</Label>
              <Textarea
                id="pocketDescription"
                value={newPocketDescription}
                onChange={(e) => setNewPocketDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang kantong ini"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-10"
                      type="button"
                    >
                      <span className="text-2xl">{newPocketIcon}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-0" align="start">
                    <EmojiPicker
                      onEmojiClick={(emojiData: EmojiClickData) => {
                        setNewPocketIcon(emojiData.emoji);
                        setEmojiPickerOpen(false);
                      }}
                      width={350}
                      height={400}
                      theme={Theme.DARK}
                      searchPlaceHolder="Cari emoji..."
                      previewConfig={{
                        showPreview: false
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pocketColor">Warna</Label>
                <Select value={newPocketColor} onValueChange={setNewPocketColor}>
                  <SelectTrigger id="pocketColor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="size-4 rounded-full"
                            style={{ backgroundColor: option.hex }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                Kantong custom dapat diisi dengan transfer dana dari kantong lain.
                Archive kantong jika sudah tidak digunakan (saldo harus Rp 0).
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={mode === 'edit' ? handleEditPocket : handleCreatePocket}
                disabled={!newPocketName.trim() || isSubmitting}
                className="flex-1"
              >
                {mode === 'edit' ? (
                  <>
                    <Pencil className="size-4 mr-2" />
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    {isSubmitting ? 'Membuat...' : 'Buat Kantong'}
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setMode('list');
                  setEditingPocketId(null);
                }}
                variant="outline"
                disabled={isSubmitting}
              >
                Batal
              </Button>
            </div>
          </div>
        )}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[75vh] flex flex-col rounded-t-2xl p-0"
          aria-describedby={undefined}
        >
          <SheetHeader className="px-4 pt-6 pb-4 border-b">
            <SheetTitle>{dialogTitle}</SheetTitle>
            <SheetDescription>{dialogDescription}</SheetDescription>
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
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
