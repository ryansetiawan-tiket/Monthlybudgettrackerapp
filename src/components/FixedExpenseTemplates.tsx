import { useState, memo, useMemo, lazy, Suspense } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Plus, Trash2, Edit2, X, Check, ChevronDown, ChevronUp, Smile } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { useConfirm } from "../hooks/useConfirm";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { EXPENSE_CATEGORIES } from "../constants";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { getAllCategories } from "../utils/categoryManager";

// Lazy load emoji picker - popular & reliable library
const EmojiPicker = lazy(() => import('emoji-picker-react'));

export interface FixedExpenseItem {
  name: string;
  amount: number;
  category?: string; // NEW: Category for each item
  pocketId?: string; // NEW: Pocket for each item
}

export interface FixedExpenseTemplate {
  id: string;
  name: string;
  items: FixedExpenseItem[];
  color?: string;
  emoji?: string; // NEW: Emoji for template
}

interface FixedExpenseTemplatesProps {
  templates: FixedExpenseTemplate[];
  onAddTemplate: (name: string, items: FixedExpenseItem[], color?: string, emoji?: string) => void;
  onUpdateTemplate: (id: string, name: string, items: FixedExpenseItem[], color?: string, emoji?: string) => void;
  onDeleteTemplate: (id: string) => void;
  pockets?: Array<{id: string; name: string; emoji?: string}>; // NEW: Pockets for dropdown
  onOpenForm?: (template?: FixedExpenseTemplate) => void; // NEW: Mobile internal navigation
  isMobileFormView?: boolean; // NEW: Flag for mobile form view
  editingTemplate?: FixedExpenseTemplate | null; // NEW: Pre-selected template to edit
  onFormSuccess?: () => void; // NEW: Callback after form success
  onExecuteTemplate?: (template: FixedExpenseTemplate) => void; // NEW: Desktop execute template handler
}

