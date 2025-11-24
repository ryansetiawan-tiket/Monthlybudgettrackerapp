import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trash2, ChevronDown, ChevronUp, ArrowUpDown, Pencil, Plus, X, Search, ArrowRight, ArrowLeft, DollarSign, Minus, BarChart3, Settings, MoreVertical, ListChecks, Info, Filter, FileText, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useMemo, useRef, useEffect, useCallback, memo, lazy, Suspense } from "react";
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
import { EXPENSE_CATEGORIES, LEGACY_CATEGORY_ID_MAP } from "../constants";
import { CategoryFilterBadge } from "./CategoryFilterBadge";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { getAllCategories } from "../utils/categoryManager";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { formatCurrency } from "../utils/currency";
import { formatUSD } from "../utils/currencyFormatting";
import { AdditionalIncomeForm } from "./AdditionalIncomeForm";
import { formatDateSafe, getLocalDateFromISO, getDayName, getDateNumber, isPast } from "../utils/date-helpers";
import { ConsolidatedToolbar } from "./ConsolidatedToolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { ExpenseItemWrapper } from "./ExpenseItemWrapper";
import { ExpenseListItem } from "./expense-list/ExpenseListItem";
import { IncomeListItem } from "./expense-list/IncomeListItem";
import { ExpenseListTabs } from "./expense-list/ExpenseListTabs";
import type { ExpenseItem, Expense, AdditionalIncome, PocketBalance, ExpenseListProps } from "../types/expense";
import { normalizeCategoryId } from "../utils/expenseHelpers";
import { useExpenseFiltering } from "../hooks/useExpenseFiltering";
import { useExpenseActions } from "../hooks/useExpenseActions";
import { useBulkSelection } from "../hooks/useBulkSelection";

// 🚀 Lazy-loaded heavy modal components (Phase 2)
const BulkEditCategoryDialog = lazy(() => import("./BulkEditCategoryDialog").then(m => ({ default: m.BulkEditCategoryDialog })));
const AdvancedFilterDrawer = lazy(() => import("./AdvancedFilterDrawer").then(m => ({ default: m.AdvancedFilterDrawer })));
const SimulationSandbox = lazy(() => import("./SimulationSandbox"));
const ItemActionSheet = lazy(() => import("./ItemActionSheet").then(m => ({ default: m.ItemActionSheet })));

