import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { EXPENSE_CATEGORIES } from "../constants";
import { ExpenseCategory } from "../types";
import { formatCurrency } from "../utils/currency";
import { Progress } from "./ui/progress";

interface CategoryBreakdownProps {
  expenses: Array<{
    amount: number;
    category?: string;
  }>;
}

interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
  percentage: number;
  emoji: string;
  label: string;
}

export const CategoryBreakdown = memo(function CategoryBreakdown({ 
  expenses 
}: CategoryBreakdownProps) {
  
  const categoryData = useMemo(() => {
    // Calculate totals per category
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    
    expenses.forEach(expense => {
      const cat = (expense.category || 'other') as ExpenseCategory;
      totals[cat] = (totals[cat] || 0) + expense.amount;
      grandTotal += expense.amount;
    });
    
    // Convert to array and sort by amount (descending)
    const categoryTotals: CategoryTotal[] = Object.entries(totals)
      .map(([category, total]) => ({
        category: category as ExpenseCategory,
        total,
        percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
        emoji: EXPENSE_CATEGORIES[category as ExpenseCategory].emoji,
        label: EXPENSE_CATEGORIES[category as ExpenseCategory].label,
      }))
      .sort((a, b) => b.total - a.total);
    
    return { categoryTotals, grandTotal };
  }, [expenses]);
  
  const { categoryTotals, grandTotal } = categoryData;
  
  // Show top 5 categories
  const topCategories = categoryTotals.slice(0, 5);
  const hasOthers = categoryTotals.length > 5;
  const othersTotal = categoryTotals.slice(5).reduce((sum, cat) => sum + cat.total, 0);
  
  if (expenses.length === 0 || grandTotal === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">📊 Pengeluaran per Kategori</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topCategories.map((cat) => (
          <div key={cat.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.emoji}</span>
                <span className="font-medium">{cat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {cat.percentage.toFixed(0)}%
                </span>
                <span className="font-medium min-w-[100px] text-right">
                  {formatCurrency(cat.total)}
                </span>
              </div>
            </div>
            <Progress 
              value={cat.percentage} 
              className="h-2"
            />
          </div>
        ))}
        
        {hasOthers && (
          <div className="space-y-1.5 pt-1 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <span className="font-medium text-muted-foreground">
                  Lainnya ({categoryTotals.length - 5} kategori)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {((othersTotal / grandTotal) * 100).toFixed(0)}%
                </span>
                <span className="font-medium min-w-[100px] text-right text-muted-foreground">
                  {formatCurrency(othersTotal)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
