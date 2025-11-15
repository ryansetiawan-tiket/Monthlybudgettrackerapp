import { useState, useEffect, useCallback, useMemo, lazy, Suspense, startTransition, useRef } from "react";
import { MonthSelector } from "./components/MonthSelector";
import { BudgetOverview } from "./components/BudgetOverview";
import { BudgetForm } from "./components/BudgetForm";
import { ExpenseList } from "./components/ExpenseList";
import { FixedExpenseTemplate, FixedExpenseTemplates } from "./components/FixedExpenseTemplates";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { PocketsSummary } from "./components/PocketsSummary";
import { FloatingActionButton } from "./components/FloatingActionButton";
import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { IncomeBreakdown } from "./components/IncomeBreakdown";
import { BottomNavigationBar } from "./components/BottomNavigationBar";
import { PocketsTabView } from "./components/PocketsTabView";
import { PocketTimeline } from "./components/PocketTimeline";
import { WishlistSimulation } from "./components/WishlistSimulation";
import RemLogo from "./imports/Rem-369-259";

// Lazy load heavy dialogs for better initial bundle size (200-300KB reduction)
const AddExpenseDialog = lazy(() => 
  import("./components/AddExpenseDialog").then(m => ({ default: m.AddExpenseDialog }))
);
const AddAdditionalIncomeDialog = lazy(() => 
  import("./components/AddAdditionalIncomeDialog").then(m => ({ default: m.AddAdditionalIncomeDialog }))
);
const TransferDialog = lazy(() => 
  import("./components/TransferDialog").then(m => ({ default: m.TransferDialog }))
);
const ManagePocketsDialog = lazy(() => 
  import("./components/ManagePocketsDialog").then(m => ({ default: m.ManagePocketsDialog }))
);
const CategoryManager = lazy(() => 
  import("./components/CategoryManager").then(m => ({ default: m.CategoryManager }))
);
const UnifiedTransactionDialog = lazy(() =>
  import("./components/UnifiedTransactionDialog").then(m => ({ default: m.UnifiedTransactionDialog }))
);
const CalendarView = lazy(() =>
  import("./components/CalendarView").then(m => ({ default: m.CalendarView }))
);
import DialogSkeleton from "./components/DialogSkeleton";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { useRealtimeSubscription } from "./utils/supabase/useRealtimeSubscription";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import { Plus, DollarSign, Settings, Sliders, Calendar, FileText } from "lucide-react";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./components/ui/drawer";
import { funnyQuotes } from "./data/funny-quotes";
import { motion, AnimatePresence } from "motion/react";
import { getBaseUrl, createAuthHeaders } from "./utils/api";
import { formatCurrency } from "./utils/currency";
import { calculateCarryOverAssets, calculateCarryOverLiabilities } from "./utils/calculations";
import { useBudgetData } from "./hooks/useBudgetData";
import { usePockets } from "./hooks/usePockets";
import { useCategorySettings } from "./hooks/useCategorySettings";
import { DialogStackProvider } from "./contexts/DialogStackContext";
import { useMobileBackButton } from "./hooks/useMobileBackButton";
import { usePullToRefresh } from "./hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "./components/PullToRefreshIndicator";
import { useIsMobile } from "./components/ui/use-mobile";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { handleError } from "./utils/errorHandler";
import "./utils/migrate-expense-keys"; // Load migration utilities in console

interface BudgetData {
  initialBudget: number;
  notes: string;
  incomeDeduction: number;
}

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

interface Pocket {
  id: string;
  name: string;
  type: 'primary' | 'custom';
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  enableWishlist?: boolean;
}

interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
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

interface MonthCache {
  budget: BudgetData;
  expenses: Expense[];
  additionalIncomes: AdditionalIncome[];
  previousMonthRemaining: number | null;
}

