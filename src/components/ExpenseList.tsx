import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trash2, ChevronDown, ChevronUp, ArrowUpDown, Pencil, Plus, X, Search, Eye, EyeOff, ArrowRight, ArrowLeft, DollarSign, Minus, Lock, Unlock, BarChart3, Settings, MoreVertical, ListChecks } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
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
import { useIsMobile } from "./ui/use-mobile";
import { getCategoryEmoji, getCategoryLabel } from "../utils/calculations";
import { EXPENSE_CATEGORIES } from "../constants";
import { BulkEditCategoryDialog } from "./BulkEditCategoryDialog";
import { CategoryFilterBadge } from "./CategoryFilterBadge";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { getAllCategories } from "../utils/categoryManager";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { formatCurrency } from "../utils/currency";
import { AdditionalIncomeForm } from "./AdditionalIncomeForm";

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
  pocketId?: string;
  groupId?: string;
  category?: string;
}

interface AdditionalIncome {
  id: string;
  name: string;
  amount: number;
  currency: string;
  exchangeRate: number | null;
  amountIDR: number;
  conversionType: string;
  date: string;
  deduction: number;
  pocketId?: string;
  createdAt?: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onBulkDeleteExpenses: (ids: string[]) => Promise<void>;
  onBulkUpdateCategory?: (ids: string[], category: string) => Promise<void>;
  excludedExpenseIds?: Set<string>;
  onExcludedIdsChange?: (ids: Set<string>) => void;
  onMoveToIncome?: (expense: Expense) => void;
  isExcludeLocked?: boolean;
  onToggleExcludeLock?: () => void;
  pockets?: Array<{id: string; name: string}>;
  categoryFilter?: Set<import('../types').ExpenseCategory>; // Phase 7
  onClearFilter?: () => void; // Phase 7
  // Income-related props
  incomes?: AdditionalIncome[];
  onDeleteIncome?: (id: string) => void;
  onUpdateIncome?: (id: string, income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
    deduction: number;
    pocketId: string;
  }) => void;
  globalDeduction?: number;
  onUpdateGlobalDeduction?: (deduction: number) => void;
  excludedIncomeIds?: Set<string>;
  onExcludedIncomeIdsChange?: (ids: Set<string>) => void;
  isDeductionExcluded?: boolean;
  onDeductionExcludedChange?: (excluded: boolean) => void;
  onOpenCategoryManager?: () => void; // Phase 8: Open CategoryManager
}

