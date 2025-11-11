/**
 * SimulationSandbox Component
 * 
 * Smart simulation system that allows users to:
 * - Toggle expenses/income on/off to see impact on budget
 * - Save/load simulation scenarios
 * - See real-time metrics (total income, expenses, remaining budget)
 * - Context-aware tab initialization based on what user was viewing
 * - ULTIMATE V2: Category filter + Date grouping + Footer polish
 * 
 * Phase 2: Smart Sandbox Refactor
 * Phase 3: Ultimate V2 Enhancement
 */

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { X, Trash2, ChevronDown, Filter, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { formatCurrency } from '../utils/currency';
import { formatDateSafe, getLocalDateFromISO } from '../utils/date-helpers';
import { getCategoryEmoji } from '../utils/calculations';
import { Expense, AdditionalIncome } from '../types';
import { useIsMobile } from './ui/use-mobile';
import { useCategorySettings } from '../hooks/useCategorySettings';
import { getAllCategories } from '../utils/categoryManager';

interface SimulationSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  incomes: AdditionalIncome[];
  initialTab: 'all' | 'expense' | 'income';
  globalDeduction?: number;
  initialBudget?: number;
  // 🏗️ ARCHITECTURE FIX: NEW - Carry-over breakdown props
  carryOverAssets?: number;
  carryOverLiabilities?: number;
}

interface Transaction {
  id: string;
  type: 'expense' | 'income';
  description: string;
  amount: number;
  date: string;
  fromIncome?: boolean;
  pocketId?: string;
  category?: string;
}

interface DateGroup {
  date: string; // ISO date string (YYYY-MM-DD)
  displayDate: string; // "Sabtu, 8 Nov"
  transactions: Transaction[];
}

// Phase 3: Persistence - Saved simulation state structure
interface SandboxState {
  id: string; // UUID
  name: string; // User-provided name
  createdAt: string; // ISO timestamp
  includedExpenseIds: string[];
  includedIncomeIds: string[];
  includeGlobalDeduction: boolean;
  metadata: {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
  };
}

// Storage utilities
const STORAGE_KEY = 'budget_sandbox_simulations';

const saveSimulationToStorage = (state: SandboxState): void => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Check if simulation with same ID exists, replace it
    const index = existing.findIndex((s: SandboxState) => s.id === state.id);
    if (index >= 0) {
      existing[index] = state;
    } else {
      existing.push(state);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to save simulation:', error);
  }
};

const loadSimulationsFromStorage = (): SandboxState[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Failed to load simulations:', error);
    return [];
  }
};

const deleteSimulationFromStorage = (id: string): void => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter((s: SandboxState) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete simulation:', error);
  }
};

// Helper: Group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]): DateGroup[] => {
  const groups = new Map<string, Transaction[]>();
  
  transactions.forEach(t => {
    // ✅ FIX: Use LOCAL date, not UTC date for grouping consistency
    const dateOnly = getLocalDateFromISO(t.date);
    if (!groups.has(dateOnly)) {
      groups.set(dateOnly, []);
    }
    groups.get(dateOnly)!.push(t);
  });
  
  return Array.from(groups.entries())
    .map(([date, items]) => ({
      date,
      displayDate: formatDateSafe(date, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      }),
      transactions: items,
    }))
    .sort((a, b) => b.date.localeCompare(a.date)); // Newest first
};

