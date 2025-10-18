import { useState, useEffect } from "react";
import { MonthSelector } from "./components/MonthSelector";
import { BudgetOverview } from "./components/BudgetOverview";
import { BudgetForm } from "./components/BudgetForm";
import { AddExpenseDialog } from "./components/AddExpenseDialog";
import { ExpenseList } from "./components/ExpenseList";
import { AdditionalIncomeForm } from "./components/AdditionalIncomeForm";
import { AdditionalIncomeList } from "./components/AdditionalIncomeList";
import { FixedExpenseTemplate } from "./components/FixedExpenseTemplates";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "./components/ui/button";
import { funnyQuotes } from "./data/funny-quotes";

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
  const [isBudgetSectionOpen, setIsBudgetSectionOpen] = useState(false);
  const [templates, setTemplates] = useState<FixedExpenseTemplate[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1`;

  useEffect(() => {
    loadBudgetData();
    loadExpenses();
    loadAdditionalIncomes();
    loadPreviousMonthData();
    loadTemplates();
  }, [selectedMonth, selectedYear]);

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
      setExpenses(data);
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
      setAdditionalIncomes(data);
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
      setExpenses((prev) => [...prev, result.data]);
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

      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
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
      setExpenses((prev) =>
        prev.map((expense) => (expense.id === id ? result.data : expense))
      );
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

  const handleUpdateIncome = async (id: string, income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
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

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsLoading(true);
  };

  const handleUpdateGlobalDeduction = async (deduction: number) => {
    const newBudget = { ...budget, incomeDeduction: deduction };
    setBudget(newBudget);
    
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
    }
  };

  const grossAdditionalIncome = additionalIncomes.reduce(
    (sum, income) => sum + income.amountIDR, 
    0
  );
  const totalAdditionalIncome = grossAdditionalIncome - (budget.incomeDeduction || 0);
  const totalIncome =
    Number(budget.initialBudget) +
    Number(budget.carryover) +
    totalAdditionalIncome;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1>Budget Tracker</h1>
          <p className="text-muted-foreground">{randomQuote || "Kelola budget bulanan Anda dengan mudah"}</p>
        </div>

        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        />

        <BudgetOverview
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          remainingBudget={remainingBudget}
        />

        <Collapsible open={isBudgetSectionOpen} onOpenChange={setIsBudgetSectionOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Pengaturan Budget & Pemasukan Tambahan</span>
              <ChevronDown 
                className={`size-4 transition-transform ${isBudgetSectionOpen ? 'rotate-180' : ''}`} 
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetForm
                  initialBudget={budget.initialBudget}
                  carryover={budget.carryover}
                  notes={budget.notes}
                  onBudgetChange={handleBudgetChange}
                  onSave={handleSaveBudget}
                  isSaving={isSaving}
                  suggestedCarryover={previousMonthRemaining}
                  isLoadingCarryover={isLoadingCarryover}
                />

                <AdditionalIncomeForm 
                  onAddIncome={handleAddIncome} 
                  isAdding={isAddingIncome} 
                />
              </div>

              <AdditionalIncomeList 
                incomes={additionalIncomes} 
                onDeleteIncome={handleDeleteIncome} 
                onUpdateIncome={handleUpdateIncome} 
                globalDeduction={budget.incomeDeduction || 0}
                onUpdateGlobalDeduction={handleUpdateGlobalDeduction}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button 
          onClick={() => setIsExpenseDialogOpen(true)}
          size="lg"
          className="w-full"
        >
          <Plus className="size-5 mr-2" />
          Tambah Pengeluaran
        </Button>

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

        <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} onEditExpense={handleEditExpense} />
      </div>
      
      <Toaster />
    </div>
  );
}