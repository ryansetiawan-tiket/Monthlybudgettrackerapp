/**
 * Expense Method Tabs Component
 * Nested tabs for choosing expense entry method (Manual vs Template)
 * Used in Desktop UnifiedTransactionDialog
 * 
 * Features:
 * - Tab: Manual - Form entri manual
 * - Tab: Template - Template manager (list + create/edit/delete)
 * - Clean separation of concerns
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AddExpenseForm } from "./AddExpenseForm";
import { FixedExpenseTemplates, type FixedExpenseTemplate } from "./FixedExpenseTemplates";

interface ExpenseMethodTabsProps {
  // Expense handlers
  onAddExpense: (
    name: string,
    amount: number,
    date: string,
    items?: Array<{ name: string; amount: number; category?: string; pocketId?: string }>,
    color?: string,
    pocketId?: string,
    groupId?: string,
    silent?: boolean,
    category?: string,
    emoji?: string
  ) => Promise<any>;
  isAddingExpense: boolean;

  // Template management
  templates: FixedExpenseTemplate[];
  onAddTemplate: (
    name: string,
    items: Array<{ name: string; amount: number; category?: string; pocketId?: string }>,
    color?: string,
    emoji?: string
  ) => void;
  onUpdateTemplate: (
    id: string,
    name: string,
    items: Array<{ name: string; amount: number; category?: string; pocketId?: string }>,
    color?: string,
    emoji?: string
  ) => void;
  onDeleteTemplate: (id: string) => void;

  // Shared
  pockets?: Array<{ id: string; name: string; emoji?: string }>;
  balances?: Map<string, { availableBalance: number }>;
  currentExpenses?: Array<{ category?: string; amount: number }>;
  expenses?: Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
    category?: string;
    pocket?: string;
    pocketId?: string;
  }>;
  
  // Callbacks
  onSuccess?: () => void;
  
  // Nested tabs state
  expenseMethod: 'manual' | 'template';
  setExpenseMethod: (method: 'manual' | 'template') => void;
}

/**
 * Nested tabs for expense entry method selection
 */
export function ExpenseMethodTabs({
  onAddExpense,
  isAddingExpense,
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  pockets = [],
  balances,
  currentExpenses = [],
  expenses = [],
  onSuccess,
  expenseMethod,
  setExpenseMethod,
}: ExpenseMethodTabsProps) {
  
  // Handler for template execution
  const handleExecuteTemplate = async (template: FixedExpenseTemplate) => {
    try {
      // Get first pocket or default
      const pocketId = pockets.length > 0 ? pockets[0].id : 'pocket_daily';
      
      // Calculate total amount
      const totalAmount = template.items.reduce((sum, item) => sum + item.amount, 0);
      
      // Get local date
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      
      // Execute template
      const items = template.items.map(item => ({
        name: item.name,
        amount: item.amount,
        ...(item.category ? { category: item.category } : {}),
        ...(item.pocketId ? { pocketId: item.pocketId } : {}),
      }));
      
      await onAddExpense(
        template.name,
        totalAmount,
        date,
        items,
        template.color,
        pocketId,
        undefined, // groupId
        false, // silent
        undefined, // category (items have their own)
        template.emoji
      );
      
      // Success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const { toast } = await import("sonner@2.0.3");
      toast.error("Gagal mengeksekusi template");
    }
  };

  return (
    <Tabs
      value={expenseMethod}
      onValueChange={(val) => setExpenseMethod(val as 'manual' | 'template')}
      className="w-full"
    >
      {/* Nested Tab Selectors */}
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">✏️ Manual</TabsTrigger>
        <TabsTrigger value="template">📄 Template</TabsTrigger>
      </TabsList>

      {/* Manual Entry Tab */}
      <TabsContent value="manual" className="mt-4">
        <AddExpenseForm
          onAddExpense={onAddExpense}
          isAdding={isAddingExpense}
          templates={templates}
          onSuccess={onSuccess}
          pockets={pockets}
          balances={balances}
          currentExpenses={currentExpenses}
          expenses={expenses}
        />
      </TabsContent>

      {/* Template Manager Tab */}
      <TabsContent value="template" className="mt-4">
        <FixedExpenseTemplates
          templates={templates}
          onAddTemplate={onAddTemplate}
          onUpdateTemplate={onUpdateTemplate}
          onDeleteTemplate={onDeleteTemplate}
          pockets={pockets}
          onExecuteTemplate={handleExecuteTemplate}
        />
      </TabsContent>
    </Tabs>
  );
}