export default function SimulationSandbox({
  isOpen,
  onClose,
  expenses,
  incomes,
  initialTab,
  globalDeduction = 0,
  initialBudget = 0,
  // 🏗️ ARCHITECTURE FIX: NEW - Carry-over breakdown props
  carryOverAssets = 0,
  carryOverLiabilities = 0,
}: SimulationSandboxProps) {
  const isMobile = useIsMobile();
  const { settings } = useCategorySettings();
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>(initialTab);
  
  // Update activeTab when initialTab changes (context-aware)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Helper to format date in short format (e.g., "Senin, 8 Nov")
  const formatDateShort = (dateString: string) => {
    return formatDateSafe(dateString, { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short' 
    });
  };
  
  // Track which transactions are INCLUDED in simulation (default: all included)
  const [includedExpenseIds, setIncludedExpenseIds] = useState<Set<string>>(
    new Set(expenses.map(e => e.id))
  );
  const [includedIncomeIds, setIncludedIncomeIds] = useState<Set<string>>(
    new Set(incomes.map(i => i.id))
  );
  const [includeGlobalDeduction, setIncludeGlobalDeduction] = useState(true);
  
  // TASK 1: Category filter state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  
  // Phase 3: Save/Load state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [simulationName, setSimulationName] = useState('');
  const [savedSimulations, setSavedSimulations] = useState<SandboxState[]>([]);
  
  // Load saved simulations from localStorage on mount
  useEffect(() => {
    const loaded = loadSimulationsFromStorage();
    setSavedSimulations(loaded);
  }, []);

  // Convert data to unified transaction format
  const allTransactions = useMemo(() => {
    const expenseTransactions: Transaction[] = expenses.map(exp => ({
      id: exp.id,
      type: 'expense' as const,
      description: exp.name,
      amount: exp.amount,
      date: exp.date,
      fromIncome: exp.fromIncome,
      pocketId: exp.pocketId,
      category: exp.category,
    }));

    const incomeTransactions: Transaction[] = incomes.map(inc => ({
      id: inc.id,
      type: 'income' as const,
      description: inc.name,
      amount: inc.amountIDR - (inc.deduction || 0), // Net amount after individual deduction
      date: inc.date,
      pocketId: inc.pocketId,
    }));

    return [...expenseTransactions, ...incomeTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, incomes]);

  // TASK 1: Extract unique categories with counts
  const categoriesWithCounts = useMemo(() => {
    const allCategories = getAllCategories(settings);
    const counts = new Map<string, number>();
    
    allTransactions.forEach(t => {
      if (t.category) {
        counts.set(t.category, (counts.get(t.category) || 0) + 1);
      }
    });
    
    return allCategories
      .map(cat => ({
        value: cat.id,
        label: cat.label,
        emoji: cat.emoji,
        count: counts.get(cat.id) || 0,
      }))
      .filter(cat => cat.count > 0); // Only show categories that have transactions
  }, [allTransactions, settings]);

  // Filter transactions based on active tab AND category filter
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;
    
    // Step 1: Filter by tab (all/expense/income)
    if (activeTab !== 'all') {
      filtered = filtered.filter(t => t.type === activeTab);
    }
    
    // Step 2: Filter by category (TASK 1)
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(t => {
        return t.category && selectedCategories.has(t.category);
      });
    }
    
    return filtered;
  }, [allTransactions, activeTab, selectedCategories]);

  // TASK 2: Group filtered transactions by date
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  // Calculate real-time metrics
  const totalIncomeSimulation = useMemo(() => {
    return incomes
      .filter(inc => includedIncomeIds.has(inc.id))
      .reduce((sum, inc) => sum + inc.amountIDR - (inc.deduction || 0), 0);
  }, [incomes, includedIncomeIds]);

  // 🏗️ ARCHITECTURE FIX: Current month expenses (simulation)
  const currentMonthExpensesSimulation = useMemo(() => {
    return expenses
      .filter(exp => includedExpenseIds.has(exp.id))
      .reduce((sum, exp) => {
        if (exp.fromIncome) {
          return sum - exp.amount; // Subtract from expenses (adds to budget)
        }
        return sum + exp.amount;
      }, 0);
  }, [expenses, includedExpenseIds]);

  // 🏗️ ARCHITECTURE FIX: Total Expenses = Current Month Expenses + Carry-Over Liabilities
  const totalExpenseSimulation = useMemo(() => {
    return currentMonthExpensesSimulation + carryOverLiabilities;
  }, [currentMonthExpensesSimulation, carryOverLiabilities]);

  const appliedGlobalDeduction = includeGlobalDeduction ? globalDeduction : 0;
  
  // 🏗️ ARCHITECTURE FIX: Total Income = Budget Awal + Pemasukan Tambahan + Carry-Over Assets - Potongan Global
  const totalIncomeWithBudget = initialBudget + totalIncomeSimulation + carryOverAssets;
  const netIncomeAfterDeduction = totalIncomeWithBudget - appliedGlobalDeduction;
  
  // 🏗️ ARCHITECTURE FIX: Remaining Budget = Total Income - Total Expenses
  const remainingBudget = netIncomeAfterDeduction - totalExpenseSimulation;

  // Toggle handlers
  const handleToggleTransaction = (id: string, type: 'expense' | 'income') => {
    if (type === 'expense') {
      setIncludedExpenseIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else {
      setIncludedIncomeIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    }
  };

  // TASK 2: Parent checkbox logic for date groups
  const getParentCheckboxState = (dateGroup: DateGroup): {
    checked: boolean;
    indeterminate: boolean;
  } => {
    const allIds = dateGroup.transactions.map(t => t.id);
    
    const checkedCount = allIds.filter(id => {
      const transaction = dateGroup.transactions.find(t => t.id === id);
      if (transaction?.type === 'expense') {
        return includedExpenseIds.has(id);
      } else {
        return includedIncomeIds.has(id);
      }
    }).length;
    
    if (checkedCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (checkedCount === allIds.length) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  };

  const handleToggleDateGroup = (dateGroup: DateGroup) => {
    const parentState = getParentCheckboxState(dateGroup);
    const shouldCheck = !parentState.checked;
    
    dateGroup.transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        setIncludedExpenseIds(prev => {
          const newSet = new Set(prev);
          if (shouldCheck) {
            newSet.add(transaction.id);
          } else {
            newSet.delete(transaction.id);
          }
          return newSet;
        });
      } else {
        setIncludedIncomeIds(prev => {
          const newSet = new Set(prev);
          if (shouldCheck) {
            newSet.add(transaction.id);
          } else {
            newSet.delete(transaction.id);
          }
          return newSet;
        });
      }
    });
  };

  const handleReset = () => {
    setIncludedExpenseIds(new Set(expenses.map(e => e.id)));
    setIncludedIncomeIds(new Set(incomes.map(i => i.id)));
    setIncludeGlobalDeduction(true);
    setSelectedCategories(new Set()); // Reset category filter
  };
  
  // TASK 1: Category filter handlers
  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.size === categoriesWithCounts.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categoriesWithCounts.map(c => c.value)));
    }
  };

  const handleCheckAllFiltered = () => {
    const filteredIds = filteredTransactions.map(t => t.id);
    
    filteredIds.forEach(id => {
      const transaction = filteredTransactions.find(t => t.id === id);
      if (transaction?.type === 'expense') {
        setIncludedExpenseIds(prev => new Set([...prev, id]));
      } else {
        setIncludedIncomeIds(prev => new Set([...prev, id]));
      }
    });
    
    toast.success(`✅ ${filteredIds.length} transaksi dicentang`);
  };

  const handleUncheckAllFiltered = () => {
    const filteredIds = filteredTransactions.map(t => t.id);
    
    filteredIds.forEach(id => {
      const transaction = filteredTransactions.find(t => t.id === id);
      if (transaction?.type === 'expense') {
        setIncludedExpenseIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        setIncludedIncomeIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    });
    
    toast.success(`⬜ ${filteredIds.length} transaksi dihapus centangnya`);
  };
  
  // Phase 3: Save/Load handlers
  const handleOpenSaveDialog = () => {
    setSimulationName('');
    setShowSaveDialog(true);
  };
  
  const handleConfirmSave = () => {
    if (!simulationName.trim()) {
      toast.error('Nama simulasi tidak boleh kosong');
      return;
    }
    
    // Generate UUID (with fallback for older browsers)
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback: Simple UUID v4 generator
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const newSimulation: SandboxState = {
      id: generateId(),
      name: simulationName.trim(),
      createdAt: new Date().toISOString(),
      includedExpenseIds: Array.from(includedExpenseIds),
      includedIncomeIds: Array.from(includedIncomeIds),
      includeGlobalDeduction,
      metadata: {
        totalIncome: netIncomeAfterDeduction,
        totalExpense: totalExpenseSimulation,
        netAmount: remainingBudget,
      },
    };
    
    saveSimulationToStorage(newSimulation);
    setSavedSimulations(loadSimulationsFromStorage());
    setShowSaveDialog(false);
    toast.success(`💾 Simulasi "${simulationName}" berhasil disimpan`);
  };
  
  const handleOpenLoadDialog = () => {
    setSavedSimulations(loadSimulationsFromStorage()); // Refresh list
    setShowLoadDialog(true);
  };
  
  const handleLoadSimulation = (simulation: SandboxState) => {
    setIncludedExpenseIds(new Set(simulation.includedExpenseIds));
    setIncludedIncomeIds(new Set(simulation.includedIncomeIds));
    setIncludeGlobalDeduction(simulation.includeGlobalDeduction);
    setShowLoadDialog(false);
    toast.success(`📂 Simulasi "${simulation.name}" berhasil dimuat`);
  };
  
  const handleDeleteSimulation = (id: string) => {
    deleteSimulationFromStorage(id);
    setSavedSimulations(loadSimulationsFromStorage());
    toast.success('🗑️ Simulasi berhasil dihapus');
  };

  // Sandbox content (shared between Dialog and Drawer)
  const sandboxContent = (
    <div className="flex flex-col h-full">
      {/* Title Row - Only show in mobile drawer */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-semibold">🧪 Simulation Sandbox</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Real-Time Metrics - Compact Layout */}
      <div className="mb-4 shrink-0 space-y-3">
        {/* Sisa Budget Card with Status Chip - Hero Position */}
        <Card 
          className={`relative overflow-hidden ${
            remainingBudget >= 0 
              ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/50' 
              : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/50'
          }`}
        >
          <CardContent className="p-6">
            <p className="text-sm font-medium mb-1">Sisa Budget (Simulasi)</p>
            <div className={`text-4xl font-bold mb-3 ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(remainingBudget)}
            </div>
            {(() => {
              // Calculate budget health percentage
              const healthPercent = netIncomeAfterDeduction > 0 
                ? (remainingBudget / netIncomeAfterDeduction) * 100 
                : 0;
              
              // Determine status
              let status: { label: string; emoji: string; bg: string; text: string };
              if (remainingBudget < 0) {
                status = { label: 'Defisit', emoji: '⚠️', bg: 'bg-red-500/20', text: 'text-red-700' };
              } else if (healthPercent >= 50) {
                status = { label: 'Aman', emoji: '✓', bg: 'bg-green-500/20', text: 'text-green-700' };
              } else if (healthPercent >= 20) {
                status = { label: 'Hati-hati', emoji: '⚡', bg: 'bg-yellow-500/20', text: 'text-yellow-700' };
              } else {
                status = { label: 'Kritis', emoji: '⚠️', bg: 'bg-orange-500/20', text: 'text-orange-700' };
              }
              
              return (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.bg} ${status.text}`}>
                  {status.emoji} {status.label}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Pemasukan & Pengeluaran - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pemasukan Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-[4px] mt-[0px] mr-[0px] ml-[0px]">
                <p className="text-sm font-medium leading-none">Pemasukan</p>
                {/* ✨ Info icon with breakdown popover (click-based) */}
                {initialBudget > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                        style={{ padding: '0px', margin: '0px' }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Lihat breakdown pemasukan"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-[240px] p-3">
                      <div className="space-y-1.5 text-xs">
                        <div className="font-semibold mb-2 text-foreground">Breakdown Pemasukan:</div>
                        {initialBudget > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground">Budget Awal:</span>
                            <span className="text-green-600 font-medium">+{formatCurrency(initialBudget)}</span>
                          </div>
                        )}
                        {totalIncomeSimulation > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground">Pemasukan Tambahan:</span>
                            <span className="text-green-600 font-medium">+{formatCurrency(totalIncomeSimulation)}</span>
                          </div>
                        )}
                        {carryOverAssets > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground">Aset Carry-Over:</span>
                            <span className="text-green-600 font-medium">+{formatCurrency(carryOverAssets)}</span>
                          </div>
                        )}
                        {appliedGlobalDeduction > 0 && (
                          <>
                            <div className="h-px bg-border my-1.5"></div>
                            <div className="flex justify-between gap-2">
                              <span className="text-muted-foreground">Potongan Global:</span>
                              <span className="text-red-600 font-medium">-{formatCurrency(appliedGlobalDeduction)}</span>
                            </div>
                          </>
                        )}
                        <div className="h-px bg-border my-1.5"></div>
                        <div className="flex justify-between gap-2 font-semibold">
                          <span className="text-foreground">Total Bersih:</span>
                          <span className="text-green-600">+{formatCurrency(netIncomeAfterDeduction)}</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <p className="text-xl text-green-600">{formatCurrency(netIncomeAfterDeduction)}</p>
            </CardContent>
          </Card>

          {/* Pengeluaran Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-[4px] mt-[0px] mr-[0px] ml-[0px]">
                <p className="text-sm font-medium leading-none">Pengeluaran</p>
                {/* 🏗️ ARCHITECTURE FIX: NEW - Info icon with breakdown popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                      style={{ padding: '0px', margin: '0px' }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Lihat breakdown pengeluaran"
                    >
                      <Info className="size-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-[280px] p-3">
                    <div className="space-y-1.5 text-xs">
                      <div className="font-semibold mb-2 text-foreground">Breakdown Pengeluaran:</div>
                      {/* Pengeluaran Bulan Ini */}
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Pengeluaran Bulan Ini:</span>
                        <span className="text-red-600 font-medium">-{formatCurrency(currentMonthExpensesSimulation)}</span>
                      </div>
                      {/* 🏗️ ARCHITECTURE FIX: NEW - Carry-Over Kewajiban (Utang) */}
                      {carryOverLiabilities > 0 && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">
                            Carry-Over Kewajiban (Utang Kantong<sup>-</sup>):
                          </span>
                          <span className="text-red-600 font-medium">-{formatCurrency(carryOverLiabilities)}</span>
                        </div>
                      )}
                      <div className="h-px bg-border my-1.5"></div>
                      <div className="flex justify-between gap-2 font-semibold">
                        <span className="text-foreground">Total Pengeluaran:</span>
                        <span className="text-red-600">-{formatCurrency(totalExpenseSimulation)}</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xl text-red-600">{formatCurrency(totalExpenseSimulation)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Global Deduction Toggle (only show if globalDeduction > 0) */}
      {globalDeduction > 0 && (
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={includeGlobalDeduction}
              onCheckedChange={(checked) => setIncludeGlobalDeduction(!!checked)}
            />
            <span className="text-sm">Potongan Global</span>
          </div>
          <span className="text-sm text-red-600">-{formatCurrency(globalDeduction)}</span>
        </div>
      )}

      {/* Tab Filter */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'expense' | 'income')} className="mb-3 shrink-0">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
          <TabsTrigger value="income">Pemasukan</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* TASK 1: Category Filter Dropdown */}
      <div className="mb-3 shrink-0">
        <Popover open={showCategoryFilter} onOpenChange={setShowCategoryFilter}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between h-11 md:h-auto"
            >
              <span className="flex items-center gap-2">
                <Filter className="size-4" />
                {selectedCategories.size === 0
                  ? 'Filter Kategori'
                  : `${selectedCategories.size} kategori dipilih`}
              </span>
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Cari kategori..."
                value={categorySearchQuery}
                onValueChange={setCategorySearchQuery}
              />
              <CommandList>
                <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {/* Select All option */}
                  <CommandItem onSelect={handleSelectAllCategories}>
                    <Checkbox
                      checked={selectedCategories.size === categoriesWithCounts.length}
                      className="mr-2"
                    />
                    <span className="font-medium">Semua Kategori</span>
                  </CommandItem>
                  
                  {/* Individual categories */}
                  {categoriesWithCounts.map(category => (
                    <CommandItem
                      key={category.value}
                      onSelect={() => handleToggleCategory(category.value)}
                    >
                      <Checkbox
                        checked={selectedCategories.has(category.value)}
                        className="mr-2"
                      />
                      <span className="mr-2">{category.emoji}</span>
                      <span className="flex-1">{category.label}</span>
                      <span className="text-xs text-muted-foreground">({category.count})</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
              
              {/* Bulk Actions */}
              <div className="border-t p-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleCheckAllFiltered}
                >
                  ✅ Centang Semua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleUncheckAllFiltered}
                >
                  ⬜ Hapus Semua
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* TASK 2: Scrollable Transaction List with Date Grouping */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-4">
          {groupedTransactions.map(dateGroup => {
            const parentState = getParentCheckboxState(dateGroup);
            const groupTotal = dateGroup.transactions.reduce((sum, t) => sum + t.amount, 0);
            
            return (
              <div key={dateGroup.date} className="space-y-0">
                {/* TASK 2: Date Header with Parent Checkbox */}
                <div className="sticky top-0 bg-background z-10 border-b border-border pb-2 mb-2">
                  <div className="flex items-center gap-2 p-[8px] m-[0px]">
                    <Checkbox
                      checked={parentState.checked}
                      // @ts-ignore - Checkbox supports indeterminate via ref
                      ref={(el: any) => {
                        if (el) el.indeterminate = parentState.indeterminate;
                      }}
                      onCheckedChange={() => handleToggleDateGroup(dateGroup)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{dateGroup.displayDate}</div>
                      <div className="text-xs text-muted-foreground">
                        {dateGroup.transactions.length} item{dateGroup.transactions.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-sm font-semibold md:w-auto w-[115px] text-right shrink-0">
                      {formatCurrency(groupTotal)}
                    </div>
                  </div>
                </div>

                {/* TASK 2: Child Transaction Rows (Indented) */}
                <div className="space-y-0">
                  {dateGroup.transactions.map(transaction => {
                    const isIncluded = transaction.type === 'expense'
                      ? includedExpenseIds.has(transaction.id)
                      : includedIncomeIds.has(transaction.id);

                    return (
                      <div
                        key={transaction.id}
                        className={`flex items-center gap-2 p-2 pl-10 border-b transition-all ${
                          isIncluded ? 'bg-background' : 'bg-muted/30 opacity-60'
                        }`}
                      >
                        <Checkbox
                          checked={isIncluded}
                          onCheckedChange={() => handleToggleTransaction(transaction.id, transaction.type)}
                        />
                        <div className="flex-1 min-w-0 mt-[0px] mr-[-28px] mb-[0px] ml-[0px]">
                          <div className="font-medium truncate flex items-center gap-1.5">
                            {transaction.category && (
                              <span className="text-base" title={`Category: ${transaction.category}`}>
                                {getCategoryEmoji(transaction.category, settings)}
                              </span>
                            )}
                            <span className="text-sm">{transaction.description}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateShort(transaction.date)}
                          </div>
                        </div>
                        <div className={`text-sm font-semibold whitespace-nowrap md:w-auto w-[115px] text-right shrink-0 ${
                          transaction.type === 'expense'
                            ? (transaction.fromIncome ? 'text-green-600' : 'text-red-600')
                            : 'text-green-600'
                        }`}>
                          {transaction.type === 'expense'
                            ? (transaction.fromIncome ? '+' : '-')
                            : '+'
                          }
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* TASK 3: Footer Actions with Visual Hierarchy */}
      <div className="border-t pt-[16px] space-y-2 mt-4 bg-background shrink-0 pr-[0px] pb-[40px] pl-[0px]">
        {/* Row 1: Save/Load buttons (Secondary) */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleOpenSaveDialog}
            className="flex-1 h-11 md:h-auto"
          >
            💾 Simpan
          </Button>
          <Button 
            variant="outline" 
            onClick={handleOpenLoadDialog}
            className="flex-1 h-11 md:h-auto"
          >
            📂 Muat
          </Button>
        </div>
        
        {/* Row 2: Reset (Destructive) + Close (Primary) */}
        <div className="flex gap-2">
          <Button 
            variant={isMobile ? "outline" : "destructive"}
            onClick={handleReset} 
            className="flex-1 h-11 md:h-auto"
          >
            Reset
          </Button>
          <Button 
            variant="default"
            onClick={onClose} 
            className="flex-1 h-11 md:h-auto"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );

  // Render based on platform
  return (
    <>
      {/* Main Sandbox Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onClose}>
          <DrawerContent 
            className="flex flex-col p-4"
            style={{ 
              height: '100vh',
              maxHeight: '100vh',
              marginTop: 0,
            }}
          >
            {/* Hidden title for accessibility - using DrawerTitle for proper a11y */}
            <DrawerTitle className="sr-only">Simulation Sandbox</DrawerTitle>
            {sandboxContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-6" aria-describedby={undefined}>
            <DialogHeader className="shrink-0">
              <DialogTitle>🔬 Simulation Sandbox</DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0 flex flex-col">
              {sandboxContent}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Phase 3: Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>💾 Simpan Simulasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input 
                placeholder="Nama simulasi (contoh: Hemat November 2025)"
                value={simulationName}
                onChange={(e) => setSimulationName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmSave();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div className="font-medium mb-2">Preview Simulasi:</div>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span>Total Pemasukan:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(netIncomeAfterDeduction)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total Pengeluaran:</span>
                  <span className="text-red-600 font-medium">{formatCurrency(totalExpenseSimulation)}</span>
                </li>
                <li className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="font-medium">Sisa Budget:</span>
                  <span className={`font-semibold ${remainingBudget >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {formatCurrency(remainingBudget)}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirmSave}>
              💾 Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Phase 3: Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>📂 Muat Simulasi</DialogTitle>
          </DialogHeader>
          
          {savedSimulations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Belum ada simulasi yang tersimpan.</p>
              <p className="text-sm mt-2">Simpan simulasi pertama Anda untuk mulai!</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {savedSimulations
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(sim => (
                    <Card 
                      key={sim.id} 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleLoadSimulation(sim)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{sim.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDateSafe(sim.createdAt, { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <div className="mt-2 text-sm flex flex-wrap items-center gap-2">
                              <span className="text-green-600 font-medium">
                                +{formatCurrency(sim.metadata.totalIncome)}
                              </span>
                              <span className="text-muted-foreground">|</span>
                              <span className="text-red-600 font-medium">
                                -{formatCurrency(sim.metadata.totalExpense)}
                              </span>
                              <span className="text-muted-foreground">|</span>
                              <span className={`font-semibold ${sim.metadata.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                Sisa: {formatCurrency(sim.metadata.netAmount)}
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSimulation(sim.id);
                            }}
                            title="Hapus simulasi"
                          >
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}