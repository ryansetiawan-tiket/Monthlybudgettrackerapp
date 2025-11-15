/**
 * useBulkSelection Hook
 * 
 * Handles bulk selection mode and operations for expenses and incomes.
 * Extracted from ExpenseList.tsx (Phase 3 - CANARY #2)
 * 
 * Features:
 * - Bulk select mode toggle
 * - Individual item selection (expense/income)
 * - Select all functionality
 * - Auto-cleanup when items change
 * - Support for both expense and income tabs
 */

import { useState, useCallback, useEffect } from 'react';
import type { Expense, AdditionalIncome } from '../types/expense';

interface UseBulkSelectionProps {
  activeTab: 'expense' | 'income';
  allSortedExpenses: Expense[];
  incomes: AdditionalIncome[];
  // Optional: For auto-cleanup when expenses/incomes change
  onSelectionChange?: (hasSelection: boolean) => void;
}

export function useBulkSelection({
  activeTab,
  allSortedExpenses,
  incomes,
  onSelectionChange,
}: UseBulkSelectionProps) {
  // Bulk select mode state
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<Set<string>>(new Set());

  // Activate bulk mode (clear selection for current tab)
  const handleActivateBulkMode = useCallback(() => {
    setIsBulkSelectMode(true);
    if (activeTab === 'expense') {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedIncomeIds(new Set());
    }
  }, [activeTab]);

  // Cancel bulk mode (clear all selections)
  const handleCancelBulkMode = useCallback(() => {
    setIsBulkSelectMode(false);
    setSelectedExpenseIds(new Set());
    setSelectedIncomeIds(new Set());
  }, []);

  // Toggle bulk mode (for toolbar)
  const handleToggleBulkMode = useCallback(() => {
    if (isBulkSelectMode) {
      handleCancelBulkMode();
    } else {
      handleActivateBulkMode();
    }
  }, [isBulkSelectMode, handleCancelBulkMode, handleActivateBulkMode]);

  // Toggle individual expense selection
  const handleToggleSelectExpense = useCallback((id: string) => {
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

  // Toggle individual income selection
  const handleToggleSelectIncome = useCallback((id: string) => {
    setSelectedIncomeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Select all expenses (toggle)
  const handleSelectAllExpenses = useCallback(() => {
    const visibleExpenses = activeTab === 'expense' ? allSortedExpenses : [];
    if (selectedExpenseIds.size === visibleExpenses.length) {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedExpenseIds(new Set(visibleExpenses.map(exp => exp.id)));
    }
  }, [activeTab, allSortedExpenses, selectedExpenseIds.size]);

  // Select all incomes (toggle)
  const handleSelectAllIncomes = useCallback(() => {
    if (selectedIncomeIds.size === incomes.length) {
      setSelectedIncomeIds(new Set());
    } else {
      setSelectedIncomeIds(new Set(incomes.map(inc => inc.id)));
    }
  }, [incomes, selectedIncomeIds.size]);

  // Unified select all handler (based on active tab)
  const handleToggleSelectAll = useCallback(() => {
    if (activeTab === 'expense') {
      handleSelectAllExpenses();
    } else {
      handleSelectAllIncomes();
    }
  }, [activeTab, handleSelectAllExpenses, handleSelectAllIncomes]);

  // Auto-cleanup: Remove selections that no longer exist
  useEffect(() => {
    if (!isBulkSelectMode) return;

    // Cleanup expense selections
    const validExpenseIds = new Set(allSortedExpenses.map(exp => exp.id));
    setSelectedExpenseIds(prev => {
      const newSet = new Set<string>();
      prev.forEach(id => {
        if (validExpenseIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });

    // Cleanup income selections
    const validIncomeIds = new Set(incomes.map(inc => inc.id));
    setSelectedIncomeIds(prev => {
      const newSet = new Set<string>();
      prev.forEach(id => {
        if (validIncomeIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [isBulkSelectMode, allSortedExpenses, incomes]);

  // Notify parent when selection changes
  useEffect(() => {
    const hasSelection = selectedExpenseIds.size > 0 || selectedIncomeIds.size > 0;
    onSelectionChange?.(hasSelection);
  }, [selectedExpenseIds.size, selectedIncomeIds.size, onSelectionChange]);

  // Computed values
  const selectedCount = activeTab === 'expense' 
    ? selectedExpenseIds.size 
    : selectedIncomeIds.size;

  const allSelected = activeTab === 'expense'
    ? selectedExpenseIds.size === allSortedExpenses.length && allSortedExpenses.length > 0
    : selectedIncomeIds.size === incomes.length && incomes.length > 0;

  return {
    // State
    isBulkSelectMode,
    selectedExpenseIds,
    selectedIncomeIds,
    selectedCount,
    allSelected,
    
    // Handlers
    handleActivateBulkMode,
    handleCancelBulkMode,
    handleToggleBulkMode,
    handleToggleSelectExpense,
    handleToggleSelectIncome,
    handleSelectAllExpenses,
    handleSelectAllIncomes,
    handleToggleSelectAll,
    
    // Direct state setters (for special cases like after bulk operations)
    setIsBulkSelectMode,
    setSelectedExpenseIds,
    setSelectedIncomeIds,
  };
}
