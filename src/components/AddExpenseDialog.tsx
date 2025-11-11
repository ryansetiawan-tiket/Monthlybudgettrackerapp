import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AddExpenseForm } from "./AddExpenseForm";
import { FixedExpenseTemplates, FixedExpenseTemplate, FixedExpenseItem } from "./FixedExpenseTemplates";
import { useIsMobile } from "./ui/use-mobile";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";
import type { ExpenseCategory } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string, pocketId?: string, groupId?: string, silent?: boolean, category?: ExpenseCategory) => Promise<any>;
  isAdding: boolean;
  templates: FixedExpenseTemplate[];
  onAddTemplate: (name: string, items: Array<{name: string, amount: number}>, color?: string) => void;
  onUpdateTemplate: (id: string, name: string, items: Array<{name: string, amount: number}>, color?: string) => void;
  onDeleteTemplate: (id: string) => void;
  pockets?: Array<{id: string; name: string}>;
  balances?: Map<string, {availableBalance: number}>;
  currentExpenses?: Array<{ category?: string; amount: number }>; // Phase 9: For budget alerts
  expenses?: Array<{ id: string; name: string; amount: number; date: string; category?: string; pocket?: string; pocketId?: string }>; // For smart suggestions
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onAddExpense,
  isAdding,
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  pockets,
  balances,
  currentExpenses,
  expenses,
}: AddExpenseDialogProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const isMobile = useIsMobile();
  
  // Mobile drawer internal navigation state
  const [drawerView, setDrawerView] = useState<'list' | 'form'>('list');
  const [editingTemplate, setEditingTemplate] = useState<FixedExpenseTemplate | null>(null);

  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'add-expense-dialog'
  );

  const handleManualExpenseSuccess = () => {
    onOpenChange(false);
  };

  const content = (
    <>
      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        // Reset drawer view when switching tabs
        if (isMobile) {
          setDrawerView('list');
          setEditingTemplate(null);
        }
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-4">
          <AddExpenseForm 
            onAddExpense={onAddExpense} 
            isAdding={isAdding} 
            templates={templates}
            onSuccess={handleManualExpenseSuccess}
            pockets={pockets}
            balances={balances}
            currentExpenses={currentExpenses}
            expenses={expenses}
          />
        </TabsContent>
        <TabsContent value="template" className="mt-4">
          <FixedExpenseTemplates
            templates={templates}
            onAddTemplate={onAddTemplate}
            onUpdateTemplate={onUpdateTemplate}
            onDeleteTemplate={onDeleteTemplate}
            pockets={pockets}
            // Mobile: trigger internal navigation instead of dialog
            onOpenForm={isMobile ? (template) => {
              setEditingTemplate(template || null);
              setDrawerView('form');
            } : undefined}
          />
        </TabsContent>
      </Tabs>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset states when closing
          setDrawerView('list');
          setEditingTemplate(null);
          setActiveTab('manual');
        }
        onOpenChange(isOpen);
      }} dismissible={true}>
        <DrawerContent className="h-[90vh] flex flex-col rounded-t-2xl p-0">
          <DrawerHeader className="px-4 pt-6 pb-4 border-b flex items-center gap-3">
            {/* Back button when in form view */}
            {activeTab === 'template' && drawerView === 'form' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerView('list')}
                className="h-8 w-8 absolute left-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <DrawerTitle className="text-center w-full">
              {activeTab === 'template' && drawerView === 'form' 
                ? (editingTemplate ? 'Edit Template' : 'Buat Template Baru')
                : 'Tambah Pengeluaran'
              }
            </DrawerTitle>
          </DrawerHeader>
          <div className={`flex-1 overflow-y-auto relative ${activeTab === 'template' && drawerView === 'form' ? '' : 'px-4 py-4'}`}>
            <AnimatePresence mode="wait">
              {activeTab === 'template' && drawerView === 'form' ? (
                // Template Form View (mobile internal navigation)
                <motion.div
                  key="template-form"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute inset-0"
                >
                  {/* Template form will be rendered by FixedExpenseTemplates */}
                  <FixedExpenseTemplates
                    templates={templates}
                    onAddTemplate={onAddTemplate}
                    onUpdateTemplate={onUpdateTemplate}
                    onDeleteTemplate={onDeleteTemplate}
                    pockets={pockets}
                    isMobileFormView={true}
                    editingTemplate={editingTemplate}
                    onFormSuccess={() => {
                      setDrawerView('list');
                      setEditingTemplate(null);
                    }}
                  />
                </motion.div>
              ) : (
                // Normal tab content (list view)
                <motion.div
                  key="tab-content"
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-20%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  {content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Tambah Pengeluaran</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}