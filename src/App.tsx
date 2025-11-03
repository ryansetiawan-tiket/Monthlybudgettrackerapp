import { useState, useEffect, useCallback } from "react";
import { MonthSelector } from "./components/MonthSelector";
import { BudgetOverview } from "./components/BudgetOverview";
import { BudgetForm } from "./components/BudgetForm";
import { AddExpenseDialog } from "./components/AddExpenseDialog";
import { AddAdditionalIncomeDialog } from "./components/AddAdditionalIncomeDialog";
import { ExpenseList } from "./components/ExpenseList";
import { AdditionalIncomeList } from "./components/AdditionalIncomeList";
import { FixedExpenseTemplate } from "./components/FixedExpenseTemplates";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import { Plus, DollarSign } from "lucide-react";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { funnyQuotes } from "./data/funny-quotes";
import { motion, AnimatePresence } from "motion/react";

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
  
  const [budget, setBudget] = useState<BudgetData>({
    initialBudget: 0,
    carryover: 0,
    notes: "",
    incomeDeduction: 0,
  });
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncome[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previousMonthRemaining, setPreviousMonthRemaining] = useState<number | null>(null);
  const [isLoadingCarryover, setIsLoadingCarryover] = useState(false);
  const [templates, setTemplates] = useState<FixedExpenseTemplate[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [excludedExpenseIds, setExcludedExpenseIds] = useState<Set<string>>(new Set());
  const [excludedIncomeIds, setExcludedIncomeIds] = useState<Set<string>>(new Set());
  const [isDeductionExcluded, setIsDeductionExcluded] = useState(false);
  const [isExcludeLocked, setIsExcludeLocked] = useState(false);

  // Client-side cache for month data
  const [cache, setCache] = useState<Record<string, MonthCache>>({});

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1`;

  // Helper to get cache key
  const getCacheKey = (year: number, month: number) => `${year}-${month.toString().padStart(2, '0')}`;

  // Helper to invalidate cache
  const invalidateCache = (year: number, month: number) => {
    const key = getCacheKey(year, month);
    setCache((prev) => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });

    // Also invalidate next month (because carryover changes)
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = year + 1;
    }
    const nextKey = getCacheKey(nextYear, nextMonth);
    setCache((prev) => {
      const newCache = { ...prev };
      delete newCache[nextKey];
      return newCache;
    });
  };

  // Helper to update cache partially
  const updateCachePartial = (
    field: keyof MonthCache, 
    value: BudgetData | Expense[] | AdditionalIncome[] | number | null
  ) => {
    const cacheKey = getCacheKey(selectedYear, selectedMonth);
    setCache((prev) => {
      const existing = prev[cacheKey] || {
        budget: { initialBudget: 0, carryover: 0, notes: "", incomeDeduction: 0 },
        expenses: [],
        additionalIncomes: [],
        previousMonthRemaining: null,
      };
      return {
        ...prev,
        [cacheKey]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  // Load exclude state from backend
  const loadExcludeState = useCallback(async () => {
    try {
      const response = await fetch(
        `${baseUrl}/exclude-state/${selectedYear}/${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load exclude state");
      }

      const data = await response.json();
      
      console.log('Loaded exclude state from backend:', data);
      
      if (data.locked) {
        setIsExcludeLocked(true);
        setExcludedExpenseIds(new Set(data.excludedExpenseIds || []));
        setExcludedIncomeIds(new Set(data.excludedIncomeIds || []));
        setIsDeductionExcluded(data.isDeductionExcluded || false);
        console.log('Applied exclude state - excludedExpenseIds:', data.excludedExpenseIds);
      } else {
        console.log('Exclude state not locked, resetting to defaults');
      }
    } catch (error) {
      console.log(`Error loading exclude state: ${error}`);
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey]);

  useEffect(() => {
    const cacheKey = getCacheKey(selectedYear, selectedMonth);
    const cachedData = cache[cacheKey];

    // Reset excluded expenses and incomes when month changes (will be overridden by loadExcludeState if locked)
    setExcludedExpenseIds(new Set());
    setExcludedIncomeIds(new Set());
    setIsDeductionExcluded(false);
    setIsExcludeLocked(false);

    if (cachedData) {
      // Use cached data - instant load!
      setBudget(cachedData.budget);
      setExpenses(cachedData.expenses);
      setAdditionalIncomes(cachedData.additionalIncomes);
      setPreviousMonthRemaining(cachedData.previousMonthRemaining);
      setIsLoading(false);
      setIsLoadingCarryover(false);
      
      // Load templates if not loaded yet (templates are global, not month-specific)
      if (templates.length === 0) {
        loadTemplates();
      }
      
      // Load exclude state (might override reset above if locked)
      loadExcludeState();
    } else {
      // No cache - fetch from server
      loadBudgetData();
      loadExpenses();
      loadAdditionalIncomes();
      loadPreviousMonthData();
      loadTemplates();
      loadExcludeState();
    }
  }, [selectedMonth, selectedYear, loadExcludeState]);

  const loadBudgetData = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/budget/${selectedYear}/${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load budget data");
      }

      const data = await response.json();
      setBudget(data);
      
      // Update cache with loaded data
      updateCachePartial('budget', data);
    } catch (error) {
      console.log(`Error loading budget data: ${error}`);
      toast.error("Gagal memuat data budget");
    } finally {
      setIsLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/expenses/${selectedYear}/${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load expenses");
      }

      const data = await response.json();
      console.log('Expenses loaded from server:', data);
      setExpenses(data);
      
      // Update cache with loaded data
      updateCachePartial('expenses', data);
    } catch (error) {
      console.log(`Error loading expenses: ${error}`);
      toast.error("Gagal memuat data pengeluaran");
    }
  };

  const loadAdditionalIncomes = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/additional-income/${selectedYear}/${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load additional incomes");
      }

      const data = await response.json();
      console.log('Additional incomes loaded from server:', data);
      setAdditionalIncomes(data);
      
      // Update cache with loaded data
      updateCachePartial('additionalIncomes', data);
    } catch (error) {
      console.log(`Error loading additional incomes: ${error}`);
      toast.error("Gagal memuat data pemasukan tambahan");
    }
  };

  const loadPreviousMonthData = async () => {
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
      console.log(`Error loading previous month data: ${error}`);
      setPreviousMonthRemaining(null);
    } finally {
      setIsLoadingCarryover(false);
    }
  };

  const loadTemplates = async () => {
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
      console.log(`Error loading templates: ${error}`);
    }
  };

  const saveExcludeState = useCallback(async () => {
    if (!isExcludeLocked) return;
    
    try {
      const response = await fetch(
        `${baseUrl}/exclude-state/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            locked: true,
            excludedExpenseIds: Array.from(excludedExpenseIds),
            excludedIncomeIds: Array.from(excludedIncomeIds),
            isDeductionExcluded,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to save exclude state: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.log(`Error saving exclude state: ${error}`);
      console.error("Full error details:", error);
    }
  }, [isExcludeLocked, selectedYear, selectedMonth, excludedExpenseIds, excludedIncomeIds, isDeductionExcluded, baseUrl, publicAnonKey]);

  const handleToggleExcludeLock = async () => {
    try {
      console.log('Toggle exclude lock - isExcludeLocked:', isExcludeLocked);
      console.log('URL:', `${baseUrl}/exclude-state/${selectedYear}/${selectedMonth}`);
      
      if (!isExcludeLocked) {
        // Lock: Save current state
        console.log('Locking with data:', {
          locked: true,
          excludedExpenseIds: Array.from(excludedExpenseIds),
          excludedIncomeIds: Array.from(excludedIncomeIds),
          isDeductionExcluded,
        });
        
        const response = await fetch(
          `${baseUrl}/exclude-state/${selectedYear}/${selectedMonth}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              locked: true,
              excludedExpenseIds: Array.from(excludedExpenseIds),
              excludedIncomeIds: Array.from(excludedIncomeIds),
              isDeductionExcluded,
            }),
          }
        );

        console.log('Lock response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Lock error data:', errorData);
          throw new Error(`Failed to lock exclude state: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        console.log('Lock success:', result);

        setIsExcludeLocked(true);
        toast.success("Exclude state di-lock - perubahan akan tersimpan");
      } else {
        // Unlock: Delete saved state and reset
        console.log('Unlocking...');
        
        const response = await fetch(
          `${baseUrl}/exclude-state/${selectedYear}/${selectedMonth}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        console.log('Unlock response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Unlock error data:', errorData);
          throw new Error(`Failed to unlock exclude state: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        console.log('Unlock success:', result);

        setIsExcludeLocked(false);
        setExcludedExpenseIds(new Set());
        setExcludedIncomeIds(new Set());
        setIsDeductionExcluded(false);
        toast.success("Exclude state di-unlock - reset ke default");
      }
    } catch (error) {
      console.log(`Error toggling exclude lock: ${error}`);
      toast.error(`Gagal toggle exclude lock: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Auto-save exclude state when it changes (only if locked)
  useEffect(() => {
    if (isExcludeLocked) {
      saveExcludeState();
    }
  }, [excludedExpenseIds, excludedIncomeIds, isDeductionExcluded, isExcludeLocked, saveExcludeState]);

  const handleAddTemplate = async (name: string, items: Array<{name: string, amount: number}>, color?: string) => {
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
      console.log(`Error adding template: ${error}`);
      toast.error("Gagal menambahkan template");
    }
  };

  const handleUpdateTemplate = async (id: string, name: string, items: Array<{name: string, amount: number}>, color?: string) => {
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
      console.log(`Error updating template: ${error}`);
      toast.error("Gagal mengupdate template");
    }
  };

  const syncColorToExpenses = async (templateName: string, color?: string) => {
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
      console.log(`Error syncing color to expenses: ${error}`);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
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
      console.log(`Error deleting template: ${error}`);
      toast.error("Gagal menghapus template");
    }
  };

  const handleBudgetChange = (field: string, value: string | number) => {
    setBudget((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveBudget = async () => {
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
      console.log(`Error saving budget: ${error}`);
      toast.error("Gagal menyimpan budget");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExpense = async (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string) => {
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
          body: JSON.stringify({ name, amount, date, items, color }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const result = await response.json();
      const newExpenses = [...expenses, result.data];
      setExpenses(newExpenses);
      
      // Update cache
      updateCachePartial('expenses', newExpenses);
      // Invalidate next month's cache (carryover changes)
      invalidateCache(selectedYear, selectedMonth);
      
      toast.success("Pengeluaran berhasil ditambahkan");
    } catch (error) {
      console.log(`Error adding expense: ${error}`);
      toast.error("Gagal menambahkan pengeluaran");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
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
      updateCachePartial('expenses', newExpenses);
      // Invalidate next month's cache (carryover changes)
      invalidateCache(selectedYear, selectedMonth);
      
      toast.success("Pengeluaran berhasil dihapus");
    } catch (error) {
      console.log(`Error deleting expense: ${error}`);
      toast.error("Gagal menghapus pengeluaran");
    }
  };

  const handleEditExpense = async (id: string, updatedExpense: Omit<Expense, 'id'>) => {
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
      updateCachePartial('expenses', newExpenses);
      // Invalidate next month's cache (carryover changes)
      invalidateCache(selectedYear, selectedMonth);
      
      toast.success("Pengeluaran berhasil diupdate");
    } catch (error) {
      console.log(`Error editing expense: ${error}`);
      toast.error("Gagal mengupdate pengeluaran");
    }
  };

  const handleAddIncome = async (income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
    deduction: number;
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
      toast.success("Pemasukan tambahan berhasil ditambahkan");
    } catch (error) {
      console.log(`Error adding additional income: ${error}`);
      toast.error("Gagal menambahkan pemasukan tambahan");
    } finally {
      setIsAddingIncome(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
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
      toast.success("Pemasukan tambahan berhasil dihapus");
    } catch (error) {
      console.log(`Error deleting additional income: ${error}`);
      toast.error("Gagal menghapus pemasukan tambahan");
    }
  };

  const handleMoveIncomeToExpense = async (income: AdditionalIncome) => {
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
      console.log('Moving income to expense - Income data:', income);
      console.log('Moving income to expense - Server response:', result.data);
      
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
      console.log('Moving income to expense - Final expense object:', expenseWithFlag);
      
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
      
      toast.success(`"${income.name}" dipindahkan ke pengeluaran`);
    } catch (error) {
      console.log(`Error moving income to expense: ${error}`);
      toast.error("Gagal memindahkan ke pengeluaran");
    }
  };

  const handleMoveExpenseToIncome = async (expense: Expense) => {
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
      
      toast.success(`"${expense.name}" dikembalikan ke pemasukan tambahan`);
    } catch (error) {
      console.log(`Error moving expense to income: ${error}`);
      toast.error("Gagal mengembalikan ke pemasukan");
    }
  };

  const handleUpdateIncome = async (id: string, income: {
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
      toast.success("Pemasukan tambahan berhasil diupdate");
      
      // Reload previous month data if this might affect next month's carryover
      loadPreviousMonthData();
    } catch (error) {
      console.log(`Error updating additional income: ${error}`);
      toast.error("Gagal mengupdate pemasukan tambahan");
    }
  };

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
      
      if (failures.length > 0) {
        console.log(`Some deletes failed: ${failures.length} out of ${ids.length}`);
      }

      // Update local state - remove successfully deleted items
      setExpenses(prev => prev.filter(exp => !ids.includes(exp.id)));
      
      // Update cache after state update
      const newExpenses = expenses.filter(exp => !ids.includes(exp.id));
      updateCachePartial('expenses', newExpenses);
      
      // Invalidate next month's cache (carryover changes)
      invalidateCache(selectedYear, selectedMonth);

      if (failures.length > 0 && successes.length > 0) {
        toast.warning(`${successes.length} dari ${ids.length} pengeluaran berhasil dihapus`);
      } else if (failures.length > 0) {
        throw new Error("All deletes failed");
      }
    } catch (error) {
      console.log(`Error bulk deleting expenses: ${error}`);
      throw error; // Re-throw to be caught by ExpenseList
    }
  }, [baseUrl, selectedYear, selectedMonth, publicAnonKey, expenses, updateCachePartial, invalidateCache]);

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsLoading(true);
  };

  const handleUpdateGlobalDeduction = async (deduction: number) => {
    const newBudget = { ...budget, incomeDeduction: deduction };
    setBudget(newBudget);
    
    // Update cache
    updateCachePartial('budget', newBudget);
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
      console.log(`Error saving global deduction: ${error}`);
      toast.error("Gagal menyimpan potongan");
    }
  };

  // Calculate gross additional income excluding excluded items and apply individual deductions
  const grossAdditionalIncome = additionalIncomes
    .filter(income => !excludedIncomeIds.has(income.id))
    .reduce((sum, income) => {
      const netAmount = income.amountIDR - (income.deduction || 0);
      return sum + netAmount;
    }, 0);
  // Apply global deduction only if not excluded
  const appliedDeduction = isDeductionExcluded ? 0 : (budget.incomeDeduction || 0);
  const totalAdditionalIncome = grossAdditionalIncome - appliedDeduction;
  const totalIncome =
    Number(budget.initialBudget) +
    Number(budget.carryover) +
    totalAdditionalIncome;
  // Calculate total expenses excluding excluded items
  // Items from income (fromIncome: true) add to budget instead of subtracting
  const totalExpenses = expenses
    .filter(expense => !excludedExpenseIds.has(expense.id))
    .reduce((sum, expense) => {
      if (expense.fromIncome) {
        return sum - expense.amount; // Subtract from expenses (adds to budget)
      }
      return sum + expense.amount;
    }, 0);
  const remainingBudget = totalIncome - totalExpenses;

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
              onOpenBudgetSettings={() => setIsBudgetDialogOpen(true)}
            />
          </motion.div>

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

          <AddExpenseDialog 
            open={isExpenseDialogOpen}
            onOpenChange={setIsExpenseDialogOpen}
            onAddExpense={handleAddExpense} 
            isAdding={isAdding} 
            templates={templates}
            onAddTemplate={handleAddTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />

          <AddAdditionalIncomeDialog 
            open={isIncomeDialogOpen}
            onOpenChange={setIsIncomeDialogOpen}
            onAddIncome={handleAddIncome}
            isAdding={isAddingIncome}
          />

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
                  onClick={() => setIsExpenseDialogOpen(true)}
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
                  onExcludedIdsChange={setExcludedExpenseIds}
                  onMoveToIncome={handleMoveExpenseToIncome}
                  isExcludeLocked={isExcludeLocked}
                  onToggleExcludeLock={handleToggleExcludeLock}
                />
              </TabsContent>

              <TabsContent value="income" className="space-y-3 mt-4">
                <Button 
                  onClick={() => setIsIncomeDialogOpen(true)}
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
                  onExcludedIdsChange={setExcludedIncomeIds}
                  isDeductionExcluded={isDeductionExcluded}
                  onDeductionExcludedChange={setIsDeductionExcluded}
                  onMoveToExpense={handleMoveIncomeToExpense}
                  isExcludeLocked={isExcludeLocked}
                  onToggleExcludeLock={handleToggleExcludeLock}
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