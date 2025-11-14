import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { 
  getCategoryEmoji, 
  getCategoryLabel,
  getBudgetStatus,
  getBudgetStatusColor,
  getBudgetPercentage
} from "../utils/calculations";
import { ExpenseCategory, LEGACY_CATEGORY_ID_MAP } from "../constants";
import { formatCurrency } from "../utils/currency";
import { motion } from "motion/react";
import { useIsMobile } from "./ui/use-mobile";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { INSIGHTS_POOL, getRandomInsights } from './category-insights-pool';
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category?: string;
  date: string;
  items?: Array<{
    name: string;
    amount: number;
    category?: string;
  }>;
}

interface CategoryBreakdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthKey: string;
  pocketId?: string;
  onRefresh?: () => void;
  expenses?: Expense[];
  onCategoryClick?: (category: ExpenseCategory) => void;
  activeFilter?: Set<ExpenseCategory>;
}

interface CategoryDataItem {
  category: ExpenseCategory;
  emoji: string;
  label: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  
  // NEW: Budget tracking
  budget?: {
    limit: number;
    warningAt: number;
    spent: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger' | 'exceeded';
  };
  
  // NEW: Month-over-Month comparison
  mom?: {
    diff: number;
    percentage: number;
    trend: 'up' | 'down' | 'same';
  };
}

// Category colors for charts
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#10B981',
  transport: '#3B82F6',
  savings: '#8B5CF6',
  bills: '#F59E0B',
  health: '#EF4444',
  loan: '#EC4899',
  family: '#06B6D4',
  entertainment: '#F97316',
  installment: '#6366F1',
  shopping: '#14B8A6',
  other: '#6B7280',
};

/**
 * 🔧 BACKWARD COMPATIBILITY HELPER
 * Normalizes legacy category IDs (0, 1, 2, etc.) to new string keys (food, transport, etc.)
 * 
 * @param categoryId - The category ID (can be old numeric or new string)
 * @returns Normalized category key
 * 
 * @example
 * normalizeCategoryId('1') → 'transport'
 * normalizeCategoryId('transport') → 'transport'
 * normalizeCategoryId('custom_abc123') → 'custom_abc123'
 */
function normalizeCategoryId(categoryId: string | undefined): string {
  if (!categoryId) return 'other';
  
  // Check if it's a legacy numeric ID
  if (categoryId in LEGACY_CATEGORY_ID_MAP) {
    return LEGACY_CATEGORY_ID_MAP[categoryId];
  }
  
  // Already normalized or custom category
  return categoryId;
}

