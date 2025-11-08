import { useState, useEffect, useMemo, useCallback } from "react";
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
import { EXPENSE_CATEGORIES } from "../constants";
import type { ExpenseCategory } from "../types";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { getAllCategories } from "../utils/categoryManager";
import { showBudgetAlertIfNeeded, calculateCategoryTotal } from "../utils/budgetAlerts";
import { BudgetExceedDialog, BudgetExceedInfo } from "./BudgetExceedDialog";
import { getCategoryLabel } from "../utils/calculations";
import { InsufficientBalanceDialog } from "./InsufficientBalanceDialog";
import { formatCurrency } from "../utils/currency";

interface AddExpenseFormProps {
  onAddExpense: (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string, pocketId?: string, groupId?: string, silent?: boolean, category?: string) => Promise<any>;
  isAdding: boolean;
  templates: FixedExpenseTemplate[];
  onSuccess?: () => void;
  pockets?: Array<{id: string; name: string}>;
  balances?: Map<string, {availableBalance: number}>;
  currentExpenses?: Array<{ category?: string; amount: number }>; // For budget alert calculations
}

interface ExpenseEntry {
  id: string;
  name: string;
  amount: string;
  calculatedAmount: number | null;
  pocketId: string;
  category?: string; // Can be ExpenseCategory or custom category ID
}

