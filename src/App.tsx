import { useState, useEffect, useCallback, useMemo, lazy, Suspense, startTransition } from "react";
import { MonthSelector } from "./components/MonthSelector";
import { BudgetOverview } from "./components/BudgetOverview";
import { BudgetForm } from "./components/BudgetForm";
import { ExpenseList } from "./components/ExpenseList";
import { AdditionalIncomeList } from "./components/AdditionalIncomeList";
import { FixedExpenseTemplate } from "./components/FixedExpenseTemplates";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { PocketsSummary } from "./components/PocketsSummary";

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
import DialogSkeleton from "./components/DialogSkeleton";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { useRealtimeSubscription } from "./utils/supabase/useRealtimeSubscription";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import { Plus, DollarSign } from "lucide-react";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { funnyQuotes } from "./data/funny-quotes";
import { motion, AnimatePresence } from "motion/react";
import { getBaseUrl, createAuthHeaders } from "./utils/api";
import { formatCurrency } from "./utils/currency";
import { useBudgetData } from "./hooks/useBudgetData";
import { usePockets } from "./hooks/usePockets";
import { useExcludeState } from "./hooks/useExcludeState";

interface BudgetData {
  initialBudget: number;
  carryover: number;
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
  createdAt?: string;
}

interface MonthCache {
  budget: BudgetData;
  expenses: Expense[];
  additionalIncomes: AdditionalIncome[];
  previousMonthRemaining: number | null;
}

