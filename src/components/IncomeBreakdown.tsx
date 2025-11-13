import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { formatCurrency } from "../utils/currency";
import { motion } from "motion/react";
import { useIsMobile } from "./ui/use-mobile";
import { ChevronDown, ChevronUp, DollarSign, Wallet, TrendingUp, Minus, BarChart3 } from "lucide-react";

interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  usdAmount?: number;
  exchangeRate?: number;
}

interface IncomeBreakdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBudget: number;
  additionalIncome: IncomeItem[];
  carryOverAssets: number;
  globalDeduction: number;
  totalIncome: number;
}

interface IncomeSourceData {
  source: string;
  amount: number;
  count: number;
  transactions: IncomeItem[];
  icon: string;
  color: string;
}

interface BreakdownItem {
  id: string;
  label: string;
  amount: number;
  count: number;
  icon: string;
  color: string;
  type: 'budget' | 'income' | 'carryover' | 'deduction';
  details?: IncomeItem[];
}

const IncomeBreakdownContent = ({
  initialBudget,
  additionalIncome,
  carryOverAssets,
  globalDeduction,
  totalIncome
}: Omit<IncomeBreakdownProps, 'open' | 'onOpenChange'>) => {
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  // Group income by source name
  const incomeBySource = useMemo(() => {
    const sourceMap = new Map<string, IncomeSourceData>();
    
    additionalIncome.forEach(item => {
      const sourceName = item.name;
      if (!sourceMap.has(sourceName)) {
        sourceMap.set(sourceName, {
          source: sourceName,
          amount: 0,
          count: 0,
          transactions: [],
          icon: "💰",
          color: "#10B981"
        });
      }
      
      const sourceData = sourceMap.get(sourceName)!;
      sourceData.amount += item.amount;
      sourceData.count += 1;
      sourceData.transactions.push(item);
    });
    
    return Array.from(sourceMap.values()).sort((a, b) => b.amount - a.amount);
  }, [additionalIncome]);

  // Build breakdown items for chart and list
  const breakdownItems = useMemo((): BreakdownItem[] => {
    const items: BreakdownItem[] = [];
    
    // Budget Awal
    if (initialBudget > 0) {
      items.push({
        id: 'budget',
        label: 'Budget Awal',
        amount: initialBudget,
        count: 1,
        icon: '🏦',
        color: '#3B82F6',
        type: 'budget'
      });
    }
    
    // Income sources (grouped)
    incomeBySource.forEach((source, index) => {
      items.push({
        id: `income-${index}`,
        label: source.source,
        amount: source.amount,
        count: source.count,
        icon: '📥',
        color: '#10B981',
        type: 'income',
        details: source.transactions
      });
    });
    
    // Carry-Over Aset
    if (carryOverAssets > 0) {
      items.push({
        id: 'carryover',
        label: 'Carry-Over Aset',
        amount: carryOverAssets,
        count: 1,
        icon: '🔄',
        color: '#06B6D4',
        type: 'carryover'
      });
    }
    
    // Potongan Global (negative, displayed as deduction)
    if (globalDeduction > 0) {
      items.push({
        id: 'deduction',
        label: 'Potongan Global',
        amount: -globalDeduction, // Negative for chart
        count: 1,
        icon: '➖',
        color: '#EF4444',
        type: 'deduction'
      });
    }
    
    return items;
  }, [initialBudget, incomeBySource, carryOverAssets, globalDeduction]);

  // Chart data
  const chartData = useMemo(() => {
    return breakdownItems.map(item => ({
      name: item.label,
      amount: Math.abs(item.amount), // Use absolute value for bar length
      displayAmount: item.amount, // Keep original for display
      color: item.color,
      isNegative: item.amount < 0
    }));
  }, [breakdownItems]);

  const toggleExpand = (itemId: string) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Find max amount for percentage calculation
  const maxAmount = useMemo(() => {
    return Math.max(...breakdownItems.map(item => Math.abs(item.amount)));
  }, [breakdownItems]);

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Pemasukan Bersih</p>
              <p className="text-2xl text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="size-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="size-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      {breakdownItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="size-4" />
              Perbandingan Sumber Pemasukan
            </h3>
            <ResponsiveContainer width="100%" height={Math.max(200, breakdownItems.length * 50)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-lg">
                        <p className="text-xs font-medium">{data.name}</p>
                        <p className={`text-sm ${data.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                          {data.isNegative ? '-' : '+'}{formatCurrency(Math.abs(data.displayAmount))}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      opacity={entry.isNegative ? 0.6 : 1}
                      style={entry.isNegative ? { 
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)'
                      } : {}}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed List */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground">Detail Breakdown</h3>
        {breakdownItems.map((item) => {
          const isExpanded = expandedSources.has(item.id);
          const hasDetails = item.details && item.details.length > 0;
          const percentage = maxAmount > 0 ? (Math.abs(item.amount) / maxAmount) * 100 : 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`
                  transition-all
                  ${hasDetails ? 'cursor-pointer hover:shadow-md' : ''}
                  ${item.type === 'deduction' ? 'border-red-200 bg-red-50/30' : ''}
                `}
                onClick={() => hasDetails && toggleExpand(item.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.label}</p>
                            {item.count > 1 && (
                              <Badge variant="secondary" className="text-xs">
                                {item.count}x
                              </Badge>
                            )}
                            {hasDetails && (
                              isExpanded ? 
                                <ChevronUp className="size-4 text-muted-foreground" /> : 
                                <ChevronDown className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className={`font-semibold ${item.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`}>
                            {item.type === 'deduction' ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
                          </p>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              item.type === 'deduction' 
                                ? 'bg-red-500' 
                                : 'bg-gradient-to-r from-green-500 to-green-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && hasDetails && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 space-y-2 pl-3 border-l-2 border-green-200"
                          >
                            {item.details!.map((detail, idx) => (
                              <div key={detail.id} className="flex items-center justify-between text-sm">
                                <div className="flex-1">
                                  <p className="text-muted-foreground">
                                    {new Date(detail.date).toLocaleDateString('id-ID', { 
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </p>
                                  {detail.usdAmount && (
                                    <p className="text-xs text-muted-foreground">
                                      ${detail.usdAmount.toFixed(2)} × {detail.exchangeRate?.toLocaleString('id-ID')}
                                    </p>
                                  )}
                                </div>
                                <p className="text-green-600 font-medium">
                                  +{formatCurrency(detail.amount)}
                                </p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export function IncomeBreakdown(props: IncomeBreakdownProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={props.open} onOpenChange={props.onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <DollarSign className="size-5 text-green-600" />
              Breakdown Pemasukan
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">
            <IncomeBreakdownContent {...props} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" aria-describedby={undefined}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="size-5 text-green-600" />
            Breakdown Pemasukan
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-1 -mx-1">
          <IncomeBreakdownContent {...props} />
        </div>
      </DialogContent>
    </Dialog>
  );
}