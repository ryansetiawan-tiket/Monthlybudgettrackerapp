import { useState, memo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Trash2, Edit2, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { useConfirm } from "../hooks/useConfirm";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";

export interface FixedExpenseItem {
  name: string;
  amount: number;
}

export interface FixedExpenseTemplate {
  id: string;
  name: string;
  items: FixedExpenseItem[];
  color?: string;
}

interface FixedExpenseTemplatesProps {
  templates: FixedExpenseTemplate[];
  onAddTemplate: (name: string, items: FixedExpenseItem[], color?: string) => void;
  onUpdateTemplate: (id: string, name: string, items: FixedExpenseItem[], color?: string) => void;
  onDeleteTemplate: (id: string) => void;
}

function FixedExpenseTemplatesComponent({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
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
  const [items, setItems] = useState<FixedExpenseItem[]>([{ name: "", amount: 0 }]);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [selectedColor, setSelectedColor] = useState("");

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
    } else {
      setEditingTemplate(null);
      setTemplateName("");
      setItems([{ name: "", amount: 0 }]);
      setSelectedColor("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setTemplateName("");
    setItems([{ name: "", amount: 0 }]);
    setSelectedColor("");
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: "name" | "amount", value: string | number) => {
    const newItems = [...items];
    if (field === "name") {
      newItems[index].name = value as string;
    } else {
      newItems[index].amount = Number(value);
    }
    setItems(newItems);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Nama template harus diisi");
      return;
    }

    const validItems = items.filter(item => item.name.trim() && item.amount > 0);
    if (validItems.length === 0) {
      toast.error("Minimal harus ada 1 item pengeluaran yang valid");
      return;
    }

    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, templateName.trim(), validItems, selectedColor);
      toast.success("Template berhasil diperbarui");
    } else {
      onAddTemplate(templateName.trim(), validItems, selectedColor);
      toast.success("Template berhasil ditambahkan");
    }

    handleCloseDialog();
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

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Template Pengeluaran</h3>
          <Button size="sm" onClick={() => handleOpenDialog()}>
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
                        onClick={() => handleOpenDialog(template)}
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
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="p-3 space-y-1 border-t">
                      {template.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-1"
                        >
                          <span className="text-sm">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
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
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Nama item"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Nominal"
                        value={formatCurrencyInput(item.amount || "")}
                        onChange={(e) => handleItemChange(index, "amount", parseCurrencyInput(e.target.value))}
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                      className="mt-1"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
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