function AppContent() {
  console.log('[App] AppContent rendering - Phase 1: Initializing hooks');
  
  // Monitor online/offline status
  console.log('[App] Phase 1.3: Calling useOnlineStatus');
  useOnlineStatus();
  console.log('[App] Phase 1.4: useOnlineStatus completed');

  // Random funny quote
  const [randomQuote, setRandomQuote] = useState("");

  // Select a random quote on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * funnyQuotes.length);
    setRandomQuote(funnyQuotes[randomIndex]);
  }, []);

  // Auto-rotate quote every 20 minutes
  useEffect(() => {
    const rotateQuote = () => {
      const currentIndex = funnyQuotes.indexOf(randomQuote);
      let newIndex;
      
      // Get a different quote from the current one
      do {
        newIndex = Math.floor(Math.random() * funnyQuotes.length);
      } while (newIndex === currentIndex && funnyQuotes.length > 1);
      
      setRandomQuote(funnyQuotes[newIndex]);
    };

    // Set interval for 20 minutes (1200000 milliseconds)
    const intervalId = setInterval(rotateQuote, 1200000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [randomQuote]);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Custom Hooks - Budget Data Management
  const {
    budget,
    setBudget,
    expenses,
    setExpenses,
    additionalIncomes,
    setAdditionalIncomes,
    previousMonthRemaining,
    setPreviousMonthRemaining,
    isLoading,
    setIsLoading,
    cache,
    fetchBudgetData,
    invalidateCache,
    updateCachePartial,
    getCacheKey,
  } = useBudgetData();

  // Custom Hooks - Pockets Management
  const {
    pockets,
    setPockets,
    archivedPockets,
    setArchivedPockets,
    balances,
    setBalances,
    isTransferDialogOpen,
    setIsTransferDialogOpen,
    isManagePocketsDialogOpen,
    setIsManagePocketsDialogOpen,
    defaultFromPocket,
    setDefaultFromPocket,
    defaultToPocket,
    setDefaultToPocket,
    defaultTargetPocket,
    setDefaultTargetPocket,
    editingPocket,
    setEditingPocket,
    pocketsRefreshKey,
    fetchPockets,
    fetchBalances,
    createPocket,
    updatePocket,
    deletePocket,
    transferBetweenPockets,
    refreshPockets,
  } = usePockets();

  // 🏗️ ARCHITECTURE FIX: Previous month pockets for carry-over calculation
  const [previousMonthBalances, setPreviousMonthBalances] = useState<Map<string, PocketBalance>>(new Map());
  
  // Local UI states
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [templates, setTemplates] = useState<FixedExpenseTemplate[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false); // Desktop unified dialog
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false); // Desktop calendar view
  const [managePocketsInitialMode, setManagePocketsInitialMode] = useState<'list' | 'create'>('list');
  
  // ✨ NEW: Smart shortcut - Category Breakdown state
  const [openCategoryBreakdownFromCard, setOpenCategoryBreakdownFromCard] = useState(false);
  
  // ✨ NEW: Smart shortcut - Income Breakdown state
  const [openIncomeBreakdownFromCard, setOpenIncomeBreakdownFromCard] = useState(false);
  
  // 📜 NEW: Ref for scrolling to ExpenseList after category filter
  const expenseListRef = useRef<HTMLDivElement>(null);
  
  // ✨ NEW: Mobile Bottom Nav - Active Tab
  const [activeTab, setActiveTab] = useState<'home' | 'pockets' | 'calendar'>(() => {
    const saved = localStorage.getItem('mobile-active-tab');
    return (saved === 'home' || saved === 'pockets' || saved === 'calendar') ? saved : 'home';
  });
  
  // ✅ NEW: Setup mobile back button handler (for Capacitor/Android)
  // Must be called after activeTab state is defined
  console.log('[App] Phase 1.1: Calling useMobileBackButton with activeTab');
  useMobileBackButton(activeTab, setActiveTab);
  console.log('[App] Phase 1.2: useMobileBackButton completed');
  
  // Show/Hide Pockets state (persistent)
  const [showPockets, setShowPockets] = useState(() => {
    const saved = localStorage.getItem('showPockets');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Phase 7: Category Filter State
  const [categoryFilter, setCategoryFilter] = useState<Set<import('./types').ExpenseCategory>>(new Set());
  
  // Phase 8: Category Manager State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  
  // Template Manager State (Desktop)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

  // Pocket Timeline State (for Tab 2 - Pockets view)
  const [showTimelineDrawer, setShowTimelineDrawer] = useState(false);
  const [timelineDrawerPocket, setTimelineDrawerPocket] = useState<{ id: string; name: string } | null>(null);
  const [isTimelineRealtimeMode, setIsTimelineRealtimeMode] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);  // ✅ NEW: Loading state untuk toggle wishlist

  // ✨ NEW: Wishlist Dialog State (for Tab 2 - Pockets view)
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const [wishlistPocket, setWishlistPocket] = useState<Pocket | null>(null);
  
  // 🔒 NEW: Modal/Drawer State Tracker (for pull-to-refresh control)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Category Settings Hook
  const { settings: categorySettings } = useCategorySettings();

  const baseUrl = getBaseUrl(projectId);
  const isMobile = useIsMobile();

  // Pull to Refresh handler - refresh all data
  const handlePullToRefresh = useCallback(async () => {
    try {
      // Fetch all data in parallel for better performance
      await Promise.all([
        fetchBudgetData(selectedYear, selectedMonth),
        fetchPockets(selectedYear, selectedMonth),
      ]);
      
      // Trigger pockets refresh to update timelines
      refreshPockets();
      
      // Show success feedback
      toast.success('Data berhasil diperbarui', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Pull to refresh error:', error);
      toast.error('Gagal memperbarui data');
    }
  }, [selectedYear, selectedMonth, fetchBudgetData, fetchPockets, refreshPockets]);

  // Pull to Refresh hook (mobile only)
  // ✅ Disabled when ANY modal/drawer is open to prevent conflict
  const hasAnyModalOpen = 
    isModalOpen || // ExpenseList drawers (tracked via onModalStateChange)
    showWishlistDialog || // Wishlist dialog (Tab 2)
    showTimelineDrawer || // Timeline drawer (Tab 2)
    openIncomeBreakdownFromCard || // Income breakdown drawer
    isTransferDialogOpen || // Transfer between pockets dialog
    isManagePocketsDialogOpen; // Manage pockets dialog
  
  const pullToRefreshState = usePullToRefresh({
    onRefresh: handlePullToRefresh,
    enabled: isMobile && !hasAnyModalOpen,
    threshold: 80,
    maxPullDistance: 120,
    resistance: 0.5,
  });

  // Handle transfer between pockets (wrapper for hook function + cache invalidation)
  const handleTransfer = async (transfer: {
    fromPocketId: string;
    toPocketId: string;
    amount: number;
    date: string;
    note?: string;
  }) => {
    const success = await transferBetweenPockets(selectedYear, selectedMonth, transfer);
    if (success) {
      // Invalidate cache after transfer
      invalidateCache(selectedYear, selectedMonth);
    }
    return success;
  };



  // Create custom pocket (wrapper for hook function + cache invalidation)
  const handleCreatePocket = async (pocket: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    enableWishlist?: boolean;
  }) => {
    const pocketData = {
      name: pocket.name,
      type: 'custom',
      icon: pocket.icon,
      color: pocket.color,
    };
    const success = await createPocket(selectedYear, selectedMonth, pocketData);
    if (success) {
      invalidateCache(selectedYear, selectedMonth);
    }
    return success;
  };

  // Edit custom pocket (wrapper for hook function + cache invalidation)
  const handleEditPocket = async (pocketId: string, pocket: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => {
    const success = await updatePocket(selectedYear, selectedMonth, pocketId, pocket);
    if (success) {
      invalidateCache(selectedYear, selectedMonth);
      setEditingPocket(null);
      setIsManagePocketsDialogOpen(false);
    }
    return success;
  };

  // Archive pocket
  const handleArchivePocket = async (pocketId: string, reason?: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/archive/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ pocketId, reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive pocket");
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        
        // Reload pockets (includes archived and balances)
        await fetchPockets(selectedYear, selectedMonth);
        
        // Invalidate cache
        invalidateCache(selectedYear, selectedMonth);
      }
    } catch (error: any) {
      handleError(error, "Gagal mengarsipkan kantong");
      throw error;
    }
  };

  // Unarchive pocket
  const handleUnarchivePocket = async (pocketId: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/archive/${pocketId}/${selectedYear}/${selectedMonth}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unarchive pocket");
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        
        // Reload pockets (includes archived and balances)
        await fetchPockets(selectedYear, selectedMonth);
        
        // Invalidate cache
        invalidateCache(selectedYear, selectedMonth);
      }
    } catch (error: any) {
      handleError(error, "Gagal memulihkan kantong");
      throw error;
    }
  };

  useEffect(() => {
    // Always fetch from server - no cache check at component level
    // fetchBudgetData will handle caching internally through setState
    fetchBudgetData(selectedYear, selectedMonth);
    
    // Load templates if not loaded yet (templates are global, not month-specific)
    if (templates.length === 0) {
      loadTemplates();
    }
    
    // Load pockets (includes archived and balances)
    fetchPockets(selectedYear, selectedMonth);
  }, [selectedMonth, selectedYear, fetchBudgetData, fetchPockets]);

  // 🏗️ ARCHITECTURE FIX: Fetch previous month balances for carry-over calculation
  useEffect(() => {
    const fetchPreviousMonthBalances = async () => {
      // Calculate previous month
      let prevMonth = selectedMonth - 1;
      let prevYear = selectedYear;
      
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = selectedYear - 1;
      }
      
      try {
        const response = await fetch(
          `${baseUrl}/pockets/${prevYear}/${prevMonth}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (!response.ok) {
          // If previous month doesn't exist, set empty map
          setPreviousMonthBalances(new Map());
          return;
        }
        
        const data = await response.json();
        const balances = data.success ? (data.data.balances || []) : (data.balances || []);
        const balanceMap = new Map<string, PocketBalance>();
        
        balances.forEach((balance: PocketBalance) => {
          balanceMap.set(balance.pocketId, balance);
        });
        
        setPreviousMonthBalances(balanceMap);
      } catch (error) {
        console.log('📅 Previous month balances not found (first month usage)');
        setPreviousMonthBalances(new Map());
      }
    };
    
    fetchPreviousMonthBalances();
  }, [selectedMonth, selectedYear, baseUrl]);

  // ============================================
  // REALTIME SUBSCRIPTIONS
  // ============================================
  
  // Subscribe to KV store changes for the current month
  const monthKey = getCacheKey(selectedYear, selectedMonth);
  
  useRealtimeSubscription({
    table: 'kv_store_3adbeaf1',
    filter: `key=like.%${monthKey}%`,
    onUpdate: (payload) => {
      // Invalidate cache and reload data
      invalidateCache(selectedYear, selectedMonth);
      
      const key = payload.new.key as string;
      
      // Determine what data to reload based on the key
      if (key.includes('budget_') || key.includes('expense') || key.includes('income')) {
        fetchBudgetData(selectedYear, selectedMonth);
      } else if (key.includes('pockets_') || key.includes('transfer')) {
        fetchPockets(selectedYear, selectedMonth);
      }
    },
    onInsert: (payload) => {
      // Same logic as update
      invalidateCache(selectedYear, selectedMonth);
      
      const key = payload.new.key as string;
      
      if (key.includes('budget_') || key.includes('expense') || key.includes('income')) {
        fetchBudgetData(selectedYear, selectedMonth);
      } else if (key.includes('pockets_') || key.includes('transfer')) {
        fetchPockets(selectedYear, selectedMonth);
      }
    },
    onDelete: (payload) => {
      // Reload relevant data
      invalidateCache(selectedYear, selectedMonth);
      
      const key = payload.old.key as string;
      
      // Reload all data since we can't determine exact scope from delete
      if (key.includes('budget_') || key.includes('expense') || key.includes('income')) {
        fetchBudgetData(selectedYear, selectedMonth);
      } else if (key.includes('pockets_') || key.includes('transfer')) {
        fetchPockets(selectedYear, selectedMonth);
      }
    },
    enabled: true
  });

  // These functions are no longer needed - using fetchBudgetData from hook instead
  // Keeping them commented for reference during migration
  // const loadBudgetData, loadExpenses, loadAdditionalIncomes - removed (use fetchBudgetData from hook)
  // ✅ REMOVED: loadPreviousMonthData - carryover manual sudah dihapus, sistem kantong handle otomatis

  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch(
        `${baseUrl}/templates`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load templates");
      }

      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      // Error loading templates - silently fail
    }
  }, [baseUrl, publicAnonKey]);

  const handleAddTemplate = useCallback(async (name: string, items: Array<{name: string, amount: number, category?: string, pocketId?: string}>, color?: string, emoji?: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name, items, color, emoji }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add template");
      }

      const result = await response.json();
      setTemplates((prev) => [...prev, result.data]);
    } catch (error) {
      toast.error("Gagal menambahkan template");
    }
  }, [baseUrl, publicAnonKey]);

  const syncColorToExpenses = useCallback(async (templateName: string, color?: string) => {
    try {
      // Find expenses that match the template name
      const matchingExpenses = expenses.filter(exp => exp.name === templateName);
      
      if (matchingExpenses.length === 0) return;

      // Update each matching expense
      for (const expense of matchingExpenses) {
        const response = await fetch(
          `${baseUrl}/expenses/${selectedYear}/${selectedMonth}/${expense.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ ...expense, color }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          setExpenses((prev) =>
            prev.map((exp) => (exp.id === expense.id ? result.data : exp))
          );
        }
      }
      
      toast.success(`Warna berhasil disinkronkan ke ${matchingExpenses.length} pengeluaran`);
    } catch (error) {
      // Error syncing color - silently fail
    }
  }, [expenses, baseUrl, selectedYear, selectedMonth, publicAnonKey]);

  const handleUpdateTemplate = useCallback(async (id: string, name: string, items: Array<{name: string, amount: number, category?: string, pocketId?: string}>, color?: string, emoji?: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/templates/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name, items, color, emoji }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update template");
      }

      const result = await response.json();
      setTemplates((prev) =>
        prev.map((template) => (template.id === id ? result.data : template))
      );
      
      // Sync color to existing expenses with matching name
      await syncColorToExpenses(name, color);
    } catch (error) {
      toast.error("Gagal mengupdate template");
    }
  }, [baseUrl, publicAnonKey, syncColorToExpenses]);

  const handleDeleteTemplate = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/templates/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      setTemplates((prev) => prev.filter((template) => template.id !== id));
    } catch (error) {
      toast.error("Gagal menghapus template");
    }
  }, [baseUrl, publicAnonKey]);

  const handleBudgetChange = useCallback((field: string, value: string | number) => {
    setBudget((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSaveBudget = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${baseUrl}/budget/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(budget),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save budget");
      }

      toast.success("Budget berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan budget");
    } finally {
      setIsSaving(false);
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, budget]);

  const handleAddExpense = useCallback(async (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string, pocketId?: string, groupId?: string, silent?: boolean, category?: string, emoji?: string) => {
    setIsAdding(true);
    try {
      const response = await fetch(
        `${baseUrl}/expenses/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name, amount, date, items, color, pocketId, groupId, category, emoji }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const result = await response.json();
      
      // 🔧 FIX: Only add to current state if expense date matches current month
      // This prevents expenses with past/future dates from appearing in wrong month
      const expenseDate = new Date(result.data.date);
      const expenseYear = expenseDate.getUTCFullYear();
      const expenseMonth = expenseDate.getUTCMonth() + 1;
      
      if (expenseYear === selectedYear && expenseMonth === selectedMonth) {
        // Expense belongs to current month → Update state
        setExpenses(prev => {
          const newExpenses = [...prev, result.data];
          // Update cache with new state
          updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
          return newExpenses;
        });
      } else {
        // Expense belongs to different month → Just invalidate cache
        console.log(`📅 Expense date (${expenseYear}-${expenseMonth}) differs from current view (${selectedYear}-${selectedMonth}) - skipping state update`);
        // Invalidate the ACTUAL expense month's cache
        invalidateCache(expenseYear, expenseMonth);
      }
      
      // Invalidate next month's cache (pocket carry-over system changes)
      invalidateCache(selectedYear, selectedMonth);
      
      // Only reload pockets and show toast if not silent (for batch operations)
      if (!silent) {
        // Reload pockets to update balances
        await fetchPockets(selectedYear, selectedMonth);
        
        // Trigger refresh for PocketsSummary timeline
        refreshPockets();
        
        toast.success("Pengeluaran berhasil ditambahkan");
      }
      
      return result.data; // Return the created expense
    } catch (error) {
      if (!silent) {
        toast.error("Gagal menambahkan pengeluaran");
      }
      throw error;
    } finally {
      setIsAdding(false);
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, updateCachePartial, invalidateCache, fetchPockets, refreshPockets]);

  const handleDeleteExpense = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/expenses/${selectedYear}/${selectedMonth}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      // 🔧 FIX: Check if deleted expense actually belongs to current month view
      const deletedExpense = expenses.find(e => e.id === id);
      if (deletedExpense) {
        const expenseDate = new Date(deletedExpense.date);
        const expenseYear = expenseDate.getUTCFullYear();
        const expenseMonth = expenseDate.getUTCMonth() + 1;
        
        if (expenseYear === selectedYear && expenseMonth === selectedMonth) {
          // Belongs to current month → Remove from state
          const newExpenses = expenses.filter((expense) => expense.id !== id);
          setExpenses(newExpenses);
          updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
        } else {
          // Belongs to different month → Just invalidate that month's cache
          console.log(`📅 Deleted expense from ${expenseYear}-${expenseMonth} (current view: ${selectedYear}-${selectedMonth})`);
          invalidateCache(expenseYear, expenseMonth);
        }
      }
      
      // Always invalidate current month cache (pocket carry-over system changes)
      invalidateCache(selectedYear, selectedMonth);
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      toast.success("Pengeluaran berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus pengeluaran");
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, expenses, updateCachePartial, invalidateCache, fetchPockets, refreshPockets]);

  const handleEditExpense = useCallback(async (id: string, updatedExpense: Omit<Expense, 'id'>) => {
    try {
      console.log('[App] Editing expense - Sending category:', updatedExpense.category);
      
      const response = await fetch(
        `${baseUrl}/expenses/${selectedYear}/${selectedMonth}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updatedExpense),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit expense");
      }

      const result = await response.json();
      console.log('[App] Server response category:', result.data?.category);
      
      // 🔧 CRITICAL FIX: Always create new object to ensure React detects changes
      const updatedData = { 
        ...result.data, 
        ...(updatedExpense.fromIncome ? { fromIncome: true } : {}) 
      };
      
      console.log('[App] Final updatedData category:', updatedData?.category);
      
      // 🔧 FIX: Check if expense date belongs to different month than currently viewing
      const newDate = new Date(updatedData.date);
      const newYear = newDate.getUTCFullYear();
      const newMonth = newDate.getUTCMonth() + 1;
      
      // Compare expense date with currently selected month (not old date!)
      // This ensures Oktober expense gets removed when viewing November
      const monthChanged = (newYear !== selectedYear || newMonth !== selectedMonth);
      
      if (monthChanged) {
        // Expense belongs to different month → Remove from current view and navigate
        console.log(`📅 Expense date is ${newYear}-${newMonth} but viewing ${selectedYear}-${selectedMonth} - removing and navigating`);
        const newExpenses = expenses.filter(expense => expense.id !== id);
        setExpenses(newExpenses);
        updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
        
        // Invalidate target month cache
        invalidateCache(newYear, newMonth);
        
        // ✨ UX IMPROVEMENT: Auto-navigate to target month + show notification
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const targetMonthName = monthNames[newMonth - 1];
        
        // Automatically navigate to target month (seamless!)
        setSelectedYear(newYear);
        setSelectedMonth(newMonth);
        
        // Show success notification
        toast.success(`Pindah ke ${targetMonthName} ${newYear}`, {
          duration: 3000
        });
      } else {
        // Same month → Update state in place
        const newExpenses = expenses.map((expense) => 
          expense.id === id ? { ...updatedData } : expense
        );
        setExpenses(newExpenses);
        updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
        invalidateCache(selectedYear, selectedMonth);
        
        toast.success("Pengeluaran berhasil diupdate");
      }
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      // Toast already shown above based on monthChanged
    } catch (error) {
      toast.error("Gagal mengupdate pengeluaran");
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, expenses, updateCachePartial, invalidateCache, fetchPockets, refreshPockets]);

  const handleBulkUpdateCategory = useCallback(async (ids: string[], category: string) => {
    console.log('[Bulk Update] Starting bulk category update for', ids.length, 'expenses');
    console.log('[Bulk Update] Category:', category);
    console.log('[Bulk Update] Base URL:', baseUrl);
    
    try {
      // Update each expense with the new category
      const updatePromises = ids.map(async (id, index) => {
        const expense = expenses.find(e => e.id === id);
        if (!expense) {
          console.log(`[Bulk Update] Expense ${id} not found, skipping`);
          return null;
        }
        
        // Exclude 'id' from the expense object (API expects Omit<Expense, 'id'>)
        const { id: _id, ...expenseWithoutId } = expense;
        const updatedExpense = {
          ...expenseWithoutId,
          category
        };
        
        const url = `${baseUrl}/expenses/${selectedYear}/${selectedMonth}/${id}`;
        console.log(`[Bulk Update ${index + 1}/${ids.length}] Updating expense ${id} at ${url}`);
        
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updatedExpense),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Bulk Update] Failed to update expense ${id}:`, response.status, errorText);
          throw new Error(`Failed to update expense ${id}: ${response.status} ${errorText}`);
        }

        console.log(`[Bulk Update ${index + 1}/${ids.length}] Successfully updated expense ${id}`);
        return response;
      });

      await Promise.all(updatePromises);

      // Update local state
      const newExpenses = expenses.map(expense =>
        ids.includes(expense.id) ? { ...expense, category } : expense
      );
      setExpenses(newExpenses);
      
      // Update cache
      updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
      // Invalidate next month's cache
      invalidateCache(selectedYear, selectedMonth);
      
      console.log('[Bulk Update] All updates completed successfully');
      toast.success(`${ids.length} pengeluaran berhasil diupdate`);
    } catch (error) {
      console.error("[Bulk Update] Error bulk updating categories:", error);
      throw error; // Re-throw to be caught by the dialog
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, expenses, updateCachePartial, invalidateCache]);

  const handleAddIncome = useCallback(async (income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
    deduction: number;
    pocketId: string;
  }) => {
    setIsAddingIncome(true);
    try {
      const response = await fetch(
        `${baseUrl}/additional-income/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(income),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add additional income");
      }

      const result = await response.json();
      
      // 🔧 FIX: Only add to current state if income date matches current month
      const incomeDate = new Date(result.data.date);
      const incomeYear = incomeDate.getUTCFullYear();
      const incomeMonth = incomeDate.getUTCMonth() + 1;
      
      if (incomeYear === selectedYear && incomeMonth === selectedMonth) {
        // Income belongs to current month → Update state
        setAdditionalIncomes((prev) => [...prev, result.data]);
      } else {
        // Income belongs to different month → Just invalidate cache
        console.log(`📅 Income date (${incomeYear}-${incomeMonth}) differs from current view (${selectedYear}-${selectedMonth}) - skipping state update`);
        invalidateCache(incomeYear, incomeMonth);
      }
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      toast.success("Pemasukan tambahan berhasil ditambahkan");
    } catch (error) {
      toast.error("Gagal menambahkan pemasukan tambahan");
    } finally {
      setIsAddingIncome(false);
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, fetchPockets, refreshPockets, invalidateCache]);

  const handleOpenTransferDialog = useCallback((targetPocketId?: string) => {
    startTransition(() => {
      setDefaultToPocket(targetPocketId);
      setIsTransferDialogOpen(true);
    });
  }, [setDefaultToPocket, setIsTransferDialogOpen]);

  const handlePocketTransfer = useCallback(async (transferData: {
    fromPocketId: string;
    toPocketId: string;
    amount: number;
    date: string;
    note?: string;
  }) => {
    await transferBetweenPockets(selectedYear, selectedMonth, transferData);
  }, [transferBetweenPockets, selectedYear, selectedMonth]);

  const handleDeleteIncome = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/additional-income/${selectedYear}/${selectedMonth}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete additional income");
      }

      setAdditionalIncomes((prev) => prev.filter((income) => income.id !== id));
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      toast.success("Pemasukan tambahan berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus pemasukan tambahan");
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, fetchPockets, refreshPockets]);



  const handleMoveExpenseToIncome = useCallback(async (expense: Expense) => {
    try {
      // Add back as income - preserve conversion data if it exists
      const hasConversionData = expense.currency && expense.originalAmount !== undefined;
      
      const response = await fetch(
        `${baseUrl}/additional-income/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: expense.name,
            amount: hasConversionData ? expense.originalAmount : (expense.amount + (expense.deduction || 0)),
            currency: expense.currency || "IDR",
            exchangeRate: expense.exchangeRate || null,
            amountIDR: expense.amount + (expense.deduction || 0), // Nilai kotor (gross)
            conversionType: expense.conversionType || "manual",
            date: expense.date,
            deduction: expense.deduction || 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add back to income");
      }

      const result = await response.json();
      
      // Delete from expenses
      const deleteResponse = await fetch(
        `${baseUrl}/expenses/${selectedYear}/${selectedMonth}/${expense.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete expense");
      }

      // Update states
      setAdditionalIncomes((prev) => [...prev, result.data]);
      setExpenses((prev) => prev.filter((exp) => exp.id !== expense.id));
      
      // Invalidate cache
      invalidateCache(selectedYear, selectedMonth);
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      toast.success(`"${expense.name}" dikembalikan ke pemasukan tambahan`);
    } catch (error) {
      toast.error("Gagal mengembalikan ke pemasukan");
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, invalidateCache, fetchPockets, refreshPockets]);

  const handleUpdateIncome = useCallback(async (id: string, income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
    deduction: number;
    pocketId: string;
  }) => {
    try {
      const response = await fetch(
        `${baseUrl}/additional-income/${selectedYear}/${selectedMonth}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(income),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update additional income");
      }

      const result = await response.json();
      
      // 🔧 FIX: Check if income date belongs to different month than currently viewing
      const newDate = new Date(result.data.date);
      const newYear = newDate.getUTCFullYear();
      const newMonth = newDate.getUTCMonth() + 1;
      
      // Compare income date with currently selected month (not old date!)
      const monthChanged = (newYear !== selectedYear || newMonth !== selectedMonth);
      
      if (monthChanged) {
        // Income belongs to different month → Remove from current view
        console.log(`📅 Income date is ${newYear}-${newMonth} but viewing ${selectedYear}-${selectedMonth} - removing from current view`);
        setAdditionalIncomes((prev) => prev.filter(item => item.id !== id));
        
        // Invalidate target month cache
        invalidateCache(newYear, newMonth);
        
        // ✨ UX IMPROVEMENT: Auto-navigate to target month + show notification
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const targetMonthName = monthNames[newMonth - 1];
        
        // Automatically navigate to target month (seamless!)
        setSelectedYear(newYear);
        setSelectedMonth(newMonth);
        
        // Show success notification
        toast.success(`Pindah ke ${targetMonthName} ${newYear}`, {
          duration: 3000
        });
      } else {
        // Same month → Update state in place
        setAdditionalIncomes((prev) =>
          prev.map((item) => (item.id === id ? result.data : item))
        );
        invalidateCache(selectedYear, selectedMonth);
        
        toast.success("Pemasukan tambahan berhasil diupdate");
      }
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
    } catch (error) {
      toast.error("Gagal mengupdate pemasukan tambahan");
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, fetchPockets, refreshPockets]);

  const handleBulkDeleteExpenses = useCallback(async (ids: string[]) => {
    try {
      // Delete all expenses in parallel
      const deletePromises = ids.map(id =>
        fetch(
          `${baseUrl}/expenses/${selectedYear}/${selectedMonth}/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        )
      );

      const results = await Promise.allSettled(deletePromises);
      
      // Check for failures
      const failures = results.filter(r => r.status === 'rejected');
      const successes = results.filter(r => r.status === 'fulfilled');

      // Update local state - remove successfully deleted items
      setExpenses(prev => prev.filter(exp => !ids.includes(exp.id)));
      
      // Update cache after state update
      const newExpenses = expenses.filter(exp => !ids.includes(exp.id));
      updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
      
      // Invalidate next month's cache (pocket carry-over system changes)
      invalidateCache(selectedYear, selectedMonth);
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();

      if (failures.length > 0 && successes.length > 0) {
        toast.warning(`${successes.length} dari ${ids.length} pengeluaran berhasil dihapus`);
      } else if (failures.length > 0) {
        throw new Error("All deletes failed");
      }
    } catch (error) {
      throw error; // Re-throw to be caught by ExpenseList
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, expenses, updateCachePartial, invalidateCache]);

  const handleMonthChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsLoading(true);
  }, []);

  const handleTogglePockets = useCallback(() => {
    setShowPockets(prev => {
      const newValue = !prev;
      localStorage.setItem('showPockets', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // Persist active tab to localStorage
  useEffect(() => {
    localStorage.setItem('mobile-active-tab', activeTab);
  }, [activeTab]);

  // FAB Action Handlers
  const handleFABAddExpense = useCallback(() => {
    startTransition(() => setIsExpenseDialogOpen(true));
  }, []);

  const handleFABAddIncome = useCallback(() => {
    startTransition(() => setIsIncomeDialogOpen(true));
  }, []);

  const handleFABTransfer = useCallback(() => {
    startTransition(() => setIsTransferDialogOpen(true));
  }, []);

  // Phase 7: Category Filter Handlers
  const handleCategoryClick = useCallback((category: import('./types').ExpenseCategory) => {
    // 📜 NOTE: Don't set parent's categoryFilter here - ExpenseList already handles
    // filtering via activeCategoryFilter. We only need to scroll to results.
    // Setting categoryFilter here causes duplicate filter badges.
    
    // 📜 Scroll to ExpenseList after category filter applied
    // Use setTimeout to wait for modal close animation
    setTimeout(() => {
      if (expenseListRef.current) {
        const elementPosition = expenseListRef.current.getBoundingClientRect().top + window.scrollY;
        // Add offset for sticky header (mobile has sticky header with ~100px height including statusbar)
        const offset = 80; // Adjust based on your sticky header height
        
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
      }
    }, 300); // Match modal close animation duration
  }, []);

  const handleClearFilter = useCallback(() => {
    setCategoryFilter(new Set());
  }, []);

  const handleUpdateGlobalDeduction = useCallback(async (deduction: number) => {
    const newBudget = { ...budget, incomeDeduction: deduction };
    setBudget(newBudget);
    
    // Update cache
    updateCachePartial(selectedYear, selectedMonth, 'budget', newBudget);
    // Invalidate next month's cache (pocket carry-over system changes)
    invalidateCache(selectedYear, selectedMonth);
    
    // Auto-save on change
    try {
      const response = await fetch(
        `${baseUrl}/budget/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(newBudget),
        }
      );

      if (response.ok) {
        toast.success("Potongan berhasil disimpan");
      }
    } catch (error) {
      toast.error("Gagal menyimpan potongan");
    }
  }, [budget, updateCachePartial, selectedYear, selectedMonth, invalidateCache, baseUrl, publicAnonKey]);

  // 🏗️ ARCHITECTURE FIX: Calculate carry-over assets (positive balances from previous month)
  const carryOverAssets = useMemo(() => {
    const assets = calculateCarryOverAssets(previousMonthBalances);
    console.log('🏗️ [ARCHITECTURE FIX] Carry-Over Assets (Positif):', formatCurrency(assets));
    return assets;
  }, [previousMonthBalances]);

  // 🏗️ ARCHITECTURE FIX: Calculate carry-over liabilities (negative balances/utang from previous month)
  const carryOverLiabilities = useMemo(() => {
    const liabilities = calculateCarryOverLiabilities(previousMonthBalances);
    console.log('🏗️ [ARCHITECTURE FIX] Carry-Over Liabilities (Utang):', formatCurrency(liabilities));
    return liabilities;
  }, [previousMonthBalances]);

  // Calculate gross additional income and apply individual deductions
  // Memoized for performance - only recomputes when dependencies change
  const grossAdditionalIncome = useMemo(() => {
    return additionalIncomes
      .reduce((sum, income) => {
        const netAmount = income.amountIDR - (income.deduction || 0);
        return sum + netAmount;
      }, 0);
  }, [additionalIncomes]);

  // Apply global deduction
  const totalAdditionalIncome = useMemo(() => {
    return grossAdditionalIncome - (budget.incomeDeduction || 0);
  }, [grossAdditionalIncome, budget.incomeDeduction]);

  // 🏗️ ARCHITECTURE FIX: Calculate current month expenses only (for breakdown display)
  const currentMonthExpenses = useMemo(() => {
    return expenses
      .reduce((sum, expense) => {
        if (expense.fromIncome) {
          return sum - expense.amount; // Subtract from expenses (adds to budget)
        }
        return sum + expense.amount;
      }, 0);
  }, [expenses]);

  // 🏗️ ARCHITECTURE FIX: Total Income = Budget Awal + Pemasukan Tambahan + Carry-Over ASET (positif)
  const totalIncome = useMemo(() => {
    const income = Number(budget.initialBudget) +
      totalAdditionalIncome +
      carryOverAssets; // ✨ NEW: Include positive carry-over (Assets)
    
    console.log('🏗️ [ARCHITECTURE FIX] Total Income Breakdown:', {
      budgetAwal: formatCurrency(Number(budget.initialBudget)),
      pemasukanTambahan: formatCurrency(totalAdditionalIncome),
      carryOverAssets: formatCurrency(carryOverAssets),
      totalIncome: formatCurrency(income)
    });
    
    return income;
  }, [budget.initialBudget, totalAdditionalIncome, carryOverAssets]);

  // 🏗️ ARCHITECTURE FIX: Total Expenses = Pengeluaran Bulan Ini + Carry-Over KEWAJIBAN (negatif/utang)
  const totalExpenses = useMemo(() => {
    const expenses = currentMonthExpenses + carryOverLiabilities; // ✨ NEW: Include negative carry-over (Liabilities/Utang)
    
    console.log('🏗️ [ARCHITECTURE FIX] Total Expenses Breakdown:', {
      pengeluaranBulanIni: formatCurrency(currentMonthExpenses),
      carryOverLiabilities: formatCurrency(carryOverLiabilities),
      totalExpenses: formatCurrency(expenses)
    });
    
    return expenses;
  }, [currentMonthExpenses, carryOverLiabilities]);

  // 🏗️ ARCHITECTURE FIX: Remaining Budget = Total Income - Total Expenses
  const remainingBudget = useMemo(() => {
    const remaining = totalIncome - totalExpenses;
    
    console.log('🏗️ [ARCHITECTURE FIX] Sisa Budget:', {
      totalIncome: formatCurrency(totalIncome),
      totalExpenses: formatCurrency(totalExpenses),
      sisaBudget: formatCurrency(remaining)
    });
    
    return remaining;
  }, [totalIncome, totalExpenses]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedYear}-${selectedMonth}-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`min-h-screen bg-background pb-20 md:pb-4 pt-0 px-4 md:p-6 lg:p-8`}
        >
        {/* Pull to Refresh Indicator (Mobile Only) */}
        {isMobile && (
          <PullToRefreshIndicator
            isPulling={pullToRefreshState.isPulling}
            isRefreshing={pullToRefreshState.isRefreshing}
            pullDistance={pullToRefreshState.pullDistance}
            progress={pullToRefreshState.progress}
            shouldTriggerRefresh={pullToRefreshState.shouldTriggerRefresh}
          />
        )}

        <div className="max-w-5xl mx-auto space-y-8">
          {/* TAB 1: HOME/DASHBOARD - Desktop always shown, Mobile only when activeTab === 'home' */}
          {(!isMobile || activeTab === 'home') && (
            <>
          {/* Sticky Header for Mobile with Native App Space */}
          <div className="md:static sticky top-0 z-50 bg-background md:pt-0 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 space-y-4 md:space-y-8 md:shadow-none shadow-sm border-b md:border-b-0 pt-[44px] pr-[16px] pb-[16px] pl-[16px]">
            {/* Desktop: Split layout (Title left | Controls right) | Mobile: Stacked */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-8">
              {/* LEFT SECTION: Title & Subtitle */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-left space-y-2 pt-2 relative flex-shrink-0"
              >
                {/* Logo REM */}
                <div className="w-[86px] h-[29px] sm:w-[108px] sm:h-[36px]">
                  <RemLogo />
                </div>
                {/* Action buttons - Mobile only, positioned at top right */}
                {isMobile && (
                  <div className="absolute top-0 right-0 flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => startTransition(() => setIsBudgetDialogOpen(true))}
                      title="Pengaturan Budget"
                    >
                      <Sliders className="size-4" />
                    </Button>
                  </div>
                )}
                <p className="text-muted-foreground text-[14px] sm:text-[16px]">{randomQuote || "Kelola budget bulanan Anda dengan mudah"}</p>
              </motion.div>

              {/* RIGHT SECTION: Month Selector with Controls */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="md:flex-shrink-0"
              >
                <MonthSelector
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onMonthChange={handleMonthChange}
                  onCalendarClick={() => startTransition(() => setIsCalendarDialogOpen(true))}
                  onSettingsClick={() => startTransition(() => setIsBudgetDialogOpen(true))}
                />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BudgetOverview
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              remainingBudget={remainingBudget}
              showPockets={showPockets}
              onTogglePockets={handleTogglePockets}
              initialBudget={Number(budget.initialBudget)}
              additionalIncome={totalAdditionalIncome}
              globalDeduction={budget.incomeDeduction || 0}
              carryOverAssets={carryOverAssets}
              currentMonthExpenses={currentMonthExpenses}
              carryOverLiabilities={carryOverLiabilities}
              onOpenCategoryBreakdown={() => setOpenCategoryBreakdownFromCard(true)}
              onOpenIncomeBreakdown={() => setOpenIncomeBreakdownFromCard(true)}
            />
          </motion.div>

          {showPockets && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.25 }}
            >
              <PocketsSummary
              key={`pockets-${selectedYear}-${selectedMonth}-${pocketsRefreshKey}`}
              monthKey={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`}
              onTransferClick={(fromPocket, toPocket) => {
                startTransition(() => {
                  setDefaultFromPocket(fromPocket);
                  setDefaultToPocket(toPocket);
                  setIsTransferDialogOpen(true);
                });
              }}
              onAddIncomeClick={handleOpenTransferDialog}
              onCreatePocketClick={() => {
                startTransition(() => {
                  setEditingPocket(null);
                  setManagePocketsInitialMode('create');
                  setIsManagePocketsDialogOpen(true);
                });
              }}
              onManagePocketsClick={() => {
                startTransition(() => {
                  setEditingPocket(null);
                  setManagePocketsInitialMode('list');
                  setIsManagePocketsDialogOpen(true);
                });
              }}
              onEditPocketClick={(pocket) => {
                startTransition(() => {
                  setEditingPocket(pocket);
                  setIsManagePocketsDialogOpen(true);
                });
              }}
              onOpenBudgetSettings={() => startTransition(() => setIsBudgetDialogOpen(true))}
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
            />
            </motion.div>
          )}

          <motion.div
            ref={expenseListRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <ExpenseList 
              expenses={expenses} 
              onDeleteExpense={handleDeleteExpense} 
              onEditExpense={handleEditExpense}
              onBulkDeleteExpenses={handleBulkDeleteExpenses}
              onBulkUpdateCategory={handleBulkUpdateCategory}
              onMoveToIncome={handleMoveExpenseToIncome}
              pockets={pockets}
              balances={balances}
              categoryFilter={categoryFilter}
              onClearFilter={handleClearFilter}
              onCategoryClick={handleCategoryClick}
              // Income props
              incomes={additionalIncomes}
              onDeleteIncome={handleDeleteIncome}
              onUpdateIncome={handleUpdateIncome}
              globalDeduction={budget.incomeDeduction || 0}
              onUpdateGlobalDeduction={handleUpdateGlobalDeduction}
              // Phase 8: Category Manager
              onOpenCategoryManager={() => startTransition(() => setIsCategoryManagerOpen(true))}
              // Desktop: Transaction entry
              onOpenAddTransaction={() => startTransition(() => setIsTransactionDialogOpen(true))}
              // Desktop: Template Manager
              onOpenTemplateManager={() => startTransition(() => setIsTemplateManagerOpen(true))}
              // 🔧 FIX: Pass month/year for CategoryBreakdown MoM calculation
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              // Budget props for SimulationSandbox
              initialBudget={budget.initialBudget}
              // 🏗️ ARCHITECTURE FIX: Carry-over breakdown props
              carryOverAssets={carryOverAssets}
              carryOverLiabilities={carryOverLiabilities}
              // ✨ NEW: Smart shortcut - External category breakdown control
              externalOpenCategoryBreakdown={openCategoryBreakdownFromCard}
              onCategoryBreakdownClose={() => setOpenCategoryBreakdownFromCard(false)}
              // 🔒 NEW: Modal state tracking (for pull-to-refresh control)
              onModalStateChange={setIsModalOpen}
            />
          </motion.div>
            </>
          )}
          
          {/* TAB 2: POCKETS - Mobile only when activeTab === 'pockets' */}
          {isMobile && activeTab === 'pockets' && (
            <PocketsTabView
              pockets={pockets}
              balances={balances}
              onPocketClick={(pocketId) => {
                const pocket = pockets.find(p => p.id === pocketId);
                if (pocket) {
                  setTimelineDrawerPocket({ id: pocket.id, name: pocket.name });
                  setShowTimelineDrawer(true);
                }
              }}
              onWishlistClick={(pocketId) => {
                const pocket = pockets.find(p => p.id === pocketId);
                if (pocket) {
                  // 🐛 DEBUG: Log pocket data yang akan dibuka
                  console.log('[App] Opening Wishlist Dialog for pocket:', {
                    pocketId: pocket.id,
                    pocketName: pocket.name,
                    enableWishlist: pocket.enableWishlist
                  });
                  // Open WishlistSimulation dialog
                  setWishlistPocket(pocket);
                  setShowWishlistDialog(true);
                }
              }}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              isRealtimeMode={isTimelineRealtimeMode}
            />
          )}
          
          {/* TAB 3: CALENDAR - Mobile only when activeTab === 'calendar' */}
          {isMobile && activeTab === 'calendar' && (
            <Suspense fallback={<DialogSkeleton />}>
              <CalendarView
                month={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                expenses={expenses}
                incomes={additionalIncomes}
                pockets={pockets}
                settings={categorySettings}
                onClose={() => {}} // No close button needed in tab mode
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                onEditIncome={handleUpdateIncome}
                onDeleteIncome={handleDeleteIncome}
                onMonthChange={(year, month) => {
                  setSelectedYear(year);
                  setSelectedMonth(month);
                }}
                embedded={true} // ✅ EMBEDDED MODE: Inline calendar, no fullscreen drawer
              />
            </Suspense>
          )}
        </div>
        
        {/* Floating Action Button - Show on Home, Pockets, and Calendar tabs */}
        {(!isMobile || (activeTab === 'home' || activeTab === 'pockets' || activeTab === 'calendar')) && (
          <FloatingActionButton
            onAddExpense={handleFABAddExpense}
            onAddIncome={handleFABAddIncome}
            onTransfer={handleFABTransfer}
          />
        )}
        
        {/* ========== GLOBAL DIALOGS - Accessible from all tabs ========== */}
        
        {/* Transfer Dialog */}
        <Suspense fallback={<DialogSkeleton />}>
          {isTransferDialogOpen && (
            <TransferDialog
              open={isTransferDialogOpen}
              onOpenChange={(open) => {
                setIsTransferDialogOpen(open);
                if (!open) {
                  setDefaultFromPocket(undefined);
                  setDefaultToPocket(undefined);
                }
              }}
              pockets={pockets}
              balances={balances}
              onTransfer={handlePocketTransfer}
              defaultFromPocket={defaultFromPocket}
              defaultToPocket={defaultToPocket}
            />
          )}
        </Suspense>

        {/* Manage Pockets Dialog */}
        <Suspense fallback={<DialogSkeleton />}>
          {isManagePocketsDialogOpen && (
            <ManagePocketsDialog
              open={isManagePocketsDialogOpen}
              onOpenChange={(open) => {
                setIsManagePocketsDialogOpen(open);
                if (!open) setEditingPocket(null);
              }}
              pockets={pockets}
              balances={balances}
              onCreatePocket={handleCreatePocket}
              onEditPocket={handleEditPocket}
              onArchivePocket={handleArchivePocket}
              onUnarchivePocket={handleUnarchivePocket}
              archivedPockets={archivedPockets}
              editPocket={editingPocket}
              initialMode={managePocketsInitialMode}
            />
          )}
        </Suspense>

        {/* Budget Form (Initial Budget) */}
        <BudgetForm
          open={isBudgetDialogOpen}
          onOpenChange={setIsBudgetDialogOpen}
          initialBudget={budget.initialBudget}
          notes={budget.notes}
          onBudgetChange={handleBudgetChange}
          onSave={handleSaveBudget}
          isSaving={isSaving}
        />

        {/* Add Expense Dialog (Mobile) */}
        <Suspense fallback={<DialogSkeleton />}>
          {isExpenseDialogOpen && (
            <AddExpenseDialog 
              open={isExpenseDialogOpen}
              onOpenChange={setIsExpenseDialogOpen}
              onAddExpense={handleAddExpense} 
              isAdding={isAdding} 
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              pockets={pockets}
              balances={balances}
              currentExpenses={expenses}
              expenses={expenses}
            />
          )}
        </Suspense>

        {/* Add Income Dialog (Mobile) */}
        <Suspense fallback={<DialogSkeleton />}>
          {isIncomeDialogOpen && (
            <AddAdditionalIncomeDialog 
              open={isIncomeDialogOpen}
              onOpenChange={(open) => {
                setIsIncomeDialogOpen(open);
                if (!open) setDefaultTargetPocket(undefined);
              }}
              onAddIncome={handleAddIncome}
              isAdding={isAddingIncome}
              defaultTargetPocket={defaultTargetPocket}
              pockets={pockets}
              balances={balances}
            />
          )}
        </Suspense>
        
        {/* Phase 8: Category Manager Dialog */}
        <Suspense fallback={<DialogSkeleton />}>
          {isCategoryManagerOpen && (
            <CategoryManager
              open={isCategoryManagerOpen}
              onOpenChange={setIsCategoryManagerOpen}
            />
          )}
        </Suspense>
        
        {/* Desktop: Template Manager Dialog */}
        {isTemplateManagerOpen && (
          <Dialog open={isTemplateManagerOpen} onOpenChange={setIsTemplateManagerOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Template Pengeluaran</DialogTitle>
              </DialogHeader>
              <FixedExpenseTemplates
                templates={templates}
                onAddTemplate={handleAddTemplate}
                onUpdateTemplate={handleUpdateTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                pockets={pockets}
              />
            </DialogContent>
          </Dialog>
        )}
        
        {/* Desktop: Unified Transaction Dialog */}
        <Suspense fallback={<DialogSkeleton />}>
          {isTransactionDialogOpen && (
            <UnifiedTransactionDialog
              open={isTransactionDialogOpen}
              onOpenChange={setIsTransactionDialogOpen}
              onAddExpense={handleAddExpense}
              isAddingExpense={isAdding}
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onAddIncome={handleAddIncome}
              isAddingIncome={isAddingIncome}
              pockets={pockets}
              balances={balances}
              currentExpenses={expenses}
              expenses={expenses}
            />
          )}
        </Suspense>
        
        {/* Desktop: Calendar View Dialog */}
        {!isMobile && (
          <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
            <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] p-6 overflow-hidden flex flex-col" aria-describedby={undefined}>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Kalender Transaksi</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto -mx-6 px-6">
                <Suspense fallback={<DialogSkeleton />}>
                  <CalendarView
                    month={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                    expenses={expenses}
                    incomes={additionalIncomes}
                    pockets={pockets}
                    settings={categorySettings}
                    onClose={() => setIsCalendarDialogOpen(false)}
                    onEditExpense={handleEditExpense}
                    onDeleteExpense={handleDeleteExpense}
                    onEditIncome={handleUpdateIncome}
                    onDeleteIncome={handleDeleteIncome}
                    onMonthChange={(year, month) => {
                      setSelectedYear(year);
                      setSelectedMonth(month);
                    }}
                    embedded={false} // ✅ DIALOG MODE: Fullscreen mode in dialog
                  />
                </Suspense>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* ✨ NEW: Income Breakdown Dialog */}
        <IncomeBreakdown
          open={openIncomeBreakdownFromCard}
          onOpenChange={setOpenIncomeBreakdownFromCard}
          initialBudget={Number(budget.initialBudget) || 0}
          additionalIncome={additionalIncomes.map(income => ({
            id: income.id,
            name: income.name,
            amount: income.amountIDR - (income.deduction || 0),
            date: income.date,
            usdAmount: income.currency === 'USD' ? income.amount : undefined,
            exchangeRate: income.exchangeRate || undefined
          }))}
          carryOverAssets={carryOverAssets}
          globalDeduction={budget.incomeDeduction || 0}
          totalIncome={totalIncome}
        />
        
        <Toaster />
      </motion.div>
    </AnimatePresence>
    
    {/* Bottom Navigation Bar - Mobile Only - OUTSIDE AnimatePresence to prevent flicker */}
    {isMobile && (
      <BottomNavigationBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    )}
    
    {/* Pocket Timeline Drawer - For Tab 2 Pockets - OUTSIDE AnimatePresence */}
    {timelineDrawerPocket && (() => {
      const pocket = pockets.find(p => p.id === timelineDrawerPocket.id);
      if (!pocket) return null;
      
      return (
        <PocketTimeline
          pocketId={pocket.id}
          pocketName={pocket.name}
          pocketDescription={pocket.description}
          pocketIcon={pocket.icon}
          pocketColor={pocket.color}
          pocketType={pocket.type}
          monthKey={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
          baseUrl={baseUrl}
          publicAnonKey={publicAnonKey}
          open={showTimelineDrawer}
          onOpenChange={setShowTimelineDrawer}
          isRealtimeMode={isTimelineRealtimeMode}
          drawerClassName="z-[101]"
          balance={balances.get(pocket.id)}
          realtimeBalance={null}
          enableWishlist={pocket.enableWishlist}
          isTogglingWishlist={isTogglingWishlist}
          onToggleRealtime={() => {
            console.log('[App] Toggle realtime mode:', !isTimelineRealtimeMode);
            setIsTimelineRealtimeMode(!isTimelineRealtimeMode);
          }}
          onToggleWishlist={async () => {
            setIsTogglingWishlist(true);
            try {
              await updatePocket(selectedYear, selectedMonth, pocket.id, {
                enableWishlist: !pocket.enableWishlist
              });
              toast.success(!pocket.enableWishlist ? 'Wishlist diaktifkan' : 'Wishlist dinonaktifkan');
            } catch (error) {
              console.error('Failed to toggle wishlist:', error);
              toast.error('Gagal mengubah simulasi wishlist');
            } finally {
              setIsTogglingWishlist(false);
            }
          }}
          onTransfer={() => {
            setShowTimelineDrawer(false);
            startTransition(() => {
              setDefaultFromPocket(pocket.id);
              setDefaultToPocket(undefined);
              setIsTransferDialogOpen(true);
            });
          }}
          onAddFunds={() => {
            setShowTimelineDrawer(false);
            // Open transfer dialog with this pocket as target (for income)
            handleOpenTransferDialog(pocket.id);
          }}
          onEditPocket={() => {
            setShowTimelineDrawer(false);
            startTransition(() => {
              setEditingPocket(pocket);
              setManagePocketsInitialMode('edit');
              setIsManagePocketsDialogOpen(true);
            });
          }}
          onDeletePocket={() => {
            setShowTimelineDrawer(false);
            // Open manage pockets in delete mode
            startTransition(() => {
              setEditingPocket(pocket);
              setManagePocketsInitialMode('delete');
              setIsManagePocketsDialogOpen(true);
            });
          }}
          onSetBudget={() => {
            setShowTimelineDrawer(false);
            startTransition(() => {
              setIsBudgetDialogOpen(true);
            });
          }}
        />
      );
    })()}
    
    {/* Wishlist Dialog - For Tab 2 Pockets - OUTSIDE AnimatePresence */}
    {wishlistPocket && (() => {
      // Use wishlistPocket directly - no need to lookup again
      const pocket = wishlistPocket;
      
      return isMobile ? (
        <Drawer open={showWishlistDialog} onOpenChange={setShowWishlistDialog}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>Simulasi Wishlist - {pocket.name}</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <WishlistSimulation
                pocketId={pocket.id}
                pocketName={pocket.name}
                pocketColor={pocket.color || '#3b82f6'}
                monthKey={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showWishlistDialog} onOpenChange={setShowWishlistDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Simulasi Wishlist - {pocket.name}</DialogTitle>
            </DialogHeader>
            <WishlistSimulation
              pocketId={pocket.id}
              pocketName={pocket.name}
              pocketColor={pocket.color || '#3b82f6'}
              monthKey={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
            />
          </DialogContent>
        </Dialog>
      );
    })()}
  </>
  );
}

export default function App() {
  // Apply dark mode to the document
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ErrorBoundary>
      <DialogStackProvider>
        <AppContent />
      </DialogStackProvider>
    </ErrorBoundary>
  );
}