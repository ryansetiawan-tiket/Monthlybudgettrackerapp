import { formatCurrency } from "../utils/currency";

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

interface CategoryDataItem {
  category: string;
  emoji: string;
  label: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  budget?: {
    limit: number;
    warningAt: number;
    spent: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger' | 'exceeded';
  };
  mom?: {
    diff: number;
    percentage: number;
    trend: 'up' | 'down' | 'same';
  };
}

// Helper to normalize category IDs
function normalizeCategoryId(categoryId: string | undefined): string {
  if (!categoryId) return 'other';
  
  const LEGACY_CATEGORY_ID_MAP: Record<string, string> = {
    '0': 'food',
    '1': 'transport',
    '2': 'savings',
    '3': 'bills',
    '4': 'health',
    '5': 'loan',
    '6': 'family',
    '7': 'entertainment',
    '8': 'installment',
    '9': 'shopping',
    '10': 'other',
  };
  
  if (categoryId in LEGACY_CATEGORY_ID_MAP) {
    return LEGACY_CATEGORY_ID_MAP[categoryId];
  }
  
  return categoryId;
}

// 🎲 INSIGHTS POOL - 12 Fun & Insightful Insights
export interface InsightConfig {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  gradient: string;
  borderColor: string;
  textColor: string;
  calculate: (data: CategoryDataItem[], expenses: Expense[], prevMonthData: Map<string, number>, settings: any) => {
    category: CategoryDataItem | null;
    value: string;
    hasData: boolean;
  };
  getFilteredExpenses: (category: CategoryDataItem | null, expenses: Expense[]) => Expense[];
}

