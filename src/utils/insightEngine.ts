/**
 * 🧠 Insight Engine
 * 
 * Business logic for generating insights from expense data
 * 
 * Created: 2025-11-09
 * Part of: Hybrid Insight Boxes v3 feature
 */

import { formatCurrency } from './currency';

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  fromIncome?: boolean;
}

export interface BusiestDayData {
  date: string;
  total: number;
  expenses: Expense[];
  dayName: string;
}

/**
 * Find busiest day (specific date with highest total expenses)
 * Used for Static Insight Box
 */
export function findBusiestDay(expenses: Expense[]): BusiestDayData | null {
  if (!expenses || expenses.length === 0) {
    return null;
  }

  // Group expenses by date
  const expensesByDate: Record<string, Expense[]> = {};

  expenses.forEach((expense) => {
    if (expense.fromIncome) return; // Skip income items
    
    const date = expense.date;
    if (!expensesByDate[date]) {
      expensesByDate[date] = [];
    }
    expensesByDate[date].push(expense);
  });

  // Calculate totals for each date
  const dateTotals = Object.entries(expensesByDate).map(([date, dayExpenses]) => {
    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { date, total, expenses: dayExpenses };
  });

  if (dateTotals.length === 0) return null;

  // Find date with highest total
  const busiestDay = dateTotals.reduce((max, current) =>
    current.total > max.total ? current : max
  );

  // Format day name
  const date = new Date(busiestDay.date);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];

  return {
    date: busiestDay.date,
    total: busiestDay.total,
    expenses: busiestDay.expenses,
    dayName: `${dayName}, ${day} ${month}`,
  };
}

/**
 * Helper: Get day name in Indonesian
 */
export function formatDayName(dateString: string): string {
  const date = new Date(dateString);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];

  return `${dayName}, ${day} ${month}`;
}
