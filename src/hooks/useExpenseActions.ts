/**
 * useExpenseActions Hook
 * 
 * Handles UI state management for expense/income CRUD operations.
 * Extracted from ExpenseList.tsx (Phase 3 - Hook 3 - CANARY #3)
 * 
 * Features:
 * - Edit expense/income UI state
 * - Delete expense/income confirmation dialogs
 * - Move expense to income confirmation dialog
 * - Action sheet (mobile bottom sheet) state
 * - Integration with parent component handlers (API calls)
 * 
 * NOTE: Actual API calls are handled by parent component (App.tsx)
 * This hook only manages UI state and confirmation flows.
 */

import { useState, useCallback } from 'react';
import type { Expense, AdditionalIncome } from '../types/expense';

interface UseExpenseActionsProps {
  expenses: Expense[];
  incomes: AdditionalIncome[];
  // Parent handlers (API calls)
  onEditExpense?: (id: string, data: Partial<Expense>) => Promise<void>;
  onDeleteExpense?: (id: string) => void;
  onDeleteIncome?: (id: string) => void;
  onMoveToIncome?: (expense: Expense) => void;
  // Utility functions
  getLocalDateFromISO: (isoDate: string) => string;
}

export function useExpenseActions({
  expenses,
  incomes,
  onEditExpense,
  onDeleteExpense,
  onDeleteIncome,
  onMoveToIncome,
  getLocalDateFromISO,
}: UseExpenseActionsProps) {
  // ===========================
  // EDIT STATE
  // ===========================
  
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Partial<Expense>>({
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
    emoji: undefined,
  });
  
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<Partial<AdditionalIncome>>({
    name: '',
    amount: 0,
    date: '',
    currency: undefined,
    originalAmount: undefined,
    exchangeRate: undefined,
    conversionType: undefined,
    deduction: undefined,
    pocketId: undefined,
  });
  
  const [itemAmountInputs, setItemAmountInputs] = useState<{ [index: number]: string }>({});
  
  // Loading states
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);
  const [isUpdatingIncome, setIsUpdatingIncome] = useState(false);

  // ===========================
  // DELETE CONFIRMATION STATE
  // ===========================
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{
    id: string;
    name: string;
    amount: number;
  } | null>(null);

  // ===========================
  // MOBILE ACTION SHEET STATE
  // ===========================
  
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [actionSheetItem, setActionSheetItem] = useState<{
    id: string;
    name: string;
    type: 'expense' | 'income';
    fromIncome?: boolean;
  } | null>(null);

  // ===========================
  // EDIT HANDLERS - EXPENSE
  // ===========================

  const handleEditExpense = useCallback((id: string) => {
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
        groupId: expense.groupId, // Preserve groupId
        category: expense.category, // 🔧 CRITICAL FIX: Include category!
        emoji: (expense as any).emoji, // 🔧 FIX: Preserve template emoji
      });
      // Initialize input strings for items
      const initialInputs: { [index: number]: string } = {};
      expense.items?.forEach((item, index) => {
        initialInputs[index] = item.amount.toString();
      });
      setItemAmountInputs(initialInputs);
    }
  }, [expenses, getLocalDateFromISO]);

  const handleCloseEditExpense = useCallback(() => {
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
      emoji: undefined,
    });
    setItemAmountInputs({});
  }, []);

  const handleSaveEditExpense = useCallback(async () => {
    if (!editingExpenseId || !onEditExpense) return;

    // Recalculate amount if items exist
    let finalAmount = editingExpense.amount || 0;
    if (editingExpense.items && editingExpense.items.length > 0) {
      finalAmount = editingExpense.items.reduce((sum, item) => sum + item.amount, 0);
    }

    // ✅ FIX: Keep date in YYYY-MM-DD format (use local date, not UTC)
    const finalDate = editingExpense.date?.includes('T')
      ? getLocalDateFromISO(editingExpense.date)
      : editingExpense.date;

    console.log('[useExpenseActions] Saving edit - Category:', editingExpense.category);

    setIsUpdatingExpense(true);
    try {
      // 🔧 FIX: Include category and emoji in update
      await onEditExpense(editingExpenseId, {
        ...editingExpense,
        amount: finalAmount,
        date: finalDate,
        category: editingExpense.category, // ← CRITICAL: Include category
        emoji: editingExpense.emoji, // ← CRITICAL: Preserve template emoji
      });

      // 🔧 FIX: Close dialog ONLY after successful update
      handleCloseEditExpense();
    } catch (error) {
      console.error('[useExpenseActions] Error saving expense:', error);
      // Error handling is done by parent (App.tsx shows toast)
    } finally {
      setIsUpdatingExpense(false);
    }
  }, [editingExpenseId, editingExpense, onEditExpense, getLocalDateFromISO, handleCloseEditExpense]);

  // ===========================
  // EDIT HANDLERS - INCOME
  // ===========================

  const handleEditIncome = useCallback((id: string) => {
    const income = incomes.find(i => i.id === id);
    if (income) {
      setEditingIncomeId(id);
      setEditingIncome(income);
    }
  }, [incomes]);

  const handleCloseEditIncome = useCallback(() => {
    setEditingIncomeId(null);
    setEditingIncome({
      name: '',
      amount: 0,
      date: '',
      currency: undefined,
      originalAmount: undefined,
      exchangeRate: undefined,
      conversionType: undefined,
      deduction: undefined,
      pocketId: undefined,
    });
  }, []);

  // ===========================
  // DELETE HANDLERS
  // ===========================

  const handleDeleteExpense = useCallback((id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setExpenseToDelete({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
      });
      setDeleteConfirmOpen(true);
    }
  }, [expenses]);

  const handleConfirmDeleteExpense = useCallback(() => {
    if (expenseToDelete && onDeleteExpense) {
      onDeleteExpense(expenseToDelete.id);
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    }
  }, [expenseToDelete, onDeleteExpense]);

  const handleCancelDeleteExpense = useCallback(() => {
    setDeleteConfirmOpen(false);
    setExpenseToDelete(null);
  }, []);

  // ===========================
  // MOBILE ACTION SHEET HANDLERS
  // ===========================

  const handleLongPressItem = useCallback((id: string, type: 'expense' | 'income') => {
    if (type === 'expense') {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        setActionSheetItem({
          id: expense.id,
          name: expense.name,
          type: 'expense',
          fromIncome: expense.fromIncome,
        });
        setActionSheetOpen(true);
      }
    } else {
      const income = incomes.find(i => i.id === id);
      if (income) {
        setActionSheetItem({
          id: income.id,
          name: income.name,
          type: 'income',
        });
        setActionSheetOpen(true);
      }
    }
  }, [expenses, incomes]);

  const handleSheetEdit = useCallback(() => {
    if (!actionSheetItem) return;

    if (actionSheetItem.type === 'expense') {
      handleEditExpense(actionSheetItem.id);
    } else {
      handleEditIncome(actionSheetItem.id);
    }

    setActionSheetOpen(false);
  }, [actionSheetItem, handleEditExpense, handleEditIncome]);

  const handleSheetDelete = useCallback(() => {
    if (!actionSheetItem) return;

    if (actionSheetItem.type === 'expense') {
      const expense = expenses.find(e => e.id === actionSheetItem.id);
      if (expense) {
        setExpenseToDelete({
          id: expense.id,
          name: expense.name,
          amount: expense.amount,
        });
        setDeleteConfirmOpen(true);
      }
    } else {
      // Income delete
      onDeleteIncome?.(actionSheetItem.id);
    }

    setActionSheetOpen(false);
  }, [actionSheetItem, expenses, onDeleteIncome]);

  const handleSheetMoveToIncome = useCallback(() => {
    if (!actionSheetItem || actionSheetItem.type !== 'expense') return;

    const expense = expenses.find(e => e.id === actionSheetItem.id);
    if (expense && expense.fromIncome) {
      onMoveToIncome?.(expense);
    }

    setActionSheetOpen(false);
  }, [actionSheetItem, expenses, onMoveToIncome]);

  return {
    // Edit expense state
    editingExpenseId,
    editingExpense,
    setEditingExpense,
    itemAmountInputs,
    setItemAmountInputs,
    isUpdatingExpense,

    // Edit income state
    editingIncomeId,
    editingIncome,
    setEditingIncome,
    isUpdatingIncome,

    // Delete confirmation state
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    expenseToDelete,
    setExpenseToDelete,

    // Action sheet state
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
  };
}
