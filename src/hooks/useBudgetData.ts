import { useState, useCallback, useRef } from 'react';
import { getBaseUrl } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BudgetData {
  initialBudget: number;
  carryover: number;
  notes: string;
  incomeDeduction: number;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  items?: { name: string; amount: number }[];
  color?: string;
  fromIncome?: boolean;
  currency?: string;
  originalAmount?: number;
  exchangeRate?: number;
  conversionType?: string;
  deduction?: number;
  pocketId?: string;
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
  pocketId?: string;
}

interface MonthCache {
  budget: BudgetData;
  expenses: Expense[];
  additionalIncomes: AdditionalIncome[];
  previousMonthRemaining: number | null;
}

export function useBudgetData() {
  const [budget, setBudget] = useState<BudgetData>({
    initialBudget: 0,
    carryover: 0,
    notes: "",
    incomeDeduction: 0,
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncome[]>([]);
  const [previousMonthRemaining, setPreviousMonthRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use ref for cache to avoid re-renders and dependency issues
  const cacheRef = useRef<Record<string, MonthCache>>({});

  const baseUrl = getBaseUrl(projectId);

  // Helper to get cache key
  const getCacheKey = (year: number, month: number) => 
    `${year}-${month.toString().padStart(2, '0')}`;

  // Helper to invalidate cache
  const invalidateCache = useCallback((year: number, month: number) => {
    const key = getCacheKey(year, month);
    delete cacheRef.current[key];

    // Also invalidate next month (because carryover changes)
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = year + 1;
    }
    const nextKey = getCacheKey(nextYear, nextMonth);
    delete cacheRef.current[nextKey];
  }, []);

  // Helper to update cache partially
  const updateCachePartial = useCallback((
    year: number,
    month: number,
    field: keyof MonthCache,
    value: BudgetData | Expense[] | AdditionalIncome[] | number | null
  ) => {
    const cacheKey = getCacheKey(year, month);
    const existing = cacheRef.current[cacheKey] || {
      budget: { initialBudget: 0, carryover: 0, notes: "", incomeDeduction: 0 },
      expenses: [],
      additionalIncomes: [],
      previousMonthRemaining: null,
    };
    cacheRef.current[cacheKey] = {
      ...existing,
      [field]: value,
    };
  }, []);

  // Fetch budget data with ref-based cache checking
  const fetchBudgetData = useCallback(async (year: number, month: number) => {
    const cacheKey = getCacheKey(year, month);
    
    // Check cache first using ref (always up-to-date, no stale closure)
    const cached = cacheRef.current[cacheKey];
    if (cached) {
      // Use cached data immediately
      setBudget(cached.budget);
      setExpenses(cached.expenses);
      setAdditionalIncomes(cached.additionalIncomes);
      setPreviousMonthRemaining(cached.previousMonthRemaining);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${baseUrl}/budget/${year}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch budget data");
      }

      const data = await response.json();

      setBudget(data.budget || { initialBudget: 0, carryover: 0, notes: "", incomeDeduction: 0 });
      setExpenses(data.expenses || []);
      setAdditionalIncomes(data.additionalIncomes || []);
      setPreviousMonthRemaining(data.previousMonthRemaining ?? null);

      // Cache the result in ref
      cacheRef.current[cacheKey] = {
        budget: data.budget || { initialBudget: 0, carryover: 0, notes: "", incomeDeduction: 0 },
        expenses: data.expenses || [],
        additionalIncomes: data.additionalIncomes || [],
        previousMonthRemaining: data.previousMonthRemaining ?? null,
      };
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  return {
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
    cache: cacheRef.current, // Expose cache for debugging/inspection only
    fetchBudgetData,
    invalidateCache,
    updateCachePartial,
    getCacheKey,
  };
}
