import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trash2, ChevronDown, ChevronUp, ArrowUpDown, Pencil, Plus, X, Search, ArrowRight, ArrowLeft, DollarSign, Minus, BarChart3, Settings, MoreVertical, ListChecks, Info, Filter, FileText } from "lucide-react";
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
import { EXPENSE_CATEGORIES, LEGACY_CATEGORY_ID_MAP } from "../constants";
import { BulkEditCategoryDialog } from "./BulkEditCategoryDialog";
import { CategoryFilterBadge } from "./CategoryFilterBadge";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { getAllCategories } from "../utils/categoryManager";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { formatCurrency } from "../utils/currency";
import { AdditionalIncomeForm } from "./AdditionalIncomeForm";
import { formatDateSafe, getLocalDateFromISO } from "../utils/date-helpers";
import { ConsolidatedToolbar } from "./ConsolidatedToolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { usePreventPullToRefresh } from "../hooks/usePreventPullToRefresh";
import { DialogPriority } from "../constants";
import SimulationSandbox from "./SimulationSandbox";
import { AdvancedFilterDrawer } from "./AdvancedFilterDrawer";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { ExpenseItemWrapper } from "./ExpenseItemWrapper";
import { ItemActionSheet } from "./ItemActionSheet";

/**
 * 🔧 BACKWARD COMPATIBILITY HELPER
 * Normalizes legacy category IDs (0, 1, 2, etc.) to new string keys (food, transport, etc.)
 * 
 * @param categoryId - The category ID (can be old numeric or new string)
 * @returns Normalized category key
 * 
 * @example
 * normalizeCategoryId('1') → 'transport'
 * normalizeCategoryId('transport') → 'transport'
 * normalizeCategoryId('custom_abc123') → 'custom_abc123'
 */
function normalizeCategoryId(categoryId: string | undefined): string {
  if (!categoryId) return 'other';
  
  // Check if it's a legacy numeric ID
  if (categoryId in LEGACY_CATEGORY_ID_MAP) {
    return LEGACY_CATEGORY_ID_MAP[categoryId];
  }
  
  // Already normalized or custom category
  return categoryId;
}

