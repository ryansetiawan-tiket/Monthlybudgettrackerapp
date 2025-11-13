import { useState, useMemo, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from './ui/use-mobile';
import { useMobileBackButton } from '../hooks/useMobileBackButton';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { formatCurrency } from '../utils/currency';
import { Badge } from './ui/badge';
import type { Expense, AdditionalIncome, Pocket, CategorySettings } from '../types';
import { getCategoryEmoji, getCategoryLabel } from '../utils/calculations';

interface CalendarViewProps {
  month: string; // "2025-11"
  expenses: Expense[];
  incomes: AdditionalIncome[];
  pockets: Pocket[];
  settings: CategorySettings;
  onClose: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  onEditIncome?: (income: AdditionalIncome) => void;
  onDeleteIncome?: (id: string) => void;
  onMonthChange?: (year: number, month: number) => void; // Callback to sync with parent App.tsx
  embedded?: boolean; // TRUE when used in Tab 3 (no drawer wrapper, inline mode)
}

interface CalendarDay {
  date: string | null; // "2025-11-08" or null for padding
  isPadding: boolean;
  isToday: boolean;
  isWeekend: boolean;
  hasExpense: boolean;
  hasIncome: boolean;
  totalExpense: number;
  totalIncome: number;
}

const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']; // Monday first (Indonesian standard)
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function CalendarView({
  month,
  expenses,
  incomes,
  pockets,
  settings,
  onClose,
  onEditExpense,
  onDeleteExpense,
  onEditIncome,
  onDeleteIncome,
  onMonthChange,
  embedded,
}: CalendarViewProps) {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedIncomeId, setExpandedIncomeId] = useState<string | null>(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  
  // Internal month navigation state (independent from parent)
  const [viewMonth, setViewMonth] = useState(month);
  
  // Sync viewMonth when parent month changes (e.g., user changes month in App)
  useEffect(() => {
    setViewMonth(month);
  }, [month]);

  // Close transaction drawer with back button (mobile)
  // Calendar drawer close is handled by Drawer component automatically
  useMobileBackButton(
    isDrawerOpen,
    () => setIsDrawerOpen(false),
    'calendar-transaction-drawer'
  );

  // Swipe gesture for closing drawer (mobile only)
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({
    onSwipeDown: () => setIsDrawerOpen(false),
    threshold: 100,
    velocityThreshold: 0.5,
    enabled: isMobile && isDrawerOpen,
  });

  // Parse viewMonth string (use internal state, not prop)
  const [year, monthNum] = viewMonth.split('-').map(Number);
  const monthName = MONTH_NAMES[monthNum - 1];
  
  // Month navigation handlers
  const handlePrevMonth = useCallback(() => {
    const currentDate = new Date(year, monthNum - 1, 1);
    currentDate.setMonth(currentDate.getMonth() - 1);
    const newYear = currentDate.getFullYear();
    const newMonthNum = currentDate.getMonth() + 1;
    const newMonth = `${newYear}-${String(newMonthNum).padStart(2, '0')}`;
    
    // Update internal state for immediate UI feedback
    setViewMonth(newMonth);
    setSelectedDate(null); // Reset selected date when changing months
    
    // Notify parent App.tsx to update main month state and fetch data
    onMonthChange?.(newYear, newMonthNum);
  }, [year, monthNum, onMonthChange]);
  
  const handleNextMonth = useCallback(() => {
    const currentDate = new Date(year, monthNum - 1, 1);
    currentDate.setMonth(currentDate.getMonth() + 1);
    const newYear = currentDate.getFullYear();
    const newMonthNum = currentDate.getMonth() + 1;
    const newMonth = `${newYear}-${String(newMonthNum).padStart(2, '0')}`;
    
    // Update internal state for immediate UI feedback
    setViewMonth(newMonth);
    setSelectedDate(null); // Reset selected date when changing months
    
    // Notify parent App.tsx to update main month state and fetch data
    onMonthChange?.(newYear, newMonthNum);
  }, [year, monthNum, onMonthChange]);
  
  // Filter expenses and incomes for the current view month
  // NOTE: This allows viewing different months even if parent only provides current month data
  // For months without data, calendar will show empty (which is expected behavior)
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(viewMonth));
  }, [expenses, viewMonth]);
  
  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => inc.date.startsWith(viewMonth));
  }, [incomes, viewMonth]);

  // Generate calendar days
  const calendarDays = useMemo((): CalendarDay[] => {
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const dayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const startPadding = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-first (Mon=0, Sun=6)
    const totalDays = lastDay.getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const days: CalendarDay[] = [];

    // Padding days from previous month
    for (let i = 0; i < startPadding; i++) {
      days.push({
        date: null,
        isPadding: true,
        isToday: false,
        isWeekend: false,
        hasExpense: false,
        hasIncome: false,
        totalExpense: 0,
        totalIncome: 0,
      });
    }

    // Actual days of the month
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, monthNum - 1, i).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

      // Calculate expenses and incomes for this date (use filtered data)
      const dayExpenses = filteredExpenses.filter(e => e.date.startsWith(dateStr));
      const dayIncomes = filteredIncomes.filter(inc => inc.date.startsWith(dateStr));

      const totalExpense = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalIncome = dayIncomes.reduce((sum, inc) => {
        const netAmount = inc.deduction > 0 ? inc.amountIDR - inc.deduction : inc.amountIDR;
        return sum + netAmount;
      }, 0);

      days.push({
        date: dateStr,
        isPadding: false,
        isToday: dateStr === todayStr,
        isWeekend,
        hasExpense: dayExpenses.length > 0,
        hasIncome: dayIncomes.length > 0,
        totalExpense,
        totalIncome,
      });
    }

    return days;
  }, [year, monthNum, filteredExpenses, filteredIncomes]);

  // Find highest spending day
  const highestSpendingDay = useMemo(() => {
    let maxDate = '';
    let maxAmount = 0;

    calendarDays.forEach(day => {
      if (day.date && day.totalExpense > maxAmount) {
        maxAmount = day.totalExpense;
        maxDate = day.date;
      }
    });

    return maxDate;
  }, [calendarDays]);

  // Find highest income day
  const highestIncomeDay = useMemo(() => {
    let maxDate = '';
    let maxAmount = 0;

    calendarDays.forEach(day => {
      if (day.date && day.totalIncome > maxAmount) {
        maxAmount = day.totalIncome;
        maxDate = day.date;
      }
    });

    return maxDate;
  }, [calendarDays]);

  // Filter transactions for selected date (use filtered data)
  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return { expenses: [], incomes: [] };

    return {
      expenses: filteredExpenses.filter(e => e.date.startsWith(selectedDate)),
      incomes: filteredIncomes.filter(inc => inc.date.startsWith(selectedDate)),
    };
  }, [selectedDate, filteredExpenses, filteredIncomes]);

  // Handle date click
  const handleDateClick = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    if (isMobile) {
      setIsDrawerOpen(true);
    }
  }, [isMobile]);

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    // Find highest spending day info
    const highestDay = calendarDays.find(day => day.date === highestSpendingDay);
    const hasHighestSpending = highestDay && highestDay.totalExpense > 0;

    // Find highest income day info
    const highestIncDay = calendarDays.find(day => day.date === highestIncomeDay);
    const hasHighestIncome = highestIncDay && highestIncDay.totalIncome > 0;

    return (
      <div className="space-y-4">
        {/* Month header with navigation */}
        <div className="flex items-center justify-between gap-4 py-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="shrink-0"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="size-5" />
          </Button>
          
          <h2 className="font-semibold text-center flex-1">{monthName} {year}</h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="shrink-0"
            aria-label="Bulan selanjutnya"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((day, index) => (
            <div
              key={day}
              className={`text-center py-2 text-sm ${
                index === 0 || index === 6 ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day.isPadding) {
              return <div key={`padding-${index}`} className="aspect-square" />;
            }

            const isSelected = day.date === selectedDate;
            const isHighestSpending = day.date === highestSpendingDay && day.totalExpense > 0;

            return (
              <button
                key={day.date}
                onClick={() => day.date && handleDateClick(day.date)}
                className={`
                  aspect-square p-1 rounded-lg transition-all relative
                  flex flex-col items-center justify-center
                  hover:scale-105 hover:shadow-md
                  ${isSelected ? 'bg-accent ring-2 ring-primary' : 'hover:bg-accent/50'}
                  ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                  ${isHighestSpending ? 'bg-red-50 dark:bg-red-950/20' : ''}
                  ${day.isWeekend && !isSelected && !isHighestSpending ? 'bg-green-50/30 dark:bg-green-950/10' : ''}
                `}
                title={day.date ? formatDateDisplay(day.date) : ''}
              >
                {/* Date number */}
                <span className={`text-sm mb-1 ${day.isWeekend ? 'text-green-600' : ''}`}>
                  {day.date ? new Date(day.date + 'T00:00:00').getDate() : ''}
                </span>

                {/* Dot indicators */}
                <div className="flex flex-col gap-0.5 items-center">
                  {day.hasExpense && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full bg-red-500 ${
                        day.isToday ? 'animate-pulse' : ''
                      }`}
                    />
                  )}
                  {day.hasIncome && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full bg-green-500 ${
                        day.isToday ? 'animate-pulse' : ''
                      }`}
                    />
                  )}
                </div>

                {/* Today indicator */}
                {day.isToday && (
                  <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Insight Bars Container - Properly aligned */}
        <div className="space-y-3">
          {/* Insight Bar - Highest Spending Day (Mobile-Optimized: NO truncate!) */}
          {hasHighestSpending && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              onClick={() => handleDateClick(highestSpendingDay)}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800 hover:shadow-md transition-all hover:scale-[1.02] text-left"
            >
              <div className="flex items-center gap-2">
                {/* Icon - Fixed width for perfect alignment */}
                <span className="text-lg shrink-0 w-6 min-w-6 max-w-6 flex items-center justify-center">💸</span>
                
                {/* NO truncate - allow full text visibility on mobile */}
                <span className="flex-1 text-sm whitespace-normal break-words">
                  <span className="font-medium">Hari Boros:</span> {formatDateDisplay(highestSpendingDay)} <span className="font-semibold text-red-600 dark:text-red-400">({formatCurrency(highestDay.totalExpense)})</span>
                </span>

                {/* Arrow indicator */}
                <svg className="size-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          )}

          {/* Insight Bar - Highest Income Day (Hari Cuan!) */}
          {hasHighestIncome && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              onClick={() => handleDateClick(highestIncomeDay)}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 hover:shadow-md transition-all hover:scale-[1.02] text-left"
            >
              <div className="flex items-center gap-2">
                {/* Icon - Fixed width for perfect alignment */}
                <span className="text-lg shrink-0 w-6 min-w-6 max-w-6 flex items-center justify-center">💰</span>
                
                {/* NO truncate - allow full text visibility on mobile */}
                <span className="flex-1 text-sm whitespace-normal break-words">
                  <span className="font-medium">Hari Cuan:</span> {formatDateDisplay(highestIncomeDay)} <span className="font-semibold text-green-600 dark:text-green-400">(+{formatCurrency(highestIncDay.totalIncome)})</span>
                </span>

                {/* Arrow indicator */}
                <svg className="size-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          )}
        </div>
      </div>
    );
  };

  // Render transaction list (100% consistent with ExpenseList final design)
  const renderTransactionList = () => {
    const { expenses: dayExpenses, incomes: dayIncomes } = selectedDateTransactions;

    if (!selectedDate) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
          <p className="text-muted-foreground">
            Pilih tanggal di kalender untuk melihat transaksi
          </p>
        </div>
      );
    }

    if (dayExpenses.length === 0 && dayIncomes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
          <p className="text-muted-foreground">
            Tidak ada transaksi pada {formatDateDisplay(selectedDate)}
          </p>
        </div>
      );
    }

    const totalExpense = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = dayIncomes.reduce((sum, inc) => {
      const netAmount = inc.deduction > 0 ? inc.amountIDR - inc.deduction : inc.amountIDR;
      return sum + netAmount;
    }, 0);

    return (
      <div className="space-y-4">
        {/* REMOVED: Old redundant header is now in DrawerHeader */}

        {/* Incomes (100% match ExpenseList income pattern with expand) */}
        {dayIncomes.length > 0 && (
          <div className="space-y-0">
            <div className="text-xs text-muted-foreground px-1 mb-2">PEMASUKAN</div>
            <div className="divide-y">
              {dayIncomes.map(income => {
                const netAmount = income.deduction > 0 ? income.amountIDR - income.deduction : income.amountIDR;
                const isExpanded = expandedIncomeId === income.id;
                
                // Backward compatibility: Support both old "amount" field and new "amountUSD" field
                const usdAmount = income.amountUSD || (income as any).amount;
                
                // Check if this is USD income
                const isUSD = income.currency === 'USD' || (usdAmount && usdAmount > 0 && income.currency !== 'IDR');
                
                // Display name with dollar amount if USD
                // Format: "Fiverr · $36" (middle dot separator, no decimals if whole number)
                const displayName = isUSD && usdAmount 
                  ? `${income.name} · $${usdAmount % 1 === 0 ? usdAmount : usdAmount.toFixed(2)}`
                  : income.name;
                
                return (
                  <div key={income.id}>
                    {/* Main row (expandable) */}
                    <div 
                      className="flex items-center gap-3 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
                      onClick={() => setExpandedIncomeId(prev => prev === income.id ? null : income.id)}
                    >
                      {/* Expand icon (match ExpenseList) */}
                      <ChevronRight 
                        className={`size-4 transition-transform shrink-0 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      
                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{displayName}</span>
                      </div>
                      
                      {/* Amount (right-aligned, green) */}
                      <span className="text-green-600 font-semibold shrink-0">
                        +{formatCurrency(netAmount)}
                      </span>
                    </div>
                    
                    {/* Metadata (when expanded) */}
                    {isExpanded && (isUSD || income.deduction > 0) && (
                      <div className="pl-7 pb-2 space-y-1 text-sm text-muted-foreground">
                        {/* Exchange rate calculation (USD only) */}
                        {isUSD && usdAmount && income.exchangeRate && (
                          <div>
                            Kurs: ${usdAmount % 1 === 0 ? usdAmount : usdAmount.toFixed(2)} × Rp {income.exchangeRate.toLocaleString('id-ID')} = {formatCurrency(income.amountIDR)}
                          </div>
                        )}
                        
                        {/* Deduction */}
                        {income.deduction > 0 && (
                          <div>
                            Potongan: {formatCurrency(income.deduction)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expenses (100% match ExpenseList final pattern) */}
        {dayExpenses.length > 0 && (
          <div className="space-y-0">
            <div className="text-xs text-muted-foreground px-1 mb-2">PENGELUARAN</div>
            <div className="divide-y">
              {dayExpenses.map(expense => {
                const pocket = pockets.find(p => p.id === expense.pocketId);
                const hasItems = expense.items && expense.items.length > 0;
                const isExpanded = expandedExpenseId === expense.id;
                
                return (
                  <div key={expense.id}>
                    {/* Main row */}
                    <div
                      className={`flex items-center gap-3 py-3 transition-colors ${
                        hasItems ? 'cursor-pointer hover:bg-accent/30' : 'hover:bg-accent/30'
                      }`}
                      onClick={() => hasItems && setExpandedExpenseId(prev => prev === expense.id ? null : expense.id)}
                    >
                      {/* Chevron (only if has items) */}
                      {hasItems ? (
                        <ChevronRight 
                          className={`size-4 transition-transform shrink-0 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-4 shrink-0" /> // Spacer for alignment
                      )}
                      
                      {/* Icon (emoji) - match ExpenseList pattern */}
                      <span className="text-2xl shrink-0">
                        {getCategoryEmoji(expense.category as any, settings)}
                      </span>
                      
                      {/* Name + Badge (middle section) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{expense.name}</span>
                          {pocket && (
                            <Badge variant="secondary" className="text-xs">
                              {pocket.emoji || pocket.icon} {pocket.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Amount (right-aligned, red) - match ExpenseList */}
                      <span className="text-red-600 font-semibold shrink-0">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    
                    {/* Items (when expanded) */}
                    {isExpanded && hasItems && (
                      <div className="pl-11 pb-2 space-y-1">
                        {expense.items!.map((item, index) => {
                          const itemCategory = (item as any).category;
                          const categoryEmoji = itemCategory ? getCategoryEmoji(itemCategory, settings) : '';
                          
                          return (
                            <div 
                              key={index} 
                              className="flex items-center justify-between text-sm py-1"
                            >
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                {categoryEmoji && <span className="text-base">{categoryEmoji}</span>}
                                <span>{item.name}</span>
                              </span>
                              <span className="text-red-600">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mobile: Fullscreen calendar + drawer
  if (isMobile) {
    // EMBEDDED MODE (Tab 3): Render inline without Drawer wrapper
    if (embedded) {
      return (
        <div className="h-full flex flex-col overflow-hidden pb-20">
          {/* Calendar Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto pt-[32px] pr-[16px] pb-[16px] pl-[16px]">
            {renderCalendarGrid()}
          </div>
          
          {/* Transaction Drawer - Overlay for selected date */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerContent 
              className="z-[110] h-[80vh] flex flex-col"
              aria-describedby={undefined}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <DrawerHeader className="flex-shrink-0">
                <DrawerTitle className="sr-only">
                  Detail Transaksi {selectedDate ? formatDateDisplay(selectedDate) : ''}
                </DrawerTitle>
                
                {/* Clean visible header (no redundancy) */}
                {selectedDate && (() => {
                  const { expenses: dayExpenses, incomes: dayIncomes } = selectedDateTransactions;
                  const totalExpense = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                  const totalIncome = dayIncomes.reduce((sum, inc) => {
                    const netAmount = inc.deduction > 0 ? inc.amountIDR - inc.deduction : inc.amountIDR;
                    return sum + netAmount;
                  }, 0);
                  
                  return (
                    <div className="space-y-1 pb-4">
                      {/* Line 1: Date (bold, large) */}
                      <h2 className="text-xl font-bold">{formatDateDisplay(selectedDate)}</h2>
                      
                      {/* Line 2: Summary (smaller, gray, inline) */}
                      <p className="text-sm text-muted-foreground">
                        {dayExpenses.length > 0 && (
                          <>
                            Pengeluaran: <span className="text-red-600">-{formatCurrency(totalExpense)}</span>
                          </>
                        )}
                        {dayExpenses.length > 0 && dayIncomes.length > 0 && ' • '}
                        {dayIncomes.length > 0 && (
                          <>
                            Pemasukan: <span className="text-green-600">+{formatCurrency(totalIncome)}</span>
                          </>
                        )}
                      </p>
                    </div>
                  );
                })()}
              </DrawerHeader>
              <ScrollArea className="flex-1 px-4 pb-4">
                {renderTransactionList()}
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>
      );
    }
    
    // MODAL MODE (old behavior): Fullscreen Drawer
    return (
      <>
        {/* Main Calendar Drawer - wraps entire calendar */}
        <Drawer open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
          <DrawerContent className="z-[100] h-[95vh] flex flex-col p-0" aria-describedby={undefined}>
            <DrawerTitle className="sr-only">Kalender Transaksi</DrawerTitle>
            
            {/* Header - Fixed */}
            <div className="flex-shrink-0 sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold">Kalender Transaksi</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="size-5" />
              </Button>
            </div>

            {/* Calendar Grid - Scrollable area */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderCalendarGrid()}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Transaction Drawer - z-index override to stay above calendar */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent 
            className="z-[110] h-[80vh] flex flex-col"
            aria-describedby={undefined}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <DrawerHeader className="flex-shrink-0">
              <DrawerTitle className="sr-only">
                Detail Transaksi {selectedDate ? formatDateDisplay(selectedDate) : ''}
              </DrawerTitle>
              
              {/* Clean visible header (no redundancy) */}
              {selectedDate && (() => {
                const { expenses: dayExpenses, incomes: dayIncomes } = selectedDateTransactions;
                const totalExpense = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                const totalIncome = dayIncomes.reduce((sum, inc) => {
                  const netAmount = inc.deduction > 0 ? inc.amountIDR - inc.deduction : inc.amountIDR;
                  return sum + netAmount;
                }, 0);
                
                return (
                  <div className="space-y-1 pb-4">
                    {/* Line 1: Date (bold, large) */}
                    <h2 className="text-xl font-bold">{formatDateDisplay(selectedDate)}</h2>
                    
                    {/* Line 2: Summary (smaller, gray, inline) */}
                    <p className="text-sm text-muted-foreground">
                      {dayExpenses.length > 0 && (
                        <>
                          Pengeluaran: <span className="text-red-600">-{formatCurrency(totalExpense)}</span>
                        </>
                      )}
                      {dayExpenses.length > 0 && dayIncomes.length > 0 && ' • '}
                      {dayIncomes.length > 0 && (
                        <>
                          Pemasukan: <span className="text-green-600">+{formatCurrency(totalIncome)}</span>
                        </>
                      )}
                    </p>
                  </div>
                );
              })()}
            </DrawerHeader>
            <ScrollArea className="flex-1 px-4 pb-4">
              {renderTransactionList()}
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: Split layout
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="font-semibold">Kalender Transaksi - {monthName} {year}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Split Layout */}
        <div className="flex-1 grid grid-cols-[60%_40%] overflow-hidden">
          {/* Left: Calendar */}
          <div className="border-r p-6 overflow-y-auto">
            {renderCalendarGrid()}
          </div>

          {/* Right: Transaction List */}
          <div className="p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate || 'empty'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderTransactionList()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}