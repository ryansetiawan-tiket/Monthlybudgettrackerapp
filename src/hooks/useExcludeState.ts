import { useState, useCallback } from 'react';
import { getBaseUrl } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function useExcludeState() {
  console.log('[useExcludeState] Hook called - starting initialization');
  
  const [excludedExpenseIds, setExcludedExpenseIds] = useState<Set<string>>(new Set());
  const [excludedIncomeIds, setExcludedIncomeIds] = useState<Set<string>>(new Set());
  const [isDeductionExcluded, setIsDeductionExcluded] = useState(false);
  const [isExcludeLocked, setIsExcludeLocked] = useState(false);
  
  console.log('[useExcludeState] State initialized, excludedExpenseIds is Set:', excludedExpenseIds instanceof Set);

  const baseUrl = getBaseUrl(projectId);

  // Load exclude state from backend
  const loadExcludeState = useCallback(async (year: number, month: number) => {
    try {
      const response = await fetch(
        `${baseUrl}/exclude-state/${year}/${month}`,
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
      
      if (data.locked) {
        setIsExcludeLocked(true);
        setExcludedExpenseIds(new Set(data.excludedExpenseIds || []));
        setExcludedIncomeIds(new Set(data.excludedIncomeIds || []));
        setIsDeductionExcluded(data.isDeductionExcluded || false);
      } else {
        setIsExcludeLocked(false);
        // Clear excluded IDs if unlocked
        setExcludedExpenseIds(new Set());
        setExcludedIncomeIds(new Set());
        setIsDeductionExcluded(false);
      }
    } catch (error) {
      console.error("Error loading exclude state:", error);
      // Don't show error toast on initial load
    }
  }, [baseUrl]);

  // Save exclude state to backend
  const saveExcludeState = useCallback(async (
    year: number,
    month: number,
    locked: boolean,
    expenseIds: Set<string>,
    incomeIds: Set<string>,
    deductionExcluded: boolean
  ) => {
    try {
      const response = await fetch(
        `${baseUrl}/exclude-state/${year}/${month}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locked,
            excludedExpenseIds: Array.from(expenseIds),
            excludedIncomeIds: Array.from(incomeIds),
            isDeductionExcluded: deductionExcluded,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save exclude state");
      }

      return true;
    } catch (error) {
      console.error("Error saving exclude state:", error);
      toast.error("Gagal menyimpan status exclude");
      return false;
    }
  }, [baseUrl]);

  // Toggle exclude lock
  const toggleExcludeLock = useCallback(async (year: number, month: number) => {
    const newLocked = !isExcludeLocked;
    
    if (newLocked) {
      // When locking, save current state
      const success = await saveExcludeState(
        year,
        month,
        true,
        excludedExpenseIds,
        excludedIncomeIds,
        isDeductionExcluded
      );
      
      if (success) {
        setIsExcludeLocked(true);
        toast.success("Status exclude telah dikunci");
      }
    } else {
      // When unlocking, clear state
      const success = await saveExcludeState(
        year,
        month,
        false,
        new Set(),
        new Set(),
        false
      );
      
      if (success) {
        setIsExcludeLocked(false);
        setExcludedExpenseIds(new Set());
        setExcludedIncomeIds(new Set());
        setIsDeductionExcluded(false);
        toast.success("Status exclude telah dibuka");
      }
    }
  }, [
    isExcludeLocked,
    excludedExpenseIds,
    excludedIncomeIds,
    isDeductionExcluded,
    saveExcludeState,
  ]);

  // Update excluded expense IDs
  const updateExcludedExpenseIds = useCallback(async (
    year: number,
    month: number,
    newIds: Set<string>
  ) => {
    if (isExcludeLocked) {
      return false;
    }

    setExcludedExpenseIds(newIds);
    return true;
  }, [isExcludeLocked]);

  // Update excluded income IDs
  const updateExcludedIncomeIds = useCallback(async (
    year: number,
    month: number,
    newIds: Set<string>
  ) => {
    if (isExcludeLocked) {
      return false;
    }

    setExcludedIncomeIds(newIds);
    return true;
  }, [isExcludeLocked]);

  // Toggle deduction excluded
  const toggleDeductionExcluded = useCallback(async (
    year: number,
    month: number
  ) => {
    if (isExcludeLocked) {
      return false;
    }

    setIsDeductionExcluded(prev => !prev);
    return true;
  }, [isExcludeLocked]);

  return {
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
  };
}