function ExpenseListComponent({ 
  expenses, 
  onDeleteExpense, 
  onEditExpense, 
  onBulkDeleteExpenses, 
  onBulkUpdateCategory, 
  onMoveToIncome, 
  pockets = [],
  balances = [],
  categoryFilter = new Set(), 
  onClearFilter,
  onCategoryClick,
  // Income props
  incomes = [],
  onDeleteIncome,
  onUpdateIncome,
  globalDeduction = 0,
  onUpdateGlobalDeduction,
  onOpenCategoryManager,
  onOpenAddTransaction,
  onOpenTemplateManager,
  // Budget props
  initialBudget = 0,
  // 🏗️ ARCHITECTURE FIX: NEW - Carry-over breakdown props
  carryOverAssets = 0,
  carryOverLiabilities = 0,
  // Month/Year props
  selectedMonth,
  selectedYear,
  // ✨ NEW: External category breakdown control
  externalOpenCategoryBreakdown = false,
  onCategoryBreakdownClose,
  // 🔒 NEW: Modal state callback
  onModalStateChange
}: ExpenseListProps) {
  const isMobile = useIsMobile();
  
  // Convert balances array to Map for AdditionalIncomeForm
  const balancesMap = useMemo(() => {
    const map = new Map<string, {availableBalance: number}>();
    balances.forEach(balance => {
      map.set(balance.pocketId, { availableBalance: balance.availableBalance });
    });
    return map;
  }, [balances]);
  
  const monthKey = useMemo(() => {
    if (selectedMonth && selectedYear) {
      const key = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      return key;
    }
    return '';
  }, [selectedMonth, selectedYear]);
  
  // Phase 8: Get custom category settings
  const { settings } = useCategorySettings();
  const allCategories = useMemo(() => {
    return getAllCategories(settings);
  }, [settings]);
  
  // ✨ NEW: Fetch templates for emoji lookup (so we always show latest template emoji)
  const [templates, setTemplates] = useState<Array<{id: string; name: string; emoji?: string; color?: string}>>([]);
  
  useEffect(() => {
    if (!monthKey) return;
    
    const fetchTemplates = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1/templates`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setTemplates(data || []);
        }
      } catch (error) {
        console.error('[ExpenseList] Failed to fetch templates:', error);
      }
    };
    
    fetchTemplates();
  }, [monthKey]);
  
  // Create template lookup map for O(1) emoji access
  const templateMap = useMemo(() => {
    const map = new Map<string, {emoji?: string; color?: string; name: string}>();
    templates.forEach(t => {
      map.set(t.id, { emoji: t.emoji, color: t.color, name: t.name });
    });
    return map;
  }, [templates]);
  
  // ✨ Helper: Get display emoji (template emoji takes priority over expense emoji)
  const getDisplayEmoji = useCallback((expense: Expense): string | undefined => {
    // If expense has groupId, try to get emoji from template (always fresh/latest)
    if (expense.groupId) {
      const template = templateMap.get(expense.groupId);
      if (template?.emoji) {
        return template.emoji;
      }
    }
    // Fallback to expense's stored emoji (might be outdated)
    return (expense as any).emoji;
  }, [templateMap]);
  
  // Get unique income sources
  const allIncomeSources = useMemo(() => {
    const sourceMap = new Map<string, number>();
    incomes.forEach(income => {
      const count = sourceMap.get(income.name) || 0;
      sourceMap.set(income.name, count + 1);
    });
    return Array.from(sourceMap.entries()).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [incomes]);
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  
 
  
  
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkEditCategoryDialog, setShowBulkEditCategoryDialog] = useState(false);
  
  // New states for Figma redesign
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [showGlobalDeductionInput, setShowGlobalDeductionInput] = useState(false);
  
  // Phase 2: Smart Simulation Sandbox state
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxContext, setSandboxContext] = useState<'all' | 'expense' | 'income'>('all');
  

  // 🎯 Phase 3 - CANARY #3: Expense Actions Hook
  // ⚠️ CRITICAL: Must be called BEFORE any useDialogRegistration that uses these states!
  const {
    // Edit states
    editingExpenseId,
    editingExpense,
    setEditingExpense,
    editingIncomeId,
    setEditingIncomeId,
    editingIncome,
    setEditingIncome,
    itemAmountInputs,
    setItemAmountInputs,
    isUpdatingExpense,
    setIsUpdatingExpense,
    isUpdatingIncome,
    setIsUpdatingIncome,

    // Delete states
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    expenseToDelete,
    setExpenseToDelete,

    // Mobile action sheet states
    actionSheetOpen,
    setActionSheetOpen,
    actionSheetItem,
    setActionSheetItem,

    // Edit handlers - Expense
    handleEditExpense,
    handleCloseEditExpense,
    handleSaveEditExpense,

    // Edit handlers - Income
    handleEditIncome,
    handleCloseEditIncome,

    // Delete handlers
    handleDeleteExpense,
    handleConfirmDeleteExpense,
    handleCancelDeleteExpense,

    // Mobile action sheet handlers
    handleLongPressItem,
    handleSheetEdit,
    handleSheetDelete,
    handleSheetMoveToIncome,
  } = useExpenseActions({
    expenses,
    incomes,
    onEditExpense,
    onDeleteExpense,
    onDeleteIncome,
    onMoveToIncome,
    getLocalDateFromISO,
  });
  
  // Register simulation sandbox for back button handling
  useDialogRegistration(
    showSandbox,
    (open) => {
      if (!open) {
        setShowSandbox(false);
      }
    },
    DialogPriority.HIGH,
    'simulation-sandbox'
  );
  
  
 
  
  
  
  // Register action sheet for back button handling
  useDialogRegistration(
    actionSheetOpen,
    (open) => {
      if (!open) {
        setActionSheetOpen(false);
        setActionSheetItem(null);
      }
    },
    DialogPriority.MEDIUM,
    'item-action-sheet'
  );
  
  // Register edit income drawer for back button handling
  useDialogRegistration(
    !!editingIncomeId,
    (open) => {
      if (!open) {
        setEditingIncomeId(null);
      }
    },
    DialogPriority.MEDIUM,
    'edit-income-drawer'
  );
 
  
  // Register edit expense drawer for back button handling
  useDialogRegistration(
    editingExpenseId !== null,
    (open) => {
      if (!open) {
        handleCloseEditExpense();
      }
    },
    DialogPriority.MEDIUM,
    'edit-expense-drawer'
  );
  
  // Register category breakdown drawer for back button handling
  useDialogRegistration(
    showCategoryDrawer,
    (open) => {
      if (!open) {
        setShowCategoryDrawer(false);
        // ✅ FIX: Also reset external state when closed via back button
        onCategoryBreakdownClose?.();
      }
    },
    DialogPriority.MEDIUM,
    'category-breakdown-drawer'
  );
  
  // ⚠️ MOVED: Track all modal/drawer states - moved after useExpenseFiltering hook
  
  // ✨ NEW: Sync external state to internal state (for BudgetOverview shortcut)
  useEffect(() => {
    // ✅ FIX: Sync both opening AND closing to prevent stuck state
    setShowCategoryDrawer(externalOpenCategoryBreakdown);
  }, [externalOpenCategoryBreakdown]);
  
  // Progressive disclosure for income items
  const [expandedIncomeIds, setExpandedIncomeIds] = useState<Set<string>>(new Set());
  
  const toggleExpandIncome = (id: string) => {
    setExpandedIncomeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Helper function to get day name
  // Helper function to get pocket name (component-specific, kept inline)
  const getPocketName = (pocketId?: string): string => {
    if (!pocketId) return '';
    const pocket = pockets.find(p => p.id === pocketId);
    return pocket?.name || '';
  };

  // Extract all unique names, day names, dates, and categories (CONTEXTUAL to active tab)
  const allNames = useMemo(() => {
    const namesSet = new Set<string>();
    const dayNamesSet = new Set<string>();
    const datesSet = new Set<string>();
    const categoriesSet = new Set<string>();
    
    // ✅ CONTEXTUAL: Filter data based on active tab
    if (activeTab === 'expense') {
      // Search in expenses only
      expenses.filter(e => !e.fromIncome).forEach(expense => {
        namesSet.add(expense.name);
        dayNamesSet.add(getDayName(expense.date));
        datesSet.add(getDateNumber(expense.date));
        
        if (expense.items && expense.items.length > 0) {
          expense.items.forEach(item => {
            namesSet.add(item.name);
          });
        }
      });
    } else {
      // Search in incomes only
      incomes.forEach(income => {
        namesSet.add(income.name);
        dayNamesSet.add(getDayName(income.date));
        datesSet.add(getDateNumber(income.date));
      });
    }
    
    // ✅ KATEGORI DETECTION: Add all category names for expenses tab
    if (activeTab === 'expense') {
      allCategories.forEach(cat => {
        categoriesSet.add(getCategoryLabel(cat.id as any, settings));
      });
    }
    
    // Combine all unique values
    const allSuggestions = [
      ...Array.from(namesSet),
      ...Array.from(dayNamesSet),
      ...Array.from(datesSet),
      ...Array.from(categoriesSet)
    ];
    
    return allSuggestions.sort();
  }, [expenses, incomes, activeTab, allCategories, settings]);

  // 🚀 Phase 3: Extract filtering logic to custom hook
  const {
    // Search state
    searchQuery,
    isSearchExpanded,
    setIsSearchExpanded,
    setSearchQuery,
    setShowSuggestions,
    matchedCategories,
    setMatchedCategories,
    showSuggestions,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
    searchInputRef,
    suggestionsRef,
    suggestions,
    
    // Filter state
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    selectedCategoryFilters,
    setSelectedCategoryFilters,
    selectedPocketFilters,
    setSelectedPocketFilters,
    selectedIncomeSourceFilters,
    setSelectedIncomeSourceFilters,
    activeFilters,
    setActiveFilters,
    activeCategoryFilter,
    setActiveCategoryFilter,
    
    // Filtered data
    sortedAndFilteredExpenses,
    filteredAndSortedIncomes,
    categoryFilteredExpenses,
    
    // Search handlers
    handleSearchChange,
    handleClearSearch,
    handleSelectSuggestion,
    handleKeyDown,
    
    // Filter handlers
    toggleCategoryFilter,
    togglePocketFilter,
    toggleIncomeSourceFilter,
    applyFilters,
    resetFilters,
  } = useExpenseFiltering({
    expenses,
    incomes,
    activeTab,
    sortOrder,
    allCategories,
    allNames,
    settings,
    getPocketName,
    getDayName,
    getDateNumber,
    isPast,
  });

  // ⚠️ All search/filter logic moved to useExpenseFiltering hook

  // ✅ Extract sorted expenses from filtering hook
  const upcomingExpenses = sortedAndFilteredExpenses?.sortedUpcoming || [];
  const historyExpenses = sortedAndFilteredExpenses?.sortedHistory || [];
  const allSortedExpenses = sortedAndFilteredExpenses?.combined || [];

  // 🎯 Phase 3 - CANARY #2: Bulk selection hook
  const {
    isBulkSelectMode,
    selectedExpenseIds,
    selectedIncomeIds,
    selectedCount,
    allSelected: isAllSelected,
    handleActivateBulkMode,
    handleCancelBulkMode,
    handleToggleBulkMode,
    handleToggleSelectExpense,
    handleToggleSelectIncome,
    handleSelectAllExpenses,
    handleSelectAllIncomes,
    handleToggleSelectAll,
    setIsBulkSelectMode,
    setSelectedExpenseIds,
    setSelectedIncomeIds,
  } = useBulkSelection({
    activeTab,
    allSortedExpenses,
    incomes: filteredAndSortedIncomes,
  });

  // ⚠️ REMOVED - Duplicate hook call (now initialized earlier before dialog registrations)
  
  // 🔒 Track all modal/drawer states and notify parent
  useEffect(() => {
    const isAnyModalOpen = 
      !!editingExpenseId || 
      !!editingIncomeId || 
      showCategoryDrawer || 
      isFilterDrawerOpen ||
      actionSheetOpen ||
      showSandbox ||
      deleteConfirmOpen ||
      showBulkDeleteDialog ||
      showBulkEditCategoryDialog;

    // Notify parent component (App.tsx) about modal state
    onModalStateChange?.(isAnyModalOpen);
  }, [
    editingExpenseId, 
    editingIncomeId, 
    showCategoryDrawer, 
    isFilterDrawerOpen,
    actionSheetOpen,
    showSandbox,
    deleteConfirmOpen,
    showBulkDeleteDialog,
    showBulkEditCategoryDialog,
    onModalStateChange
  ]);

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
    console.log('toggleSortOrder called, current sortOrder:', sortOrder);
    setSortOrder(prev => {
      const newOrder = prev === 'asc' ? 'desc' : 'asc';
      console.log('New sortOrder will be:', newOrder);
      toast.info(newOrder === 'asc' ? 'Diurutkan: Terlama ke Terbaru' : 'Diurutkan: Terbaru ke Terlama');
      return newOrder;
    });
  };

  // Handle category click from pie chart
  const handleCategoryClick = useCallback((category: import('../types').ExpenseCategory) => {
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
    
    // 📜 NEW: Notify parent to trigger auto-scroll (if opened from external card)
    if (onCategoryClick) {
      onCategoryClick(category);
    }
    
    // ✅ V4 FIX: Simply close the drawer - Vaul will handle cleanup properly
    setShowCategoryDrawer(false);
  }, [settings, onCategoryClick]);

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

  

  // Phase 2: Handler to open sandbox with smart context
  const handleOpenSandbox = useCallback(() => {
    // Map activeTab to sandbox context ('expense' or 'income' → same, otherwise 'all')
    const context = activeTab === 'expense' || activeTab === 'income' ? activeTab : 'all';
    setSandboxContext(context);
    setShowSandbox(true);
  }, [activeTab]);

 

  

  const handleBulkDeleteIncomes = useCallback(async () => {
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
  }, [selectedIncomeIds, onDeleteIncome]);

  // Calculate totals
  // Items from income (fromIncome: true) subtract from expenses
  const totalExpenses = expenses
    .reduce((sum, expense) => {
      if (expense.fromIncome) {
        return sum - expense.amount;
      }
      return sum + expense.amount;
    }, 0);

  // Calculate income totals
  const totalGrossIncome = incomes
    .reduce((sum, income) => sum + income.amountIDR, 0);
  
  const totalIndividualDeductions = incomes
    .reduce((sum, income) => sum + (income.deduction || 0), 0);
  
  const subtotalAfterIndividualDeductions = totalGrossIncome - totalIndividualDeductions;
  
  const totalNetIncome = subtotalAfterIndividualDeductions - (globalDeduction || 0);

 

  

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

 

  // Keyboard support: Escape to exit bulk mode / close search / close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBulkSelectMode) {
        handleCancelBulkMode();
      }
      // ✅ NEW: Close search expanded mode dengan Escape key
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
        setSearchQuery('');
        setShowSuggestions(false);
      }
      // ✅ FIX: Close category drawer dengan Escape key
      if (e.key === 'Escape' && showCategoryDrawer) {
        setShowCategoryDrawer(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBulkSelectMode, handleCancelBulkMode, isSearchExpanded, showCategoryDrawer]);

  // ✅ V9 FIX: Aggressive cleanup of stuck drawer overlays when state changes
  useEffect(() => {
    if (!showCategoryDrawer) {
      // Force cleanup any stuck Vaul drawer overlays
      const cleanupOverlays = () => {
        const overlays = document.querySelectorAll('[data-vaul-overlay], [data-vaul-drawer-wrapper]');
        overlays.forEach(overlay => {
          // ✅ V9 FIX: Hapus paksa tanpa cek opacity - lebih agresif!
          // If condition terlalu "pintar" dan gagal cleanup overlay stuck di tengah animasi
          overlay.remove();
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

  // ⚠️ DEPRECATED - This handler logic now exists in useExpenseActions hook
  // TODO: Remove after all references updated to use hook handler
  const handleEditExpense_DEPRECATED = (id: string) => {
    // Now handled by useExpenseActions hook - call hook's handler instead
    handleEditExpense(id);
  };

  // 📱 Mobile Bottom Sheet Handlers
  // ⚠️ These still use old state - will be migrated gradually
  const handleLongPressItem_OLD = useCallback((id: string, type: 'expense' | 'income') => {
    if (isBulkSelectMode) return; // Skip if in bulk mode
    
    if (type === 'expense') {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        setActionSheetItem({
          id: expense.id,
          name: expense.name,
          type: 'expense',
          fromIncome: expense.fromIncome
        });
        setActionSheetOpen(true);
      }
    } else {
      const income = incomes.find(i => i.id === id);
      if (income) {
        setActionSheetItem({
          id: income.id,
          name: income.name,
          type: 'income'
        });
        setActionSheetOpen(true);
      }
    }
  }, [isBulkSelectMode, expenses, incomes]);

 

  // ⚠️ DEPRECATED - Use handleCloseEditExpense from hook instead
  // Keeping as alias temporarily for backward compatibility
  const handleCloseEditDialog = handleCloseEditExpense;

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

  const handleUpdateItem = (index: number, field: 'name' | 'amount' | 'category', value: string | number) => {
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
      items: [...(editingExpense.items || []), { name: '', amount: 0, category: undefined }] 
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
    
    // Debug flag - set to true to enable grouping debug logs
    const DEBUG_GROUPING = false;
    
    expenses.forEach(expense => {
      // ✅ FIX: Convert to LOCAL date, not UTC date!
      // UTC: "2025-10-27T23:21:21.000Z" → split → "2025-10-27" (wrong for WIB!)
      // Local: new Date() → getFullYear/Month/Date → "2025-10-28" (correct for WIB!)
      const localDate = new Date(expense.date);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const dateOnly = `${year}-${month}-${day}`; // Local date in YYYY-MM-DD format
      const groupKey = dateOnly;
      
      if (DEBUG_GROUPING) {
        console.log('🔍 Grouping expense:', {
          name: expense.name,
          fullDate: expense.date,
          utcDateOnly: expense.date.split('T')[0],
          localDateOnly: dateOnly,
          groupKey,
          pocketId: expense.pocketId,
          category: expense.category,
        });
      }
      
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      grouped.get(groupKey)!.push(expense);
    });
    
    if (DEBUG_GROUPING) {
      console.log('📦 Grouped results:', Array.from(grouped.entries()).map(([key, exps]) => ({
        date: key,
        count: exps.length,
        expenses: exps.map(e => ({ name: e.name, pocket: e.pocketId })),
      })));
    }
    
    return grouped;
  };

  // ⚠️ REMOVED - Now handled by useExpenseFiltering hook (filteredAndSortedIncomes)
  /*
  // ✅ NEW: Filter incomes with search (CONTEXTUAL for income tab)
  const filteredIncomes = useMemo(() => {
    if (activeTab !== 'income') return incomes;
    
    return incomes.filter((income) => fuzzyMatchIncome(income, searchQuery));
  }, [incomes, searchQuery, activeTab]);
  */

  // ⚠️ REMOVED duplicate split - already handled in useMemo above
  // upcomingExpenses and historyExpenses are now extracted from sortedAndFilteredExpenses

  // Group by date
  const upcomingGrouped = groupExpensesByDate(upcomingExpenses);
  const historyGrouped = groupExpensesByDate(historyExpenses);

  // Calculate subtotals (excluding excluded items)
  // Items from income (fromIncome: true) subtract from expenses
  const upcomingTotal = upcomingExpenses
    .reduce((sum, expense) => {
      if (expense.fromIncome) {
        return sum - expense.amount;
      }
      return sum + expense.amount;
    }, 0);
  const historyTotal = historyExpenses
    .reduce((sum, expense) => {
      if (expense.fromIncome) {
        return sum - expense.amount;
      }
      return sum + expense.amount;
    }, 0);

  // Auto-expand "Riwayat" if "Hari Ini & Mendatang" is empty
  useEffect(() => {
    if (upcomingExpenses.length === 0 && historyExpenses.length > 0) {
      setHistoryExpanded(true);
    }
  }, [upcomingExpenses.length, historyExpenses.length]);

  // ✨ NEW: Smart Category Suggestions - Calculate most frequently used categories
  const topCategories = useMemo(() => {
    // Count category usage from all expenses (TODO: extend to all-time data from backend)
    const categoryCount = new Map<string, number>();
    
    expenses.forEach(expense => {
      // Skip income items
      if (expense.fromIncome) return;
      
      // Check if expense has items with individual categories
      const expenseItems = (expense as any).items;
      
      if (expenseItems && Array.isArray(expenseItems) && expenseItems.length > 0) {
        // Count item-level categories (template expenses)
        expenseItems.forEach((item: any) => {
          if (item.category) {
            const count = categoryCount.get(item.category) || 0;
            categoryCount.set(item.category, count + 1);
          }
        });
      } else if (expense.category) {
        // Count expense-level category (regular expenses)
        const count = categoryCount.get(expense.category) || 0;
        categoryCount.set(expense.category, count + 1);
      }
    });
    
    // Sort by frequency and get top 3
    const sorted = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoryId, count]) => ({ categoryId, count }));
    
    return sorted;
  }, [expenses]);

  // Render grouped expenses by date or groupId
  const renderGroupedExpenseItem = (groupKey: string, expenses: Expense[]) => {
    // ✨ REFACTOR V2: Always use static date header + simple list (no nested collapse)
    const dateExpenses = expenses;
    const actualDate = dateExpenses[0].date;

    // Calculate total for this group
    const groupTotal = dateExpenses
      .reduce((sum, exp) => {
        if (exp.fromIncome) {
          return sum - exp.amount;
        }
        return sum + exp.amount;
      }, 0);

    return (
      <div key={`group-${groupKey}`} className="space-y-1">
        {/* ✨ Static Date Header with Total (hierarchy clear) */}
        <div className="py-2 px-1 flex items-center justify-between gap-4 border-b border-border mb-2">
          {/* Left: Date with indicator */}
          <div className="flex items-center gap-2">
            {isToday(actualDate) && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
            )}
            <span className={`text-base font-bold ${isWeekend(actualDate) ? "text-green-600" : "text-foreground"}`}>
              {formatDateShort(actualDate)}
            </span>
          </div>
          
          {/* Right: Total Harian (subtle, gray) */}
          <span className="text-sm font-semibold text-muted-foreground opacity-70">
            {groupTotal > 0 ? '-' : '+'}{formatCurrency(Math.abs(groupTotal))}
          </span>
        </div>

        {/* ✨ Simple List Items (indented, clean layout) */}
        <div className="space-y-1">
          {dateExpenses.map(expense => renderIndividualExpenseInGroup(expense))}
        </div>
      </div>
    );
  };

  // 🚀 Phase 4A: Component-based rendering for ExpenseListItem
  // Extracted individual expense rendering to component for better modularity
  const renderIndividualExpenseInGroup = (expense: Expense) => {
    return (
      <ExpenseListItem
        key={expense.id}
        expense={expense}
        isBulkSelectMode={isBulkSelectMode}
        isSelected={selectedExpenseIds.has(expense.id)}
        isExpanded={expandedItems.has(expense.id)}
        categorySettings={settings}
        isMobile={isMobile}
        onToggleExpand={toggleExpanded}
        onToggleSelect={handleToggleSelectExpense}
        onEdit={handleEditExpense}
        onDelete={(data) => {
          // Trigger delete confirmation dialog (same as old function)
          setExpenseToDelete(data);
          setDeleteConfirmOpen(true);
        }}
        onLongPress={handleLongPressItem}
        onMoveToIncome={onMoveToIncome}
        getDisplayEmoji={getDisplayEmoji}
        getPocketName={getPocketName}
        formatUSD={formatUSD}
      />
    );
  };

  // 🚀 Phase 4B: Component-based rendering for IncomeListItem
  // Extracted individual income rendering to component for better modularity
  const renderIndividualIncomeInGroup = (income: AdditionalIncome) => {
    return (
      <IncomeListItem
        key={income.id}
        income={income}
        isBulkSelectMode={isBulkSelectMode}
        isSelected={selectedIncomeIds.has(income.id)}
        isExpanded={expandedIncomeIds.has(income.id)}
        isMobile={isMobile}
        onToggleExpand={toggleExpandIncome}
        onToggleSelect={handleToggleSelectIncome}
        onEdit={(id, inc, datePart) => {
          setEditingIncomeId(id);
          setEditingIncome({
            ...inc,
            date: datePart
          });
        }}
        onDelete={onDeleteIncome}
        onLongPress={handleLongPressItem}
        getLocalDateFromISO={getLocalDateFromISO}
      />
    );
  };

  // Render expense item function to avoid duplication
  const renderExpenseItem = (expense: Expense) => {
    if (expense.items && expense.items.length > 0) {
      return (
        <ExpenseItemWrapper
          key={expense.id}
          id={expense.id}
          isMobile={isMobile}
          isBulkSelectMode={isBulkSelectMode}
          isSelected={selectedExpenseIds.has(expense.id)}
          onLongPress={(id) => handleLongPressItem(id, 'expense')}
        >
          {(longPressHandlers) => (
            <Collapsible open={expandedItems.has(expense.id)} onOpenChange={() => toggleExpanded(expense.id)}>
              <div className={`border rounded-lg ${isToday(expense.date) ? 'ring-2 ring-blue-500' : ''} ${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30 border-primary' : ''}`}>
                <CollapsibleTrigger asChild>
                  <div 
                    className="group flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 hover:scale-[1.005] transition-all rounded-lg"
                    {...longPressHandlers}
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {isBulkSelectMode && (
                    <Checkbox
                      checked={selectedExpenseIds.has(expense.id)}
                      onCheckedChange={() => handleToggleSelectExpense(expense.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {isToday(expense.date) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
                  )}
                  <span 
                    className={`${isWeekend(expense.date) || expense.fromIncome ? "text-green-600" : ""} whitespace-nowrap`}
                    style={expense.color && !isWeekend(expense.date) && !expense.fromIncome ? { color: expense.color } : {}}
                  >
                    {formatDateShort(expense.date)}
                  </span>
                  <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'} truncate`}>
                    {expense.emoji && <span className="mr-1">{expense.emoji}</span>}
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
                  <p className={`${expense.fromIncome ? 'text-green-600' : 'text-red-600'} text-sm sm:text-base whitespace-nowrap`}>
                    {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                  </p>
                  {!isBulkSelectMode && (
                    <div className={`flex items-center gap-0.5 transition-opacity ${isMobile ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                      {expense.fromIncome && onMoveToIncome && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToIncome(expense);
                          }}
                          title="Kembalikan ke pemasukan tambahan"
                        >
                          <ArrowLeft className="size-3.5 text-green-600" />
                        </Button>
                      )}
                      <DropdownMenu open={isMobile ? (openDropdownId === expense.id) : undefined} onOpenChange={isMobile ? ((open) => !open && setOpenDropdownId(null)) : undefined}>
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
                          {expense.fromIncome && onMoveToIncome && isMobile && (
                            <DropdownMenuItem onClick={() => {
                              onMoveToIncome(expense);
                              setOpenDropdownId(null);
                            }}>
                              <ArrowLeft className="size-3.5 mr-2 text-green-600" />
                              Kembalikan ke Pemasukan
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            handleEditExpense(expense.id);
                            setOpenDropdownId(null);
                          }}>
                            <Pencil className="size-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                              setDeleteConfirmOpen(true);
                              setOpenDropdownId(null);
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
                  <div className="flex items-center gap-2 text-sm text-green-600 pl-8 mb-2">
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
                  <div className="text-xs text-muted-foreground pl-8 mb-2">
                    <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                  </div>
                )}
                {expense.items.map((item, index) => {
                  const itemCategory = (item as any).category; // Get category from item
                  const categoryEmoji = itemCategory ? getCategoryEmoji(itemCategory, settings) : '';
                  
                  return (
                    <div key={index} className="flex justify-between text-sm pl-8">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        {categoryEmoji && <span className="text-base">{categoryEmoji}</span>}
                        <span>{item.name}</span>
                      </span>
                      <span className={expense.fromIncome ? 'text-green-600' : 'text-red-600'}>
                        {expense.fromIncome ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </div>
            </Collapsible>
          )}
        </ExpenseItemWrapper>
      );
    } else {
      return (
        <ExpenseItemWrapper
          key={expense.id}
          id={expense.id}
          isMobile={isMobile}
          isBulkSelectMode={isBulkSelectMode}
          isSelected={selectedExpenseIds.has(expense.id)}
          onLongPress={(id) => handleLongPressItem(id, 'expense')}
        >
          {(longPressHandlers) => (
        <div
          key={expense.id}
          className={`group flex flex-col sm:flex-row sm:items-center gap-2 p-3 border rounded-lg hover:bg-accent/50 hover:scale-[1.005] transition-all ${isToday(expense.date) ? 'ring-2 ring-blue-500' : ''} ${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30 border-primary' : ''}`}
          {...(isMobile && !isBulkSelectMode ? longPressHandlers : {})}
        >
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {isBulkSelectMode && (
              <Checkbox
                checked={selectedExpenseIds.has(expense.id)}
                onCheckedChange={() => handleToggleSelectExpense(expense.id)}
                className="border-neutral-400 data-[state=checked]:border-primary"
              />
            )}
            {isToday(expense.date) && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`${expense.fromIncome ? 'text-green-600' : ''} truncate`}>
                  {expense.category && <span className="mr-1" title={`Category: ${expense.category}`}>{getCategoryEmoji(expense.category, settings)}</span>}
                  {expense.name}
                </p>
              </div>
              {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                <div className="flex items-center gap-2 text-sm text-green-600">
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
                <div className="text-xs text-muted-foreground">
                  <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                </div>
              )}
              <div className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'} flex items-center gap-1.5`}>
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
            <p className={`${expense.fromIncome ? 'text-green-600' : 'text-red-600'} text-sm sm:text-base whitespace-nowrap`}>
              {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
            </p>
            {!isBulkSelectMode && (
              <div className={`flex items-center gap-0.5 transition-opacity ${isMobile ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                {expense.fromIncome && onMoveToIncome && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToIncome(expense);
                    }}
                    title="Kembalikan ke pemasukan tambahan"
                  >
                    <ArrowRight className="size-3.5 text-green-600" />
                  </Button>
                )}
                <DropdownMenu open={isMobile ? (openDropdownId === expense.id) : undefined} onOpenChange={isMobile ? ((open) => !open && setOpenDropdownId(null)) : undefined}>
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
                    {expense.fromIncome && onMoveToIncome && isMobile && (
                      <DropdownMenuItem onClick={() => {
                        onMoveToIncome(expense);
                        setOpenDropdownId(null);
                      }}>
                        <ArrowRight className="size-3.5 mr-2 text-green-600" />
                        Kembalikan ke Pemasukan
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => {
                      handleEditExpense(expense.id);
                      setOpenDropdownId(null);
                    }}>
                      <Pencil className="size-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setExpenseToDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                        setDeleteConfirmOpen(true);
                        setOpenDropdownId(null);
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
          )}
        </ExpenseItemWrapper>
      );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col gap-2">
          {/* Row 1: Title + Desktop Buttons */}
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg">Daftar Transaksi</span>
            
            <div className="flex items-center gap-1.5">
              {/* Mobile: Simulasi button (Icon + Label) - Pojok kanan */}
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenSandbox}
                  className="flex md:hidden items-center gap-1.5 h-8 px-2.5"
                  title="Buka Simulation Sandbox"
                >
                  🧪
                  <span className="text-xs">Simulasi</span>
                </Button>
              )}
              
              {/* Desktop Add Transaction Button */}
              {onOpenAddTransaction && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onOpenAddTransaction}
                  className="hidden md:flex items-center gap-1.5"
                >
                  <Plus className="size-4" />
                  Tambah Transaksi
                </Button>
              )}
              
              {/* Phase 2: Simulation Sandbox Button (Desktop) */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenSandbox}
                className="hidden md:flex items-center gap-1.5"
                title="Buka Simulation Sandbox"
              >
                🧪 Simulasi
              </Button>
            </div>
          </div>
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
          <div className="space-y-4 p-[0px] mt-[-20px] mr-[0px] mb-[0px] ml-[0px]">
            {/* ✨ Consolidated Toolbar - Always visible above tabs */}
            <ConsolidatedToolbar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              isSearchExpanded={isSearchExpanded}
              onSearchToggle={() => setIsSearchExpanded(!isSearchExpanded)}
              searchInputRef={searchInputRef}
              showSuggestions={showSuggestions && !isMobile}
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
              suggestionsRef={suggestionsRef}
              onKeyDown={handleKeyDown}
              selectedSuggestionIndex={selectedSuggestionIndex}
              onSuggestionMouseEnter={setSelectedSuggestionIndex}
              matchedCategories={matchedCategories}
              onCategoryClick={(categoryId) => {
                setActiveCategoryFilter(new Set([categoryId as any]));
                setShowSuggestions(false);
                setIsSearchExpanded(false);
                toast.success(`Filter kategori: ${getCategoryEmoji(categoryId as any, settings)} ${getCategoryLabel(categoryId as any, settings)}`);
              }}
              getCategoryEmoji={(id) => getCategoryEmoji(id as any, settings)}
              getCategoryLabel={(id) => getCategoryLabel(id as any, settings)}
              isSelectionMode={isBulkSelectMode}
              onToggleSelection={handleToggleBulkMode}
              hasItems={activeTab === 'expense' ? expenses.length > 0 : incomes.length > 0}
              selectedCount={activeTab === 'expense' ? selectedExpenseIds.size : selectedIncomeIds.size}
              allSelected={
                activeTab === 'expense'
                  ? selectedExpenseIds.size > 0 && selectedExpenseIds.size === expenses.length
                  : selectedIncomeIds.size > 0 && selectedIncomeIds.size === incomes.length
              }
              onToggleSelectAll={handleToggleSelectAll}
              onBulkEdit={() => setShowBulkEditCategoryDialog(true)}
              onBulkDelete={handleBulkDelete}
              totalAmount={activeTab === 'expense' ? totalExpenses : totalNetIncome}
              activeTab={activeTab}
              onSort={activeTab === 'expense' ? toggleSortOrder : undefined}
              onFilter={() => {
                setSelectedCategoryFilters(new Set(activeFilters.categories));
                setSelectedPocketFilters(new Set(activeFilters.pockets));
                setSelectedIncomeSourceFilters(new Set(activeFilters.incomeSources));
                setIsFilterDrawerOpen(true);
              }}
              sortOrder={sortOrder === 'asc' ? 'oldest' : 'newest'}
              hasActiveFilters={
                activeFilters.categories.size > 0 || 
                activeFilters.pockets.size > 0 || 
                activeFilters.incomeSources.size > 0
              }
            />
            
            {/* Tabs for Expense/Income - Component-based (Phase 4C) */}
            <ExpenseListTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            {/* Mobile Search Bar - Below tabs, above expandable sections (toggleable) */}
            {isMobile && isSearchExpanded && !isBulkSelectMode && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={
                    activeTab === 'expense'
                      ? 'Cari nama, kategori, hari, atau tanggal...'
                      : 'Cari nama, hari, atau tanggal...'
                  }
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9 pr-9 h-10 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Hapus pencarian"
                  >
                    <X className="size-4" />
                  </button>
                )}
                
                {/* ✅ Smart Suggestions - Positioned directly below search input (Mobile) */}
                {showSuggestions && (suggestions.length > 0 || matchedCategories.size > 0) && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-lg z-[100] max-h-60 overflow-y-auto"
                  >
                  {/* ✅ Matched categories section (clickable badges) */}
                  {matchedCategories.size > 0 && activeTab === 'expense' && (
                    <div className="px-3 py-2 border-b border-border">
                      <div className="text-xs text-muted-foreground mb-2">Kategori ditemukan:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(matchedCategories).map(categoryId => {
                          const category = allCategories.find(c => c.id === categoryId);
                          if (!category) return null;
                          
                          return (
                            <button
                              key={categoryId}
                              onClick={() => {
                                setActiveCategoryFilter(new Set([categoryId as any]));
                                setShowSuggestions(false);
                                setIsSearchExpanded(false);
                                toast.success(`Filter kategori: ${getCategoryEmoji(categoryId as any, settings)} ${getCategoryLabel(categoryId as any, settings)}`);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-accent/50 hover:bg-accent rounded-md text-xs transition-colors"
                            >
                              <span>{getCategoryEmoji(categoryId as any, settings)}</span>
                              <span>{getCategoryLabel(categoryId as any, settings)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Regular suggestions */}
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
            )}
            
            {/* ✅ NEW: Active Filter Chips */}
            {(activeFilters.categories.size > 0 || activeFilters.pockets.size > 0 || activeFilters.incomeSources.size > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Category Filter Chips (Expense) */}
                {Array.from(activeFilters.categories).map(catId => (
                  <Badge key={catId} variant="secondary" className="gap-1 pl-2 pr-1">
                    <span>{getCategoryEmoji(catId as any, settings)}</span>
                    <span>{getCategoryLabel(catId as any, settings)}</span>
                    <button
                      onClick={() => {
                        const newFilters = new Set(activeFilters.categories);
                        newFilters.delete(catId);
                        setActiveFilters(prev => ({ ...prev, categories: newFilters }));
                        setSelectedCategoryFilters(newFilters);
                        toast.info(`Filter "${getCategoryLabel(catId as any, settings)}" dihapus`);
                      }}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-sm p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                
                {/* Pocket Filter Chips (Expense) */}
                {Array.from(activeFilters.pockets).map(pocketId => {
                  const pocket = pockets.find(p => p.id === pocketId);
                  if (!pocket) return null;
                  return (
                    <Badge key={pocketId} variant="secondary" className="gap-1 pl-2 pr-1">
                      <span>{pocket.emoji || '💰'}</span>
                      <span>{pocket.name}</span>
                      <button
                        onClick={() => {
                          const newFilters = new Set(activeFilters.pockets);
                          newFilters.delete(pocketId);
                          setActiveFilters(prev => ({ ...prev, pockets: newFilters }));
                          setSelectedPocketFilters(newFilters);
                          toast.info(`Filter "${pocket.name}" dihapus`);
                        }}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-sm p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
                
                {/* Income Source Filter Chips (Income) */}
                {Array.from(activeFilters.incomeSources).map(sourceName => (
                  <Badge key={sourceName} variant="secondary" className="gap-1 pl-2 pr-1">
                    <span>💵</span>
                    <span>{sourceName}</span>
                    <button
                      onClick={() => {
                        const newFilters = new Set(activeFilters.incomeSources);
                        newFilters.delete(sourceName);
                        setActiveFilters(prev => ({ ...prev, incomeSources: newFilters }));
                        setSelectedIncomeSourceFilters(newFilters);
                        toast.info(`Filter "${sourceName}" dihapus`);
                      }}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-sm p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={resetFilters}
                  className="h-6 px-2"
                >
                  ❌ Reset Semua
                </Button>
              </div>
            )}
            
            {/* Conditional rendering based on active tab */}
            {activeTab === 'expense' ? (
              <>
                {/* ✅ NEW: Show "no results" message if search returns empty */}
                {allSortedExpenses.length === 0 && searchQuery.trim() ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Tidak ada pengeluaran yang sesuai dengan pencarian "{searchQuery}"
                  </p>
                ) : (
                  <>
                {/* Only show "Hari Ini & Mendatang" if there are upcoming expenses */}
                {upcomingExpenses.length > 0 && (
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
                      {Array.from(upcomingGrouped.entries())
                        .sort((a, b) => {
                          // ✅ Use sortOrder state to control sorting (not hardcoded!)
                          return sortOrder === 'asc'
                            ? new Date(a[0]).getTime() - new Date(b[0]).getTime()
                            : new Date(b[0]).getTime() - new Date(a[0]).getTime();
                        })
                        .map(([date, expenses]) => 
                          renderGroupedExpenseItem(date, expenses)
                        )}
                  </div>
                  </CollapsibleContent>
                </Collapsible>
                )}
                
                {/* Always show "Riwayat" if there are history expenses */}
                {historyExpenses.length > 0 && (
                  <div className={upcomingExpenses.length > 0 ? "mt-2" : ""}>
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
                  </>
                )}
              </>
            ) : (
              /* Income Tab Content */
              <div className="space-y-2 mt-4">
                {/* ✅ Show empty state if no incomes after filter */}
                {filteredAndSortedIncomes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {incomes.length === 0 
                      ? 'Belum ada pemasukan tambahan untuk bulan ini'
                      : searchQuery.trim() || activeFilters.incomeSources.size > 0
                        ? `Tidak ada pemasukan yang sesuai dengan ${searchQuery.trim() ? 'pencarian' : 'filter'}`
                        : 'Belum ada pemasukan tambahan untuk bulan ini'
                    }
                  </p>
                ) : (
                  <>
                    {/* ✨ NEW: Grouped Income Rendering (same pattern as expenses!) */}
                    {(() => {
                      // Group incomes by date (YYYY-MM-DD only)
                      const groupIncomesByDate = (incomes: AdditionalIncome[]): Map<string, AdditionalIncome[]> => {
                        const grouped = new Map<string, AdditionalIncome[]>();
                        
                        incomes.forEach(income => {
                          // ✅ FIX: Convert to LOCAL date, not UTC date!
                          const localDate = new Date(income.date);
                          const year = localDate.getFullYear();
                          const month = String(localDate.getMonth() + 1).padStart(2, '0');
                          const day = String(localDate.getDate()).padStart(2, '0');
                          const dateOnly = `${year}-${month}-${day}`; // Local date in YYYY-MM-DD
                          const groupKey = dateOnly;
                          
                          if (!grouped.has(groupKey)) {
                            grouped.set(groupKey, []);
                          }
                          grouped.get(groupKey)!.push(income);
                        });
                        
                        return grouped;
                      };
                      
                      // ✅ FIXED: Use filtered and sorted incomes
                      const groupedIncomes = groupIncomesByDate(filteredAndSortedIncomes);
                      
                      // Render grouped income items
                      const renderGroupedIncomeItem = (groupKey: string, incomes: AdditionalIncome[]) => {
                        const actualDate = incomes[0].date;
                        
                        // Calculate daily total (NET after deductions)
                        const groupTotal = incomes.reduce((sum, income) => {
                          const netAmount = income.deduction > 0 
                            ? income.amountIDR - income.deduction 
                            : income.amountIDR;
                          return sum + netAmount;
                        }, 0);
                        
                        return (
                          <div key={`group-${groupKey}`} className="space-y-1">
                            {/* ✨ Date Header with Total (same as expenses!) */}
                            <div className="py-2 px-1 flex items-center justify-between gap-4 border-b border-border mb-2">
                              {/* Left: Date */}
                              <div className="flex items-center gap-2">
                                {isToday(actualDate) && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" title="Hari ini" />
                                )}
                                <span className={`text-base font-bold ${isWeekend(actualDate) ? "text-green-600" : "text-foreground"}`}>
                                  {formatDateShort(actualDate)}
                                </span>
                              </div>
                              
                              {/* Right: Total Harian (subtle, gray) */}
                              <span className="text-sm font-semibold text-muted-foreground opacity-70">
                                +{formatCurrency(groupTotal)}
                              </span>
                            </div>
                            
                            {/* ✨ Simple List Items (clean, no cards) */}
                            <div className="space-y-1">
                              {incomes.map(income => renderIndividualIncomeInGroup(income))}
                            </div>
                          </div>
                        );
                      };
                      
                      // Render individual income within a group
                      // ✅ Phase 4B: Moved to IncomeListItem.tsx component - Old implementation removed
                      
                      // Return the grouped and sorted render
                      const groupedEntries = Array.from(groupedIncomes.entries())
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
                      
                      // ✅ NEW: Show message if no results after filtering
                      if (groupedEntries.length === 0 && searchQuery.trim()) {
                        return (
                          <p className="text-center text-muted-foreground py-8 text-sm">
                            Tidak ada pemasukan yang sesuai dengan pencarian "{searchQuery}"
                          </p>
                        );
                      }
                      
                      return groupedEntries.map(([date, incomes]) => renderGroupedIncomeItem(date, incomes));
                    })()}
                    
                    {/* Income Breakdown Section */}
                    <div className="pt-4 border-t space-y-2 bg-muted/30 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-3">Ringkasan Pemasukan</h4>
                      
                      {/* Total Kotor */}
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Kotor</span>
                        <span className="text-green-600">{formatCurrency(totalGrossIncome)}</span>
                      </div>
                      
                      {/* Indented: Individual deductions */}
                      {totalIndividualDeductions > 0 && (
                        <div className="flex items-center justify-between text-sm pl-4">
                          <span className="text-muted-foreground">Potongan Individual</span>
                          <span className="text-red-600">-{formatCurrency(totalIndividualDeductions)}</span>
                        </div>
                      )}
                      
                      {/* Subtotal */}
                      {totalIndividualDeductions > 0 && (
                        <div className="flex items-center justify-between text-sm border-t pt-2">
                          <span>Subtotal</span>
                          <span className="text-green-600">{formatCurrency(subtotalAfterIndividualDeductions)}</span>
                        </div>
                      )}
                      
                      {/* Indented: Global Deduction with Info Tooltip */}
                      <div className="pl-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm cursor-pointer" onClick={() => setShowGlobalDeductionInput(!showGlobalDeductionInput)}>
                            <span className="text-muted-foreground">
                              Potongan Global
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="size-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[250px]">
                                  <p className="text-xs">
                                    Potongan yang diterapkan sekali ke subtotal setelah semua
                                    pemasukan digabung, bukan diterapkan per item.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-6"
                              onClick={() => setShowGlobalDeductionInput(!showGlobalDeductionInput)}
                              title={showGlobalDeductionInput ? "Sembunyikan input" : "Tampilkan input"}
                            >
                              {showGlobalDeductionInput ? <ChevronUp className="size-3 text-muted-foreground" /> : <ChevronDown className="size-3 text-muted-foreground" />}
                            </Button>
                            <span className={`text-sm text-red-600`}>
                              {globalDeduction > 0 ? '-' : ''}{formatCurrency(globalDeduction)}
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
                            className="text-sm"
                          />
                        )}
                      </div>
                      
                      {/* Highlighted: Total Bersih */}
                      <div className="flex items-center justify-between border-t-2 border-border pt-3 mt-2">
                        <span className="font-semibold">Total Bersih</span>
                        <span className="text-lg font-bold text-green-600">{formatCurrency(totalNetIncome)}</span>
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
        <Drawer 
          open={editingExpenseId !== null} 
          onOpenChange={(open) => {
            if (!open && !isUpdatingExpense) {
              handleCloseEditDialog();
            }
          }} 
          dismissible={!isUpdatingExpense}
        >
          {editingExpenseId !== null && (
            <DrawerContent className="h-[90vh] flex flex-col">
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

            {/* Only show global category if no items */}
            {(!editingExpense.items || editingExpense.items.length === 0) && (
              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategori (Opsional)</Label>
                
                {/* ✨ Smart Category Suggestions */}
                {topCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs text-muted-foreground self-center">Sering dipakai:</span>
                    {topCategories.map(({ categoryId, count }) => {
                      const category = allCategories.find(c => c.id === categoryId);
                      if (!category) return null;
                      
                      const isSelected = editingExpense.category === categoryId;
                      
                      return (
                        <button
                          key={categoryId}
                          type="button"
                          onClick={() => setEditingExpense({ ...editingExpense, category: categoryId })}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/70'
                          }`}
                        >
                          <span>{category.emoji}</span>
                          <span>{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                
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
            )}
            
            {editingExpense.items && editingExpense.items.length > 0 && (
              <div className="space-y-2">
                <Label>Item Pengeluaran</Label>
                <div className="space-y-3">
                  {editingExpense.items.map((item, index) => (
                    <div key={index} className="space-y-2 p-3 border border-border rounded-md bg-muted/30">
                      <Input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        placeholder="Nama Item"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={itemAmountInputs[index] ?? item.amount.toString()}
                          onChange={(e) => handleUpdateItem(index, 'amount', e.target.value)}
                          onBlur={() => handleBlurItemAmount(index)}
                          placeholder="Jumlah"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="flex-shrink-0"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <select
                        value={item.category || ''}
                        onChange={(e) => handleUpdateItem(index, 'category', e.target.value || undefined)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Pilih Kategori (Opsional)</option>
                        {allCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.label}{cat.isCustom ? ' (Custom)' : ''}
                          </option>
                        ))}
                      </select>
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
                disabled={isUpdatingExpense}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveEditExpense}
                disabled={isUpdatingExpense}
              >
                {isUpdatingExpense ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </DrawerContent>
          )}
        </Drawer>
      ) : (
        <Dialog 
          open={editingExpenseId !== null} 
          onOpenChange={(open) => {
            if (!open && !isUpdatingExpense) {
              handleCloseEditDialog();
            }
          }}
        >
          {editingExpenseId !== null && (
            <DialogContent 
              className="max-w-3xl max-h-[90vh] overflow-y-auto" 
              aria-describedby={undefined}
              onPointerDownOutside={(e) => {
                if (isUpdatingExpense) e.preventDefault();
              }}
              onEscapeKeyDown={(e) => {
                if (isUpdatingExpense) e.preventDefault();
              }}
            >
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

              {/* Only show global category if no items */}
              {(!editingExpense.items || editingExpense.items.length === 0) && (
                <div className="space-y-2">
                  <Label htmlFor="edit-category-desktop">Kategori (Opsional)</Label>
                  
                  {/* ✨ Smart Category Suggestions */}
                  {topCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs text-muted-foreground self-center">Sering dipakai:</span>
                      {topCategories.map(({ categoryId, count }) => {
                        const category = allCategories.find(c => c.id === categoryId);
                        if (!category) return null;
                        
                        const isSelected = editingExpense.category === categoryId;
                        
                        return (
                          <button
                            key={categoryId}
                            type="button"
                            onClick={() => setEditingExpense({ ...editingExpense, category: categoryId })}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/70'
                            }`}
                          >
                            <span>{category.emoji}</span>
                            <span>{category.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
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
              )}
              
              {editingExpense.items && editingExpense.items.length > 0 && (
                <div className="space-y-2">
                  <Label>Item Pengeluaran</Label>
                  <div className="space-y-3">
                    {editingExpense.items.map((item, index) => (
                      <div key={index} className="space-y-2 p-3 border border-border rounded-md bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                            placeholder="Nama Item"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="flex-shrink-0"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                        <Input
                          type="text"
                          value={itemAmountInputs[index] ?? item.amount.toString()}
                          onChange={(e) => handleUpdateItem(index, 'amount', e.target.value)}
                          onBlur={() => handleBlurItemAmount(index)}
                          placeholder="Jumlah"
                        />
                        <select
                          value={item.category || ''}
                          onChange={(e) => handleUpdateItem(index, 'category', e.target.value || undefined)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">Pilih Kategori (Opsional)</option>
                          {allCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.emoji} {cat.label}{cat.isCustom ? ' (Custom)' : ''}
                            </option>
                          ))}
                        </select>
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
                disabled={isUpdatingExpense}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveEditExpense}
                disabled={isUpdatingExpense}
              >
                {isUpdatingExpense ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </DialogContent>
          )}
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
        <Suspense fallback={<div className="hidden" />}>
          <BulkEditCategoryDialog
            open={showBulkEditCategoryDialog}
            onOpenChange={setShowBulkEditCategoryDialog}
            selectedExpenseIds={Array.from(selectedExpenseIds)}
            expenses={expenses}
            onUpdate={handleConfirmBulkEditCategory}
          />
        </Suspense>
      )}
      
      {/* Category Breakdown - Now handles its own Dialog/Drawer with Insight Boxes */}
      <CategoryBreakdown
        open={showCategoryDrawer}
        onOpenChange={(open) => {
          setShowCategoryDrawer(open);
          // ✅ FIX: Also notify parent when drawer is closed to reset external state
          if (!open) {
            onCategoryBreakdownClose?.();
          }
        }}
        monthKey={monthKey}
        expenses={expenses.filter(e => !e.fromIncome)}
        onCategoryClick={handleCategoryClick}
        activeFilter={activeCategoryFilter}
      />
      
      {/* Edit Income Dialog/Drawer - Using AdditionalIncomeForm */}
      {isMobile ? (
        <Drawer 
          open={!!editingIncomeId && !!editingIncome} 
          onOpenChange={(open) => {
            if (!open && !isUpdatingIncome) {
              setEditingIncomeId(null);
            }
          }}
          dismissible={!isUpdatingIncome}
        >
          {editingIncomeId && editingIncome && onUpdateIncome && (
            <DrawerContent className="h-[90vh] flex flex-col">
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
                  onUpdateIncome={async (incomeData) => {
                    setIsUpdatingIncome(true);
                    try {
                      await onUpdateIncome(editingIncomeId, incomeData);
                      setEditingIncomeId(null);
                    } catch (error) {
                      console.error('Error updating income:', error);
                    } finally {
                      setIsUpdatingIncome(false);
                    }
                  }}
                  isAdding={isUpdatingIncome}
                  inDialog={true}
                  pockets={pockets}
                  balances={balancesMap}
                  hideTargetPocket={false}
                  submitButtonText="Simpan"
                />
              </div>
              <div className="flex gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingIncomeId(null)}
                  disabled={isUpdatingIncome}
                >
                  Batal
                </Button>
              </div>
            </DrawerContent>
          )}
        </Drawer>
      ) : (
        <Dialog open={!!editingIncomeId && !!editingIncome} onOpenChange={(open) => {
          if (!open && !isUpdatingIncome) {
            setEditingIncomeId(null);
          }
        }}>
          {editingIncomeId && editingIncome && onUpdateIncome && (
            <DialogContent 
              className="max-w-xl max-h-[90vh] overflow-y-auto" 
              aria-describedby={undefined}
              onPointerDownOutside={(e) => {
                if (isUpdatingIncome) e.preventDefault();
              }}
              onEscapeKeyDown={(e) => {
                if (isUpdatingIncome) e.preventDefault();
              }}
            >
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
                onUpdateIncome={async (incomeData) => {
                  setIsUpdatingIncome(true);
                  try {
                    await onUpdateIncome(editingIncomeId, incomeData);
                    setEditingIncomeId(null);
                  } catch (error) {
                    console.error('Error updating income:', error);
                  } finally {
                    setIsUpdatingIncome(false);
                  }
                }}
                isAdding={isUpdatingIncome}
                inDialog={true}
                pockets={pockets}
                hideTargetPocket={false}
                submitButtonText="Simpan"
              />
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingIncomeId(null)}
                  disabled={isUpdatingIncome}
                >
                  Batal
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
      )}
      
      {/* Phase 2: Simulation Sandbox */}
      <Suspense fallback={<div className="hidden" />}>
        <SimulationSandbox
          isOpen={showSandbox}
          onClose={() => setShowSandbox(false)}
          expenses={expenses}
          incomes={incomes}
          initialTab={sandboxContext}
          globalDeduction={globalDeduction}
          initialBudget={initialBudget}
          carryOverAssets={carryOverAssets}
          carryOverLiabilities={carryOverLiabilities}
        />
      </Suspense>
      
      {/* ✅ NEW: Advanced Filter Drawer */}
      <Suspense fallback={<div className="hidden" />}>
        <AdvancedFilterDrawer
          open={isFilterDrawerOpen}
          onOpenChange={setIsFilterDrawerOpen}
          activeTab={activeTab}
          selectedCategories={selectedCategoryFilters}
          onCategoryToggle={toggleCategoryFilter}
          selectedPockets={selectedPocketFilters}
          onPocketToggle={togglePocketFilter}
          selectedIncomeSources={selectedIncomeSourceFilters}
          onIncomeSourceToggle={toggleIncomeSourceFilter}
          onApply={applyFilters}
          onReset={resetFilters}
          allCategories={allCategories}
          allPockets={pockets.map(p => {
            const balance = Array.isArray(balances) 
              ? (balances.find(b => b.pocketId === p.id)?.availableBalance || 0)
              : 0;
            return {
              id: p.id,
              name: p.name,
              emoji: p.emoji || '💰',
              balance: balance,
              isActive: true
            };
          })}
          allIncomeSources={allIncomeSources}
          settings={settings}
        />
      </Suspense>

      {/* 📱 Mobile Bottom Sheet for Item Actions */}
      {actionSheetItem && (
        <Suspense fallback={<div className="hidden" />}>
          <ItemActionSheet
            open={actionSheetOpen}
            onOpenChange={setActionSheetOpen}
            itemName={actionSheetItem.name}
            itemType={actionSheetItem.type}
            onEdit={handleSheetEdit}
            onDelete={handleSheetDelete}
            showMoveToIncome={actionSheetItem.type === 'expense' && actionSheetItem.fromIncome === true}
            onMoveToIncome={handleSheetMoveToIncome}
          />
        </Suspense>
      )}
    </Card>
  );
}

// Export memoized component for performance
export const ExpenseList = memo(ExpenseListComponent);