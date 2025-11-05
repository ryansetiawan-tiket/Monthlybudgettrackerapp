import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AddExpenseForm } from "./AddExpenseForm";
import { FixedExpenseTemplates, FixedExpenseTemplate } from "./FixedExpenseTemplates";
import { useIsMobile } from "./ui/use-mobile";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (name: string, amount: number, date: string, items?: Array<{name: string, amount: number}>, color?: string, pocketId?: string) => void;
  isAdding: boolean;
  templates: FixedExpenseTemplate[];
  onAddTemplate: (name: string, items: Array<{name: string, amount: number}>, color?: string) => void;
  onUpdateTemplate: (id: string, name: string, items: Array<{name: string, amount: number}>, color?: string) => void;
  onDeleteTemplate: (id: string) => void;
  pockets?: Array<{id: string; name: string}>;
  balances?: Map<string, {availableBalance: number}>;
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
}: AddExpenseDialogProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const isMobile = useIsMobile();

  const handleManualExpenseSuccess = () => {
    onOpenChange(false);
  };

  const content = (
    <>
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
            pockets={pockets}
            balances={balances}
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
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[75vh] flex flex-col rounded-t-2xl p-0"
        >
          <SheetHeader className="px-4 pt-6 pb-4 border-b">
            <SheetTitle>Tambah Pengeluaran</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {content}
          </div>
        </SheetContent>
      </Sheet>
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
