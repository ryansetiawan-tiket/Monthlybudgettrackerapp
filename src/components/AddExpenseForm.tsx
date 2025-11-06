import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Plus, CalendarIcon, FileText, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "./ui/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { FixedExpenseTemplate } from "./FixedExpenseTemplates";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

interface AddExpenseFormProps {
  onAddExpense: (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string, pocketId?: string, groupId?: string, silent?: boolean) => Promise<any>;
  isAdding: boolean;
  templates: FixedExpenseTemplate[];
  onSuccess?: () => void;
  pockets?: Array<{id: string; name: string}>;
  balances?: Map<string, {availableBalance: number}>;
}

interface ExpenseEntry {
  id: string;
  name: string;
  amount: string;
  calculatedAmount: number | null;
  pocketId: string;
}

export function AddExpenseForm({ onAddExpense, isAdding, templates, onSuccess, pockets = [], balances }: AddExpenseFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateItems, setTemplateItems] = useState<Array<{name: string, amount: number, editable?: boolean}>>([]);
  
  // Multiple entries state
  const [entries, setEntries] = useState<ExpenseEntry[]>([{
    id: crypto.randomUUID(),
    name: "",
    amount: "",
    calculatedAmount: null,
    pocketId: 'pocket_daily'
  }]);
  
  // Update selected pocket when pockets load
  useEffect(() => {
    if (pockets.length > 0) {
      setEntries(prev => prev.map(entry => {
        if (!pockets.find(p => p.id === entry.pocketId)) {
          return { ...entry, pocketId: pockets[0].id };
        }
        return entry;
      }));
    }
  }, [pockets]);

  const formatDateToIndonesian = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const dayName = days[dateObj.getDay()];
    const dayNum = dateObj.getDate();
    const monthName = months[dateObj.getMonth()];
    
    return `${dayName}, ${dayNum} ${monthName}`;
  };

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
      let processed = cleaned;
      
      // Match pattern: number followed by operator followed by number followed by %
      const percentPattern = /([0-9.]+)([\+\-\*\/])([0-9.]+)%/g;
      processed = processed.replace(percentPattern, (match, base, operator, percent) => {
        return `${base}${operator}(${base}*${percent}/100)`;
      });
      
      // Match pattern: just number followed by %
      const simplePercentPattern = /([0-9.]+)%/g;
      processed = processed.replace(simplePercentPattern, (match, num) => {
        return `(${num}/100)`;
      });

      // Safely evaluate using Function constructor
      const result = new Function('return ' + processed)();
      
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Math.round(result);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const updateEntryCalculation = (entryId: string, amount: string) => {
    const result = evaluateExpression(amount);
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, amount, calculatedAmount: result }
        : entry
    ));
  };

  const updateEntryField = (entryId: string, field: keyof ExpenseEntry, value: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, [field]: value }
        : entry
    ));
  };

  const addNewEntry = () => {
    const defaultPocket = pockets.length > 0 ? pockets[0].id : 'pocket_daily';
    setEntries(prev => [...prev, {
      id: crypto.randomUUID(),
      name: "",
      amount: "",
      calculatedAmount: null,
      pocketId: defaultPocket
    }]);
  };

  const removeEntry = (entryId: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setTemplateItems(template.items.map(item => ({ ...item, editable: false })));
      }
    } else {
      setTemplateItems([]);
    }
  };

  const handleTemplateItemChange = (index: number, field: "name" | "amount", value: string | number) => {
    const newItems = [...templateItems];
    if (field === "name") {
      newItems[index].name = value as string;
    } else {
      newItems[index].amount = Number(value);
    }
    newItems[index].editable = true;
    setTemplateItems(newItems);
  };

  const handleAddTemplateItem = () => {
    setTemplateItems([...templateItems, { name: "", amount: 0, editable: true }]);
  };

  const handleRemoveTemplateItem = (index: number) => {
    if (templateItems.length > 1) {
      setTemplateItems(templateItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmitFromTemplate = () => {
    if (templateItems.length === 0) return;
    
    const currentDate = date || new Date().toISOString().split('T')[0];
    const template = templates.find(t => t.id === selectedTemplate);
    const templateName = template?.name || "Template";
    const templateColor = template?.color;
    
    // Use first entry's pocket or default
    const pocketId = entries[0]?.pocketId || 'pocket_daily';
    
    // Calculate total amount
    const totalAmount = getTotalTemplateAmount();
    
    // Send as single expense with items and color
    if (totalAmount > 0) {
      const items = templateItems.map(item => ({ name: item.name, amount: item.amount }));
      onAddExpense(templateName, totalAmount, currentDate, items, templateColor, pocketId);
      if (onSuccess) onSuccess();
    }

    // Reset
    setSelectedTemplate("");
    setTemplateItems([]);
    setDate(new Date().toISOString().split('T')[0]);
    resetEntries();
  };

  const getTotalTemplateAmount = () => {
    return templateItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmitMultiple = async () => {
    // Filter valid entries
    const validEntries = entries.filter(entry => {
      const finalAmount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
      return finalAmount > 0;
    });

    if (validEntries.length === 0) return;

    // Generate groupId for multiple entries added together
    const groupId = validEntries.length > 1 ? crypto.randomUUID() : undefined;
    const isBatch = validEntries.length > 1;

    try {
      // Submit each entry individually with groupId
      // Using sequential calls to maintain order and ensure proper state updates
      for (let i = 0; i < validEntries.length; i++) {
        const entry = validEntries[i];
        const finalAmount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
        const finalName = entry.name.trim() || formatDateToIndonesian(date);
        const isLast = i === validEntries.length - 1;
        
        // Wait for each to complete before moving to next
        // Use silent mode for batch to avoid multiple toasts, except for the last one
        await onAddExpense(finalName, finalAmount, date, undefined, undefined, entry.pocketId, groupId, !isLast && isBatch);
      }

      // Show success toast for batch
      if (isBatch) {
        const { toast } = await import("sonner@2.0.3");
        toast.success(`${validEntries.length} pengeluaran berhasil ditambahkan`);
      }

      if (onSuccess) onSuccess();
      resetEntries();
    } catch (error) {
      const { toast } = await import("sonner@2.0.3");
      toast.error("Gagal menambahkan pengeluaran");
    }
  };

  const resetEntries = () => {
    const defaultPocket = pockets.length > 0 ? pockets[0].id : 'pocket_daily';
    setEntries([{
      id: crypto.randomUUID(),
      name: "",
      amount: "",
      calculatedAmount: null,
      pocketId: defaultPocket
    }]);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleKeyPress = (e: React.KeyboardEvent, entryId: string) => {
    if (e.key === 'Enter') {
      const entry = entries.find(e => e.id === entryId);
      if (entry && (entry.calculatedAmount !== null || Number(entry.amount) > 0)) {
        handleSubmitMultiple();
      }
    }
  };

  const handlePreviousDay = () => {
    const [year, month, day] = date.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() - 1);
    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const newDay = String(currentDate.getDate()).padStart(2, '0');
    setDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const handleNextDay = () => {
    const [year, month, day] = date.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() + 1);
    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const newDay = String(currentDate.getDate()).padStart(2, '0');
    setDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalAmount = () => {
    return entries.reduce((sum, entry) => {
      const amount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const hasValidEntries = entries.some(entry => {
    const amount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
    return amount > 0;
  });

  return (
    <div className="space-y-4">
      {/* Date Picker - Shared for all entries */}
      <div className="space-y-2">
        <Label htmlFor="expenseDate">Tanggal</Label>
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePreviousDay}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Popover>
            <PopoverTrigger className="flex-1">
              <Input
                id="expenseDate"
                type="text"
                value={format(new Date(date), "EEEE, dd MMM yyyy", { locale: id })}
                className="cursor-pointer"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={(() => {
                  const [year, month, day] = date.split('-').map(Number);
                  return new Date(year, month - 1, day);
                })()}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    setDate(`${year}-${month}-${day}`);
                  }
                }}
                className="p-2"
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Multiple Entries Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Pengeluaran ({entries.length})</Label>
          {entries.length > 1 && (
            <span className="text-sm text-muted-foreground">
              Total: {formatCurrency(getTotalAmount())}
            </span>
          )}
        </div>

        {entries.map((entry, index) => {
          const showCalculation = entry.amount && entry.amount !== entry.calculatedAmount?.toString() && entry.calculatedAmount !== null;
          
          return (
            <Card key={entry.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Entry {index + 1}</span>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <X className="size-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nama (Opsional)</Label>
                <Input
                  value={entry.name}
                  onChange={(e) => updateEntryField(entry.id, 'name', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, entry.id)}
                  placeholder="Kosongkan untuk otomatis menggunakan tanggal"
                />
              </div>

              <div className="space-y-2">
                <Label>Nominal</Label>
                <Input
                  type="text"
                  value={entry.amount}
                  onChange={(e) => updateEntryCalculation(entry.id, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, entry.id)}
                  placeholder="0 atau 50000+4000-20%"
                />
                {showCalculation && (
                  <div className="p-2 bg-accent rounded-md">
                    <p className="text-sm text-muted-foreground">Hasil perhitungan:</p>
                    <p className="text-primary">{formatCurrency(entry.calculatedAmount!)}</p>
                  </div>
                )}
              </div>

              {pockets.length > 0 && (
                <div className="space-y-2">
                  <Label>Ambil dari Kantong</Label>
                  <Select 
                    value={entry.pocketId} 
                    onValueChange={(value) => updateEntryField(entry.id, 'pocketId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pockets.map(pocket => {
                        const balance = balances?.get(pocket.id);
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
                  {balances && balances.get(entry.pocketId) && (
                    <p className="text-xs text-muted-foreground">
                      Saldo tersedia: {formatCurrency(balances.get(entry.pocketId)!.availableBalance)}
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {/* Add New Entry Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addNewEntry}
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          Tambah Entry Baru
        </Button>

        {/* Submit Multiple Entries */}
        <Button 
          onClick={handleSubmitMultiple} 
          disabled={!hasValidEntries || isAdding}
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          {isAdding ? "Menambahkan..." : `Tambah ${entries.length} Pengeluaran`}
        </Button>
      </div>

      <Separator />

      {/* Template Section */}
      <div className="space-y-2">
        <Label htmlFor="expenseTemplate">Pilih Template</Label>
        <Select onValueChange={handleTemplateSelect} value={selectedTemplate}>
          <SelectTrigger>
            <FileText className="size-4 mr-2" />
            {selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name : "Pilih Template"}
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {templateItems.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="expenseTemplateItems">Item Template</Label>
          <div className="space-y-2">
            {templateItems.map((item, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleTemplateItemChange(index, "name", e.target.value)}
                  placeholder="Nama Item"
                  className="flex-1"
                />
                <Input
                  type="text"
                  value={item.amount.toString()}
                  onChange={(e) => handleTemplateItemChange(index, "amount", e.target.value)}
                  placeholder="Nominal"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTemplateItem(index)}
                  disabled={templateItems.length === 1}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTemplateItem}
            className="w-full"
          >
            <Plus className="size-4 mr-2" />
            Tambah Item
          </Button>
          <div className="p-2 bg-accent rounded-md">
            <p className="text-sm text-muted-foreground">Total Nominal Template:</p>
            <p className="text-primary">{formatCurrency(getTotalTemplateAmount())}</p>
          </div>
          <Button 
            onClick={handleSubmitFromTemplate} 
            disabled={isAdding}
            className="w-full"
          >
            <Plus className="size-4 mr-2" />
            {isAdding ? "Menambahkan..." : "Tambah Pengeluaran dari Template"}
          </Button>
        </div>
      )}
    </div>
  );
}