export const INSIGHTS_POOL: InsightConfig[] = [
  // 1. 🏆 Juara Ngabisin Duit
  {
    id: 'top-spender',
    icon: '🏆',
    title: 'Juara Ngabisin Duit',
    subtitle: '% dari total pengeluaran',
    gradient: 'from-red-500/10 to-red-600/5',
    borderColor: 'border-red-500/30 hover:border-red-500/50',
    textColor: 'text-red-600',
    calculate: (data) => {
      if (data.length === 0) return { category: null, value: '-', hasData: false };
      const top = data[0]; // Already sorted by amount
      return {
        category: top,
        value: `${top.percentage.toFixed(0)}%`,
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 2. 🔥 Paling Rajin Swipe
  {
    id: 'most-frequent',
    icon: '🔥',
    title: 'Paling Rajin Swipe',
    subtitle: 'transaksi',
    gradient: 'from-blue-500/10 to-blue-600/5',
    borderColor: 'border-blue-500/30 hover:border-blue-500/50',
    textColor: 'text-blue-600',
    calculate: (data) => {
      if (data.length === 0) return { category: null, value: '-', hasData: false };
      const mostFreq = [...data].sort((a, b) => b.count - a.count)[0];
      return {
        category: mostFreq,
        value: `${mostFreq.count}`,
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 3. 💎 Sultan Transaksi
  {
    id: 'highest-avg',
    icon: '💎',
    title: 'Sultan Transaksi',
    subtitle: 'Sekali gesek, langsung gede!',
    gradient: 'from-purple-500/10 to-purple-600/5',
    borderColor: 'border-purple-500/30 hover:border-purple-500/50',
    textColor: 'text-purple-600',
    calculate: (data, expenses, prevMonthData, settings) => {
      if (data.length === 0) return { category: null, value: '-', hasData: false };
      const withAvg = [...data].map(cat => ({
        ...cat,
        avgPerTransaction: cat.amount / cat.count
      })).sort((a, b) => b.avgPerTransaction - a.avgPerTransaction)[0];
      return {
        category: withAvg,
        value: formatCurrency(withAvg.avgPerTransaction),
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 4. 💰 Paling Hemat
  {
    id: 'lowest-spender',
    icon: '💰',
    title: 'Paling Hemat',
    subtitle: 'Kategori paling irit',
    gradient: 'from-green-500/10 to-green-600/5',
    borderColor: 'border-green-500/30 hover:border-green-500/50',
    textColor: 'text-green-600',
    calculate: (data) => {
      if (data.length === 0) return { category: null, value: '-', hasData: false };
      const lowest = [...data].sort((a, b) => a.amount - b.amount)[0];
      return {
        category: lowest,
        value: formatCurrency(lowest.amount),
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 5. 🎯 Budget Hero
  {
    id: 'budget-hero',
    icon: '🎯',
    title: 'Budget Hero',
    subtitle: 'Paling jauh dari limit',
    gradient: 'from-teal-500/10 to-teal-600/5',
    borderColor: 'border-teal-500/30 hover:border-teal-500/50',
    textColor: 'text-teal-600',
    calculate: (data) => {
      const withBudget = data.filter(cat => cat.budget?.enabled);
      if (withBudget.length === 0) return { category: null, value: '-', hasData: false };
      
      const hero = [...withBudget].sort((a, b) => {
        const aRemaining = 100 - (a.budget?.percentage || 100);
        const bRemaining = 100 - (b.budget?.percentage || 100);
        return bRemaining - aRemaining;
      })[0];
      
      const remaining = 100 - (hero.budget?.percentage || 0);
      return {
        category: hero,
        value: `${remaining.toFixed(0)}% tersisa`,
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 6. ⚠️ Budget Alert
  {
    id: 'budget-alert',
    icon: '⚠️',
    title: 'Budget Alert',
    subtitle: 'Mendekati/melebihi limit',
    gradient: 'from-orange-500/10 to-orange-600/5',
    borderColor: 'border-orange-500/30 hover:border-orange-500/50',
    textColor: 'text-orange-600',
    calculate: (data) => {
      const withBudget = data.filter(cat => cat.budget?.enabled);
      if (withBudget.length === 0) return { category: null, value: '-', hasData: false };
      
      const alert = [...withBudget].sort((a, b) => 
        (b.budget?.percentage || 0) - (a.budget?.percentage || 0)
      )[0];
      
      return {
        category: alert,
        value: `${alert.budget?.percentage.toFixed(0)}% terpakai`,
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 7. 📈 Naik Daun
  {
    id: 'trending-up',
    icon: '📈',
    title: 'Naik Daun',
    subtitle: 'Naik paling tinggi vs bulan lalu',
    gradient: 'from-rose-500/10 to-rose-600/5',
    borderColor: 'border-rose-500/30 hover:border-rose-500/50',
    textColor: 'text-rose-600',
    calculate: (data) => {
      const withMom = data.filter(cat => cat.mom && cat.mom.trend === 'up');
      if (withMom.length === 0) return { category: null, value: '-', hasData: false };
      
      const trending = [...withMom].sort((a, b) => 
        (b.mom?.percentage || 0) - (a.mom?.percentage || 0)
      )[0];
      
      return {
        category: trending,
        value: `+${trending.mom?.percentage.toFixed(0)}%`,
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 8. 📉 Turun Drastis
  {
    id: 'trending-down',
    icon: '📉',
    title: 'Turun Drastis',
    subtitle: 'Turun paling banyak vs bulan lalu',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
    textColor: 'text-emerald-600',
    calculate: (data) => {
      const withMom = data.filter(cat => cat.mom && cat.mom.trend === 'down');
      if (withMom.length === 0) return { category: null, value: '-', hasData: false };
      
      const trending = [...withMom].sort((a, b) => 
        Math.abs(a.mom?.percentage || 0) - Math.abs(b.mom?.percentage || 0)
      )[0];
      
      return {
        category: trending,
        value: `${trending.mom?.percentage.toFixed(0)}%`,
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 9. 🌅 Early Bird Spender
  {
    id: 'early-bird',
    icon: '🌅',
    title: 'Early Bird Spender',
    subtitle: 'Paling boros di awal bulan',
    gradient: 'from-amber-500/10 to-amber-600/5',
    borderColor: 'border-amber-500/30 hover:border-amber-500/50',
    textColor: 'text-amber-600',
    calculate: (data, expenses) => {
      if (expenses.length === 0) return { category: null, value: '-', hasData: false };
      
      // Get expenses from first 10 days
      const earlyExpenses = expenses.filter(exp => {
        const day = new Date(exp.date).getDate();
        return day <= 10;
      });
      
      if (earlyExpenses.length === 0) return { category: null, value: '-', hasData: false };
      
      // Aggregate by category
      const catMap = new Map<string, number>();
      earlyExpenses.forEach(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          items.forEach((item: any) => {
            const cat = normalizeCategoryId(item.category);
            catMap.set(cat, (catMap.get(cat) || 0) + item.amount);
          });
        } else {
          const cat = normalizeCategoryId(exp.category);
          catMap.set(cat, (catMap.get(cat) || 0) + exp.amount);
        }
      });
      
      // Find category with most early spending
      let maxCat = '';
      let maxAmount = 0;
      catMap.forEach((amount, cat) => {
        if (amount > maxAmount) {
          maxAmount = amount;
          maxCat = cat;
        }
      });
      
      const category = data.find(d => d.category === maxCat);
      if (!category) return { category: null, value: '-', hasData: false };
      
      return {
        category,
        value: formatCurrency(maxAmount),
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const day = new Date(exp.date).getDate();
        if (day > 10) return false;
        
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 10. 🌙 Night Owl Spender
  {
    id: 'night-owl',
    icon: '🌙',
    title: 'Night Owl Spender',
    subtitle: 'Paling boros di akhir bulan',
    gradient: 'from-indigo-500/10 to-indigo-600/5',
    borderColor: 'border-indigo-500/30 hover:border-indigo-500/50',
    textColor: 'text-indigo-600',
    calculate: (data, expenses) => {
      if (expenses.length === 0) return { category: null, value: '-', hasData: false };
      
      // Get expenses from last 10 days
      const lateExpenses = expenses.filter(exp => {
        const day = new Date(exp.date).getDate();
        return day >= 21; // Assuming month has at least 28 days
      });
      
      if (lateExpenses.length === 0) return { category: null, value: '-', hasData: false };
      
      // Aggregate by category
      const catMap = new Map<string, number>();
      lateExpenses.forEach(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          items.forEach((item: any) => {
            const cat = normalizeCategoryId(item.category);
            catMap.set(cat, (catMap.get(cat) || 0) + item.amount);
          });
        } else {
          const cat = normalizeCategoryId(exp.category);
          catMap.set(cat, (catMap.get(cat) || 0) + exp.amount);
        }
      });
      
      // Find category with most late spending
      let maxCat = '';
      let maxAmount = 0;
      catMap.forEach((amount, cat) => {
        if (amount > maxAmount) {
          maxAmount = amount;
          maxCat = cat;
        }
      });
      
      const category = data.find(d => d.category === maxCat);
      if (!category) return { category: null, value: '-', hasData: false };
      
      return {
        category,
        value: formatCurrency(maxAmount),
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const day = new Date(exp.date).getDate();
        if (day < 21) return false;
        
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 11. 🎲 Paling Random
  {
    id: 'most-random',
    icon: '🎲',
    title: 'Paling Random',
    subtitle: 'Pengeluaran paling nggak konsisten',
    gradient: 'from-pink-500/10 to-pink-600/5',
    borderColor: 'border-pink-500/30 hover:border-pink-500/50',
    textColor: 'text-pink-600',
    calculate: (data, expenses) => {
      if (data.length === 0) return { category: null, value: '-', hasData: false };
      
      // Calculate variance for each category
      const withVariance = data.map(cat => {
        const catExpenses = expenses.filter(exp => {
          const items = (exp as any).items;
          if (items && Array.isArray(items) && items.length > 0) {
            return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
          }
          return normalizeCategoryId(exp.category) === cat.category;
        });
        
        if (catExpenses.length < 2) return { ...cat, variance: 0 };
        
        const amounts = catExpenses.map(e => e.amount);
        const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
        const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
        
        return { ...cat, variance };
      });
      
      const mostRandom = [...withVariance].sort((a, b) => (b as any).variance - (a as any).variance)[0];
      if ((mostRandom as any).variance === 0) return { category: null, value: '-', hasData: false };
      
      const stdDev = Math.sqrt((mostRandom as any).variance);
      return {
        category: mostRandom,
        value: `±${formatCurrency(stdDev)}`,
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  },

  // 12. 🤖 Paling Konsisten
  {
    id: 'most-consistent',
    icon: '🤖',
    title: 'Paling Konsisten',
    subtitle: 'Pengeluaran paling stabil',
    gradient: 'from-cyan-500/10 to-cyan-600/5',
    borderColor: 'border-cyan-500/30 hover:border-cyan-500/50',
    textColor: 'text-cyan-600',
    calculate: (data, expenses) => {
      if (data.length === 0) return { category: null, value: '-', hasData: false };
      
      // Calculate variance for each category
      const withVariance = data.filter(cat => cat.count >= 2).map(cat => {
        const catExpenses = expenses.filter(exp => {
          const items = (exp as any).items;
          if (items && Array.isArray(items) && items.length > 0) {
            return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
          }
          return normalizeCategoryId(exp.category) === cat.category;
        });
        
        const amounts = catExpenses.map(e => e.amount);
        const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
        const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
        
        return { ...cat, variance };
      });
      
      if (withVariance.length === 0) return { category: null, value: '-', hasData: false };
      
      const mostConsistent = [...withVariance].sort((a, b) => (a as any).variance - (b as any).variance)[0];
      const stdDev = Math.sqrt((mostConsistent as any).variance);
      
      return {
        category: mostConsistent,
        value: `±${formatCurrency(stdDev)}`,
        hasData: true
      };
    },
    getFilteredExpenses: (cat, expenses) => {
      if (!cat) return [];
      return expenses.filter(exp => {
        const items = (exp as any).items;
        if (items && Array.isArray(items) && items.length > 0) {
          return items.some((item: any) => normalizeCategoryId(item.category) === cat.category);
        }
        return normalizeCategoryId(exp.category) === cat.category;
      });
    }
  }
];

/**
 * 🎲 Get 3 random unique insights from pool
 */
export function getRandomInsights(): string[] {
  const available = [...INSIGHTS_POOL];
  const selected: string[] = [];
  
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selected.push(available[randomIndex].id);
    available.splice(randomIndex, 1); // Remove to avoid duplicates
  }
  
  return selected;
}
