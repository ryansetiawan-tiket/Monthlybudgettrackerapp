import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { 
  getCategoryEmoji, 
  getCategoryLabel,
  getBudgetStatus,
  getBudgetStatusColor,
  getBudgetPercentage
} from "../utils/calculations";
import { ExpenseCategory } from "../constants";
import { formatCurrency } from "../utils/currency";
import { motion } from "motion/react";
import { useIsMobile } from "./ui/use-mobile";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { TrendingUp, TrendingDown } from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Expense {
  id: string;
  name: string;
  amount: number;
  category?: string;
  date: string;
}

interface CategoryBreakdownProps {
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

export function CategoryBreakdown({ 
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
  const isMobile = useIsMobile();
  
  const { settings } = useCategorySettings();
  const expenses = expensesProp || fetchedExpenses;

  // Fetch previous month data for MoM comparison
  useEffect(() => {
    if (monthKey) {
      fetchPreviousMonthData();
      fetchThreeMonthAverage();
    }
  }, [monthKey, pocketId]);

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
      const prevDate = new Date(year, month - 2, 1);
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1/timeline?month=${prevKey}${pocketId ? `&pocketId=${pocketId}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const prevExpenses: Expense[] = data.flatMap((day: any) => 
          day.expenses || []
        );
        
        // Aggregate by category
        const categoryMap = new Map<string, number>();
        prevExpenses.forEach(exp => {
          const cat = exp.category || 'other';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + exp.amount);
        });
        
        setPreviousMonthData(categoryMap);
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
    const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();

    expensesOnly.forEach(expense => {
      const category = (expense.category as ExpenseCategory) || 'other';
      const current = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: current.amount + expense.amount,
        count: current.count + 1
      });
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
        // 🔧 FIX: Only show MoM if there's valid previous month data (> 0)
        mom: mom.previousAmount > 0 ? mom : undefined
      };
    });

    data.sort((a, b) => b.amount - a.amount);
    return data;
  }, [expenses, settings, calculateMoM]);

  const totalExpenses = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.amount, 0);
  }, [categoryData]);

  // Handle category click
  const handleCategoryClick = useCallback((category: ExpenseCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  }, [onCategoryClick]);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (categoryData.length === 0) {
    const hasExpenses = expenses.some(exp => exp.amount > 0);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Breakdown per Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="font-medium mb-2">Belum Ada Data</h3>
            <p className="text-sm text-muted-foreground">
              {hasExpenses 
                ? "Pengeluaran Anda belum memiliki kategori. Tambahkan kategori untuk melihat breakdown."
                : "Tambahkan pengeluaran untuk melihat breakdown kategori"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📊 Breakdown per Kategori
          </CardTitle>
          <div className="text-right">
            <p className="font-semibold">Total: {formatCurrency(totalExpenses)}</p>
            {threeMonthAvg > 0 && (
              <p className="text-xs text-muted-foreground">
                Avg 3 bulan: {formatCurrency(threeMonthAvg)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
          <ScrollArea className="max-h-[60vh]">
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
          </ScrollArea>
        )}
      </CardContent>
    </Card>
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