function ExpenseListComponent({ 
  expenses, 
  onDeleteExpense, 
  onEditExpense, 
  onBulkDeleteExpenses, 
  onBulkUpdateCategory, 
  excludedExpenseIds: excludedExpenseIdsProp, 
  onExcludedIdsChange, 
  onMoveToIncome, 
  isExcludeLocked = false, 
  onToggleExcludeLock, 
  pockets = [], 
  categoryFilter = new Set(), 
  onClearFilter,
  // Income props
  incomes = [],
  onDeleteIncome,
  onUpdateIncome,
  globalDeduction = 0,
  onUpdateGlobalDeduction,
  excludedIncomeIds: excludedIncomeIdsProp,
  onExcludedIncomeIdsChange,
  isDeductionExcluded = false,
  onDeductionExcludedChange,
  onOpenCategoryManager
}: ExpenseListProps) {
  const isMobile = useIsMobile();
  
  // Phase 8: Get custom category settings
  const { settings } = useCategorySettings();
  const allCategories = useMemo(() => {
    return getAllCategories(settings);
  }, [settings]);
  
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
    deduction: undefined,
    pocketId: undefined,
    groupId: undefined,
    category: undefined
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
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<Set<string>>(new Set());
  
  // Track input strings for item amounts (for math expression support)
  const [itemAmountInputs, setItemAmountInputs] = useState<{ [index: number]: string }>({});
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkEditCategoryDialog, setShowBulkEditCategoryDialog] = useState(false);
  
  // New states for Figma redesign
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  
  // Exclude from calculation states for income
  const excludedIncomeIds = excludedIncomeIdsProp || new Set<string>();
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [showGlobalDeductionInput, setShowGlobalDeductionInput] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<Set<import('../types').ExpenseCategory>>(new Set());
  
  // Income editing states
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<Partial<AdditionalIncome>>({});
  
  // Exclude from calculation states - use prop or default to empty Set
  const excludedExpenseIds = excludedExpenseIdsProp || new Set<string>();

  // Helper function to get day name
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  // Helper function to get pocket name
  const getPocketName = (pocketId?: string): string => {
    if (!pocketId) return '';
    const pocket = pockets.find(p => p.id === pocketId);
    return pocket?.name || '';
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

  // Handle category click from pie chart
  const handleCategoryClick = (category: import('../types').ExpenseCategory) => {
    console.log('handleCategoryClick called for category:', category);
    
    setActiveCategoryFilter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
        toast.success(`Filter kategori "${getCategoryLabel(category, settings)}" dihapus`);
      } else {
        newSet.clear(); // Only one category at a time
        newSet.add(category);
        toast.success(`Filter aktif: ${getCategoryEmoji(category, settings)} ${getCategoryLabel(category, settings)}`);
      }
      return newSet;
    });
    
    // ✅ CRITICAL FIX: Force close the drawer/dialog after clicking
    console.log('Closing category drawer...');
    setShowCategoryDrawer(false);
    
    // ✅ Additional safety: Force cleanup after short delay
    setTimeout(() => {
      const overlays = document.querySelectorAll('[data-vaul-overlay]');
      console.log('Found stuck overlays:', overlays.length);
      overlays.forEach(overlay => {
        overlay.remove();
      });
      // Restore pointer events
      document.body.style.pointerEvents = '';
    }, 200);
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

  // Bulk selection handlers (supports both expense and income tabs)
  const handleActivateBulkMode = useCallback(() => {
    setIsBulkSelectMode(true);
    if (activeTab === 'expense') {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedIncomeIds(new Set());
    }
  }, [activeTab]);

  const handleCancelBulkMode = useCallback(() => {
    setIsBulkSelectMode(false);
    setSelectedExpenseIds(new Set());
    setSelectedIncomeIds(new Set());
  }, []);

  const handleToggleSelectExpense = (id: string) => {
    setSelectedExpenseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleSelectIncome = (id: string) => {
    setSelectedIncomeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAllExpenses = () => {
    const visibleExpenses = activeTab === 'expense' ? filteredExpenses : [];
    if (selectedExpenseIds.size === visibleExpenses.length) {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedExpenseIds(new Set(visibleExpenses.map(exp => exp.id)));
    }
  };

  const handleSelectAllIncomes = () => {
    if (selectedIncomeIds.size === incomes.length) {
      setSelectedIncomeIds(new Set());
    } else {
      setSelectedIncomeIds(new Set(incomes.map(inc => inc.id)));
    }
  };

  const handleBulkDeleteIncomes = async () => {
    if (selectedIncomeIds.size === 0 || !onDeleteIncome) return;

    const confirmed = window.confirm(
      `Anda yakin ingin menghapus ${selectedIncomeIds.size} pemasukan yang dipilih? Tindakan ini tidak dapat dibatalkan.`
    );

    if (confirmed) {
      selectedIncomeIds.forEach(id => {
        onDeleteIncome(id);
      });
      toast.success(`${selectedIncomeIds.size} pemasukan berhasil dihapus`);
      setIsBulkSelectMode(false);
      setSelectedIncomeIds(new Set());
    }
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

  // Calculate income totals
  const totalGrossIncome = incomes
    .filter(income => !excludedIncomeIds.has(income.id))
    .reduce((sum, income) => sum + income.amountIDR, 0);
  
  const totalIndividualDeductions = incomes
    .filter(income => !excludedIncomeIds.has(income.id))
    .reduce((sum, income) => sum + (income.deduction || 0), 0);
  
  const subtotalAfterIndividualDeductions = totalGrossIncome - totalIndividualDeductions;
  
  const effectiveGlobalDeduction = isDeductionExcluded ? 0 : (globalDeduction || 0);
  
  const totalNetIncome = subtotalAfterIndividualDeductions - effectiveGlobalDeduction;

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

  // Phase 7: Filter by category first, then by tab (expense/income)
  const categoryFilteredExpenses = useMemo(() => {
    let filtered = expenses;
    
    // Filter by tab (expense or income)
    filtered = filtered.filter(expense => {
      if (activeTab === 'expense') {
        return !expense.fromIncome; // Show only expenses
      } else {
        return expense.fromIncome; // Show only income
      }
    });
    
    // Then filter by category if needed (combine categoryFilter from props and activeCategoryFilter from breakdown)
    const combinedFilter = new Set([...Array.from(categoryFilter), ...Array.from(activeCategoryFilter)]);
    if (combinedFilter.size > 0) {
      filtered = filtered.filter(expense => {
        const expCategory = (expense.category || 'other') as import('../types').ExpenseCategory;
        return combinedFilter.has(expCategory);
      });
    }
    
    return filtered;
  }, [expenses, categoryFilter, activeCategoryFilter, activeTab]);

  // Sort and filter expenses
  const sortedAndFilteredExpenses = useMemo(() => {
    return [...categoryFilteredExpenses]
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
  }, [categoryFilteredExpenses, sortOrder, searchQuery]);

  // Check if all filtered expenses are selected
  const isAllSelected = useMemo(() => {
    return sortedAndFilteredExpenses.length > 0 && 
           selectedExpenseIds.size === sortedAndFilteredExpenses.length &&
           sortedAndFilteredExpenses.every(exp => selectedExpenseIds.has(exp.id));
  }, [selectedExpenseIds, sortedAndFilteredExpenses]);

  // Bulk select handlers with useCallback for performance - REMOVED (using handlers defined above that support both expense and income)

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
      toast.error("Gagal menghapus beberapa pengeluaran");
    } finally {
      setIsBulkDeleting(false);
    }
  }, [selectedExpenseIds, onBulkDeleteExpenses]);

  const handleBulkEditCategory = useCallback(() => {
    if (selectedExpenseIds.size === 0) return;
    setShowBulkEditCategoryDialog(true);
  }, [selectedExpenseIds.size]);

  const handleConfirmBulkEditCategory = useCallback(async (ids: string[], category: string) => {
    if (!onBulkUpdateCategory) return;
    
    try {
      await onBulkUpdateCategory(ids, category);
      
      setSelectedExpenseIds(new Set());
      setIsBulkSelectMode(false);
      setShowBulkEditCategoryDialog(false);
    } catch (error) {
      // Error already handled in dialog with toast
      console.error("Bulk category update failed:", error);
    }
  }, [onBulkUpdateCategory]);

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
    if (validExcludedIds.size !== excludedExpenseIds.size && onExcludedIdsChange) {
      onExcludedIdsChange(validExcludedIds);
    }
  }, [expenses, excludedExpenseIds, onExcludedIdsChange]);

  // Keyboard support: Escape to exit bulk mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBulkSelectMode) {
        handleCancelBulkMode();
      }
      // ✅ FIX: Close category drawer dengan Escape key
      if (e.key === 'Escape' && showCategoryDrawer) {
        setShowCategoryDrawer(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBulkSelectMode, handleCancelBulkMode, showCategoryDrawer]);

  // ✅ CRITICAL FIX: Cleanup stuck drawer overlays when state changes
  useEffect(() => {
    if (!showCategoryDrawer) {
      // Force cleanup any stuck Vaul drawer overlays
      const cleanupOverlays = () => {
        const overlays = document.querySelectorAll('[data-vaul-overlay], [data-vaul-drawer-wrapper]');
        overlays.forEach(overlay => {
          const style = window.getComputedStyle(overlay);
          // Only remove if drawer is truly closed (opacity 0 or display none)
          if (style.opacity === '0' || style.display === 'none') {
            overlay.remove();
          }
        });
        
        // Also remove any stuck pointer-events blocking
        document.body.style.pointerEvents = '';
        document.documentElement.style.pointerEvents = '';
      };
      
      // Run cleanup after animation completes
      const timer = setTimeout(cleanupOverlays, 400);
      return () => clearTimeout(timer);
    }
  }, [showCategoryDrawer]);

  const handleEditExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setEditingExpenseId(id);
      // Extract date only (YYYY-MM-DD) from timestamp to display correctly in date input
      const dateOnly = expense.date ? expense.date.split('T')[0] : expense.date;
      setEditingExpense({ 
        name: expense.name, 
        amount: expense.amount, 
        date: dateOnly, 
        items: expense.items ? [...expense.items] : [], 
        color: expense.color || '',
        fromIncome: expense.fromIncome,
        currency: expense.currency,
        originalAmount: expense.originalAmount,
        exchangeRate: expense.exchangeRate,
        conversionType: expense.conversionType,
        deduction: expense.deduction,
        pocketId: expense.pocketId,
        groupId: expense.groupId  // Preserve groupId
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
        deduction: undefined,
        pocketId: undefined,
        groupId: undefined
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
      deduction: undefined,
      pocketId: undefined,
      groupId: undefined
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

  // Group expenses by date only (YYYY-MM-DD)
  // GroupId is preserved for metadata/tracking, but grouping is always by date
  const groupExpensesByDate = (expenses: Expense[]): Map<string, Expense[]> => {
    const grouped = new Map<string, Expense[]>();
    expenses.forEach(expense => {
      // Always group by date (YYYY-MM-DD only), not by groupId
      // This ensures all expenses on the same date are grouped together
      const dateOnly = expense.date.split('T')[0]; // Extract date part only
      const groupKey = dateOnly;
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      grouped.get(groupKey)!.push(expense);
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

  // Render grouped expenses by date or groupId
  const renderGroupedExpenseItem = (groupKey: string, expenses: Expense[]) => {
    // If only 1 expense, render as single item
    if (expenses.length === 1) {
      return renderExpenseItem(expenses[0]);
    }

    // Multiple expenses - render as grouped card
    const dateExpenses = expenses;
    // Use the actual date from the first expense (all in group should have same date)
    const actualDate = dateExpenses[0].date;
    const isGroupExpanded = expandedItems.has(`group-${groupKey}`);
    const hasExcludedInGroup = dateExpenses.some(exp => excludedExpenseIds.has(exp.id));
    const allExcluded = dateExpenses.every(exp => excludedExpenseIds.has(exp.id));
    const hasSelectedInGroup = dateExpenses.some(exp => selectedExpenseIds.has(exp.id));
    const allSelected = dateExpenses.every(exp => selectedExpenseIds.has(exp.id));

    // Calculate total for this group (excluding excluded items)
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
        key={`group-${groupKey}`} 
        open={isGroupExpanded} 
        onOpenChange={() => {
          setExpandedItems(prev => {
            const newSet = new Set(prev);
            const key = `group-${groupKey}`;
            if (newSet.has(key)) {
              newSet.delete(key);
            } else {
              newSet.add(key);
            }
            return newSet;
          });
        }}
      >
        <div className={`border rounded-lg ${isToday(actualDate) ? 'ring-2 ring-blue-500' : ''} ${hasSelectedInGroup && isBulkSelectMode ? 'bg-accent/30 border-primary' : ''} ${allExcluded ? 'opacity-50 bg-muted/30' : ''}`}>
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer hover:bg-accent/50 transition-all rounded-lg">
              {/* Mobile: Single-line compact layout (more natural and common) */}
              <div className="md:hidden p-3">
                <div className="flex items-center justify-between gap-3">
                  {/* Left side: Date, badge, indicator */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isBulkSelectMode && (
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => {
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
                    {isToday(actualDate) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
                    )}
                    <span className={`text-sm ${isWeekend(actualDate) ? "text-green-600" : ""} ${allExcluded ? 'line-through' : ''} truncate`}>
                      {formatDateShort(actualDate)}
                    </span>
                    <Badge variant="secondary" className="text-xs h-5 px-2 shrink-0">
                      {dateExpenses.length}
                    </Badge>
                  </div>
                  
                  {/* Right side: Amount and chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <p className={`text-sm ${groupTotal < 0 ? 'text-green-600' : 'text-red-600'} ${allExcluded ? 'line-through' : ''}`}>
                      {groupTotal < 0 ? '+' : '-'}{formatCurrency(Math.abs(groupTotal))}
                    </p>
                    {isGroupExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop: Keep original single-line layout */}
              <div className="hidden md:flex items-center justify-between p-3">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {isBulkSelectMode && (
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => {
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
                  {isToday(actualDate) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
                  )}
                  <span 
                    className={`${isWeekend(actualDate) ? "text-green-600" : ""} ${allExcluded ? 'line-through' : ''} whitespace-nowrap`}
                  >
                    {formatDateShort(actualDate)}
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
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-3 border-t pt-3">
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
          <div className={`${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30 rounded-lg' : ''} ${isExcluded ? 'opacity-50' : ''}`}>
            <CollapsibleTrigger asChild>
              <div className="cursor-pointer rounded-lg hover:bg-accent/30 transition-colors">
                {/* Mobile: Compact layout with badge below */}
                <div className="md:hidden p-2">
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Checkbox, Name area, Chevron */}
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {isBulkSelectMode && (
                        <Checkbox
                          checked={selectedExpenseIds.has(expense.id)}
                          onCheckedChange={() => handleToggleExpense(expense.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : ''} ${isExcluded ? 'line-through' : ''}`}>
                          {expense.category && <span className="mr-1.5">{getCategoryEmoji(expense.category, settings)}</span>}
                          {expense.name}
                        </p>
                        {expense.pocketId && getPocketName(expense.pocketId) && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 w-fit">
                            {getPocketName(expense.pocketId)}
                          </Badge>
                        )}
                      </div>
                      {isItemExpanded ? (
                        <ChevronUp className="size-3 text-muted-foreground shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="size-3 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>

                    {/* Right: Amount and action buttons */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-red-600'} ${isExcluded ? 'line-through' : ''}`}>
                        {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                      </p>
                      {!isBulkSelectMode && (
                        <>
                          {expense.fromIncome && onMoveToIncome && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onMoveToIncome(expense)}
                              title="Kembalikan ke pemasukan tambahan"
                            >
                              <ArrowRight className="size-3.5 text-muted-foreground" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleToggleExclude(expense.id)}
                            title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                          >
                            {isExcluded ? (
                              <EyeOff className="size-3.5 text-muted-foreground" />
                            ) : (
                              <Eye className="size-3.5 text-muted-foreground" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="size-3.5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditExpense(expense.id)}>
                                <Pencil className="size-3.5 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                                  setDeleteConfirmOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-3.5 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop: Keep original single-line layout */}
                <div className="hidden md:flex items-center justify-between p-2">
                  <div className="flex-1 flex items-center gap-2">
                    {isBulkSelectMode && (
                      <Checkbox
                        checked={selectedExpenseIds.has(expense.id)}
                        onCheckedChange={() => handleToggleExpense(expense.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'} ${isExcluded ? 'line-through' : ''}`}>
                      {expense.category && <span className="mr-1.5">{getCategoryEmoji(expense.category, settings)}</span>}
                      {expense.name}
                    </p>
                    {expense.pocketId && getPocketName(expense.pocketId) && (
                      <Badge variant="secondary" className="text-xs">
                        {getPocketName(expense.pocketId)}
                      </Badge>
                    )}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditExpense(expense.id)}>
                              <Pencil className="size-3 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                                setDeleteConfirmOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-2 border-t pt-3 mt-2 md:px-2 md:pb-2 md:space-y-1 md:pt-1 md:mt-1">
                {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                  <div className={`flex items-center gap-2 text-xs text-green-600 pl-8 md:pl-6 mb-1 ${isExcluded ? 'line-through' : ''}`}>
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
                  <div className={`text-xs text-muted-foreground pl-8 md:pl-6 mb-1 ${isExcluded ? 'line-through' : ''}`}>
                    <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                  </div>
                )}
                {expense.items.map((item, index) => (
                  <div key={index} className={`flex justify-between items-center text-sm md:text-xs pl-8 md:pl-6 py-1.5 md:py-0 rounded-lg md:rounded-none hover:bg-accent/30 md:hover:bg-transparent transition-colors ${isExcluded ? 'line-through' : ''}`}>
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
          className={`rounded-lg hover:bg-accent/30 transition-colors ${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30' : ''} ${isExcluded ? 'opacity-50' : ''}`}
        >
          {/* Mobile: Compact layout with badge below */}
          <div className="md:hidden p-2">
            <div className="flex items-start justify-between gap-2">
              {/* Left: Checkbox, Name area */}
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {isBulkSelectMode && (
                  <Checkbox
                    checked={selectedExpenseIds.has(expense.id)}
                    onCheckedChange={() => handleToggleExpense(expense.id)}
                    className="mt-0.5"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5">
                    <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : ''} ${isExcluded ? 'line-through' : ''}`}>
                      {expense.category && <span className="mr-1.5">{getCategoryEmoji(expense.category, settings)}</span>}
                      {expense.name}
                    </p>
                    {expense.pocketId && getPocketName(expense.pocketId) && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 w-fit">
                        {getPocketName(expense.pocketId)}
                      </Badge>
                    )}
                  </div>
                  {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                    <div className={`flex items-center gap-1 text-xs text-green-600 mt-0.5 ${isExcluded ? 'line-through' : ''}`}>
                      <DollarSign className="size-3" />
                      <span className="truncate">
                        {formatUSD(expense.originalAmount)} × {formatCurrency(expense.exchangeRate)}
                        <span className="ml-1">
                          ({expense.conversionType === "auto" ? "realtime" : "manual"})
                        </span>
                      </span>
                    </div>
                  )}
                  {expense.fromIncome && expense.deduction && expense.deduction > 0 && (
                    <div className={`text-xs text-muted-foreground mt-0.5 truncate ${isExcluded ? 'line-through' : ''}`}>
                      <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Amount and action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-red-600'} ${isExcluded ? 'line-through' : ''}`}>
                  {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                </p>
                {!isBulkSelectMode && (
                  <>
                    {expense.fromIncome && onMoveToIncome && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onMoveToIncome(expense)}
                        title="Kembalikan ke pemasukan tambahan"
                      >
                        <ArrowRight className="size-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleToggleExclude(expense.id)}
                      title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                    >
                      {isExcluded ? (
                        <EyeOff className="size-3.5 text-muted-foreground" />
                      ) : (
                        <Eye className="size-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="size-3.5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditExpense(expense.id)}>
                          <Pencil className="size-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3.5 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Keep original single-line layout */}
          <div className="hidden md:flex items-center justify-between p-2">
            <div className="flex-1 flex items-center gap-2">
              {isBulkSelectMode && (
                <Checkbox
                  checked={selectedExpenseIds.has(expense.id)}
                  onCheckedChange={() => handleToggleExpense(expense.id)}
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : ''} ${isExcluded ? 'line-through' : ''}`}>
                    {expense.category && <span className="mr-1.5">{getCategoryEmoji(expense.category, settings)}</span>}
                    {expense.name}
                  </p>
                  {expense.pocketId && getPocketName(expense.pocketId) && (
                    <Badge variant="secondary" className="text-xs">
                      {getPocketName(expense.pocketId)}
                    </Badge>
                  )}
                </div>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="size-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditExpense(expense.id)}>
                        <Pencil className="size-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                          setDeleteConfirmOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-3 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  // Render expense item function to avoid duplication
  const renderExpenseItem = (expense: Expense) => {
    const isExcluded = excludedExpenseIds.has(expense.id);
    
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
                  <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'} ${isExcluded ? 'line-through' : ''} truncate`}>
                    {expense.category && <span className="mr-1">{getCategoryEmoji(expense.category, settings)}</span>}
                    {expense.name}
                  </p>
                  {expense.pocketId && getPocketName(expense.pocketId) && (
                    <Badge variant="secondary" className="text-xs">
                      {getPocketName(expense.pocketId)}
                    </Badge>
                  )}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                            title="More"
                          >
                            <MoreVertical className="size-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditExpense(expense.id)}>
                            <Pencil className="size-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                className="border-neutral-400 data-[state=checked]:border-primary"
              />
            )}
            {isToday(expense.date) && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`${expense.fromIncome ? 'text-green-600' : ''} ${isExcluded ? 'line-through' : ''} truncate`}>
                  {expense.category && <span className="mr-1">{getCategoryEmoji(expense.category, settings)}</span>}
                  {expense.name}
                </p>
              </div>
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
              <div className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'} ${isExcluded ? 'line-through' : ''} flex items-center gap-1.5`}>
                <span>{formatDateShort(expense.date)}</span>
                {expense.pocketId && getPocketName(expense.pocketId) && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="secondary" className="text-xs">
                      {getPocketName(expense.pocketId)}
                    </Badge>
                  </>
                )}
              </div>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                      title="More"
                    >
                      <MoreVertical className="size-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditExpense(expense.id)}>
                      <Pencil className="size-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                        setDeleteConfirmOpen(true);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-3.5 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        <CardTitle className="flex flex-col gap-2">
          {!isBulkSelectMode ? (
            // Normal Mode
            <>
              {/* Row 1: Title + Category Menu */}
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg">Daftar Transaksi</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-8 w-8 flex items-center justify-center bg-[rgba(38,38,38,0.3)] border-[0.5px] border-neutral-800 rounded-lg hover:bg-[rgba(38,38,38,0.5)] transition-colors"
                      title="Menu Kategori"
                    >
                      <span className="text-sm">📊</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setShowCategoryDrawer(true)}
                      className="cursor-pointer"
                    >
                      <BarChart3 className="size-4 mr-2" />
                      <span>Lihat Breakdown</span>
                    </DropdownMenuItem>
                    {onOpenCategoryManager && (
                      <DropdownMenuItem
                        onClick={() => onOpenCategoryManager()}
                        className="cursor-pointer"
                      >
                        <Settings className="size-4 mr-2" />
                        <span>Kelola Kategori</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Row 2: Action Buttons + Lock + Total */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {expenses.length > 0 && (
                    <button
                      onClick={handleActivateBulkMode}
                      className="h-11 w-11 flex items-center justify-center bg-[rgba(38,38,38,0.3)] border-[0.5px] border-neutral-800 rounded-lg hover:bg-[rgba(38,38,38,0.5)] transition-colors text-neutral-50"
                      aria-label="Pilih"
                    >
                      <ListChecks className="h-5 w-5" />
                    </button>
                  )}
                  {activeTab === 'expense' && excludedExpenseIds.size > 0 && (
                    <Badge variant="secondary" className="text-xs h-6 px-1.5">
                      {excludedExpenseIds.size} excluded
                    </Badge>
                  )}
                  {activeTab === 'income' && excludedIncomeIds.size > 0 && (
                    <Badge variant="secondary" className="text-xs h-6 px-1.5">
                      {excludedIncomeIds.size} excluded
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {onToggleExcludeLock && (
                    <button
                      onClick={() => onToggleExcludeLock()}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                        isExcludeLocked 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-[rgba(38,38,38,0.3)] hover:bg-[rgba(38,38,38,0.5)] text-neutral-400'
                      }`}
                      title={isExcludeLocked ? "Unlock - perubahan tidak akan tersimpan" : "Lock - simpan state exclude saat refresh"}
                    >
                      {isExcludeLocked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                    </button>
                  )}
                  <span className={`text-sm font-normal whitespace-nowrap ${
                    activeTab === 'expense' 
                      ? (totalExpenses < 0 ? 'text-green-600' : 'text-red-600')
                      : 'text-green-600'
                  }`}>
                    {activeTab === 'expense' 
                      ? `${totalExpenses < 0 ? '+' : '-'}${formatCurrency(Math.abs(totalExpenses))}`
                      : `+${formatCurrency(totalNetIncome)}`
                    }
                  </span>
                </div>
              </div>
            </>
          ) : (
            // Bulk Select Mode
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={activeTab === 'expense' ? isAllSelected : (selectedIncomeIds.size === incomes.length && incomes.length > 0)}
                  onCheckedChange={activeTab === 'expense' ? handleSelectAllExpenses : handleSelectAllIncomes}
                  className="border-neutral-400 data-[state=checked]:border-primary"
                />
                <span className="text-sm">
                  {activeTab === 'expense' 
                    ? (selectedExpenseIds.size > 0 ? `${selectedExpenseIds.size} dipilih` : "Pilih semua")
                    : (selectedIncomeIds.size > 0 ? `${selectedIncomeIds.size} dipilih` : "Pilih semua")
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'expense' && onBulkUpdateCategory && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleBulkEditCategory}
                    disabled={selectedExpenseIds.size === 0}
                    className="h-8 text-xs"
                  >
                    Edit Kategori
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={activeTab === 'expense' ? handleBulkDelete : handleBulkDeleteIncomes}
                  disabled={activeTab === 'expense' ? selectedExpenseIds.size === 0 : selectedIncomeIds.size === 0}
                  className="h-8 text-xs"
                >
                  Hapus ({activeTab === 'expense' ? selectedExpenseIds.size : selectedIncomeIds.size})
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
        
        {/* Phase 7: Category Filter Badge */}
        {categoryFilter.size > 0 && onClearFilter && (
          <div className="mt-3">
            <CategoryFilterBadge
              activeCategories={categoryFilter}
              onClear={onClearFilter}
              itemCount={categoryFilteredExpenses.length}
            />
          </div>
        )}
        
        {/* Active Category Filter Badge (from pie chart click) */}
        {activeCategoryFilter.size > 0 && (
          <div className="mt-3">
            <CategoryFilterBadge
              activeCategories={activeCategoryFilter}
              onClear={() => {
                setActiveCategoryFilter(new Set());
                toast.success('Filter kategori dihapus');
              }}
              itemCount={categoryFilteredExpenses.length}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada pengeluaran untuk bulan ini
          </p>
        ) : (
          <div className="space-y-4">
            {/* Tabs for Expense/Income - Figma Design */}
            <div className="bg-neutral-800 rounded-[14px] p-[3px] flex gap-0 w-full">
              <button
                onClick={() => setActiveTab('expense')}
                className={`flex-1 px-3 py-[6.5px] rounded-[10px] text-sm text-center transition-all ${
                  activeTab === 'expense'
                    ? 'bg-[rgba(255,76,76,0.1)] border border-[#ff4c4c] text-neutral-50'
                    : 'bg-transparent border border-transparent text-[#a1a1a1]'
                }`}
              >
                Pengeluaran
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`flex-1 px-3 py-[6.5px] rounded-[10px] text-sm text-center transition-all ${
                  activeTab === 'income'
                    ? 'bg-[rgba(34,197,94,0.1)] border border-green-500 text-neutral-50'
                    : 'bg-transparent border border-transparent text-[#a1a1a1]'
                }`}
              >
                Pemasukan
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a1a1a1]" />
                <Input
                  type="text"
                  placeholder="Cari nama, hari, atau tanggal..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  ref={searchInputRef}
                  className="pl-9 bg-[rgba(38,38,38,0.3)] border-[0.5px] border-neutral-800 rounded-lg h-9 text-neutral-50 placeholder:text-[#a1a1a1]"
                />
              </div>
              {activeTab === 'expense' && (
                <button
                  onClick={toggleSortOrder}
                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[rgba(38,38,38,0.3)] transition-colors flex-shrink-0"
                  title={sortOrder === 'asc' ? 'Terlama ke Terbaru' : 'Terbaru ke Terlama'}
                >
                  <ArrowUpDown className="size-4" />
                </button>
              )}
            </div>
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
            
            {/* Conditional rendering based on active tab */}
            {activeTab === 'expense' ? (
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
                    <div className="space-y-3 md:space-y-2 mt-3">
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
                        <div className="space-y-3 md:space-y-2 mt-3">
                          {Array.from(historyGrouped.entries())
                            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                            .map(([date, expenses]) => 
                              renderGroupedExpenseItem(date, expenses)
                            )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </div>
            ) : (
              /* Income Tab Content */
              <div className="space-y-2 mt-4">
                {incomes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada pemasukan tambahan untuk bulan ini
                  </p>
                ) : (
                  <>
                    {incomes.map((income) => {
                      const isExcluded = excludedIncomeIds.has(income.id);
                      const isSelected = selectedIncomeIds.has(income.id);
                      return (
                        <div
                          key={income.id}
                          className={`flex items-start gap-2 p-3 border rounded-lg transition-all ${
                            isExcluded ? 'opacity-50 bg-muted/30' : ''
                          } ${
                            isBulkSelectMode 
                              ? 'cursor-pointer hover:bg-accent/50' 
                              : 'hover:bg-accent/50 hover:scale-[1.005]'
                          } ${
                            isSelected ? 'bg-accent border-primary' : ''
                          }`}
                          onClick={() => isBulkSelectMode && handleToggleSelectIncome(income.id)}
                        >
                          {isBulkSelectMode && (
                            <div className="pt-0.5">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleSelectIncome(income.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="border-neutral-400 data-[state=checked]:border-primary"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`${isExcluded ? 'line-through' : ''} truncate`}>{income.name}</p>
                              <span className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''} whitespace-nowrap`}>
                                {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(income.date))}
                              </span>
                            </div>
                            {income.currency === "USD" && (
                              <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                                <DollarSign className="size-3" />
                                <span className="text-xs">
                                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(income.amount)} × {formatCurrency(income.exchangeRate || 0)}
                                  <span className="ml-1">({income.conversionType === "auto" ? "realtime" : "manual"})</span>
                                </span>
                              </div>
                            )}
                            {income.deduction > 0 && (
                              <div className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                                <Minus className="size-3 inline" /> Potongan: {formatCurrency(income.deduction)} (Kotor: {formatCurrency(income.amountIDR)})
                              </div>
                            )}
                          </div>
                          {!isBulkSelectMode && (
                            <div className="flex items-center justify-between sm:justify-end gap-1">
                              <div className="text-right">
                                <p className={`text-sm sm:text-base text-green-600 ${isExcluded ? 'line-through' : ''} whitespace-nowrap`}>
                                  {formatCurrency(income.deduction > 0 ? income.amountIDR - income.deduction : income.amountIDR)}
                                </p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const wasExcluded = excludedIncomeIds.has(income.id);
                                    const newSet = new Set(excludedIncomeIds);
                                    if (wasExcluded) {
                                      newSet.delete(income.id);
                                      toast.success(`${income.name} dimasukkan kembali dalam hitungan`);
                                    } else {
                                      newSet.add(income.id);
                                      toast.info(`${income.name} dikecualikan dari hitungan`);
                                    }
                                    if (onExcludedIncomeIdsChange) onExcludedIncomeIdsChange(newSet);
                                  }}
                                  title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                                >
                                  {isExcluded ? <EyeOff className="size-3.5 text-muted-foreground" /> : <Eye className="size-3.5 text-muted-foreground" />}
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                      title="More"
                                    >
                                      <MoreVertical className="size-3.5 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingIncomeId(income.id);
                                        // Convert date to YYYY-MM-DD format for input type="date"
                                        const dateObj = new Date(income.date);
                                        const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                                        setEditingIncome({
                                          ...income,
                                          date: formattedDate
                                        });
                                      }}
                                    >
                                      <Pencil className="size-3.5 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDeleteIncome?.(income.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="size-3.5 mr-2" />
                                      Hapus
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Income Breakdown Section */}
                    <div className="pt-4 border-t space-y-3 bg-muted/30 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-3">Ringkasan Pemasukan</h4>
                      
                      {/* Total Kotor */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Kotor</span>
                        <span className="text-green-600">{formatCurrency(totalGrossIncome)}</span>
                      </div>
                      
                      {/* Potongan Individual */}
                      {totalIndividualDeductions > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Minus className="size-3" />
                            Potongan Individual
                          </span>
                          <span className="text-red-600">-{formatCurrency(totalIndividualDeductions)}</span>
                        </div>
                      )}
                      
                      {/* Subtotal */}
                      <div className="flex items-center justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-green-600">{formatCurrency(subtotalAfterIndividualDeductions)}</span>
                      </div>
                      
                      {/* Potongan Global */}
                      <div className={`space-y-2 ${isDeductionExcluded ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm flex items-center gap-2 cursor-pointer" onClick={() => setShowGlobalDeductionInput(!showGlobalDeductionInput)}>
                            <Minus className="size-3 text-red-600" />
                            <span className={isDeductionExcluded ? 'line-through' : ''}>Potongan Global</span>
                            {isDeductionExcluded && <Badge variant="secondary" className="text-xs">excluded</Badge>}
                          </Label>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-6"
                              onClick={() => setShowGlobalDeductionInput(!showGlobalDeductionInput)}
                              title={showGlobalDeductionInput ? "Sembunyikan input" : "Tampilkan input"}
                            >
                              {showGlobalDeductionInput ? <EyeOff className="size-3 text-muted-foreground" /> : <Eye className="size-3 text-muted-foreground" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="size-6"
                              onClick={() => {
                                const newValue = !isDeductionExcluded;
                                if (onDeductionExcludedChange) onDeductionExcludedChange(newValue);
                                toast.info(newValue ? "Potongan dikecualikan dari hitungan" : "Potongan dimasukkan dalam hitungan");
                              }}
                              title={isDeductionExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                            >
                              {isDeductionExcluded ? <Lock className="size-3 text-muted-foreground" /> : <Unlock className="size-3 text-muted-foreground" />}
                            </Button>
                            <span className={`text-sm ${isDeductionExcluded ? 'line-through text-muted-foreground' : 'text-red-600'}`}>
                              {effectiveGlobalDeduction > 0 ? '-' : ''}{formatCurrency(effectiveGlobalDeduction)}
                            </span>
                          </div>
                        </div>
                        {showGlobalDeductionInput && (
                          <Input
                            id="globalDeduction"
                            type="text"
                            inputMode="numeric"
                            value={formatCurrencyInput(globalDeduction || "")}
                            onChange={(e) => onUpdateGlobalDeduction?.(parseCurrencyInput(e.target.value))}
                            placeholder="0"
                            className={`text-sm ${isDeductionExcluded ? 'line-through' : ''}`}
                          />
                        )}
                      </div>
                      
                      {/* Total Bersih */}
                      <div className="flex items-center justify-between text-base font-medium border-t pt-3">
                        <span>Total Bersih</span>
                        <span className="text-green-600">{formatCurrency(totalNetIncome)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Edit Dialog/Drawer - Responsive */}
      {isMobile ? (
        <Drawer open={editingExpenseId !== null} onOpenChange={(open) => !open && handleCloseEditDialog()} dismissible={true}>
          <DrawerContent className="max-h-[90vh] flex flex-col">
            <DrawerHeader className="text-left border-b">
              <DrawerTitle>Edit Pengeluaran</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyInput(editingExpense.amount)}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseCurrencyInput(e.target.value) })}
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

            {pockets.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="edit-pocket">Sumber Dana (Kantong)</Label>
                <select
                  id="edit-pocket"
                  value={editingExpense.pocketId || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, pocketId: e.target.value || undefined })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Pilih Kantong</option>
                  {pockets.map(pocket => (
                    <option key={pocket.id} value={pocket.id}>
                      {pocket.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-category">Kategori (Opsional)</Label>
              <select
                id="edit-category"
                value={editingExpense.category || ''}
                onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value || undefined })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Pilih Kategori</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}{cat.isCustom ? ' (Custom)' : ''}
                  </option>
                ))}
              </select>
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
            <div className="px-4 py-4 border-t bg-background flex justify-end gap-2">
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
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={editingExpenseId !== null} onOpenChange={(open) => !open && handleCloseEditDialog()}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Pengeluaran</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name-desktop">Nama</Label>
                <Input
                  id="edit-name-desktop"
                  value={editingExpense.name}
                  onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                />
              </div>
              
              {(!editingExpense.items || editingExpense.items.length === 0) && (
                <div className="space-y-2">
                  <Label htmlFor="edit-amount-desktop">Jumlah</Label>
                  <Input
                    id="edit-amount-desktop"
                    type="text"
                    inputMode="numeric"
                    value={formatCurrencyInput(editingExpense.amount)}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseCurrencyInput(e.target.value) })}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-date-desktop">Tanggal</Label>
                <Input
                  id="edit-date-desktop"
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                />
              </div>

              {pockets.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="edit-pocket-desktop">Sumber Dana (Kantong)</Label>
                  <select
                    id="edit-pocket-desktop"
                    value={editingExpense.pocketId || ''}
                    onChange={(e) => setEditingExpense({ ...editingExpense, pocketId: e.target.value || undefined })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Pilih Kantong</option>
                    {pockets.map(pocket => (
                      <option key={pocket.id} value={pocket.id}>
                        {pocket.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-category-desktop">Kategori (Opsional)</Label>
                <select
                  id="edit-category-desktop"
                  value={editingExpense.category || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value || undefined })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Pilih Kategori</option>
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}{cat.isCustom ? ' (Custom)' : ''}
                    </option>
                  ))}
                </select>
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
      )}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-xl">
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
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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

      {/* Bulk Edit Category Dialog */}
      {onBulkUpdateCategory && (
        <BulkEditCategoryDialog
          open={showBulkEditCategoryDialog}
          onOpenChange={setShowBulkEditCategoryDialog}
          selectedExpenseIds={Array.from(selectedExpenseIds)}
          expenses={expenses}
          onUpdate={handleConfirmBulkEditCategory}
        />
      )}
      
      {/* Category Breakdown - Dialog (Desktop) / Drawer (Mobile) */}
      {/* ✅ CRITICAL FIX: Conditional rendering to force unmount when closed */}
      {isMobile ? (
        showCategoryDrawer && (
          <Drawer 
            open={showCategoryDrawer} 
            onOpenChange={(open) => {
              console.log('Category Drawer onOpenChange:', open);
              setShowCategoryDrawer(open);
              // ✅ Force cleanup stuck overlay
              if (!open) {
                // Force remove any stuck overlays
                setTimeout(() => {
                  const overlays = document.querySelectorAll('[data-vaul-overlay], [data-vaul-drawer]');
                  overlays.forEach(overlay => {
                    if (overlay.parentElement) {
                      overlay.parentElement.removeChild(overlay);
                    }
                  });
                }, 100);
              }
            }}
            modal={true}
            dismissible={true}
            shouldScaleBackground={false}
          >
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>Breakdown Kategori</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-6">
                <CategoryBreakdown
                  monthKey=""
                  expenses={expenses.filter(e => !excludedExpenseIds.has(e.id) && !e.fromIncome)}
                  onCategoryClick={handleCategoryClick}
                  activeFilter={activeCategoryFilter}
                />
              </div>
            </DrawerContent>
          </Drawer>
        )
      ) : (
        showCategoryDrawer && (
          <Dialog open={showCategoryDrawer} onOpenChange={setShowCategoryDrawer}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Breakdown Kategori</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <CategoryBreakdown
                  monthKey=""
                  expenses={expenses.filter(e => !excludedExpenseIds.has(e.id) && !e.fromIncome)}
                  onCategoryClick={handleCategoryClick}
                  activeFilter={activeCategoryFilter}
                />
              </div>
            </DialogContent>
          </Dialog>
        )
      )}
      
      {/* Edit Income Dialog/Drawer - Using AdditionalIncomeForm */}
      {editingIncomeId && editingIncome && onUpdateIncome && (
        isMobile ? (
          <Drawer open={true} onOpenChange={(open) => !open && setEditingIncomeId(null)}>
            <DrawerContent className="max-h-[90vh] flex flex-col">
              <DrawerHeader className="text-left border-b">
                <DrawerTitle>Edit Pemasukan</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <AdditionalIncomeForm
                  editMode={true}
                  initialValues={{
                    name: editingIncome.name,
                    amount: editingIncome.amount,
                    currency: editingIncome.currency || 'IDR',
                    exchangeRate: editingIncome.exchangeRate || null,
                    conversionType: editingIncome.conversionType || 'auto',
                    date: editingIncome.date,
                    deduction: editingIncome.deduction || 0,
                    pocketId: editingIncome.pocketId || 'pocket_daily',
                    amountIDR: editingIncome.amountIDR || editingIncome.amount,
                  }}
                  onUpdateIncome={(incomeData) => {
                    onUpdateIncome(editingIncomeId, incomeData);
                    setEditingIncomeId(null);
                    toast.success("Pemasukan berhasil diupdate");
                  }}
                  onSuccess={() => setEditingIncomeId(null)}
                  inDialog={true}
                  pockets={pockets}
                  hideTargetPocket={false}
                  submitButtonText="Simpan"
                />
              </div>
              <div className="flex gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingIncomeId(null)}
                >
                  Batal
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={true} onOpenChange={(open) => !open && setEditingIncomeId(null)}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Pemasukan</DialogTitle>
              </DialogHeader>
              <AdditionalIncomeForm
                editMode={true}
                initialValues={{
                  name: editingIncome.name,
                  amount: editingIncome.amount,
                  currency: editingIncome.currency || 'IDR',
                  exchangeRate: editingIncome.exchangeRate || null,
                  conversionType: editingIncome.conversionType || 'auto',
                  date: editingIncome.date,
                  deduction: editingIncome.deduction || 0,
                  pocketId: editingIncome.pocketId || 'pocket_daily',
                  amountIDR: editingIncome.amountIDR || editingIncome.amount,
                }}
                onUpdateIncome={(incomeData) => {
                  onUpdateIncome(editingIncomeId, incomeData);
                  setEditingIncomeId(null);
                  toast.success("Pemasukan berhasil diupdate");
                }}
                onSuccess={() => setEditingIncomeId(null)}
                inDialog={true}
                pockets={pockets}
                hideTargetPocket={false}
                submitButtonText="Simpan"
              />
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingIncomeId(null)}
                >
                  Batal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )
      )}
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

// Export memoized component for performance
export const ExpenseList = memo(ExpenseListComponent);