export default function App() {
  // Apply dark mode to the document
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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

  // Custom Hooks - Exclude State Management
  const {
    excludedExpenseIds,
    setExcludedExpenseIds,
    excludedIncomeIds,
    setExcludedIncomeIds,
    isDeductionExcluded,
    setIsDeductionExcluded,
    isExcludeLocked,
    setIsExcludeLocked,
    loadExcludeState,
    saveExcludeState,
    toggleExcludeLock,
    updateExcludedExpenseIds,
    updateExcludedIncomeIds,
    toggleDeductionExcluded,
  } = useExcludeState();

  // Local UI states
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [isLoadingCarryover, setIsLoadingCarryover] = useState(false);
  const [templates, setTemplates] = useState<FixedExpenseTemplate[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  
  // Show/Hide Pockets state (persistent)
  const [showPockets, setShowPockets] = useState(() => {
    const saved = localStorage.getItem('showPockets');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const baseUrl = getBaseUrl(projectId);



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
      toast.error(error.message || "Gagal mengarsipkan kantong");
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
      toast.error(error.message || "Gagal memulihkan kantong");
      throw error;
    }
  };

  useEffect(() => {
    // Always fetch from server - no cache check at component level
    // fetchBudgetData will handle caching internally through setState
    fetchBudgetData(selectedYear, selectedMonth);
    
    // Reset excluded expenses and incomes when month changes (will be overridden by loadExcludeState if locked)
    setExcludedExpenseIds(new Set());
    setExcludedIncomeIds(new Set());
    setIsDeductionExcluded(false);
    setIsExcludeLocked(false);
    
    // Load templates if not loaded yet (templates are global, not month-specific)
    if (templates.length === 0) {
      loadTemplates();
    }
    
    // Load exclude state (might override reset above if locked)
    loadExcludeState(selectedYear, selectedMonth);
    
    // Load pockets (includes archived and balances)
    fetchPockets(selectedYear, selectedMonth);
  }, [selectedMonth, selectedYear, fetchBudgetData, loadExcludeState, fetchPockets]);

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
      } else if (key.includes('exclude_state_')) {
        loadExcludeState(selectedYear, selectedMonth);
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
      } else if (key.includes('exclude_state_')) {
        loadExcludeState(selectedYear, selectedMonth);
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
      } else if (key.includes('exclude_state_')) {
        loadExcludeState(selectedYear, selectedMonth);
      }
    },
    enabled: true
  });

  // These functions are no longer needed - using fetchBudgetData from hook instead
  // Keeping them commented for reference during migration
  // const loadBudgetData, loadExpenses, loadAdditionalIncomes - removed (use fetchBudgetData from hook)

  const loadPreviousMonthData = useCallback(async () => {
    setIsLoadingCarryover(true);
    try {
      // Calculate previous month and year
      let prevMonth = selectedMonth - 1;
      let prevYear = selectedYear;
      
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = selectedYear - 1;
      }

      // Fetch budget data
      const budgetResponse = await fetch(
        `${baseUrl}/budget/${prevYear}/${prevMonth}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!budgetResponse.ok) {
        throw new Error("Failed to load previous month budget data");
      }

      const budgetData = await budgetResponse.json();

      // Fetch expenses
      const expensesResponse = await fetch(
        `${baseUrl}/expenses/${prevYear}/${prevMonth}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const expensesData = expensesResponse.ok ? await expensesResponse.json() : [];

      // Fetch additional incomes
      const incomesResponse = await fetch(
        `${baseUrl}/additional-income/${prevYear}/${prevMonth}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const incomesData = incomesResponse.ok ? await incomesResponse.json() : [];

      // Calculate remaining budget
      const prevGrossIncome = incomesData.reduce(
        (sum: number, income: AdditionalIncome) => sum + income.amountIDR,
        0
      );
      const prevTotalAdditionalIncome = prevGrossIncome - (budgetData.incomeDeduction || 0);
      const prevTotalIncome =
        Number(budgetData.initialBudget || 0) +
        Number(budgetData.carryover || 0) +
        prevTotalAdditionalIncome;
      const prevTotalExpenses = expensesData.reduce(
        (sum: number, expense: Expense) => sum + expense.amount,
        0
      );
      const remaining = prevTotalIncome - prevTotalExpenses;

      setPreviousMonthRemaining(remaining);
    } catch (error) {
      setPreviousMonthRemaining(null);
    } finally {
      setIsLoadingCarryover(false);
    }
  }, [selectedMonth, selectedYear, baseUrl, publicAnonKey]);

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

  // Auto-save exclude state when it changes (only if locked)
  useEffect(() => {
    if (isExcludeLocked) {
      saveExcludeState(selectedYear, selectedMonth, true, excludedExpenseIds, excludedIncomeIds, isDeductionExcluded);
    }
  }, [excludedExpenseIds, excludedIncomeIds, isDeductionExcluded, isExcludeLocked, saveExcludeState, selectedYear, selectedMonth]);

  const handleAddTemplate = useCallback(async (name: string, items: Array<{name: string, amount: number}>, color?: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name, items, color }),
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

  const handleUpdateTemplate = useCallback(async (id: string, name: string, items: Array<{name: string, amount: number}>, color?: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/templates/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name, items, color }),
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

  const handleAddExpense = useCallback(async (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string, pocketId?: string) => {
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
          body: JSON.stringify({ name, amount, date, items, color, pocketId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const result = await response.json();
      const newExpenses = [...expenses, result.data];
      setExpenses(newExpenses);
      
      // Update cache
      updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
      // Invalidate next month's cache (carryover changes)
      invalidateCache(selectedYear, selectedMonth);
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      toast.success("Pengeluaran berhasil ditambahkan");
    } catch (error) {
      toast.error("Gagal menambahkan pengeluaran");
    } finally {
      setIsAdding(false);
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, expenses, updateCachePartial, invalidateCache, fetchPockets, refreshPockets]);

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

      const newExpenses = expenses.filter((expense) => expense.id !== id);
      setExpenses(newExpenses);
      
      // Update cache
      updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
      // Invalidate next month's cache (carryover changes)
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
      // Preserve fromIncome flag if it exists in the update
      const updatedData = updatedExpense.fromIncome ? { ...result.data, fromIncome: true } : result.data;
      const newExpenses = expenses.map((expense) => (expense.id === id ? updatedData : expense));
      setExpenses(newExpenses);
      
      // Update cache
      updateCachePartial(selectedYear, selectedMonth, 'expenses', newExpenses);
      // Invalidate next month's cache (carryover changes)
      invalidateCache(selectedYear, selectedMonth);
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      toast.success("Pengeluaran berhasil diupdate");
    } catch (error) {
      toast.error("Gagal mengupdate pengeluaran");
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, expenses, updateCachePartial, invalidateCache, fetchPockets, refreshPockets]);

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
      setAdditionalIncomes((prev) => [...prev, result.data]);
      
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
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, fetchPockets, refreshPockets]);

  const handleOpenIncomeDialog = useCallback((targetPocketId?: string) => {
    startTransition(() => {
      setDefaultTargetPocket(targetPocketId);
      setIsIncomeDialogOpen(true);
    });
  }, [setDefaultTargetPocket]);

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

  const handleMoveIncomeToExpense = useCallback(async (income: AdditionalIncome) => {
    try {
      // Add as expense with fromIncome flag and preserve all conversion data
      const response = await fetch(
        `${baseUrl}/expenses/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            name: income.name, 
            amount: income.amountIDR - (income.deduction || 0), // Nilai bersih (net amount)
            date: income.date,
            fromIncome: true,
            currency: income.currency,
            originalAmount: income.amount,
            exchangeRate: income.exchangeRate,
            conversionType: income.conversionType,
            deduction: income.deduction || 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const result = await response.json();
      
      // Ensure fromIncome flag is set (workaround if server didn't save it)
      const expenseWithFlag = {
        ...result.data,
        fromIncome: true,
        currency: income.currency,
        originalAmount: income.amount,
        exchangeRate: income.exchangeRate,
        conversionType: income.conversionType,
        deduction: income.deduction || 0,
      };
      
      // Delete from income
      const deleteResponse = await fetch(
        `${baseUrl}/additional-income/${selectedYear}/${selectedMonth}/${income.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete income");
      }

      // Update states with the flagged expense
      setExpenses((prev) => [...prev, expenseWithFlag]);
      setAdditionalIncomes((prev) => prev.filter((inc) => inc.id !== income.id));
      
      // Invalidate cache (both income and expense changed)
      invalidateCache(selectedYear, selectedMonth);
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      toast.success(`"${income.name}" dipindahkan ke pengeluaran`);
    } catch (error) {
      toast.error("Gagal memindahkan ke pengeluaran");
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, invalidateCache, fetchPockets, refreshPockets]);

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
      setAdditionalIncomes((prev) =>
        prev.map((item) => (item.id === id ? result.data : item))
      );
      
      // Reload pockets to update balances
      await fetchPockets(selectedYear, selectedMonth);
      
      // Trigger refresh for PocketsSummary timeline
      refreshPockets();
      
      toast.success("Pemasukan tambahan berhasil diupdate");
      
      // Reload previous month data if this might affect next month's carryover
      loadPreviousMonthData();
    } catch (error) {
      toast.error("Gagal mengupdate pemasukan tambahan");
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, fetchPockets, refreshPockets, loadPreviousMonthData]);

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
      
      // Invalidate next month's cache (carryover changes)
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

  const handleUpdateGlobalDeduction = useCallback(async (deduction: number) => {
    const newBudget = { ...budget, incomeDeduction: deduction };
    setBudget(newBudget);
    
    // Update cache
    updateCachePartial(selectedYear, selectedMonth, 'budget', newBudget);
    // Invalidate next month's cache (carryover changes)
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

  // Calculate gross additional income excluding excluded items and apply individual deductions
  // Memoized for performance - only recomputes when dependencies change
  const grossAdditionalIncome = useMemo(() => 
    additionalIncomes
      .filter(income => !excludedIncomeIds.has(income.id))
      .reduce((sum, income) => {
        const netAmount = income.amountIDR - (income.deduction || 0);
        return sum + netAmount;
      }, 0),
    [additionalIncomes, excludedIncomeIds]
  );

  // Apply global deduction only if not excluded
  const totalAdditionalIncome = useMemo(() => {
    const appliedDeduction = isDeductionExcluded ? 0 : (budget.incomeDeduction || 0);
    return grossAdditionalIncome - appliedDeduction;
  }, [grossAdditionalIncome, isDeductionExcluded, budget.incomeDeduction]);

  // Calculate total income from all sources
  const totalIncome = useMemo(() =>
    Number(budget.initialBudget) +
    Number(budget.carryover) +
    totalAdditionalIncome,
    [budget.initialBudget, budget.carryover, totalAdditionalIncome]
  );

  // Calculate total expenses excluding excluded items
  // Items from income (fromIncome: true) add to budget instead of subtracting
  const totalExpenses = useMemo(() => 
    expenses
      .filter(expense => !excludedExpenseIds.has(expense.id))
      .reduce((sum, expense) => {
        if (expense.fromIncome) {
          return sum - expense.amount; // Subtract from expenses (adds to budget)
        }
        return sum + expense.amount;
      }, 0),
    [expenses, excludedExpenseIds]
  );

  // Calculate remaining budget
  const remainingBudget = useMemo(() => 
    totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${selectedYear}-${selectedMonth}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen bg-background p-4 md:p-6 lg:p-8"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-2 pt-2"
          >
            <h1>Budget Tracker</h1>
            <p className="text-muted-foreground">{randomQuote || "Kelola budget bulanan Anda dengan mudah"}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <MonthSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={handleMonthChange}
            />
          </motion.div>

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
              onAddIncomeClick={handleOpenIncomeDialog}
              onManagePocketsClick={() => {
                startTransition(() => {
                  setEditingPocket(null);
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

          <Suspense fallback={<DialogSkeleton />}>
            {isTransferDialogOpen && (
              <TransferDialog
                open={isTransferDialogOpen}
                onOpenChange={(open) => {
                  setIsTransferDialogOpen(open);
                  if (!open) {
                    // Reset defaults when closing
                    setDefaultFromPocket(undefined);
                    setDefaultToPocket(undefined);
                  }
                }}
                pockets={pockets}
                balances={balances}
                onTransfer={handleTransfer}
                defaultFromPocket={defaultFromPocket}
                defaultToPocket={defaultToPocket}
              />
            )}
          </Suspense>

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
              />
            )}
          </Suspense>

          <BudgetForm
            open={isBudgetDialogOpen}
            onOpenChange={setIsBudgetDialogOpen}
            initialBudget={budget.initialBudget}
            carryover={budget.carryover}
            notes={budget.notes}
            onBudgetChange={handleBudgetChange}
            onSave={handleSaveBudget}
            isSaving={isSaving}
            suggestedCarryover={previousMonthRemaining}
            isLoadingCarryover={isLoadingCarryover}
          />

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
              />
            )}
          </Suspense>

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
              />
            )}
          </Suspense>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="expenses"
                  className="data-[state=active]:bg-[rgba(255,76,76,0.1)] data-[state=active]:border-[#ff4c4c] data-[state=active]:text-neutral-50"
                >
                  Pengeluaran
                </TabsTrigger>
                <TabsTrigger 
                  value="income"
                  className="data-[state=active]:bg-[rgba(34,197,94,0.1)] data-[state=active]:border-[#22c55e] data-[state=active]:text-neutral-50"
                >
                  Pemasukan Tambahan
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses" className="space-y-3 mt-4">
                <Button 
                  onClick={() => startTransition(() => setIsExpenseDialogOpen(true))}
                  variant="outline"
                  className="w-full border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-600 dark:text-red-400"
                >
                  <Plus className="size-4 mr-2" />
                  Tambah Pengeluaran
                </Button>
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={handleDeleteExpense} 
                  onEditExpense={handleEditExpense}
                  onBulkDeleteExpenses={handleBulkDeleteExpenses}
                  excludedExpenseIds={excludedExpenseIds}
                  onExcludedIdsChange={updateExcludedExpenseIds}
                  onMoveToIncome={handleMoveExpenseToIncome}
                  isExcludeLocked={isExcludeLocked}
                  onToggleExcludeLock={() => toggleExcludeLock(selectedYear, selectedMonth)}
                  pockets={pockets}
                />
              </TabsContent>

              <TabsContent value="income" className="space-y-3 mt-4">
                <Button 
                  onClick={() => startTransition(() => setIsIncomeDialogOpen(true))}
                  variant="outline"
                  className="w-full border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 text-green-600 dark:text-green-400"
                >
                  <DollarSign className="size-4 mr-2" />
                  Tambah Pemasukan
                </Button>
                <AdditionalIncomeList 
                  incomes={additionalIncomes} 
                  onDeleteIncome={handleDeleteIncome} 
                  onUpdateIncome={handleUpdateIncome} 
                  globalDeduction={budget.incomeDeduction || 0}
                  onUpdateGlobalDeduction={handleUpdateGlobalDeduction}
                  excludedIncomeIds={excludedIncomeIds}
                  onExcludedIdsChange={updateExcludedIncomeIds}
                  isDeductionExcluded={isDeductionExcluded}
                  onDeductionExcludedChange={toggleDeductionExcluded}
                  onMoveToExpense={handleMoveIncomeToExpense}
                  isExcludeLocked={isExcludeLocked}
                  onToggleExcludeLock={() => toggleExcludeLock(selectedYear, selectedMonth)}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
        
        <Toaster />
      </motion.div>
    </AnimatePresence>
  );
}