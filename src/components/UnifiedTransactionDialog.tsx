/**
 * Unified Transaction Dialog Component
 * Desktop entry point for adding both Expenses and Income
 * 
 * Features:
 * - Single dialog for both transaction types
 * - Segmented control (tabs) to switch between Expense/Income
 * - Reuses existing AddExpenseForm and AdditionalIncomeForm
 * - Desktop-only (mobile has FAB)
 * - Resets to default tab on close
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AddExpenseForm } from "./AddExpenseForm";
import { AdditionalIncomeForm } from "./AdditionalIncomeForm";
import { useState, useEffect } from "react";
import { ExpenseCategory } from "../types";

interface FixedExpenseTemplate {
  id: string;
  name: string;
  items: Array<{ name: string; amount: number }>;
  color?: string;
}

interface UnifiedTransactionDialogProps {
  // Dialog control
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Expense handlers
  onAddExpense: (
    name: string,
    amount: number,
    date: string,
    items?: Array<{ name: string; amount: number }>,
    color?: string,
    pocketId?: string,
    groupId?: string,
    silent?: boolean,
    category?: ExpenseCategory
  ) => Promise<any>;
  isAddingExpense: boolean;
  templates: FixedExpenseTemplate[];
  onAddTemplate: (name: string, items: Array<{ name: string; amount: number }>, color?: string) => void;
  onUpdateTemplate: (id: string, name: string, items: Array<{ name: string; amount: number }>, color?: string) => void;
  onDeleteTemplate: (id: string) => void;
  
  // Income handlers
  onAddIncome: (
    name: string,
    amount: number,
    currency: string,
    exchangeRate: number | null,
    amountIDR: number,
    conversionType: string,
    date: string,
    deduction: number,
    pocketId: string
  ) => Promise<void>;
  isAddingIncome: boolean;
  
  // Shared
  pockets?: Array<{ id: string; name: string }>;
  balances?: Map<string, { availableBalance: number }>;
  currentExpenses?: Array<{ category?: string; amount: number }>;
}

/**
 * Unified dialog for adding both expenses and income on desktop
 * 
 * @example
 * <UnifiedTransactionDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onAddExpense={handleAddExpense}
 *   isAddingExpense={isAdding}
 *   onAddIncome={handleAddIncome}
 *   isAddingIncome={isAddingIncome}
 *   templates={templates}
 *   pockets={pockets}
 * />
 */
export function UnifiedTransactionDialog({
  open,
  onOpenChange,
  onAddExpense,
  isAddingExpense,
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onAddIncome,
  isAddingIncome,
  pockets = [],
  balances,
  currentExpenses = [],
}: UnifiedTransactionDialogProps) {
  const [selectedTab, setSelectedTab] = useState<'expense' | 'income'>('expense');

  // Reset tab to default (expense) when dialog closes
  // This ensures consistent UX on each open
  useEffect(() => {
    if (!open) {
      setSelectedTab('expense');
    }
  }, [open]);

  // Success callback for expense submission
  // Closes dialog after successful add
  const handleExpenseSuccess = () => {
    onOpenChange(false);
  };

  // Success callback for income submission
  // Closes dialog after successful add
  const handleIncomeSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <Tabs 
          value={selectedTab} 
          onValueChange={(val) => setSelectedTab(val as 'expense' | 'income')} 
          className="w-full"
        >
          {/* Segmented Control: Choose transaction type */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
          </TabsList>

          {/* Expense Form Tab */}
          <TabsContent value="expense" className="mt-4">
            <AddExpenseForm
              onAddExpense={onAddExpense}
              isAdding={isAddingExpense}
              templates={templates}
              onSuccess={handleExpenseSuccess}
              pockets={pockets}
              balances={balances}
              currentExpenses={currentExpenses}
            />
          </TabsContent>

          {/* Income Form Tab */}
          <TabsContent value="income" className="mt-4">
            <AdditionalIncomeForm
              onAddIncome={onAddIncome}
              isAdding={isAddingIncome}
              onSuccess={handleIncomeSuccess}
              pockets={pockets}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
