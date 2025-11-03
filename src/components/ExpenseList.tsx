import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trash2, ChevronDown, ChevronUp, ArrowUpDown, Pencil, Plus, X, Search, Eye, EyeOff, ArrowRight, DollarSign, Minus, Lock, Unlock } from "lucide-react";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner@2.0.3";

interface ExpenseItem {
  name: string;
  amount: number;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  items?: ExpenseItem[];
  color?: string;
  fromIncome?: boolean;
  currency?: string;
  originalAmount?: number;
  exchangeRate?: number;
  conversionType?: string;
  deduction?: number;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onBulkDeleteExpenses: (ids: string[]) => Promise<void>;
  excludedExpenseIds?: Set<string>;
  onExcludedIdsChange?: (ids: Set<string>) => void;
  onMoveToIncome?: (expense: Expense) => void;
  isExcludeLocked?: boolean;
  onToggleExcludeLock?: () => void;
}

export function ExpenseList({ expenses, onDeleteExpense, onEditExpense, onBulkDeleteExpenses, excludedExpenseIds: excludedExpenseIdsProp, onExcludedIdsChange, onMoveToIncome, isExcludeLocked = false, onToggleExcludeLock }: ExpenseListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Omit<Expense, 'id'>>({ 
    name: '', 
    amount: 0, 
    date: '', 
    items: [], 
    color: '', 
    fromIncome: undefined,
    currency: undefined,
    originalAmount: undefined,
    exchangeRate: undefined,
    conversionType: undefined,
    deduction: undefined
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: string; name: string; amount: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Bulk select states
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  
  // Track input strings for item amounts (for math expression support)
  const [itemAmountInputs, setItemAmountInputs] = useState<{ [index: number]: string }>({});
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Exclude from calculation states - use prop or default to empty Set
  const excludedExpenseIds = excludedExpenseIdsProp || new Set<string>();

  // Helper function to get day name
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  // Helper function to get date number
  const getDateNumber = (dateString: string): string => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  // Extract all unique names, day names, and dates from expenses
  const allNames = useMemo(() => {
    const namesSet = new Set<string>();
    const dayNamesSet = new Set<string>();
    const datesSet = new Set<string>();
    
    expenses.forEach(expense => {
      // Add expense name
      namesSet.add(expense.name);
      
      // Add day name
      dayNamesSet.add(getDayName(expense.date));
      
      // Add date number
      datesSet.add(getDateNumber(expense.date));
      
      // Add item names
      if (expense.items && expense.items.length > 0) {
        expense.items.forEach(item => {
          namesSet.add(item.name);
        });
      }
    });
    
    // Combine all unique values
    const allSuggestions = [
      ...Array.from(namesSet),
      ...Array.from(dayNamesSet),
      ...Array.from(datesSet)
    ];
    
    return allSuggestions.sort();
  }, [expenses]);

  // Filter suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const lowerQuery = searchQuery.toLowerCase();
    return allNames.filter(name => 
      name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Limit to 10 suggestions
  }, [allNames, searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName}, ${day} ${monthName}`;
  };

  const isWeekend = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Minggu, 6 = Sabtu
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isPast = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Toggle exclude expense from calculation
  const handleToggleExclude = useCallback((id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    const wasExcluded = excludedExpenseIds.has(id);
    const newSet = new Set(excludedExpenseIds);
    
    if (wasExcluded) {
      newSet.delete(id);
      if (expense) {
        toast.success(`${expense.name} dimasukkan kembali dalam hitungan`);
      }
    } else {
      newSet.add(id);
      if (expense) {
        toast.info(`${expense.name} dikecualikan dari hitungan`);
      }
    }
    
    // Notify parent about the change
    if (onExcludedIdsChange) {
      onExcludedIdsChange(newSet);
    }
  }, [excludedExpenseIds, onExcludedIdsChange, expenses]);

  // Calculate totals excluding excluded items
  // Items from income (fromIncome: true) subtract from expenses
  const totalExpenses = expenses
    .filter(expense => !excludedExpenseIds.has(expense.id))
    .reduce((sum, expense) => {
      if (expense.fromIncome) {
        return sum - expense.amount;
      }
      return sum + expense.amount;
    }, 0);

  // Fuzzy search function - checks if expense name, items, day name, or date matches
  const fuzzyMatch = (expense: Expense, query: string): boolean => {
    if (!query) return true;
    
    const lowerQuery = query.toLowerCase();
    
    // Check expense name
    if (expense.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check items if they exist
    if (expense.items && expense.items.length > 0) {
      const itemMatch = expense.items.some(item => 
        item.name.toLowerCase().includes(lowerQuery)
      );
      if (itemMatch) return true;
    }
    
    // Check day name
    const dayName = getDayName(expense.date);
    if (dayName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check date number
    const dateNumber = getDateNumber(expense.date);
    if (dateNumber.includes(lowerQuery)) {
      return true;
    }
    
    return false;
  };

  // Sort and filter expenses
  const sortedAndFilteredExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => {
        // First sort by date
        const dateCompare = sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime() 
          : new Date(b.date).getTime() - new Date(a.date).getTime();
        
        // If dates are the same, prioritize template expenses (with items)
        if (dateCompare === 0) {
          const aHasItems = a.items && a.items.length > 0;
          const bHasItems = b.items && b.items.length > 0;
          
          // Template expenses (with items) come first
          if (aHasItems && !bHasItems) return -1;
          if (!aHasItems && bHasItems) return 1;
          return 0;
        }
        
        return dateCompare;
      })
      .filter((expense) => fuzzyMatch(expense, searchQuery));
  }, [expenses, sortOrder, searchQuery]);

  // Check if all filtered expenses are selected
  const isAllSelected = useMemo(() => {
    return sortedAndFilteredExpenses.length > 0 && 
           selectedExpenseIds.size === sortedAndFilteredExpenses.length &&
           sortedAndFilteredExpenses.every(exp => selectedExpenseIds.has(exp.id));
  }, [selectedExpenseIds, sortedAndFilteredExpenses]);

  // Bulk select handlers with useCallback for performance
  const handleActivateBulkMode = useCallback(() => {
    setIsBulkSelectMode(true);
    setSelectedExpenseIds(new Set());
  }, []);

  const handleCancelBulkMode = useCallback(() => {
    setIsBulkSelectMode(false);
    setSelectedExpenseIds(new Set());
  }, []);

  const handleToggleExpense = useCallback((id: string) => {
    setSelectedExpenseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedExpenseIds(new Set());
    } else {
      const allIds = new Set(sortedAndFilteredExpenses.map(exp => exp.id));
      setSelectedExpenseIds(allIds);
    }
  }, [isAllSelected, sortedAndFilteredExpenses]);

  const handleBulkDelete = useCallback(() => {
    if (selectedExpenseIds.size === 0) return;
    setShowBulkDeleteDialog(true);
  }, [selectedExpenseIds.size]);

  const handleConfirmBulkDelete = useCallback(async () => {
    const idsToDelete = Array.from(selectedExpenseIds);
    
    setIsBulkDeleting(true);
    try {
      await onBulkDeleteExpenses(idsToDelete);
      
      setSelectedExpenseIds(new Set());
      setIsBulkSelectMode(false);
      setShowBulkDeleteDialog(false);
      
      toast.success(`${idsToDelete.length} pengeluaran berhasil dihapus`);
    } catch (error) {
      console.log(`Error in bulk delete: ${error}`);
      toast.error("Gagal menghapus beberapa pengeluaran");
    } finally {
      setIsBulkDeleting(false);
    }
  }, [selectedExpenseIds, onBulkDeleteExpenses]);

  // Auto-exit bulk mode when expenses change (e.g., month change)
  useEffect(() => {
    if (isBulkSelectMode) {
      // Keep selections valid - remove any that no longer exist
      const validIds = new Set(
        Array.from(selectedExpenseIds).filter(id => 
          expenses.some(exp => exp.id === id)
        )
      );
      if (validIds.size !== selectedExpenseIds.size) {
        setSelectedExpenseIds(validIds);
      }
    }
  }, [expenses, isBulkSelectMode, selectedExpenseIds]);

  // Clean up excluded IDs when expenses change (remove deleted expenses from excluded list)
  useEffect(() => {
    const validExcludedIds = new Set(
      Array.from(excludedExpenseIds).filter(id => 
        expenses.some(exp => exp.id === id)
      )
    );
    if (validExcludedIds.size !== excludedExpenseIds.size) {
      setExcludedExpenseIds(validExcludedIds);
      if (onExcludedIdsChange) {
        onExcludedIdsChange(validExcludedIds);
      }
    }
  }, [expenses, excludedExpenseIds, onExcludedIdsChange]);

  // Keyboard support: Escape to exit bulk mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBulkSelectMode) {
        handleCancelBulkMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBulkSelectMode, handleCancelBulkMode]);

  const handleEditExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setEditingExpenseId(id);
      setEditingExpense({ 
        name: expense.name, 
        amount: expense.amount, 
        date: expense.date, 
        items: expense.items ? [...expense.items] : [], 
        color: expense.color || '',
        fromIncome: expense.fromIncome,
        currency: expense.currency,
        originalAmount: expense.originalAmount,
        exchangeRate: expense.exchangeRate,
        conversionType: expense.conversionType,
        deduction: expense.deduction
      });
      // Initialize input strings for items
      const initialInputs: { [index: number]: string } = {};
      expense.items?.forEach((item, index) => {
        initialInputs[index] = item.amount.toString();
      });
      setItemAmountInputs(initialInputs);
    }
  };

  const handleSaveEditExpense = () => {
    if (editingExpenseId) {
      // Recalculate amount if items exist
      let finalAmount = editingExpense.amount;
      if (editingExpense.items && editingExpense.items.length > 0) {
        finalAmount = editingExpense.items.reduce((sum, item) => sum + item.amount, 0);
      }
      
      onEditExpense(editingExpenseId, { ...editingExpense, amount: finalAmount });
      setEditingExpenseId(null);
      setEditingExpense({ 
        name: '', 
        amount: 0, 
        date: '', 
        items: [], 
        color: '', 
        fromIncome: undefined,
        currency: undefined,
        originalAmount: undefined,
        exchangeRate: undefined,
        conversionType: undefined,
        deduction: undefined
      });
    }
  };

  const handleCloseEditDialog = () => {
    setEditingExpenseId(null);
    setEditingExpense({ 
      name: '', 
      amount: 0, 
      date: '', 
      items: [], 
      color: '', 
      fromIncome: undefined,
      currency: undefined,
      originalAmount: undefined,
      exchangeRate: undefined,
      conversionType: undefined,
      deduction: undefined
    });
    setItemAmountInputs({});
  };

  // Evaluate math expression
  const evaluateMathExpression = (expression: string): number => {
    try {
      // Remove all whitespace
      const cleaned = expression.replace(/\s/g, '');
      
      // Check if it's just a number
      if (/^-?\d+\.?\d*$/.test(cleaned)) {
        return parseFloat(cleaned) || 0;
      }
      
      // Only allow numbers and basic operators
      if (!/^[\d+\-*/().]+$/.test(cleaned)) {
        return 0;
      }
      
      // Evaluate the expression using Function constructor (safer than eval)
      const result = new Function(`return ${cleaned}`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return 0;
    }
  };

  const handleUpdateItem = (index: number, field: 'name' | 'amount', value: string | number) => {
    const newItems = [...(editingExpense.items || [])];
    if (field === 'amount' && typeof value === 'string') {
      // Just update the input string, don't evaluate yet
      setItemAmountInputs(prev => ({ ...prev, [index]: value }));
      // Don't update the item amount yet
      return;
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setEditingExpense({ ...editingExpense, items: newItems });
  };

  const handleBlurItemAmount = (index: number) => {
    const inputValue = itemAmountInputs[index];
    if (inputValue !== undefined) {
      const evaluatedValue = evaluateMathExpression(inputValue);
      const newItems = [...(editingExpense.items || [])];
      newItems[index] = { ...newItems[index], amount: evaluatedValue };
      setEditingExpense({ ...editingExpense, items: newItems });
      // Update input to show evaluated value
      setItemAmountInputs(prev => ({ ...prev, [index]: evaluatedValue.toString() }));
    }
  };

  const handleAddItem = () => {
    const newIndex = (editingExpense.items || []).length;
    setEditingExpense({ 
      ...editingExpense, 
      items: [...(editingExpense.items || []), { name: '', amount: 0 }] 
    });
    setItemAmountInputs(prev => ({ ...prev, [newIndex]: '0' }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...(editingExpense.items || [])];
    newItems.splice(index, 1);
    setEditingExpense({ ...editingExpense, items: newItems });
    // Remove the input string for this index and shift others
    const newInputs: { [index: number]: string } = {};
    Object.keys(itemAmountInputs).forEach(key => {
      const idx = parseInt(key);
      if (idx < index) {
        newInputs[idx] = itemAmountInputs[idx];
      } else if (idx > index) {
        newInputs[idx - 1] = itemAmountInputs[idx];
      }
    });
    setItemAmountInputs(newInputs);
  };

  // Group expenses by date
  const groupExpensesByDate = (expenses: Expense[]): Map<string, Expense[]> => {
    const grouped = new Map<string, Expense[]>();
    expenses.forEach(expense => {
      const dateKey = expense.date;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(expense);
    });
    return grouped;
  };

  // Split into upcoming and history
  const upcomingExpenses = sortedAndFilteredExpenses.filter(exp => !isPast(exp.date));
  const historyExpenses = sortedAndFilteredExpenses.filter(exp => isPast(exp.date));

  // Group by date
  const upcomingGrouped = groupExpensesByDate(upcomingExpenses);
  const historyGrouped = groupExpensesByDate(historyExpenses);

  // Calculate subtotals (excluding excluded items)
  // Items from income (fromIncome: true) subtract from expenses
  const upcomingTotal = upcomingExpenses
    .filter(expense => !excludedExpenseIds.has(expense.id))
    .reduce((sum, expense) => {
      if (expense.fromIncome) {
        return sum - expense.amount;
      }
      return sum + expense.amount;
    }, 0);
  const historyTotal = historyExpenses
    .filter(expense => !excludedExpenseIds.has(expense.id))
    .reduce((sum, expense) => {
      if (expense.fromIncome) {
        return sum - expense.amount;
      }
      return sum + expense.amount;
    }, 0);

  // Render grouped expenses by date
  const renderGroupedExpenseItem = (date: string, expenses: Expense[]) => {
    // If only 1 expense, render as single item
    if (expenses.length === 1) {
      return renderExpenseItem(expenses[0]);
    }

    // Multiple expenses on same date - render as grouped card
    const dateExpenses = expenses;
    const isGroupExpanded = expandedItems.has(`group-${date}`);
    const hasExcludedInGroup = dateExpenses.some(exp => excludedExpenseIds.has(exp.id));
    const allExcluded = dateExpenses.every(exp => excludedExpenseIds.has(exp.id));
    const hasSelectedInGroup = dateExpenses.some(exp => selectedExpenseIds.has(exp.id));
    const allSelected = dateExpenses.every(exp => selectedExpenseIds.has(exp.id));

    // Calculate total for this date group (excluding excluded items)
    const groupTotal = dateExpenses
      .filter(exp => !excludedExpenseIds.has(exp.id))
      .reduce((sum, exp) => {
        if (exp.fromIncome) {
          return sum - exp.amount;
        }
        return sum + exp.amount;
      }, 0);

    const hasFromIncome = dateExpenses.some(exp => exp.fromIncome);
    const hasNormalExpense = dateExpenses.some(exp => !exp.fromIncome);

    return (
      <Collapsible 
        key={`group-${date}`} 
        open={isGroupExpanded} 
        onOpenChange={() => {
          setExpandedItems(prev => {
            const newSet = new Set(prev);
            const key = `group-${date}`;
            if (newSet.has(key)) {
              newSet.delete(key);
            } else {
              newSet.add(key);
            }
            return newSet;
          });
        }}
      >
        <div className={`border rounded-lg ${isToday(date) ? 'ring-2 ring-blue-500' : ''} ${hasSelectedInGroup && isBulkSelectMode ? 'bg-accent/30 border-primary' : ''} ${allExcluded ? 'opacity-50 bg-muted/30' : ''}`}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 hover:scale-[1.005] transition-all rounded-lg">
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {isBulkSelectMode && (
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => {
                      // Toggle all expenses in this group
                      setSelectedExpenseIds(prev => {
                        const newSet = new Set(prev);
                        if (allSelected) {
                          dateExpenses.forEach(exp => newSet.delete(exp.id));
                        } else {
                          dateExpenses.forEach(exp => newSet.add(exp.id));
                        }
                        return newSet;
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                {isToday(date) && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
                )}
                <span 
                  className={`${isWeekend(date) ? "text-green-600" : ""} ${allExcluded ? 'line-through' : ''} whitespace-nowrap`}
                >
                  {formatDateShort(date)}
                </span>
                <p className={`text-sm text-muted-foreground ${allExcluded ? 'line-through' : ''} truncate`}>
                  {dateExpenses.length} item{dateExpenses.length > 1 ? 's' : ''}
                </p>
                {isGroupExpanded ? (
                  <ChevronUp className="size-4 shrink-0" />
                ) : (
                  <ChevronDown className="size-4 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <p className={`${groupTotal < 0 ? 'text-green-600' : 'text-red-600'} ${allExcluded ? 'line-through' : ''} text-sm sm:text-base whitespace-nowrap`}>
                  {groupTotal < 0 ? '+' : '-'}{formatCurrency(Math.abs(groupTotal))}
                </p>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-2 border-t pt-2 mt-1">
              {dateExpenses.map(expense => renderIndividualExpenseInGroup(expense))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  // Render individual expense within a group
  const renderIndividualExpenseInGroup = (expense: Expense) => {
    const isExcluded = excludedExpenseIds.has(expense.id);

    if (expense.items && expense.items.length > 0) {
      // Template expense with items
      const isItemExpanded = expandedItems.has(expense.id);
      return (
        <Collapsible key={expense.id} open={isItemExpanded} onOpenChange={() => toggleExpanded(expense.id)}>
          <div className={`${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30 rounded-md' : ''} ${isExcluded ? 'opacity-50' : ''}`}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-2 cursor-pointer">
                <div className="flex-1 flex items-center gap-2">
                  {isBulkSelectMode && (
                    <Checkbox
                      checked={selectedExpenseIds.has(expense.id)}
                      onCheckedChange={() => handleToggleExpense(expense.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'} ${isExcluded ? 'line-through' : ''}`}>
                    {expense.name}
                  </p>
                  {isItemExpanded ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-red-600'} ${isExcluded ? 'line-through' : ''}`}>
                    {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                  </p>
                  {!isBulkSelectMode && (
                    <>
                      {expense.fromIncome && onMoveToIncome && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onMoveToIncome(expense)}
                          title="Kembalikan ke pemasukan tambahan"
                        >
                          <ArrowRight className="size-3 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleToggleExclude(expense.id)}
                        title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                      >
                        {isExcluded ? (
                          <EyeOff className="size-3 text-muted-foreground" />
                        ) : (
                          <Eye className="size-3 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditExpense(expense.id)}
                      >
                        <Pencil className="size-3 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-2 pb-2 space-y-1 border-t pt-1 mt-1">
                {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                  <div className={`flex items-center gap-2 text-xs text-green-600 pl-6 mb-1 ${isExcluded ? 'line-through' : ''}`}>
                    <DollarSign className="size-3" />
                    <span>
                      {formatUSD(expense.originalAmount)} × {formatCurrency(expense.exchangeRate)}
                      <span className="ml-1 text-xs">
                        ({expense.conversionType === "auto" ? "realtime" : "manual"})
                      </span>
                    </span>
                  </div>
                )}
                {expense.fromIncome && expense.deduction && expense.deduction > 0 && (
                  <div className={`text-xs text-muted-foreground pl-6 mb-1 ${isExcluded ? 'line-through' : ''}`}>
                    <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                  </div>
                )}
                {expense.items.map((item, index) => (
                  <div key={index} className={`flex justify-between text-xs pl-6 ${isExcluded ? 'line-through' : ''}`}>
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className={expense.fromIncome ? 'text-green-600' : 'text-red-600'}>
                      {expense.fromIncome ? '+' : '-'}{formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    } else {
      // Single expense without items
      return (
        <div
          key={expense.id}
          className={`flex items-center justify-between p-2 ${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30 rounded-md' : ''} ${isExcluded ? 'opacity-50' : ''}`}
        >
          <div className="flex-1 flex items-center gap-2">
            {isBulkSelectMode && (
              <Checkbox
                checked={selectedExpenseIds.has(expense.id)}
                onCheckedChange={() => handleToggleExpense(expense.id)}
              />
            )}
            <div>
              <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : ''} ${isExcluded ? 'line-through' : ''}`}>{expense.name}</p>
              {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                <div className={`flex items-center gap-2 text-xs text-green-600 ${isExcluded ? 'line-through' : ''}`}>
                  <DollarSign className="size-3" />
                  <span>
                    {formatUSD(expense.originalAmount)} × {formatCurrency(expense.exchangeRate)}
                    <span className="ml-1 text-xs">
                      ({expense.conversionType === "auto" ? "realtime" : "manual"})
                    </span>
                  </span>
                </div>
              )}
              {expense.fromIncome && expense.deduction && expense.deduction > 0 && (
                <div className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                  <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-red-600'} ${isExcluded ? 'line-through' : ''}`}>
              {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
            </p>
            {!isBulkSelectMode && (
              <>
                {expense.fromIncome && onMoveToIncome && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onMoveToIncome(expense)}
                    title="Kembalikan ke pemasukan tambahan"
                  >
                    <ArrowRight className="size-3 text-green-600" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleToggleExclude(expense.id)}
                  title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                >
                  {isExcluded ? (
                    <EyeOff className="size-3 text-muted-foreground" />
                  ) : (
                    <Eye className="size-3 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleEditExpense(expense.id)}
                >
                  <Pencil className="size-3 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </>
            )}
          </div>
        </div>
      );
    }
  };

  // Render expense item function to avoid duplication
  const renderExpenseItem = (expense: Expense) => {
    const isExcluded = excludedExpenseIds.has(expense.id);
    
    // Debug: Log fromIncome expenses with deduction data
    if (expense.fromIncome) {
      console.log('Rendering fromIncome expense:', {
        name: expense.name,
        amount: expense.amount,
        deduction: expense.deduction,
        currency: expense.currency,
        originalAmount: expense.originalAmount,
        exchangeRate: expense.exchangeRate
      });
    }
    
    if (expense.items && expense.items.length > 0) {
      return (
        <Collapsible key={expense.id} open={expandedItems.has(expense.id)} onOpenChange={() => toggleExpanded(expense.id)}>
          <div className={`border rounded-lg ${isToday(expense.date) ? 'ring-2 ring-blue-500' : ''} ${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30 border-primary' : ''} ${isExcluded ? 'opacity-50 bg-muted/30' : ''}`}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 hover:scale-[1.005] transition-all rounded-lg">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {isBulkSelectMode && (
                    <Checkbox
                      checked={selectedExpenseIds.has(expense.id)}
                      onCheckedChange={() => handleToggleExpense(expense.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {isToday(expense.date) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
                  )}
                  <span 
                    className={`${isWeekend(expense.date) || expense.fromIncome ? "text-green-600" : ""} ${isExcluded ? 'line-through' : ''} whitespace-nowrap`}
                    style={expense.color && !isWeekend(expense.date) && !expense.fromIncome ? { color: expense.color } : {}}
                  >
                    {formatDateShort(expense.date)}
                  </span>
                  <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'} ${isExcluded ? 'line-through' : ''} truncate`}>{expense.name}</p>
                  {expandedItems.has(expense.id) ? (
                    <ChevronUp className="size-4 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <p className={`${expense.fromIncome ? 'text-green-600' : 'text-red-600'} ${isExcluded ? 'line-through' : ''} text-sm sm:text-base whitespace-nowrap`}>
                    {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                  </p>
                  {!isBulkSelectMode && (
                    <div className="flex items-center gap-0.5">
                      {expense.fromIncome && onMoveToIncome && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onMoveToIncome(expense)}
                          title="Kembalikan ke pemasukan tambahan"
                        >
                          <ArrowLeft className="size-3.5 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleExclude(expense.id)}
                        title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                      >
                        {isExcluded ? (
                          <EyeOff className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Eye className="size-3.5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditExpense(expense.id)}
                        title="Edit"
                      >
                        <Pencil className="size-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                          setDeleteConfirmOpen(true);
                        }}
                        title="Hapus"
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-1 border-t pt-2 mt-1">
                {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                  <div className={`flex items-center gap-2 text-sm text-green-600 pl-8 mb-2 ${isExcluded ? 'line-through' : ''}`}>
                    <DollarSign className="size-3" />
                    <span>
                      {formatUSD(expense.originalAmount)} × {formatCurrency(expense.exchangeRate)}
                      <span className="ml-1 text-xs">
                        ({expense.conversionType === "auto" ? "realtime" : "manual"})
                      </span>
                    </span>
                  </div>
                )}
                {expense.fromIncome && expense.deduction && expense.deduction > 0 && (
                  <div className={`text-xs text-muted-foreground pl-8 mb-2 ${isExcluded ? 'line-through' : ''}`}>
                    <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                  </div>
                )}
                {expense.items.map((item, index) => (
                  <div key={index} className={`flex justify-between text-sm pl-8 ${isExcluded ? 'line-through' : ''}`}>
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className={expense.fromIncome ? 'text-green-600' : 'text-red-600'}>
                      {expense.fromIncome ? '+' : '-'}{formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    } else {
      return (
        <div
          key={expense.id}
          className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 border rounded-lg hover:bg-accent/50 hover:scale-[1.005] transition-all ${isToday(expense.date) ? 'ring-2 ring-blue-500' : ''} ${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30 border-primary' : ''} ${isExcluded ? 'opacity-50 bg-muted/30' : ''}`}
        >
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {isBulkSelectMode && (
              <Checkbox
                checked={selectedExpenseIds.has(expense.id)}
                onCheckedChange={() => handleToggleExpense(expense.id)}
              />
            )}
            {isToday(expense.date) && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`${expense.fromIncome ? 'text-green-600' : ''} ${isExcluded ? 'line-through' : ''} truncate`}>{expense.name}</p>
              {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                <div className={`flex items-center gap-2 text-sm text-green-600 ${isExcluded ? 'line-through' : ''}`}>
                  <DollarSign className="size-3" />
                  <span className="text-xs">
                    {formatUSD(expense.originalAmount)} × {formatCurrency(expense.exchangeRate)}
                    <span className="ml-1">
                      ({expense.conversionType === "auto" ? "realtime" : "manual"})
                    </span>
                  </span>
                </div>
              )}
              {expense.fromIncome && expense.deduction && expense.deduction > 0 && (
                <div className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                  <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                </div>
              )}
              <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'} ${isExcluded ? 'line-through' : ''}`}>{formatDateShort(expense.date)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-1">
            <p className={`${expense.fromIncome ? 'text-green-600' : 'text-red-600'} ${isExcluded ? 'line-through' : ''} text-sm sm:text-base whitespace-nowrap`}>
              {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
            </p>
            {!isBulkSelectMode && (
              <div className="flex items-center gap-0.5">
                {expense.fromIncome && onMoveToIncome && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onMoveToIncome(expense)}
                    title="Kembalikan ke pemasukan tambahan"
                  >
                    <ArrowRight className="size-3.5 text-green-600" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleExclude(expense.id)}
                  title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                >
                  {isExcluded ? (
                    <EyeOff className="size-3.5 text-muted-foreground" />
                  ) : (
                    <Eye className="size-3.5 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEditExpense(expense.id)}
                  title="Edit"
                >
                  <Pencil className="size-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                    setDeleteConfirmOpen(true);
                  }}
                  title="Hapus"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {!isBulkSelectMode ? (
            // Normal Mode
            <>
              <span className="text-base sm:text-lg">Daftar Pengeluaran</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {onToggleExcludeLock && (
                  <Button
                    variant={isExcludeLocked ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleExcludeLock}
                    className={`h-8 px-3 text-xs mr-1.5 ${isExcludeLocked ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' : ''}`}
                    title={isExcludeLocked ? "Unlock - perubahan tidak akan tersimpan" : "Lock - simpan state exclude saat refresh"}
                  >
                    {isExcludeLocked ? <Lock className="size-3.5 mr-1.5" /> : <Unlock className="size-3.5 mr-1.5" />}
                    {isExcludeLocked ? 'Locked' : 'Lock'}
                  </Button>
                )}
                {expenses.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleActivateBulkMode}
                    className="h-8 px-3 text-xs"
                  >
                    Pilih
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSortOrder}
                  className="h-8 w-8"
                  title={sortOrder === 'asc' ? 'Terlama ke Terbaru' : 'Terbaru ke Terlama'}
                >
                  <ArrowUpDown className="size-4" />
                </Button>
                {excludedExpenseIds.size > 0 && (
                  <Badge variant="secondary" className="text-xs h-6 px-1.5">
                    {excludedExpenseIds.size} excluded
                  </Badge>
                )}
                <span className={`text-sm whitespace-nowrap ${totalExpenses < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalExpenses < 0 ? '+' : ''}{formatCurrency(Math.abs(totalExpenses))}
                </span>
              </div>
            </>
          ) : (
            // Bulk Select Mode
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">
                  {selectedExpenseIds.size > 0
                    ? `${selectedExpenseIds.size} dipilih`
                    : "Pilih semua"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedExpenseIds.size === 0}
                  className="h-8 text-xs"
                >
                  Hapus ({selectedExpenseIds.size})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelBulkMode}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>
              </div>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada pengeluaran untuk bulan ini
          </p>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama, hari, atau tanggal..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={searchInputRef}
                className="pl-9"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute left-0 top-full mt-1 w-full bg-popover border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                        index === selectedSuggestionIndex 
                          ? 'bg-accent text-accent-foreground' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Collapsible open={upcomingExpanded} onOpenChange={setUpcomingExpanded}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      {upcomingExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                      <span>Hari Ini & Mendatang</span>
                      <span className="text-xs text-muted-foreground">({upcomingExpenses.length})</span>
                    </div>
                    <span className={`text-sm ${upcomingTotal < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {upcomingTotal < 0 ? '+' : ''}{formatCurrency(Math.abs(upcomingTotal))}
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-3">
                    {upcomingExpenses.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        Tidak ada pengeluaran mendatang
                      </p>
                    ) : (
                      Array.from(upcomingGrouped.entries()).map(([date, expenses]) => 
                        renderGroupedExpenseItem(date, expenses)
                      )
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            {historyExpenses.length > 0 && (
              <div className="mt-2">
                <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        {historyExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                        <span>Riwayat</span>
                        <span className="text-xs text-muted-foreground">({historyExpenses.length})</span>
                      </div>
                      <span className={`text-sm ${historyTotal < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {historyTotal < 0 ? '+' : ''}{formatCurrency(Math.abs(historyTotal))}
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2 mt-3">
                      {Array.from(historyGrouped.entries()).map(([date, expenses]) => 
                        renderGroupedExpenseItem(date, expenses)
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <Dialog open={editingExpenseId !== null} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pengeluaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                value={editingExpense.name}
                onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
              />
            </div>
            
            {(!editingExpense.items || editingExpense.items.length === 0) && (
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Jumlah</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingExpense.amount.toString()}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-date">Tanggal</Label>
              <Input
                id="edit-date"
                type="date"
                value={editingExpense.date}
                onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
              />
            </div>
            
            {editingExpense.items && editingExpense.items.length > 0 && (
              <div className="space-y-2">
                <Label>Item Pengeluaran</Label>
                <div className="space-y-2">
                  {editingExpense.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        placeholder="Nama Item"
                        className="flex-1"
                      />
                      <Input
                        type="text"
                        value={itemAmountInputs[index] ?? item.amount.toString()}
                        onChange={(e) => handleUpdateItem(index, 'amount', e.target.value)}
                        onBlur={() => handleBlurItemAmount(index)}
                        placeholder="Jumlah"
                        className="w-32"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="w-full"
                  >
                    <Plus className="size-4 mr-2" />
                    Tambah Item
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCloseEditDialog}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveEditExpense}
            >
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengeluaran</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus pengeluaran "{expenseToDelete?.name}" sebesar {expenseToDelete?.amount ? formatCurrency(expenseToDelete.amount) : "Rp 0"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (expenseToDelete) {
                  onDeleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
                }
                setDeleteConfirmOpen(false);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedExpenseIds.size} Pengeluaran</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Anda yakin ingin menghapus pengeluaran berikut?</p>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3 bg-muted/50">
                  {Array.from(selectedExpenseIds).map(id => {
                    const expense = expenses.find(e => e.id === id);
                    if (!expense) return null;
                    return (
                      <div key={id} className="flex justify-between text-sm border-b pb-2 last:border-b-0">
                        <span className="flex-1 truncate pr-2">{expense.name}</span>
                        <span className="text-red-600 flex-shrink-0">{formatCurrency(expense.amount)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-red-600">
                    {formatCurrency(
                      Array.from(selectedExpenseIds).reduce((sum, id) => {
                        const expense = expenses.find(e => e.id === id);
                        return sum + (expense?.amount || 0);
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? "Menghapus..." : "Hapus Semua"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Helper function for USD formatting
const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};