export function AddExpenseForm({ onAddExpense, isAdding, templates, onSuccess, pockets = [], balances, currentExpenses = [] }: AddExpenseFormProps) {
  // Phase 8: Get custom categories
  const { settings } = useCategorySettings();
  const allCategories = useMemo(() => getAllCategories(settings), [settings]);
  
  // Phase 9: Budget Alert System state
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [exceedingCategories, setExceedingCategories] = useState<BudgetExceedInfo[]>([]);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Balance validation state
  const [balanceErrors, setBalanceErrors] = useState<Map<string, string>>(new Map());
  const [insufficientBalances, setInsufficientBalances] = useState<Set<string>>(new Set());
  
  // Reactive validation dialog state
  const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
  const [insufficientDetails, setInsufficientDetails] = useState<{
    pocketName: string;
    availableBalance: number;
    attemptedAmount: number;
  } | null>(null);
  
  // Get local date (not UTC) for default value
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [date, setDate] = useState(getLocalDateString());
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
    
    const template = templates.find(t => t.id === selectedTemplate);
    const templateName = template?.name || "Template";
    const templateColor = template?.color;
    
    // Use first entry's pocket or default
    const pocketId = entries[0]?.pocketId || 'pocket_daily';
    
    // Calculate total amount
    const totalAmount = getTotalTemplateAmount();
    
    // 🔧 FIX: Keep date in YYYY-MM-DD format to avoid timezone conversion
    // Just use the date string directly - backend will handle time if needed
    const fullTimestamp = date;
    
    // Send as single expense with items and color
    if (totalAmount > 0) {
      const items = templateItems.map(item => ({ name: item.name, amount: item.amount }));
      // Templates don't have category for now (future enhancement)
      onAddExpense(templateName, totalAmount, fullTimestamp, items, templateColor, pocketId, undefined, false, undefined);
      if (onSuccess) onSuccess();
    }

    // Reset
    setSelectedTemplate("");
    setTemplateItems([]);
    setDate(getLocalDateString());
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

    // 🚨 PHASE 9: Check if any entries will exceed budget BEFORE saving
    const exceeding: BudgetExceedInfo[] = [];
    
    for (const entry of validEntries) {
      if (entry.category && settings?.budgets?.[entry.category]) {
        const budgetConfig = settings.budgets[entry.category];
        
        // Calculate current total for this category
        const currentTotal = calculateCategoryTotal(entry.category, currentExpenses);
        
        const finalAmount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
        const projectedTotal = currentTotal + finalAmount;
        
        // Will it exceed the limit?
        if (projectedTotal > budgetConfig.limit) {
          const excess = projectedTotal - budgetConfig.limit;
          const currentPercent = Math.round((currentTotal / budgetConfig.limit) * 100);
          const projectedPercent = Math.round((projectedTotal / budgetConfig.limit) * 100);
          
          exceeding.push({
            categoryId: entry.category,
            categoryLabel: getCategoryLabel(entry.category, settings),
            currentTotal,
            projectedTotal,
            limit: budgetConfig.limit,
            excess,
            currentPercent,
            projectedPercent
          });
        }
      }
    }
    
    // If any will exceed, show dialog first (Feature 2: Confirmation Dialog)
    if (exceeding.length > 0) {
      setExceedingCategories(exceeding);
      setShowBudgetDialog(true);
      setPendingSubmit(true);
      return; // Stop here, wait for user confirmation
    }
    
    // If no budget exceeded, proceed normally
    await proceedWithSubmit();
  };
  
  // Actual submit logic (called after confirmation or if no exceed)
  const proceedWithSubmit = async () => {
    setIsProcessing(true); // 🔥 Start processing state
    
    const validEntries = entries.filter(entry => {
      const finalAmount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
      return finalAmount > 0;
    });

    // BALANCE VALIDATION (Reactive fail-safe)
    if (balances) {
      for (const entry of validEntries) {
        const finalAmount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
        const pocket = balances.get(entry.pocketId);
        
        if (pocket && finalAmount > pocket.availableBalance) {
          const pocketName = pockets.find(p => p.id === entry.pocketId)?.name || 'kantong ini';
          setInsufficientDetails({
            pocketName,
            availableBalance: pocket.availableBalance,
            attemptedAmount: finalAmount,
          });
          setShowInsufficientDialog(true);
          setIsProcessing(false);
          return; // BLOCK SUBMISSION!
        }
      }
    }

    const groupId = validEntries.length > 1 ? crypto.randomUUID() : undefined;
    const isBatch = validEntries.length > 1;
    const fullTimestamp = date;

    try {
      // Submit each entry individually with groupId
      for (let i = 0; i < validEntries.length; i++) {
        const entry = validEntries[i];
        const finalAmount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
        const finalName = entry.name.trim() || formatDateToIndonesian(date);
        const isLast = i === validEntries.length - 1;
        
        // 🔥 PHASE 9: Get old total BEFORE save (for Feature 1: Toast Alert)
        let oldTotal = 0;
        if (entry.category && settings?.budgets?.[entry.category]) {
          oldTotal = calculateCategoryTotal(entry.category, currentExpenses);
        }
        
        // Wait for each to complete before moving to next
        await onAddExpense(finalName, finalAmount, fullTimestamp, undefined, undefined, entry.pocketId, groupId, !isLast && isBatch, entry.category);
        
        // 🔥 PHASE 9: Show budget alert if needed (Feature 1: Toast Alert)
        if (entry.category && settings?.budgets?.[entry.category]) {
          const budgetConfig = settings.budgets[entry.category];
          const newTotal = oldTotal + finalAmount;
          const categoryLabel = getCategoryLabel(entry.category, settings);
          
          showBudgetAlertIfNeeded({
            categoryId: entry.category,
            categoryLabel,
            oldTotal,
            newTotal,
            limit: budgetConfig.limit,
            warningAt: budgetConfig.warningAt
          });
        }
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
    } finally {
      setPendingSubmit(false);
      setIsProcessing(false); // 🔥 End processing state
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
    setDate(getLocalDateString());
  };

  /**
   * Validates if expense amount exceeds pocket balance
   * Shows inline error and disables submit if insufficient
   */
  const validateEntryBalance = useCallback((
    entryId: string,
    amount: number,
    pocketId: string
  ) => {
    // Skip validation if no pocket selected or no amount
    if (!pocketId || !amount || amount <= 0) {
      setBalanceErrors(prev => {
        const next = new Map(prev);
        next.delete(entryId);
        return next;
      });
      setInsufficientBalances(prev => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
      return true;
    }

    // Skip if balances not loaded yet
    if (!balances) {
      setBalanceErrors(prev => {
        const next = new Map(prev);
        next.delete(entryId);
        return next;
      });
      setInsufficientBalances(prev => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
      return true;
    }

    // Get pocket balance
    const pocket = balances.get(pocketId);
    if (!pocket) {
      // Pocket not found in balances (shouldn't happen, but be safe)
      setBalanceErrors(prev => {
        const next = new Map(prev);
        next.delete(entryId);
        return next;
      });
      setInsufficientBalances(prev => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
      return true;
    }

    const available = pocket.availableBalance;
    
    // Check if amount exceeds available balance
    if (amount > available) {
      const pocketName = pockets.find(p => p.id === pocketId)?.name || 'kantong ini';
      const errorMsg = `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
        `nggak cukup buat bayar ${formatCurrency(amount)}.`;
      
      setBalanceErrors(prev => {
        const next = new Map(prev);
        next.set(entryId, errorMsg);
        return next;
      });
      setInsufficientBalances(prev => {
        const next = new Set(prev);
        next.add(entryId);
        return next;
      });
      return false;
    }

    // All good!
    setBalanceErrors(prev => {
      const next = new Map(prev);
      next.delete(entryId);
      return next;
    });
    setInsufficientBalances(prev => {
      const next = new Set(prev);
      next.delete(entryId);
      return next;
    });
    return true;
  }, [balances, pockets]);

  // Validate all entries when amounts or pockets change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      entries.forEach(entry => {
        const finalAmount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
        validateEntryBalance(entry.id, finalAmount, entry.pocketId);
      });
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [entries, validateEntryBalance]);

  // Validate immediately when pocket changes
  useEffect(() => {
    entries.forEach(entry => {
      if (entry.pocketId) {
        const finalAmount = entry.calculatedAmount !== null ? entry.calculatedAmount : Number(entry.amount);
        validateEntryBalance(entry.id, finalAmount, entry.pocketId);
      }
    });
  }, [entries.map(e => e.pocketId).join(','), validateEntryBalance]);

  // Phase 9: Budget Exceed Dialog Handlers
  const handleBudgetConfirm = async () => {
    await proceedWithSubmit();
  };

  const handleBudgetCancel = () => {
    setPendingSubmit(false);
    setExceedingCategories([]);
    // Stay in form, don't reset entries
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
                value={(() => {
                  // Parse date string safely to avoid timezone issues
                  const [year, month, day] = date.split('-').map(Number);
                  const dateObj = new Date(year, month - 1, day);
                  return format(dateObj, "EEEE, dd MMM yyyy", { locale: id });
                })()}
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
                <Label>Kategori (Opsional)</Label>
                <Select 
                  value={entry.category || ""} 
                  onValueChange={(value) => updateEntryField(entry.id, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                          {cat.isCustom && (
                            <span className="text-xs text-muted-foreground">(Custom)</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nominal</Label>
                <Input
                  type="text"
                  value={entry.amount}
                  onChange={(e) => updateEntryCalculation(entry.id, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, entry.id)}
                  placeholder="0 atau 50000+4000-20%"
                  className={balanceErrors.has(entry.id) ? "border-red-500" : ""}
                />
                {showCalculation && (
                  <div className="p-2 bg-accent rounded-md">
                    <p className="text-sm text-muted-foreground">Hasil perhitungan:</p>
                    <p className="text-primary">{formatCurrency(entry.calculatedAmount!)}</p>
                  </div>
                )}
                {/* Balance Error Message */}
                {balanceErrors.has(entry.id) && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <span className="text-red-500 text-lg flex-shrink-0">⛔️</span>
                    <p className="text-sm text-red-500 leading-relaxed">{balanceErrors.get(entry.id)}</p>
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
          disabled={!hasValidEntries || isAdding || insufficientBalances.size > 0}
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

      {/* Phase 9: Budget Exceed Confirmation Dialog */}
      <BudgetExceedDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
        exceedingCategories={exceedingCategories}
        onConfirm={handleBudgetConfirm}
        onCancel={handleBudgetCancel}
        isLoading={isProcessing}
      />
      
      {/* Insufficient Balance Dialog (Reactive Fail-safe) */}
      {insufficientDetails && (
        <InsufficientBalanceDialog
          open={showInsufficientDialog}
          onOpenChange={setShowInsufficientDialog}
          pocketName={insufficientDetails.pocketName}
          availableBalance={insufficientDetails.availableBalance}
          attemptedAmount={insufficientDetails.attemptedAmount}
        />
      )}
    </div>
  );
}