function FixedExpenseTemplatesComponent({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  pockets = [],
  onOpenForm,
  isMobileFormView = false,
  editingTemplate: externalEditingTemplate,
  onFormSuccess,
  onExecuteTemplate,
}: FixedExpenseTemplatesProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Register internal dialog for back button handling
  useDialogRegistration(
    isDialogOpen,
    setIsDialogOpen,
    DialogPriority.HIGH, // Higher than parent AddExpenseDialog
    'fixed-expense-template-editor'
  );
  const [editingTemplate, setEditingTemplate] = useState<FixedExpenseTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [items, setItems] = useState<FixedExpenseItem[]>([{ name: "", amount: 0, category: undefined, pocketId: undefined }]);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Get all categories (default + custom)
  const { settings } = useCategorySettings();
  const allCategories = useMemo(() => getAllCategories(settings), [settings]);

  const colors = [
    { name: "None", value: "" },
    { name: "Biru", value: "#3b82f6" },
    { name: "Hijau", value: "#10b981" },
    { name: "Merah", value: "#ef4444" },
    { name: "Kuning", value: "#f59e0b" },
    { name: "Ungu", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Orange", value: "#f97316" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenDialog = (template?: FixedExpenseTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateName(template.name);
      setItems([...template.items]);
      setSelectedColor(template.color || "");
      setSelectedEmoji(template.emoji || "");
    } else {
      setEditingTemplate(null);
      setTemplateName("");
      setItems([{ name: "", amount: 0, category: undefined, pocketId: undefined }]);
      setSelectedColor("");
      setSelectedEmoji("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setTemplateName("");
    setItems([{ name: "", amount: 0, category: undefined, pocketId: undefined }]);
    setSelectedColor("");
    setSelectedEmoji("");
    setShowEmojiPicker(false);
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", amount: 0, category: undefined, pocketId: undefined }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: "name" | "amount" | "category" | "pocketId", value: string | number) => {
    const newItems = [...items];
    if (field === "name") {
      newItems[index].name = value as string;
    } else if (field === "amount") {
      newItems[index].amount = Number(value);
    } else if (field === "category") {
      newItems[index].category = value as string;
    } else if (field === "pocketId") {
      newItems[index].pocketId = value as string;
    }
    setItems(newItems);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Nama template harus diisi");
      return;
    }

    // Validate items: must have name, amount, category, and pocketId
    const validItems = items.filter(item => 
      item.name.trim() && 
      item.amount > 0 &&
      item.category &&
      item.pocketId
    );
    
    if (validItems.length === 0) {
      toast.error("Setiap item harus memiliki nama, nominal, kategori, dan kantong!");
      return;
    }

    // Warn if some items were invalid
    if (validItems.length < items.length) {
      toast.warning(`${items.length - validItems.length} item tidak valid akan diabaikan`);
    }

    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, templateName.trim(), validItems, selectedColor, selectedEmoji);
      toast.success("Template berhasil diperbarui");
    } else {
      onAddTemplate(templateName.trim(), validItems, selectedColor, selectedEmoji);
      toast.success("Template berhasil ditambahkan");
    }

    handleCloseDialog();
    
    // Call success callback for mobile
    if (onFormSuccess) {
      onFormSuccess();
    }
  };

  const toggleExpand = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedTemplates(newExpanded);
  };

  const getTotalAmount = (items: FixedExpenseItem[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  // Mobile form view (internal navigation)
  if (isMobileFormView) {
    // Use external editing template from parent if provided
    const currentTemplate = externalEditingTemplate || editingTemplate;
    
    // Initialize form with external template data
    if (currentTemplate && templateName === "") {
      setTemplateName(currentTemplate.name);
      setItems([...currentTemplate.items]);
      setSelectedColor(currentTemplate.color || "");
      setSelectedEmoji(currentTemplate.emoji || "");
      setEditingTemplate(currentTemplate);
    }
    
    return (
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="templateName">Nama Template</Label>
          <Input
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Contoh: Ngantor, Belanja Bulanan, dll"
          />
        </div>

        {/* Emoji Picker */}
        <div className="space-y-2">
          <Label>Pilih Ikon/Emoji</Label>
          <div className="flex gap-2">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start">
                  {selectedEmoji ? (
                    <span className="text-2xl mr-2">{selectedEmoji}</span>
                  ) : (
                    <Smile className="size-4 mr-2" />
                  )}
                  {selectedEmoji || "Pilih emoji..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Suspense fallback={<div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>}>
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setSelectedEmoji(emojiObject.emoji);
                      setShowEmojiPicker(false);
                    }}
                    searchPlaceHolder="Cari emoji..."
                    width="100%"
                    height="350px"
                    previewConfig={{ showPreview: false }}
                    theme="dark"
                  />
                </Suspense>
              </PopoverContent>
            </Popover>
            {selectedEmoji && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEmoji("")}
                title="Hapus emoji"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Item Pengeluaran</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="size-4 mr-1" />
              Tambah Item
            </Button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-md">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nama item"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Nominal"
                  value={formatCurrencyInput(item.amount || "")}
                  onChange={(e) => handleItemChange(index, "amount", parseCurrencyInput(e.target.value))}
                />
                <Select
                  value={item.category || ""}
                  onValueChange={(val) => handleItemChange(index, "category", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={item.pocketId || ""}
                  onValueChange={(val) => handleItemChange(index, "pocketId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kantong" />
                  </SelectTrigger>
                  <SelectContent>
                    {pockets.map(pocket => (
                      <SelectItem key={pocket.id} value={pocket.id}>
                        {pocket.emoji || "📦"} {pocket.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {items.filter(item => item.name.trim() && item.amount > 0).length > 0 && (
          <div className="p-3 bg-accent rounded-md">
            <p className="text-sm text-muted-foreground">Total:</p>
            <p className="text-primary">
              {formatCurrency(
                items
                  .filter(item => item.name.trim() && item.amount > 0)
                  .reduce((sum, item) => sum + item.amount, 0)
              )}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Warna Template</Label>
          <div className="grid grid-cols-4 gap-3">
            {colors.map(color => (
              <button
                key={color.value || 'none'}
                type="button"
                className={`flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent transition-colors ${selectedColor === color.value ? 'bg-accent' : ''}`}
                onClick={() => setSelectedColor(color.value)}
              >
                {color.value === "" ? (
                  <div className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.value ? 'border-primary' : 'border-gray-500'} bg-gray-800 flex items-center justify-center`}>
                    <X className="size-4 text-gray-400" />
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.value ? 'border-primary' : 'border-gray-500'}`}
                    style={{ backgroundColor: color.value }}
                  />
                )}
                <span className="text-xs">{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              // Reset states
              setTemplateName("");
              setItems([{ name: "", amount: 0, category: undefined, pocketId: undefined }]);
              setSelectedColor("");
              setSelectedEmoji("");
              setEditingTemplate(null);
              if (onFormSuccess) onFormSuccess();
            }}
          >
            Batal
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            {currentTemplate ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </div>
    );
  }

  // Normal list view (desktop dialog or mobile tab)
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Template Pengeluaran</h3>
          <Button size="sm" onClick={() => {
            if (onOpenForm) {
              // Mobile: Use internal navigation
              onOpenForm();
            } else {
              // Desktop: Use dialog
              handleOpenDialog();
            }
          }}>
            <Plus className="size-4 mr-1" />
            Buat Template
          </Button>
        </div>
        {templates.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada template pengeluaran tetap
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => {
              const isExpanded = expandedTemplates.has(template.id);
              return (
                <div
                  key={template.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div 
                    className="flex items-center justify-between p-3 bg-accent/50 cursor-pointer hover:bg-accent/70 transition-colors"
                    onClick={() => toggleExpand(template.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {template.emoji && (
                          <span className="text-lg">{template.emoji}</span>
                        )}
                        {template.color && (
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-500" 
                            style={{ backgroundColor: template.color }}
                          />
                        )}
                        <p>{template.name}</p>
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.items.length} item • {formatCurrency(getTotalAmount(template.items))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (onOpenForm) {
                            // Mobile: Use internal navigation
                            onOpenForm(template);
                          } else {
                            // Desktop: Use dialog
                            handleOpenDialog(template);
                          }
                        }}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: "Hapus Template?",
                            description: `Apakah Anda yakin ingin menghapus template "${template.name}"?`,
                            confirmText: "Hapus",
                            cancelText: "Batal",
                            variant: "destructive",
                          });
                          if (confirmed) {
                            onDeleteTemplate(template.id);
                            toast.success("Template berhasil dihapus");
                          }
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                      {onExecuteTemplate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onExecuteTemplate(template)}
                        >
                          <Plus className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="p-3 space-y-2 border-t">
                      {template.items.map((item, index) => {
                        // Get category info
                        const category = allCategories.find(cat => cat.id === item.category);
                        const categoryDisplay = category 
                          ? `${category.emoji} ${category.label}`
                          : "Tidak ada kategori";
                        
                        // Get pocket info
                        const pocket = pockets?.find(p => p.id === item.pocketId);
                        const pocketDisplay = pocket 
                          ? `${pocket.emoji || "💰"} ${pocket.name}`
                          : "Tidak ada kantong";
                        
                        return (
                          <div
                            key={index}
                            className="flex flex-col gap-1.5 py-2 border-b last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{item.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {categoryDisplay}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {pocketDisplay}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Buat Template Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nama Template</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Contoh: Ngantor, Belanja Bulanan, dll"
              />
            </div>

            {/* NEW: Emoji Picker */}
            <div className="space-y-2">
              <Label>Pilih Ikon/Emoji</Label>
              <div className="flex gap-2">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start">
                      {selectedEmoji ? (
                        <span className="text-2xl mr-2">{selectedEmoji}</span>
                      ) : (
                        <Smile className="size-4 mr-2" />
                      )}
                      {selectedEmoji || "Pilih emoji..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Suspense fallback={<div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>}>
                      <EmojiPicker
                        onEmojiClick={(emojiObject) => {
                          setSelectedEmoji(emojiObject.emoji);
                          setShowEmojiPicker(false);
                        }}
                        searchPlaceHolder="Cari emoji..."
                        width="100%"
                        height="350px"
                        previewConfig={{ showPreview: false }}
                        theme="dark"
                      />
                    </Suspense>
                  </PopoverContent>
                </Popover>
                {selectedEmoji && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedEmoji("")}
                    title="Hapus emoji"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Item Pengeluaran</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                >
                  <Plus className="size-4 mr-1" />
                  Tambah Item
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded-md">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nama item"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Nominal"
                      value={formatCurrencyInput(item.amount || "")}
                      onChange={(e) => handleItemChange(index, "amount", parseCurrencyInput(e.target.value))}
                    />
                    {/* NEW: Category Dropdown */}
                    <Select
                      value={item.category || ""}
                      onValueChange={(val) => handleItemChange(index, "category", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* NEW: Pocket Dropdown */}
                    <Select
                      value={item.pocketId || ""}
                      onValueChange={(val) => handleItemChange(index, "pocketId", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kantong" />
                      </SelectTrigger>
                      <SelectContent>
                        {pockets.map(pocket => (
                          <SelectItem key={pocket.id} value={pocket.id}>
                            {pocket.emoji || "📦"} {pocket.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {items.filter(item => item.name.trim() && item.amount > 0).length > 0 && (
              <div className="p-3 bg-accent rounded-md">
                <p className="text-sm text-muted-foreground">Total:</p>
                <p className="text-primary">
                  {formatCurrency(
                    items
                      .filter(item => item.name.trim() && item.amount > 0)
                      .reduce((sum, item) => sum + item.amount, 0)
                  )}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Warna Template</Label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map(color => (
                  <button
                    key={color.value || 'none'}
                    type="button"
                    className={`flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent transition-colors ${selectedColor === color.value ? 'bg-accent' : ''}`}
                    onClick={() => setSelectedColor(color.value)}
                  >
                    {color.value === "" ? (
                      <div className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.value ? 'border-primary' : 'border-gray-500'} bg-gray-800 flex items-center justify-center`}>
                        <X className="size-4 text-gray-400" />
                      </div>
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.value ? 'border-primary' : 'border-gray-500'}`}
                        style={{ backgroundColor: color.value }}
                      />
                    )}
                    <span className="text-xs">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="size-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleSave}>
              <Check className="size-4 mr-2" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog />
    </>
  );
}

// Export memoized component for performance
export const FixedExpenseTemplates = memo(FixedExpenseTemplatesComponent);