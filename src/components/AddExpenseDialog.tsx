import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AddExpenseForm } from "./AddExpenseForm";
import { FixedExpenseTemplates, FixedExpenseTemplate } from "./FixedExpenseTemplates";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string) => void;
  isAdding: boolean;
  templates: FixedExpenseTemplate[];
  onAddTemplate: (name: string, items: Array<{name: string, amount: number}>, color?: string) => void;
  onUpdateTemplate: (id: string, name: string, items: Array<{name: string, amount: number}>, color?: string) => void;
  onDeleteTemplate: (id: string) => void;
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
}: AddExpenseDialogProps) {
  const [activeTab, setActiveTab] = useState("manual");

  const handleManualExpenseSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Pengeluaran</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            />
          </TabsContent>
          <TabsContent value="template" className="mt-4">
            <FixedExpenseTemplates
              templates={templates}
              onAddTemplate={onAddTemplate}
              onUpdateTemplate={onUpdateTemplate}
              onDeleteTemplate={onDeleteTemplate}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}