interface ExpenseItem {
  name: string;
  amount: number;
  category?: string; // Per-item category support
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

interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onBulkDeleteExpenses: (ids: string[]) => Promise<void>;
  onBulkUpdateCategory?: (ids: string[], category: string) => Promise<void>;
  onMoveToIncome?: (expense: Expense) => void;
  pockets?: Array<{id: string; name: string}>;
  balances?: PocketBalance[];
  categoryFilter?: Set<import('../types').ExpenseCategory>; // Phase 7
  onClearFilter?: () => void; // Phase 7
  onCategoryClick?: (category: import('../types').ExpenseCategory) => void; // 📜 Scroll to filtered results
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
  onOpenCategoryManager?: () => void; // Phase 8: Open CategoryManager
  onOpenAddTransaction?: () => void; // Desktop transaction entry
  onOpenTemplateManager?: () => void; // Desktop template manager
  // Budget-related props (for SimulationSandbox)
  initialBudget?: number;
  // 🏗️ ARCHITECTURE FIX: NEW - Carry-over breakdown props
  carryOverAssets?: number;
  carryOverLiabilities?: number;
  // Month/Year for CategoryBreakdown MoM calculation
  selectedMonth?: number;
  selectedYear?: number;
  // ✨ NEW: External control for opening Category Breakdown modal
  externalOpenCategoryBreakdown?: boolean;
  onCategoryBreakdownClose?: () => void;
}

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
  onCategoryBreakdownClose
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
    category: undefined,
    emoji: undefined
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [matchedCategories, setMatchedCategories] = useState<Set<string>>(new Set());
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
  
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [showGlobalDeductionInput, setShowGlobalDeductionInput] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<Set<import('../types').ExpenseCategory>>(new Set());
  
  // Phase 2: Smart Simulation Sandbox state
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxContext, setSandboxContext] = useState<'all' | 'expense' | 'income'>('all');
  
  // Advanced Filter state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<Set<string>>(new Set());
  const [selectedPocketFilters, setSelectedPocketFilters] = useState<Set<string>>(new Set());
  const [selectedIncomeSourceFilters, setSelectedIncomeSourceFilters] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<{
    categories: Set<string>;
    pockets: Set<string>;
    incomeSources: Set<string>;
  }>({
    categories: new Set(),
    pockets: new Set(),
    incomeSources: new Set(),
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
  
  // Income editing states
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  
  // 📱 Mobile Bottom Sheet Action states
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [actionSheetItem, setActionSheetItem] = useState<{
    id: string;
    name: string;
    type: 'expense' | 'income';
    fromIncome?: boolean;
  } | null>(null);
  
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
  const [editingIncome, setEditingIncome] = useState<Partial<AdditionalIncome>>({});
  
  // Register edit expense drawer for back button handling
  useDialogRegistration(
    editingExpenseId !== null,
    (open) => {
      if (!open) {
        handleCloseEditDialog();
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
  
  // 📱 Prevent pull-to-refresh on mobile when drawers are open
  usePreventPullToRefresh(editingExpenseId !== null || !!editingIncomeId || actionSheetOpen || showCategoryDrawer || isFilterDrawerOpen);
  
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
    // Show suggestions when there's text (both mobile and desktop)
    setShowSuggestions(value.trim().length > 0);
    setSelectedSuggestionIndex(-1);
    
    // ✅ KATEGORI DETECTION: Check if query matches any category
    if (value.trim() && activeTab === 'expense') {
      const lowerQuery = value.toLowerCase();
      const matched = new Set<string>();
      
      allCategories.forEach(cat => {
        const categoryLabel = getCategoryLabel(cat.id as any, settings);
        if (categoryLabel.toLowerCase().includes(lowerQuery)) {
          matched.add(cat.id);
        }
      });
      
      setMatchedCategories(matched);
    } else {
      setMatchedCategories(new Set());
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setMatchedCategories(new Set());
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Ctrl/Cmd+A to select all text
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      if (searchInputRef.current) {
        searchInputRef.current.select();
      }
      return;
    }
    
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
    console.log('toggleSortOrder called, current sortOrder:', sortOrder);
    setSortOrder(prev => {
      const newOrder = prev === 'asc' ? 'desc' : 'asc';
      console.log('New sortOrder will be:', newOrder);
      toast.info(newOrder === 'asc' ? 'Diurutkan: Terlama ke Terbaru' : 'Diurutkan: Terbaru ke Terlama');
      return newOrder;
    });
  };

  // Handle category click from pie chart
  const handleCategoryClick = (category: import('../types').ExpenseCategory) => {
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

  // Toggle handler for ConsolidatedToolbar
  const handleToggleBulkMode = useCallback(() => {
    if (isBulkSelectMode) {
      handleCancelBulkMode();
    } else {
      handleActivateBulkMode();
    }
  }, [isBulkSelectMode, handleCancelBulkMode, handleActivateBulkMode]);

  // Phase 2: Handler to open sandbox with smart context
  const handleOpenSandbox = () => {
    // Map activeTab to sandbox context ('expense' or 'income' → same, otherwise 'all')
    const context = activeTab === 'expense' || activeTab === 'income' ? activeTab : 'all';
    setSandboxContext(context);
    setShowSandbox(true);
  };

  // Advanced Filter handlers
  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategoryFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const togglePocketFilter = (pocketId: string) => {
    setSelectedPocketFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pocketId)) {
        newSet.delete(pocketId);
      } else {
        newSet.add(pocketId);
      }
      return newSet;
    });
  };

  const toggleIncomeSourceFilter = (sourceName: string) => {
    setSelectedIncomeSourceFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceName)) {
        newSet.delete(sourceName);
      } else {
        newSet.add(sourceName);
      }
      return newSet;
    });
  };

  const applyFilters = () => {
    // Copy temporary selections to active filters
    setActiveFilters({
      categories: new Set(selectedCategoryFilters),
      pockets: new Set(selectedPocketFilters),
      incomeSources: new Set(selectedIncomeSourceFilters),
    });
    
    // Clear the pie chart category filter if advanced filter is active
    if (selectedCategoryFilters.size > 0) {
      setActiveCategoryFilter(new Set());
    }
    
    // Close drawer
    setIsFilterDrawerOpen(false);
    
    // Show success toast
    const filterCount = selectedCategoryFilters.size + selectedPocketFilters.size + selectedIncomeSourceFilters.size;
    if (filterCount > 0) {
      toast.success(`✅ ${filterCount} filter diterapkan`);
    }
  };

  const resetFilters = () => {
    // Clear all selections
    setSelectedCategoryFilters(new Set());
    setSelectedPocketFilters(new Set());
    setSelectedIncomeSourceFilters(new Set());
    setActiveFilters({
      categories: new Set(),
      pockets: new Set(),
      incomeSources: new Set(),
    });
    
    // Clear existing category filter badge
    setActiveCategoryFilter(new Set());
    
    // Close drawer
    setIsFilterDrawerOpen(false);
    
    // Show toast
    toast.info('🔄 Filter direset');
  };

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
    // ✅ FIX: Use allSortedExpenses (combined array) instead of sortedAndFilteredExpenses object
    const visibleExpenses = activeTab === 'expense' ? allSortedExpenses : [];
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

  // Unified handler for "Pilih semua" checkbox in toolbar
  const handleToggleSelectAll = () => {
    if (activeTab === 'expense') {
      handleSelectAllExpenses();
    } else {
      handleSelectAllIncomes();
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

  // ✅ IMPROVED: Fuzzy search for expenses - includes category matching and ALL history
  const fuzzyMatchExpense = (expense: Expense, query: string): boolean => {
    if (!query || !query.trim()) return true;
    
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
    
    // ✅ NEW: Check category name
    if (expense.category) {
      const categoryLabel = getCategoryLabel(expense.category as any, settings);
      if (categoryLabel.toLowerCase().includes(lowerQuery)) {
        return true;
      }
    }
    
    // ✅ NEW: Check pocket name
    const pocketName = getPocketName(expense.pocketId);
    if (pocketName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  };
  
  // ✅ NEW: Fuzzy search for incomes - includes ALL history
  const fuzzyMatchIncome = (income: AdditionalIncome, query: string): boolean => {
    if (!query || !query.trim()) return true;
    
    const lowerQuery = query.toLowerCase();
    
    // Check income name
    if (income.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check day name
    const dayName = getDayName(income.date);
    if (dayName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check date number
    const dateNumber = getDateNumber(income.date);
    if (dateNumber.includes(lowerQuery)) {
      return true;
    }
    
    // Check pocket name
    const pocketName = getPocketName(income.pocketId);
    if (pocketName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  };

  // Phase 7: Filter by category first, then by tab (expense/income), then by date
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
    
    // ✅ NEW: Advanced Category Filter (multi-select) - takes priority
    if (activeFilters.categories.size > 0) {
      filtered = filtered.filter(expense => {
        // ✅ Support filtering by item-level categories (template expenses)
        if (expense.items && expense.items.length > 0) {
          // Check if ANY item matches the filter
          return expense.items.some(item => {
            const rawCategory = ((item as any).category || 'other') as string;
            const normalizedCategory = normalizeCategoryId(rawCategory); // 🔧 Normalize!
            return activeFilters.categories.has(normalizedCategory);
          });
        } else {
          // Check expense-level category (regular expenses)
          const rawCategory = (expense.category || 'other') as string;
          const normalizedCategory = normalizeCategoryId(rawCategory); // 🔧 Normalize!
          return activeFilters.categories.has(normalizedCategory);
        }
      });
    }
    // Legacy: Then filter by category if needed (combine categoryFilter from props and activeCategoryFilter from breakdown)
    // Only apply if advanced filter is NOT active
    else {
      const combinedFilter = new Set([...Array.from(categoryFilter), ...Array.from(activeCategoryFilter)]);
      if (combinedFilter.size > 0) {
        filtered = filtered.filter(expense => {
          // ✅ NEW: Support filtering by item-level categories (template expenses)
          if (expense.items && expense.items.length > 0) {
            // Check if ANY item matches the filter
            return expense.items.some(item => {
              const rawCategory = ((item as any).category || 'other');
              const normalizedCategory = normalizeCategoryId(rawCategory) as import('../types').ExpenseCategory; // 🔧 Normalize!
              return combinedFilter.has(normalizedCategory);
            });
          } else {
            // Check expense-level category (regular expenses)
            const rawCategory = (expense.category || 'other');
            const normalizedCategory = normalizeCategoryId(rawCategory) as import('../types').ExpenseCategory; // 🔧 Normalize!
            return combinedFilter.has(normalizedCategory);
          }
        });
      }
    }
    
    // ��� NEW: Advanced Pocket Filter (multi-select, expense only)
    if (activeFilters.pockets.size > 0 && activeTab === 'expense') {
      filtered = filtered.filter(expense => {
        return expense.pocketId && activeFilters.pockets.has(expense.pocketId);
      });
    }
    
    return filtered;
  }, [expenses, categoryFilter, activeCategoryFilter, activeTab, activeFilters]);

  // ✅ IMPROVED: Sort and filter expenses - no date restriction, with category filter
  // ⚠️ CRITICAL: sortOrder ONLY applies to "Hari Ini & Mendatang" section
  // History section is ALWAYS sorted desc (newest first)
  const sortedAndFilteredExpenses = useMemo(() => {
    if (activeTab !== 'expense') return [];
    
    let filtered = [...categoryFilteredExpenses];
    
    // ✅ NEW: If category detected AND user is searching, show all from that category OR match search
    if (matchedCategories.size > 0 && searchQuery.trim()) {
      filtered = filtered.filter(expense => {
        // ✅ Support item-level categories (template expenses)
        let categoryMatches = false;
        
        if (expense.items && expense.items.length > 0) {
          // Check if ANY item's category matches
          categoryMatches = expense.items.some(item => {
            const rawCategory = ((item as any).category || 'other');
            const normalizedCategory = normalizeCategoryId(rawCategory) as import('../types').ExpenseCategory; // 🔧 Normalize!
            return matchedCategories.has(normalizedCategory);
          });
        } else {
          // Check expense-level category
          const rawCategory = (expense.category || 'other');
          const normalizedCategory = normalizeCategoryId(rawCategory) as import('../types').ExpenseCategory; // 🔧 Normalize!
          categoryMatches = matchedCategories.has(normalizedCategory);
        }
        
        // Show if category matches OR if search text matches
        return categoryMatches || fuzzyMatchExpense(expense, searchQuery);
      });
    } else {
      // Regular search filter
      filtered = filtered.filter((expense) => fuzzyMatchExpense(expense, searchQuery));
    }
    
    // ✅ NEW LOGIC: Split first, then sort separately
    // Split into upcoming (today & future) and history (past)
    const upcoming = filtered.filter(exp => !isPast(exp.date));
    const history = filtered.filter(exp => isPast(exp.date));
    
    // Sort upcoming based on user preference (sortOrder)
    const sortedUpcoming = upcoming.sort((a, b) => {
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
    });
    
    // Sort history ALWAYS desc (newest first) - fixed, not affected by sortOrder
    const sortedHistory = history.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      
      if (dateCompare === 0) {
        const aHasItems = a.items && a.items.length > 0;
        const bHasItems = b.items && b.items.length > 0;
        
        if (aHasItems && !bHasItems) return -1;
        if (!aHasItems && bHasItems) return 1;
        return 0;
      }
      
      return dateCompare;
    });
    
    // Combine: upcoming first, then history
    const combined = [...sortedUpcoming, ...sortedHistory];
    
    // ⚠️ Return object dengan upcoming & history terpisah untuk menghindari re-filter
    return { sortedUpcoming, sortedHistory, combined };
  }, [categoryFilteredExpenses, sortOrder, searchQuery, matchedCategories, activeTab]);

  // ✅ Extract from useMemo result
  const upcomingExpenses = sortedAndFilteredExpenses.sortedUpcoming || [];
  const historyExpenses = sortedAndFilteredExpenses.sortedHistory || [];
  const allSortedExpenses = sortedAndFilteredExpenses.combined || [];

  // ✅ NEW: Filter and sort incomes (with income source filter)
  const filteredAndSortedIncomes = useMemo(() => {
    let filtered = [...incomes];
    
    // Apply income source filter
    if (activeFilters.incomeSources.size > 0) {
      filtered = filtered.filter(income => activeFilters.incomeSources.has(income.name));
    }
    
    // Apply search filter
    filtered = filtered.filter(income => fuzzyMatchIncome(income, searchQuery));
    
    // Sort by date (newest first by default)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, activeFilters.incomeSources, searchQuery]);

  // Check if all filtered expenses are selected
  const isAllSelected = useMemo(() => {
    return allSortedExpenses.length > 0 && 
           selectedExpenseIds.size === allSortedExpenses.length &&
           allSortedExpenses.every(exp => selectedExpenseIds.has(exp.id));
  }, [selectedExpenseIds, allSortedExpenses]);

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
      const allIds = new Set(allSortedExpenses.map(exp => exp.id));
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

  const handleEditExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setEditingExpenseId(id);
      // ✅ FIX: Extract LOCAL date (not UTC) for timezone consistency
      const dateOnly = expense.date ? getLocalDateFromISO(expense.date) : expense.date;
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
        groupId: expense.groupId,  // Preserve groupId
        category: expense.category,  // 🔧 CRITICAL FIX: Include category!
        emoji: (expense as any).emoji  // 🔧 FIX: Preserve template emoji
      });
      // Initialize input strings for items
      const initialInputs: { [index: number]: string } = {};
      expense.items?.forEach((item, index) => {
        initialInputs[index] = item.amount.toString();
      });
      setItemAmountInputs(initialInputs);
    }
  };

  // 📱 Mobile Bottom Sheet Handlers
  const handleLongPressItem = useCallback((id: string, type: 'expense' | 'income') => {
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

  const handleSheetEdit = useCallback(() => {
    if (!actionSheetItem) return;
    
    if (actionSheetItem.type === 'expense') {
      handleEditExpense(actionSheetItem.id);
    } else {
      // Income edit
      const income = incomes.find(i => i.id === actionSheetItem.id);
      if (income) {
        setEditingIncomeId(income.id);
        setEditingIncome(income);
      }
    }
  }, [actionSheetItem, incomes]);

  const handleSheetDelete = useCallback(() => {
    if (!actionSheetItem) return;
    
    if (actionSheetItem.type === 'expense') {
      const expense = expenses.find(e => e.id === actionSheetItem.id);
      if (expense) {
        setExpenseToDelete({ 
          id: expense.id, 
          name: expense.name, 
          amount: expense.amount 
        });
        setDeleteConfirmOpen(true);
      }
    } else {
      // Income delete
      onDeleteIncome?.(actionSheetItem.id);
    }
  }, [actionSheetItem, expenses, onDeleteIncome]);

  const handleSheetMoveToIncome = useCallback(() => {
    if (!actionSheetItem || actionSheetItem.type !== 'expense') return;
    
    const expense = expenses.find(e => e.id === actionSheetItem.id);
    if (expense && expense.fromIncome) {
      onMoveToIncome?.(expense);
    }
  }, [actionSheetItem, expenses, onMoveToIncome]);

  const handleSaveEditExpense = () => {
    if (editingExpenseId) {
      // Recalculate amount if items exist
      let finalAmount = editingExpense.amount;
      if (editingExpense.items && editingExpense.items.length > 0) {
        finalAmount = editingExpense.items.reduce((sum, item) => sum + item.amount, 0);
      }
      
      // ✅ FIX: Keep date in YYYY-MM-DD format (use local date, not UTC)
      const finalDate = editingExpense.date?.includes('T')
        ? getLocalDateFromISO(editingExpense.date)
        : editingExpense.date;
      
      console.log('[ExpenseList] Saving edit - Category:', editingExpense.category);
      
      // 🔧 FIX: Include category and emoji in update
      onEditExpense(editingExpenseId, { 
        ...editingExpense, 
        amount: finalAmount,
        date: finalDate,
        category: editingExpense.category, // ← CRITICAL: Include category
        emoji: editingExpense.emoji // ← CRITICAL: Preserve template emoji
      });
      
      // 🔧 FIX: Close dialog immediately to prevent UI freeze
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
        groupId: undefined,
        category: undefined, // ← Add category to reset state
        emoji: undefined // ← Add emoji to reset state
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
      groupId: undefined,
      category: undefined,
      emoji: undefined
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

  // ✅ NEW: Filter incomes with search (CONTEXTUAL for income tab)
  const filteredIncomes = useMemo(() => {
    if (activeTab !== 'income') return incomes;
    
    return incomes.filter((income) => fuzzyMatchIncome(income, searchQuery));
  }, [incomes, searchQuery, activeTab]);

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

  // Render individual expense within a group
  const renderIndividualExpenseInGroup = (expense: Expense) => {
    if (expense.items && expense.items.length > 0) {
      // Template expense with items
      const isItemExpanded = expandedItems.has(expense.id);
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
        <Collapsible key={expense.id} open={isItemExpanded} onOpenChange={() => toggleExpanded(expense.id)}>
          <div className={`${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30 rounded-lg' : ''}`}>
            <CollapsibleTrigger asChild>
              <div className="cursor-pointer rounded-lg hover:bg-accent/30 transition-colors">
                {/* Mobile: Compact layout with badge below + long-press */}
                <div className="md:hidden p-2 pl-6" {...longPressHandlers}>
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
                        <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : ''}`}>
                          {/* ✨ Template Emoji (priority: template > expense) */}
                          {(() => {
                            const templateEmoji = getDisplayEmoji(expense);
                            if (templateEmoji) {
                              return <span className="mr-1.5" title="From template">{templateEmoji}</span>;
                            }
                            return null;
                          })()}
                          {/* Category display: Check both expense.category and expense.items[].category */}
                          {/* ⚠️ SKIP category emoji if expense has template emoji to avoid double emoji */}
                          {(() => {
                            const templateEmoji = getDisplayEmoji(expense);
                            if (templateEmoji) return null; // Skip if has template emoji
                            
                            // Single expense with category
                            if (expense.category) {
                              return <span className="mr-1.5" title={`cat="${expense.category}"`}>{getCategoryEmoji(expense.category, settings)}</span>;
                            }
                            // Template expense: check if items have categories
                            if (expense.items && expense.items.length > 0) {
                              const itemsWithCategories = expense.items.filter((item: any) => item.category);
                              if (itemsWithCategories.length > 0) {
                                // Show first item's category emoji (template uses first item's category as representative)
                                const firstCategory = itemsWithCategories[0].category;
                                return <span className="mr-1.5" title={`multi-cat (${itemsWithCategories.length} items)`}>{getCategoryEmoji(firstCategory, settings)}</span>;
                              }
                            }
                            // No category found
                            return <span className="mr-1.5 text-yellow-500" title="No category">⚠️</span>;
                          })()}
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

                    {/* Right: Amount and action buttons (forced right-aligned) */}
                    <div className="flex items-center shrink-0 ml-auto">
                      <p className={`text-sm text-right ${expense.fromIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                      </p>

                    </div>
                  </div>
                </div>

                {/* Desktop: Keep original single-line layout with hover behavior */}
                <div className="hidden md:flex items-center justify-between p-2 pl-6 group">
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {isBulkSelectMode && (
                      <Checkbox
                        checked={selectedExpenseIds.has(expense.id)}
                        onCheckedChange={() => handleToggleExpense(expense.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {/* ✨ Template Emoji (priority: template > expense) */}
                      {(() => {
                        const templateEmoji = getDisplayEmoji(expense);
                        if (templateEmoji) {
                          return <span className="mr-1.5" title="From template">{templateEmoji}</span>;
                        }
                        return null;
                      })()}
                      {/* Category display: Check both expense.category and expense.items[].category */}
                      {/* ⚠️ SKIP category emoji if expense has template emoji to avoid double emoji */}
                      {(() => {
                        const templateEmoji = getDisplayEmoji(expense);
                        if (templateEmoji) return null; // Skip if has template emoji
                        
                        // Single expense with category
                        if (expense.category) {
                          return <span className="mr-1.5" title={`cat="${expense.category}"`}>{getCategoryEmoji(expense.category, settings)}</span>;
                        }
                        // Template expense: check if items have categories
                        if (expense.items && expense.items.length > 0) {
                          const itemsWithCategories = expense.items.filter((item: any) => item.category);
                          if (itemsWithCategories.length > 0) {
                            // Show first item's category emoji (template uses first item's category as representative)
                            const firstCategory = itemsWithCategories[0].category;
                            return <span className="mr-1.5" title={`multi-cat (${itemsWithCategories.length} items)`}>{getCategoryEmoji(firstCategory, settings)}</span>;
                          }
                        }
                        // No category found
                        return <span className="mr-1.5 text-yellow-500" title="No category">⚠️</span>;
                      })()}
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
                  <div className="flex items-center shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                    <p className={`text-sm text-right transition-all ${expense.fromIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                    </p>
                    {!isBulkSelectMode && (
                      /* 🔧 Desktop: Uncontrolled dropdown (separate from mobile state) */
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-0 group-hover:w-6 opacity-0 group-hover:opacity-100 transition-all overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {expense.fromIncome && onMoveToIncome && (
                              <DropdownMenuItem onClick={() => onMoveToIncome(expense)}>
                                <ArrowRight className="size-3.5 mr-2 text-green-600" />
                                Kembalikan ke Pemasukan
                              </DropdownMenuItem>
                            )}
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
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-2 border-t pt-3 mt-2 md:px-2 md:pb-2 md:space-y-1 md:pt-1 md:mt-1">
                {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-green-600 pl-8 md:pl-6 mb-1">
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
                  <div className="text-xs text-muted-foreground pl-8 md:pl-6 mb-1">
                    <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                  </div>
                )}
                {expense.items.map((item, index) => {
                  const itemCategory = (item as any).category; // Get category from item
                  const categoryEmoji = itemCategory ? getCategoryEmoji(itemCategory, settings) : '';
                  
                  return (
                    <div key={index} className="flex justify-between items-center text-sm md:text-xs pl-8 md:pl-6 py-1.5 md:py-0 rounded-lg md:rounded-none hover:bg-accent/30 md:hover:bg-transparent transition-colors">
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
      // Single expense without items
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
              className={`rounded-lg hover:bg-accent/30 transition-colors ${isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/30' : ''}`}
            >
              {/* Mobile: Compact layout with badge below + long-press */}
              <div 
                className="md:hidden p-2 pl-6"
                {...longPressHandlers}
          >
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
                    <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : ''}`}>
                      {/* ✨ Template Emoji (priority: template > expense) */}
                      {(() => {
                        const templateEmoji = getDisplayEmoji(expense);
                        if (templateEmoji) {
                          return <span className="mr-1.5" title="From template">{templateEmoji}</span>;
                        }
                        return null;
                      })()}
                      {/* Category display: Check both expense.category and expense.items[].category */}
                      {/* ⚠️ SKIP category emoji if expense has template emoji to avoid double emoji */}
                      {(() => {
                        const templateEmoji = getDisplayEmoji(expense);
                        if (templateEmoji) return null; // Skip if has template emoji
                        
                        // Single expense with category
                        if (expense.category) {
                          return <span className="mr-1.5" title={`cat="${expense.category}"`}>{getCategoryEmoji(expense.category, settings)}</span>;
                        }
                        // Template expense: check if items have categories
                        if (expense.items && expense.items.length > 0) {
                          const itemsWithCategories = expense.items.filter((item: any) => item.category);
                          if (itemsWithCategories.length > 0) {
                            // Show first item's category emoji (template uses first item's category as representative)
                            const firstCategory = itemsWithCategories[0].category;
                            return <span className="mr-1.5" title={`multi-cat (${itemsWithCategories.length} items)`}>{getCategoryEmoji(firstCategory, settings)}</span>;
                          }
                        }
                        // No category found
                        return <span className="mr-1.5 text-yellow-500" title="No category">⚠️</span>;
                      })()}
                      {expense.name}
                    </p>
                    {expense.pocketId && getPocketName(expense.pocketId) && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 w-fit">
                        {getPocketName(expense.pocketId)}
                      </Badge>
                    )}
                  </div>
                  {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
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
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Amount and action buttons (forced right-aligned) */}
              <div className="flex items-center shrink-0 ml-auto">
                <p className={`text-sm text-right ${expense.fromIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                </p>

              </div>
            </div>
          </div>

          {/* Desktop: Keep original single-line layout with hover behavior */}
          <div className="hidden md:flex items-center justify-between p-2 pl-6 group">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {isBulkSelectMode && (
                <Checkbox
                  checked={selectedExpenseIds.has(expense.id)}
                  onCheckedChange={() => handleToggleExpense(expense.id)}
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${expense.fromIncome ? 'text-green-600' : ''}`}>
                    {(() => {
                      const templateEmoji = getDisplayEmoji(expense);
                      if (templateEmoji) {
                        return <span className="mr-1.5" title="From template">{templateEmoji}</span>;
                      }
                      return null;
                    })()}
                    {/* Only show category emoji if no template emoji */}
                    {!getDisplayEmoji(expense) && expense.category && <span className="mr-1.5">{getCategoryEmoji(expense.category, settings)}</span>}
                    {expense.name}
                  </p>
                  {expense.pocketId && getPocketName(expense.pocketId) && (
                    <Badge variant="secondary" className="text-xs">
                      {getPocketName(expense.pocketId)}
                    </Badge>
                  )}
                </div>
                {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
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
                  <div className="text-xs text-muted-foreground">
                    <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center shrink-0 ml-auto">
              <p className={`text-sm text-right transition-all ${expense.fromIncome ? 'text-green-600' : 'text-red-600'}`}>
                {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
              </p>
              {!isBulkSelectMode && (
                <>
                  {expense.fromIncome && onMoveToIncome && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-0 group-hover:w-6 opacity-0 group-hover:opacity-100 transition-all overflow-hidden"
                      onClick={() => onMoveToIncome(expense)}
                      title="Kembalikan ke pemasukan tambahan"
                    >
                      <ArrowRight className="size-3 text-green-600" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-0 group-hover:w-6 opacity-0 group-hover:opacity-100 transition-all overflow-hidden"
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
          )}
        </ExpenseItemWrapper>
      );
    }
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
                      onCheckedChange={() => handleToggleExpense(expense.id)}
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
                onCheckedChange={() => handleToggleExpense(expense.id)}
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
                      const renderIndividualIncomeInGroup = (income: AdditionalIncome) => {
                        const isSelected = selectedIncomeIds.has(income.id);
                        const isExpanded = expandedIncomeIds.has(income.id);
                        const netAmount = income.deduction > 0 ? income.amountIDR - income.deduction : income.amountIDR;
                        
                        return (
                          <ExpenseItemWrapper
                            key={income.id}
                            id={income.id}
                            isMobile={isMobile}
                            isBulkSelectMode={isBulkSelectMode}
                            isSelected={isSelected}
                            onLongPress={(id) => handleLongPressItem(id, 'income')}
                          >
                            {(longPressHandlers) => (
                              <Collapsible open={isExpanded} onOpenChange={() => toggleExpandIncome(income.id)}>
                                <div className={`${isBulkSelectMode && isSelected ? 'bg-accent/30 rounded-lg' : ''}`}>
                                  <CollapsibleTrigger asChild>
                                    <div className="group cursor-pointer rounded-lg hover:bg-accent/30 transition-colors">
                                      {/* Mobile: Compact layout with long-press */}
                                      <div 
                                        className="md:hidden p-2 pl-6"
                                        {...longPressHandlers}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      {/* Left: Name + metadata */}
                                      <div className="flex items-start gap-2 min-w-0 flex-1">
                                        {isBulkSelectMode && (
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleToggleSelectIncome(income.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-0.5"
                                          />
                                        )}
                                        
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm truncate text-green-600">{income.name}</p>
                                          <span className="text-xs text-muted-foreground">
                                            {formatDateSafe(income.date)}
                                            {income.conversionType === "auto" && " • (Auto)"}
                                            {income.currency === "USD" && income.amount && ` • ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(income.amount)}`}
                                          </span>
                                        </div>
                                        
                                        {!isBulkSelectMode && (
                                          isExpanded ? (
                                            <ChevronUp className="size-3 text-muted-foreground shrink-0 mt-1" />
                                          ) : (
                                            <ChevronDown className="size-3 text-muted-foreground shrink-0 mt-1" />
                                          )
                                        )}
                                      </div>
                                      
                                      {/* Right: Amount + actions (forced right-aligned) */}
                                      <div className="flex items-center shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                                        <p className="text-sm text-right text-green-600">
                                          +{formatCurrency(netAmount)}
                                        </p>
                                        

                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Desktop: Single-line layout */}
                                  <div className="hidden md:flex items-center justify-between p-2 pl-6">
                                    <div className="flex-1 flex items-center gap-2 min-w-0">
                                      {isBulkSelectMode && (
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={() => handleToggleSelectIncome(income.id)}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      )}
                                      
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm text-green-600">{income.name}</p>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDateSafe(income.date)}
                                          {income.conversionType === "auto" && " • (Auto)"}
                                          {income.currency === "USD" && income.amount && ` • ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(income.amount)}`}
                                        </span>
                                      </div>
                                      
                                      {!isBulkSelectMode && (
                                        isExpanded ? (
                                          <ChevronUp className="size-3" />
                                        ) : (
                                          <ChevronDown className="size-3" />
                                        )
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                                      <p className="text-sm text-right text-green-600 transition-all">
                                        +{formatCurrency(netAmount)}
                                      </p>
                                      
                                      {!isBulkSelectMode && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-0 group-hover:w-6 opacity-0 group-hover:opacity-100 transition-all overflow-hidden"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <MoreVertical className="size-3 text-muted-foreground" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setEditingIncomeId(income.id);
                                                const datePart = getLocalDateFromISO(income.date);
                                                setEditingIncome({
                                                  ...income,
                                                  date: datePart
                                                });
                                              }}
                                            >
                                              <Pencil className="size-3 mr-2" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => onDeleteIncome?.(income.id)}
                                              className="text-destructive focus:text-destructive"
                                            >
                                              <Trash2 className="size-3 mr-2" />
                                              Hapus
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                {/* Expandable details */}
                                <div className="px-3 pb-3 space-y-2 border-t pt-3 mt-2 md:px-2 md:pb-2 md:space-y-1 md:pt-1 md:mt-1">
                                  {income.currency === "USD" && (
                                    <div className="text-xs text-muted-foreground pl-8 md:pl-6">
                                      <span className="font-medium">Kotor:</span> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(income.amount)} × {formatCurrency(income.exchangeRate || 0)} = {formatCurrency(income.amountIDR)}
                                    </div>
                                  )}
                                  {income.deduction > 0 && (
                                    <div className="text-xs text-muted-foreground pl-8 md:pl-6">
                                      <span className="font-medium">Potongan:</span> -{formatCurrency(income.deduction)}
                                    </div>
                                  )}
                                  {(!income.currency || income.currency === "IDR") && (
                                    <div className="text-xs text-muted-foreground pl-8 md:pl-6">
                                      <span className="font-medium">Jumlah:</span> {formatCurrency(income.amountIDR)}
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                            )}
                          </ExpenseItemWrapper>
                        );
                      };
                      
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
        <Drawer open={editingExpenseId !== null} onOpenChange={(open) => !open && handleCloseEditDialog()} dismissible={true}>
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
          )}
        </Drawer>
      ) : (
        <Dialog open={editingExpenseId !== null} onOpenChange={(open) => !open && handleCloseEditDialog()}>
          {editingExpenseId !== null && (
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
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
        <BulkEditCategoryDialog
          open={showBulkEditCategoryDialog}
          onOpenChange={setShowBulkEditCategoryDialog}
          selectedExpenseIds={Array.from(selectedExpenseIds)}
          expenses={expenses}
          onUpdate={handleConfirmBulkEditCategory}
        />
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
        <Drawer open={!!editingIncomeId && !!editingIncome} onOpenChange={(open) => {
          if (!open) {
            setEditingIncomeId(null);
          }
        }}>
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
                  onUpdateIncome={(incomeData) => {
                    onUpdateIncome(editingIncomeId, incomeData);
                    setEditingIncomeId(null);
                    // ✅ REMOVED: Duplicate toast - already shown in App.tsx after API success
                  }}
                  onSuccess={() => setEditingIncomeId(null)}
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
                >
                  Batal
                </Button>
              </div>
            </DrawerContent>
          )}
        </Drawer>
      ) : (
        <Dialog open={!!editingIncomeId && !!editingIncome} onOpenChange={(open) => {
          if (!open) {
            setEditingIncomeId(null);
          }
        }}>
          {editingIncomeId && editingIncome && onUpdateIncome && (
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
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
                  // ✅ REMOVED: Duplicate toast - already shown in App.tsx after API success
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
          )}
        </Dialog>
      )}
      
      {/* Phase 2: Simulation Sandbox */}
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
      
      {/* ✅ NEW: Advanced Filter Drawer */}
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

      {/* 📱 Mobile Bottom Sheet for Item Actions */}
      {actionSheetItem && (
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