export function CategoryBreakdown({ 
  open,
  onOpenChange,
  monthKey, 
  pocketId, 
  expenses: expensesProp,
  onCategoryClick,
  activeFilter = new Set()
}: CategoryBreakdownProps) {
  const [loading, setLoading] = useState(!expensesProp);
  const [fetchedExpenses, setFetchedExpenses] = useState<Expense[]>([]);
  const [previousMonthData, setPreviousMonthData] = useState<Map<string, number>>(new Map());
  const [threeMonthAvg, setThreeMonthAvg] = useState<number>(0);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  const { settings } = useCategorySettings();
  const expenses = expensesProp || fetchedExpenses;

  // Fetch previous month data for MoM comparison
  useEffect(() => {
    if (monthKey && open) {
      fetchPreviousMonthData();
      fetchThreeMonthAverage();
    }
  }, [monthKey, pocketId, open]);

  useEffect(() => {
    if (!expensesProp && monthKey) {
      fetchExpenses();
    } else if (expensesProp) {
      setLoading(false);
    }
  }, [monthKey, pocketId, expensesProp]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFetchedExpenses([]);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch previous month expenses for MoM comparison
  const fetchPreviousMonthData = async () => {
    try {
      const [year, month] = monthKey.split('-').map(Number);
      const prevDate = new Date(year, month - 1, 1);
      prevDate.setMonth(prevDate.getMonth() - 1); // Go back 1 month
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      
      const [prevYear, prevMonth] = prevKey.split('-');
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1/expenses/${prevYear}/${prevMonth}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Handle multiple response formats (backward compat)
        let prevExpenses: Expense[] = [];
        
        if (Array.isArray(result)) {
          prevExpenses = result;
        } else if (result.data && Array.isArray(result.data)) {
          prevExpenses = result.data;
        } else if (result.expenses && Array.isArray(result.expenses)) {
          prevExpenses = result.expenses;
        } else {
          console.error('Unknown response format - cannot parse expenses:', result);
        }
        
        // Aggregate by category - support both expense-level and item-level categories
        // 🔧 BACKWARD COMPAT: Normalize legacy category IDs to new string keys
        const categoryMap = new Map<string, number>();
        prevExpenses.forEach(exp => {
          // Check if expense has items with individual categories
          const expenseItems = (exp as any).items;
          
          if (expenseItems && Array.isArray(expenseItems) && expenseItems.length > 0) {
            // Aggregate by item category (with normalization)
            expenseItems.forEach((item: any) => {
              const rawCat = item.category || 'other';
              const cat = normalizeCategoryId(rawCat);
              categoryMap.set(cat, (categoryMap.get(cat) || 0) + item.amount);
            });
          } else {
            // Aggregate by expense category (with normalization)
            const rawCat = exp.category || 'other';
            const cat = normalizeCategoryId(rawCat);
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + exp.amount);
          }
        });
        
        setPreviousMonthData(categoryMap);
      } else {
        console.error('Failed to fetch previous month data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching previous month data:', error);
    }
  };

  // Fetch 3-month average
  const fetchThreeMonthAverage = async () => {
    try {
      const [year, month] = monthKey.split('-').map(Number);
      const months: string[] = [];
      
      // Get last 3 months
      for (let i = 1; i <= 3; i++) {
        const d = new Date(year, month - i - 1, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
      
      let totalSpent = 0;
      let validMonths = 0;
      
      for (const m of months) {
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1/timeline?month=${m}${pocketId ? `&pocketId=${pocketId}` : ''}`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const monthExpenses: Expense[] = data.flatMap((day: any) => day.expenses || []);
          const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
          totalSpent += monthTotal;
          validMonths++;
        }
      }
      
      if (validMonths > 0) {
        setThreeMonthAvg(totalSpent / validMonths);
      }
    } catch (error) {
      console.error('Error fetching 3-month average:', error);
    }
  };

  // Calculate MoM diff
  const calculateMoM = useCallback((currentAmount: number, category: string) => {
    const previousAmount = previousMonthData.get(category) || 0;
    const diff = currentAmount - previousAmount;
    const percentage = previousAmount > 0 ? ((diff / previousAmount) * 100) : 0;
    const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
    
    return { diff, percentage, trend, previousAmount };
  }, [previousMonthData]);

  // Process category data with budget and MoM
  const categoryData = useMemo<CategoryDataItem[]>(() => {
    if (expenses.length === 0) return [];

    const expensesOnly = expenses.filter(exp => exp.amount > 0);
    if (expensesOnly.length === 0) return [];

    // Aggregate by category
    // ✅ Support both expense-level category AND item-level categories (for template expenses)
    // 🔧 BACKWARD COMPAT: Normalize legacy category IDs to new string keys
    const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();

    expensesOnly.forEach(expense => {
      // Check if expense has items with individual categories
      const expenseItems = (expense as any).items;
      
      if (expenseItems && Array.isArray(expenseItems) && expenseItems.length > 0) {
        // ✅ NEW: Aggregate by item category (template expenses)
        expenseItems.forEach((item: any) => {
          const rawCategory = item.category || 'other';
          const category = normalizeCategoryId(rawCategory) as ExpenseCategory;  // ✅ Normalize!
          const current = categoryMap.get(category) || { amount: 0, count: 0 };
          categoryMap.set(category, {
            amount: current.amount + item.amount,
            count: current.count + 1
          });
        });
      } else {
        // ✅ OLD: Aggregate by expense category (regular expenses)
        const rawCategory = expense.category || 'other';
        const category = normalizeCategoryId(rawCategory) as ExpenseCategory;  // ✅ Normalize!
        const current = categoryMap.get(category) || { amount: 0, count: 0 };
        categoryMap.set(category, {
          amount: current.amount + expense.amount,
          count: current.count + 1
        });
      }
    });

    const total = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.amount, 0);

    // Create enhanced data array
    const data: CategoryDataItem[] = Array.from(categoryMap.entries()).map(([cat, stats]) => {
      // 🔧 FIX: Budget data stored in settings.budgets[categoryId], not settings.categories
      const budget = settings?.budgets?.[cat];
      
      // Budget info
      let budgetInfo = undefined;
      if (budget?.enabled) {
        const budgetPercentage = getBudgetPercentage(stats.amount, budget.limit);
        const status = getBudgetStatus(stats.amount, budget.limit, budget.warningAt);
        
        budgetInfo = {
          limit: budget.limit,
          warningAt: budget.warningAt,
          spent: stats.amount,
          percentage: budgetPercentage,
          status
        };
      }
      
      // MoM info
      const mom = calculateMoM(stats.amount, cat);

      return {
        category: cat,
        emoji: getCategoryEmoji(cat, settings),
        label: getCategoryLabel(cat, settings),
        amount: stats.amount,
        count: stats.count,
        percentage: total > 0 ? (stats.amount / total) * 100 : 0,
        color: CATEGORY_COLORS[cat],
        budget: budgetInfo,
        // 🔧 MoM Badge Logic:
        // ✅ SHOW: Previous month had data (previousAmount > 0)
        // ❌ HIDE: Category is new this month (previousAmount = 0)
        mom: mom.previousAmount > 0 ? mom : undefined
      };
    });

    data.sort((a, b) => b.amount - a.amount);
    
    return data;
  }, [expenses, settings, calculateMoM]); // ✅ Added settings dependency

  const totalExpenses = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.amount, 0);
  }, [categoryData]);

  // 🎲 Random select 3 insights when dialog opens (MUST be after categoryData is defined)
  useEffect(() => {
    if (open && categoryData.length > 0) {
      setSelectedInsights(getRandomInsights());
    }
  }, [open, categoryData.length]);

  // Handle category click
  const handleCategoryClick = useCallback((category: ExpenseCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category);
      // Close modal so user can see filtered expense list
      onOpenChange(false);
    }
  }, [onCategoryClick, onOpenChange]);

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryDataItem;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">
            {data.emoji} {data.label}
          </p>
          <p className="text-sm font-semibold">{formatCurrency(data.amount)}</p>
          <p className="text-xs text-muted-foreground">{data.count} transaksi</p>
          {data.budget && (
            <p className="text-xs mt-1" style={{ color: getBudgetStatusColor(data.budget.status) }}>
              Budget: {data.budget.percentage.toFixed(0)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Loading state content
  const loadingContent = (
    <div className="space-y-4 p-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );

  // Empty state content
  const emptyContent = () => {
    const hasExpenses = expenses.some(exp => exp.amount > 0);
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="font-medium mb-2">Belum Ada Data</h3>
        <p className="text-sm text-muted-foreground">
          {hasExpenses 
            ? "Pengeluaran Anda belum memiliki kategori. Tambahkan kategori untuk melihat breakdown."
            : "Tambahkan pengeluaran untuk melihat breakdown kategori"}
        </p>
      </div>
    );
  };

  // Main content
  const mainContent = (
    <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
      {/* Header with total */}
      {!loading && categoryData.length > 0 && (
        <div className={isMobile ? 'px-4' : ''}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className={isMobile ? 'size-4' : 'size-5'} />
              <h3 className={isMobile ? 'text-sm font-semibold' : 'font-semibold'}>
                Breakdown per Kategori
              </h3>
            </div>
            {!isMobile && (
              <p className="text-sm text-muted-foreground">
                Total: {formatCurrency(totalExpenses)}
              </p>
            )}
          </div>
          {isMobile && (
            <p className="text-xs text-muted-foreground mt-1">
              Total: {formatCurrency(totalExpenses)}
            </p>
          )}
          {!isMobile && threeMonthAvg > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Avg 3 bulan: {formatCurrency(threeMonthAvg)}
            </p>
          )}
        </div>
      )}
      
      {/* Loading state */}
      {loading && loadingContent}
      
      {/* Empty state */}
      {!loading && categoryData.length === 0 && emptyContent()}
      
      {/* Content with data */}
      {!loading && categoryData.length > 0 && (
        <>
          {/* DESKTOP: 2-Column Layout */}
          {!isMobile && (
            <div className="grid grid-cols-2 gap-6">
              {/* LEFT: Horizontal Bar Chart */}
              <div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={categoryData} 
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="label" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="amount" 
                      radius={[0, 4, 4, 0]}
                      fill="#3B82F6"
                      style={{ cursor: 'pointer' }}
                      onClick={(data: any) => {
                        if (data && data.category) {
                          handleCategoryClick(data.category);
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* RIGHT: Smart Category List */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {categoryData.map((item, index) => (
                    <CategorySmartCard
                      key={item.category}
                      data={item}
                      onClick={() => handleCategoryClick(item.category)}
                      index={index}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* MOBILE: 1-Column Compact Cards */}
          {isMobile && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {categoryData.map((item, index) => (
                  <CategoryCompactCard
                    key={item.category}
                    data={item}
                    onClick={() => handleCategoryClick(item.category)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 🎯 NEW: Fun Insights Section */}
          <div className={isMobile ? 'px-4 mt-6' : 'mt-6'}>
            <h3 className={isMobile ? 'text-sm font-semibold mb-3' : 'font-semibold mb-4'}>
              💡 Fun Insights Bulan Ini
            </h3>
            
            {/* Dynamic Insight Cards Grid */}
            <div className={isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-3'}>
              {selectedInsights.map(insightId => {
                const config = INSIGHTS_POOL.find(i => i.id === insightId);
                if (!config) return null;
                
                const result = config.calculate(categoryData, expenses, previousMonthData, settings);
                if (!result.hasData) return null; // Skip if no data available
                
                const isActive = selectedInsight === insightId;
                
                return (
                  <div key={insightId}>
                    {/* Insight Card */}
                    <Card 
                      className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} ${config.borderColor} transition-colors cursor-pointer`}
                      onClick={() => setSelectedInsight(isActive ? null : insightId)}
                    >
                      <CardContent className={isMobile ? 'p-4' : 'p-4'}>
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{result.category ? result.category.emoji : config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">{config.icon} {config.title}</p>
                            <p className="font-semibold text-sm mb-1 truncate">
                              {result.category ? result.category.label : '-'}
                            </p>
                            <p className={`${config.textColor} font-bold`}>{result.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {config.subtitle}
                            </p>
                          </div>
                          {isActive ? (
                            <ChevronUp className="size-4 text-muted-foreground ml-auto flex-shrink-0" />
                          ) : (
                            <ChevronDown className="size-4 text-muted-foreground ml-auto flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Transaction List - Immediately Below This Card (Mobile Only) */}
                    {isMobile && isActive && (() => {
                      const filteredExpenses = config.getFilteredExpenses(result.category!, expenses);
                      const sortedExpenses = [...filteredExpenses].sort((a, b) => b.amount - a.amount);
                      
                      // Extract border color (e.g., 'border-red-500/30' -> 'red')
                      const colorMatch = config.borderColor.match(/border-(\w+)-/);
                      const baseColor = colorMatch ? colorMatch[1] : 'gray';
                      
                      return (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden mt-2"
                        >
                          <div className="grid grid-cols-1 gap-2">
                            {sortedExpenses.map((exp, idx) => {
                              const isLargest = idx === 0;
                              
                              return (
                                <motion.div
                                  key={exp.id}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                >
                                  <Card className={`bg-muted/30 border-${baseColor}-500/20 h-full`}>
                                    <CardContent className="p-3">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium truncate flex-1 text-sm">
                                          {exp.name}
                                        </p>
                                        <p className={`font-semibold text-${baseColor}-600 ml-2 text-sm`}>
                                          {formatCurrency(exp.amount)}
                                        </p>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </p>
                                      {isLargest && (
                                        <div className={`mt-2 pt-2 border-t border-${baseColor}-500/20`}>
                                          <p className={`text-xs text-${baseColor}-600 font-medium`}>💰 Transaksi Terbesar</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Desktop Transaction Lists - Full Width Outside Grid */}
            {!isMobile && selectedInsight && (() => {
              const config = INSIGHTS_POOL.find(i => i.id === selectedInsight);
              if (!config) return null;
              
              const result = config.calculate(categoryData, expenses, previousMonthData, settings);
              if (!result.hasData || !result.category) return null;
              
              const filteredExpenses = config.getFilteredExpenses(result.category, expenses);
              const sortedExpenses = [...filteredExpenses].sort((a, b) => b.amount - a.amount);
              
              // Extract border color (e.g., 'border-red-500/30' -> 'red')
              const colorMatch = config.borderColor.match(/border-(\w+)-/);
              const baseColor = colorMatch ? colorMatch[1] : 'gray';
              
              return (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden mt-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {sortedExpenses.map((exp, idx) => {
                      const isLargest = idx === 0;
                      
                      return (
                        <motion.div
                          key={exp.id}
                          className={isLargest ? 'md:col-span-2' : ''}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className={`bg-muted/30 border-${baseColor}-500/20 h-full`}>
                            <CardContent className={isLargest ? 'p-4' : 'p-3'}>
                              <div className="flex items-center justify-between">
                                <p className={`font-medium truncate flex-1 ${isLargest ? 'text-base' : 'text-sm'}`}>
                                  {exp.name}
                                </p>
                                <p className={`font-semibold text-${baseColor}-600 ml-2 ${isLargest ? 'text-base' : 'text-sm'}`}>
                                  {formatCurrency(exp.amount)}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              {isLargest && (
                                <div className={`mt-2 pt-2 border-t border-${baseColor}-500/20`}>
                                  <p className={`text-xs text-${baseColor}-600 font-medium`}>💰 Transaksi Terbesar</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );

  if (isMobile) {
    // Mobile: Drawer with Tabs - Only render when needed to prevent portal issues
    if (!open) return null;
    
    return (
      <Drawer 
        open={open} 
        onOpenChange={onOpenChange}
        dismissible={true}
        modal={true}
        shouldScaleBackground={false}
      >
        <DrawerContent aria-describedby={undefined} className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Breakdown Kategori</DrawerTitle>
          </DrawerHeader>
          
          {/* Loading/Empty States */}
          {loading && <div className="pb-4">{loadingContent}</div>}
          {!loading && categoryData.length === 0 && <div className="pb-4">{emptyContent()}</div>}
          
          {/* 2-Tab Layout for Mobile */}
          {!loading && categoryData.length > 0 && (
            <Tabs defaultValue="breakdown" className="w-full flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-2 mx-4 mb-2 shrink-0">
                <TabsTrigger value="breakdown" className="text-xs">
                  <BarChart3 className="size-3 mr-1" />
                  Breakdown
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-xs">
                  <Sparkles className="size-3 mr-1" />
                  Fun Insights
                </TabsTrigger>
              </TabsList>
              
              {/* Tab 1: Breakdown Kategori */}
              <TabsContent value="breakdown" className="mt-0 overflow-y-auto flex-1">
                {/* Header with total */}
                <div className="px-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4" />
                      <h3 className="text-sm font-semibold">Breakdown per Kategori</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: {formatCurrency(totalExpenses)}
                  </p>
                </div>
                
                {/* Category Cards */}
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {categoryData.map((item, index) => (
                      <CategoryCompactCard
                        key={item.category}
                        data={item}
                        onClick={() => handleCategoryClick(item.category)}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab 2: Fun Insights */}
              <TabsContent value="insights" className="mt-0 overflow-y-auto flex-1">
                <div className="px-4 pb-4">
                  <h3 className="text-sm font-semibold mb-3">
                    💡 Fun Insights Bulan Ini
                  </h3>
                  
                  {/* Dynamic Insight Cards with Inline Transaction Lists */}
                  <div className="space-y-3">
                    {selectedInsights.map(insightId => {
                      const config = INSIGHTS_POOL.find(i => i.id === insightId);
                      if (!config) return null;
                      
                      const result = config.calculate(categoryData, expenses, previousMonthData, settings);
                      if (!result.hasData) return null;
                      
                      const isActive = selectedInsight === insightId;
                      
                      return (
                        <div key={insightId}>
                          {/* Insight Card */}
                          <Card 
                            className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} ${config.borderColor} transition-colors cursor-pointer`}
                            onClick={() => setSelectedInsight(isActive ? null : insightId)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <span className="text-3xl">{result.category ? result.category.emoji : config.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-1">{config.icon} {config.title}</p>
                                  <p className="font-semibold text-sm mb-1 truncate">
                                    {result.category ? result.category.label : '-'}
                                  </p>
                                  <p className={`${config.textColor} font-bold`}>{result.value}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {config.subtitle}
                                  </p>
                                </div>
                                {isActive ? (
                                  <ChevronUp className="size-4 text-muted-foreground ml-auto flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="size-4 text-muted-foreground ml-auto flex-shrink-0" />
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Transaction List - Immediately Below This Card */}
                          {isActive && (() => {
                            const filteredExpenses = config.getFilteredExpenses(result.category!, expenses);
                            const sortedExpenses = [...filteredExpenses].sort((a, b) => b.amount - a.amount);
                            
                            // Extract border color
                            const colorMatch = config.borderColor.match(/border-(\w+)-/);
                            const baseColor = colorMatch ? colorMatch[1] : 'gray';
                            
                            return (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden mt-2"
                              >
                                <div className="grid grid-cols-1 gap-2">
                                  {sortedExpenses.map((exp, idx) => {
                                    const isLargest = idx === 0;
                                    
                                    return (
                                      <motion.div
                                        key={exp.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                      >
                                        <Card className={`bg-muted/30 border-${baseColor}-500/20`}>
                                          <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                              <p className="font-medium truncate flex-1 text-sm">
                                                {exp.name}
                                              </p>
                                              <p className={`font-semibold text-${baseColor}-600 ml-2 text-sm`}>
                                                {formatCurrency(exp.amount)}
                                              </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {new Date(exp.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            {isLargest && (
                                              <div className={`mt-2 pt-2 border-t border-${baseColor}-500/20`}>
                                                <p className={`text-xs text-${baseColor}-600 font-medium`}>💰 Transaksi Terbesar</p>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col" aria-describedby={undefined}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Breakdown Kategori</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 px-1 -mx-1">
          {mainContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Desktop: Smart Card Component
function CategorySmartCard({ 
  data, 
  onClick,
  index 
}: { 
  data: CategoryDataItem; 
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onClick}
      >
        {/* Row 1: Icon + Name + Count */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{data.emoji}</span>
            <span className="font-medium">{data.label}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {data.count} trans
          </span>
        </div>
        
        {/* Row 2: Amount + MoM Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{formatCurrency(data.amount)}</span>
          {data.mom && (
            <Badge 
              variant={data.mom.trend === 'up' ? 'destructive' : 'default'}
              className="text-xs"
            >
              {data.mom.trend === 'up' ? <TrendingUp className="size-3 mr-1" /> : <TrendingDown className="size-3 mr-1" />}
              {formatCurrency(Math.abs(data.mom.diff))}
            </Badge>
          )}
        </div>
        
        {/* Row 3: Progress Bar (if budget enabled) */}
        {data.budget && (
          <>
            <Progress 
              value={Math.min(data.budget.percentage, 100)} 
              className="h-2 mb-1"
              style={{
                // @ts-ignore
                '--progress-background': getBudgetStatusColor(data.budget.status)
              }}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                dari budget {formatCurrency(data.budget.limit)}
              </span>
              <span 
                className="font-medium"
                style={{ color: getBudgetStatusColor(data.budget.status) }}
              >
                {data.budget.percentage.toFixed(0)}%
              </span>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}

// Mobile: Compact Card Component
function CategoryCompactCard({ 
  data, 
  onClick,
  index 
}: { 
  data: CategoryDataItem; 
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className="p-3 cursor-pointer active:bg-muted/50 transition-colors"
        onClick={onClick}
      >
        {/* Line 1: Icon + Name + Count */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{data.emoji}</span>
          <span className="font-medium">{data.label}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            ({data.count} transaksi)
          </span>
        </div>
        
        {/* Line 2: Amount + MoM */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">{formatCurrency(data.amount)}</span>
          {data.mom && (
            <span className="text-xs flex items-center gap-1">
              {data.mom.trend === 'up' ? (
                <TrendingUp className="size-3 text-destructive" />
              ) : (
                <TrendingDown className="size-3 text-green-500" />
              )}
              {formatCurrency(Math.abs(data.mom.diff))}
            </span>
          )}
        </div>
        
        {/* Line 3: Progress bar if budget */}
        {data.budget && (
          <Progress 
            value={Math.min(data.budget.percentage, 100)}
            className="h-2 mb-1"
            style={{
              // @ts-ignore
              '--progress-background': getBudgetStatusColor(data.budget.status)
            }}
          />
        )}
        
        {/* Line 4: Budget context */}
        {data.budget && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Budget: {formatCurrency(data.budget.limit)}</span>
            <span 
              className="font-medium"
              style={{ color: getBudgetStatusColor(data.budget.status) }}
            >
              {data.budget.percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}