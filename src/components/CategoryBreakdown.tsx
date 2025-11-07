import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getCategoryEmoji, getCategoryLabel } from "../utils/calculations";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "../constants";
import { formatCurrency } from "../utils/currency";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { useIsMobile } from "./ui/use-mobile";
import { useCategorySettings } from "../hooks/useCategorySettings";

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
  expenses?: Expense[]; // Optional: if not provided, will fetch from server
  onCategoryClick?: (category: ExpenseCategory) => void; // Phase 7: Click handler
  activeFilter?: Set<ExpenseCategory>; // Phase 7: Active filter state
}

interface CategoryDataItem {
  category: ExpenseCategory;
  emoji: string;
  label: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

// Category colors for pie chart
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#10B981',         // green-500
  transport: '#3B82F6',    // blue-500
  savings: '#8B5CF6',      // violet-500
  bills: '#F59E0B',        // amber-500
  health: '#EF4444',       // red-500
  loan: '#EC4899',         // pink-500
  family: '#06B6D4',       // cyan-500
  entertainment: '#F97316', // orange-500
  installment: '#6366F1',  // indigo-500
  shopping: '#14B8A6',     // teal-500
  other: '#6B7280',        // gray-500
};

export function CategoryBreakdown({ 
  monthKey, 
  pocketId, 
  expenses: expensesProp,
  onCategoryClick,
  activeFilter = new Set()
}: CategoryBreakdownProps) {
  const [loading, setLoading] = useState(!expensesProp); // If expenses prop provided, no loading
  const [fetchedExpenses, setFetchedExpenses] = useState<Expense[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  
  // Phase 8: Get custom category settings
  const { settings } = useCategorySettings();

  // Use provided expenses or fetched expenses
  const expenses = expensesProp || fetchedExpenses;

  useEffect(() => {
    // Only fetch if expenses not provided as prop
    if (!expensesProp && monthKey) {
      fetchExpenses();
    } else if (expensesProp) {
      setLoading(false);
    }
  }, [monthKey, pocketId, expensesProp]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // TODO: Implement proper API endpoint for fetching expenses by month
      // For now, we'll use a mock implementation
      // In production, this should call the timeline endpoint and extract expenses
      
      // Mock data for development
      await new Promise(resolve => setTimeout(resolve, 500));
      setFetchedExpenses([]);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process category data - memoized for performance
  const categoryData = useMemo<CategoryDataItem[]>(() => {
    if (expenses.length === 0) return [];

    // Filter only expenses (positive amounts)
    const expensesOnly = expenses.filter(exp => exp.amount > 0);
    
    if (expensesOnly.length === 0) return [];

    // Aggregate expenses by category
    const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();

    expensesOnly.forEach(expense => {
      const category = (expense.category as ExpenseCategory) || 'other';
      const current = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: current.amount + expense.amount,
        count: current.count + 1
      });
    });

    // Calculate total for percentages
    const total = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.amount, 0);

    // Create data array
    const data: CategoryDataItem[] = Array.from(categoryMap.entries()).map(([cat, stats]) => ({
      category: cat,
      emoji: getCategoryEmoji(cat, settings),
      label: getCategoryLabel(cat, settings),
      amount: stats.amount,
      count: stats.count,
      percentage: total > 0 ? (stats.amount / total) * 100 : 0,
      color: CATEGORY_COLORS[cat]
    }));

    // Sort by amount DESC
    data.sort((a, b) => b.amount - a.amount);

    return data;
  }, [expenses]);

  // Only show categories with actual data (no 0-amount categories)
  const allCategoriesData = useMemo(() => {
    // Return only categories that have transactions
    return categoryData;
  }, [categoryData]);

  const totalExpenses = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.amount, 0);
  }, [categoryData]);

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryDataItem;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">
            {data.emoji} {data.label}
          </p>
          <p className="text-sm font-semibold">{formatCurrency(data.amount)}</p>
          <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">{data.count} transaksi</p>
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

  // Empty state
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
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            📊 Breakdown per Kategori
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {formatCurrency(totalExpenses)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layout: Desktop = side-by-side, Mobile = stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 80 : 100}
                  label={({ percentage }) => `${percentage.toFixed(0)}%`}
                  labelLine={false}
                  onClick={(data: any) => {
                    if (onCategoryClick && data.category) {
                      onCategoryClick(data.category);
                    }
                  }}
                  activeIndex={categoryData.findIndex(d => activeFilter.has(d.category))}
                  activeShape={{
                    stroke: '#000',
                    strokeWidth: 3,
                    scale: 1.05
                  }}
                  style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
                >
                  {categoryData.map((entry) => (
                    <Cell 
                      key={entry.category} 
                      fill={entry.color}
                      style={{ 
                        cursor: onCategoryClick ? 'pointer' : 'default',
                        opacity: activeFilter.size > 0 && !activeFilter.has(entry.category) ? 0.5 : 1,
                        transition: 'opacity 0.2s'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top 3 Categories */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="font-medium flex items-center gap-2">
              🥇 Top 3 Kategori
            </h3>
            <div className="space-y-2">
              {categoryData.slice(0, 3).map((item, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <motion.div
                    key={item.category}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="border border-border/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xl">{medals[index]}</span>
                            <span className="text-lg">{item.emoji}</span>
                            <span className="font-medium truncate">{item.label}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-sm">
                              {formatCurrency(item.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Full Category List - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="font-medium">
                Semua Kategori ({allCategoriesData.length})
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="size-4" />
              </motion.div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1 pt-2"
            >
              {allCategoriesData.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm">{item.label}</span>
                    {item.count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({item.count} transaksi)
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${item.amount === 0 ? 'text-muted-foreground' : ''}`}>
                      {formatCurrency(item.amount)}
                    </p>
                    {item.percentage > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* Summary Footer */}
        {categoryData.length > 0 && (
          <div className="pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="size-4" />
              <span>{categoryData.reduce((sum, item) => sum + item.count, 0)} total pengeluaran</span>
            </div>
            <p className="text-sm font-medium">
              Total: {formatCurrency(totalExpenses)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
