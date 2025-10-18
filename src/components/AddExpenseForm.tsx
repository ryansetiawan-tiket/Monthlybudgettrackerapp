import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Plus, CalendarIcon, FileText, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "./ui/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { FixedExpenseTemplate } from "./FixedExpenseTemplates";

interface AddExpenseFormProps {
  onAddExpense: (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string) => void;
  isAdding: boolean;
  templates: FixedExpenseTemplate[];
  onSuccess?: () => void;
}

export function AddExpenseForm({ onAddExpense, isAdding, templates, onSuccess }: AddExpenseFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateItems, setTemplateItems] = useState<Array<{name: string, amount: number, editable?: boolean}>>([]);

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

  useEffect(() => {
    const result = evaluateExpression(amount);
    setCalculatedAmount(result);
  }, [amount]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setTemplateItems(template.items.map(item => ({ ...item, editable: false })));
        // Clear manual inputs when template is selected
        setName("");
        setAmount("");
        setCalculatedAmount(null);
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
    
    // Calculate total amount
    const totalAmount = getTotalTemplateAmount();
    
    // Send as single expense with items and color
    if (totalAmount > 0) {
      const items = templateItems.map(item => ({ name: item.name, amount: item.amount }));
      onAddExpense(templateName, totalAmount, currentDate, items, templateColor);
      if (onSuccess) onSuccess();
    }

    // Reset
    setSelectedTemplate("");
    setTemplateItems([]);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const getTotalTemplateAmount = () => {
    return templateItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = () => {
    const finalAmount = calculatedAmount !== null ? calculatedAmount : Number(amount);
    const finalName = name.trim() || formatDateToIndonesian(date);
    
    if (finalAmount > 0) {
      onAddExpense(finalName, finalAmount, date);
      if (onSuccess) onSuccess();
      setName("");
      setAmount("");
      setDate(new Date().toISOString().split('T')[0]);
      setCalculatedAmount(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (calculatedAmount !== null || Number(amount) > 0)) {
      handleSubmit();
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

  const showCalculation = amount && amount !== calculatedAmount?.toString() && calculatedAmount !== null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expenseName">Nama Pengeluaran (Opsional)</Label>
        <Input
          id="expenseName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Kosongkan untuk otomatis menggunakan tanggal"
        />
      </div>

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
                onChange={(e) => setDate(e.target.value)}
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

      <div className="space-y-2">
        <Label htmlFor="expenseAmount">Nominal</Label>
        <Input
          id="expenseAmount"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="0 atau 50000+4000-20%"
        />
        {showCalculation && (
          <div className="p-2 bg-accent rounded-md">
            <p className="text-sm text-muted-foreground">Hasil perhitungan:</p>
            <p className="text-primary">{formatCurrency(calculatedAmount)}</p>
          </div>
        )}
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={(!calculatedAmount && !Number(amount)) || isAdding}
        className="w-full"
      >
        <Plus className="size-4 mr-2" />
        {isAdding ? "Menambahkan..." : "Tambah Pengeluaran"}
      </Button>

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