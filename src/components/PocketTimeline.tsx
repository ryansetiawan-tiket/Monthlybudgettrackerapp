import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Wallet, Sparkles, ShoppingBag, ArrowRight, ArrowLeft, TrendingUp, Info, ArrowRightLeft, Plus, Minus, ChevronLeft, TrendingDown, BarChart3, MoreVertical, Edit3, Trash2, DollarSign, Loader2, Search, X, Filter, Calendar, RotateCcw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ScrollArea } from "./ui/scroll-area";
import { useIsMobile } from "./ui/use-mobile";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { DialogPriority } from "../constants";
import { useCategorySettings } from "../hooks/useCategorySettings";
import { getCategoryConfig } from "../utils/categoryManager";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { TimelineFilterDialog } from "./TimelineFilterDialog";

interface TimelineEntry {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'initial_balance'; // ✅ FASE 3: Added initial_balance
  date: string;
  description: string;
  amount: number;
  balanceAfter: number;
  icon: string;
  color: string;
  metadata?: any;
}

interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  income: number; // 💰 Income for Cold Money & Custom pockets
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
}

interface PocketTimelineProps {
  pocketId: string;
  pocketName: string;
  monthKey: string;
  baseUrl: string;
  publicAnonKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefetchedEntries?: TimelineEntry[];
  isRealtimeMode?: boolean;
  drawerClassName?: string;
  onTimelineLoaded?: (entries: TimelineEntry[]) => void;
  pocketDescription?: string;
  pocketIcon?: string;
  pocketColor?: string;
  pocketType?: 'primary' | 'custom';
  enableWishlist?: boolean;
  isTogglingWishlist?: boolean;  // ✅ NEW: Loading state untuk toggle wishlist
  balance?: PocketBalance;
  realtimeBalance?: number | null;
  onToggleRealtime?: () => void;
  onToggleWishlist?: () => void;
  onTransfer?: () => void;
  onAddFunds?: () => void;
  onShowDetailPage?: () => void;
  onEditPocket?: () => void;
  onDeletePocket?: () => void;
  onSetBudget?: () => void; // ✅ Add missing prop
}

export function PocketTimeline({ 
  pocketId, 
  pocketName, 
  monthKey, 
  baseUrl, 
  publicAnonKey,
  open,
  onOpenChange,
  prefetchedEntries,
  isRealtimeMode = false,
  drawerClassName,
  onTimelineLoaded,
  pocketDescription,
  pocketIcon,
  pocketColor,
  pocketType,
  enableWishlist,
  isTogglingWishlist,
  balance,
  realtimeBalance,
  onToggleRealtime,
  onToggleWishlist,
  onTransfer,
  onAddFunds,
  onShowDetailPage,
  onEditPocket,
  onDeletePocket,
  onSetBudget
}: PocketTimelineProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>(prefetchedEntries || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // ✅ NEW: Search state
  
  // ✅ NEW: Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '3days' | '7days' | 'custom'>('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Register drawer for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.HIGH, // Higher than normal dialogs
    `pocket-timeline-${pocketId}`
  );
  const [viewMode, setViewMode] = useState<'timeline' | 'info'>('timeline');
  const isMobile = useIsMobile();
  
  // Phase 8: Get category settings for emoji display
  const { settings } = useCategorySettings();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMM yyyy, HH:mm', { locale: localeId });
    } catch {
      return dateStr;
    }
  };
  
  // ✅ FASE 3: Format month key to readable name
  const formatMonth = (monthKey: string) => {
    try {
      const [year, month] = monthKey.split('-');
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${months[parseInt(month) - 1]} ${year}`;
    } catch {
      return monthKey;
    }
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Reset time for comparison
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      
      if (dateOnly.getTime() === todayOnly.getTime()) {
        return 'Hari Ini';
      } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
        return 'Kemarin';
      } else {
        return format(date, 'EEEE, d MMMM yyyy', { locale: localeId });
      }
    } catch {
      return dateStr;
    }
  };

  const getDateKey = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'yyyy-MM-dd');
    } catch {
      return dateStr;
    }
  };

  // Check if entry date is in the past (for realtime mode)
  const isEntryInPast = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entryDate = new Date(dateStr);
    entryDate.setHours(0, 0, 0, 0);
    
    return entryDate <= today;
  };

  const fetchTimeline = async () => {
    // Don't fetch if we already have prefetched data
    if (prefetchedEntries && prefetchedEntries.length > 0) {
      return;
    }
    
    if (!open) return;
    
    setLoading(true);
    try {
      const [year, month] = monthKey.split('-');
      
      // ✅ MONTHLY STATEMENT MODEL: Fetch data for SPECIFIC month only
      // Timeline shows month-scoped view with Saldo Awal = carry-over from previous months
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${baseUrl}/timeline/${year}/${month}/${pocketId}?sortOrder=desc`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch timeline: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.data.entries);
        // Notify parent to update cache
        if (onTimelineLoaded) {
          onTimelineLoaded(data.data.entries);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      // Don't show error toast here as it might be disruptive
      // Just set empty entries
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTimeline();
      // Reset view mode when drawer opens
      setViewMode('timeline');
    }
  }, [open, monthKey, pocketId]);
  
  // Update entries when prefetchedEntries changes
  useEffect(() => {
    if (prefetchedEntries) {
      setEntries(prefetchedEntries);
    }
  }, [prefetchedEntries]);
  
  // ✅ NEW: Reset search query when drawer closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setFilterOpen(false);
    }
  }, [open]);
  
  // ✅ NEW: Reset filters when switching between pockets
  useEffect(() => {
    resetFilters();
    setSearchQuery('');
  }, [pocketId]);
  
  // ✅ NEW: Reset all filters
  const resetFilters = () => {
    setDateFilter('all');
    setCustomDateStart('');
    setCustomDateEnd('');
    setAmountMin('');
    setAmountMax('');
    setSelectedCategories([]);
  };
  
  // ✅ NEW: Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (dateFilter !== 'all') count++;
    if (amountMin || amountMax) count++;
    if (selectedCategories.length > 0) count++;
    return count;
  }, [dateFilter, amountMin, amountMax, selectedCategories]);
  
  // ✅ NEW: Get available categories from entries
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    entries.forEach(entry => {
      if (entry.type === 'expense' && entry.metadata?.category) {
        categories.add(entry.metadata.category);
      }
    });
    return Array.from(categories);
  }, [entries]);

  // ✅ NEW: Filter entries based on search query AND filters
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter(entry => {
        // Search in description
        if (entry.description.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in amount (formatted)
        const amountStr = formatCurrency(Math.abs(entry.amount)).toLowerCase();
        if (amountStr.includes(query)) {
          return true;
        }
        
        // Search in category name
        if (entry.metadata?.category) {
          const categoryConfig = getCategoryConfig(entry.metadata.category, settings);
          if (categoryConfig?.label.toLowerCase().includes(query)) {
            return true;
          }
        }
        
        // Search in notes
        if (entry.metadata?.note && entry.metadata.note.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in transfer metadata (from/to pocket)
        if (entry.type === 'transfer') {
          if (entry.metadata?.fromPocket?.toLowerCase().includes(query)) {
            return true;
          }
          if (entry.metadata?.toPocket?.toLowerCase().includes(query)) {
            return true;
          }
        }
        
        return false;
      });
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let start: Date | null = null;
      let end: Date = endOfDay(now);
      
      switch (dateFilter) {
        case 'today':
          start = startOfDay(now);
          break;
        case '3days':
          start = startOfDay(subDays(now, 2));
          break;
        case '7days':
          start = startOfDay(subDays(now, 6));
          break;
        case 'custom':
          if (customDateStart) {
            start = startOfDay(new Date(customDateStart));
          }
          if (customDateEnd) {
            end = endOfDay(new Date(customDateEnd));
          }
          break;
      }
      
      if (start) {
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date);
          return isWithinInterval(entryDate, { start: start!, end });
        });
      }
    }
    
    // Apply amount filter
    if (amountMin || amountMax) {
      const min = amountMin ? parseInt(amountMin) : 0;
      const max = amountMax ? parseInt(amountMax) : Infinity;
      
      filtered = filtered.filter(entry => {
        const absAmount = Math.abs(entry.amount);
        return absAmount >= min && absAmount <= max;
      });
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(entry => {
        // Only filter expenses with categories
        if (entry.type === 'expense' && entry.metadata?.category) {
          return selectedCategories.includes(entry.metadata.category);
        }
        // Include non-expense entries
        return entry.type !== 'expense';
      });
    }
    
    return filtered;
  }, [entries, searchQuery, settings, dateFilter, customDateStart, customDateEnd, amountMin, amountMax, selectedCategories]);

  // Group entries by date using useMemo for performance
  const { groupedEntries, sortedDateKeys } = useMemo(() => {
    const grouped = filteredEntries.reduce((groups, entry) => {
      const dateKey = getDateKey(entry.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
      return groups;
    }, {} as Record<string, TimelineEntry[]>);

    // Get sorted date keys (newest first)
    const sorted = Object.keys(grouped).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return { groupedEntries: grouped, sortedDateKeys: sorted };
  }, [filteredEntries]);

  // ✅ FIX: Saldo Proyeksi = balanceAfter dari entry TERAKHIR (paling baru/atas)
  // Ini adalah saldo yang akan dicapai jika semua transaksi di timeline terjadi
  const projectedBalance = useMemo(() => {
    if (!entries || entries.length === 0) {
      return balance?.availableBalance ?? 0; // Fallback to server balance if no entries (with null check)
    }
    
    // Entries are already sorted DESC (newest first) from server
    // So entries[0] is the LATEST/NEWEST entry
    return entries[0].balanceAfter;
  }, [entries, balance?.availableBalance]);

  // ✅ NEW: Calculate realtime balance (balance up to today only)
  const calculatedRealtimeBalance = useMemo(() => {
    if (!entries || entries.length === 0) {
      return balance?.availableBalance ?? 0;
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Filter entries up to today only
    const pastEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate <= today;
    });
    
    if (pastEntries.length === 0) {
      // No entries yet today, return original balance
      return balance?.originalAmount ?? 0;
    }
    
    // Return balance after the latest past entry
    // Since entries are sorted DESC, pastEntries[0] is the latest one
    return pastEntries[0].balanceAfter;
  }, [entries, balance?.availableBalance, balance?.originalAmount]);

  const getIcon = (entry: TimelineEntry) => {
    const iconClass = "size-4";
    
    // ✅ FASE 3: Handle initial_balance type
    if (entry.type === 'initial_balance' || entry.metadata?.isInitialBalance) {
      // Use emoji from entry.icon (set by server)
      return <span className="text-base">{entry.icon || '💰'}</span>;
    }
    
    // Universal icons based on transaction type
    switch (entry.type) {
      case 'income':
        return <Plus className={iconClass} />;
      case 'expense':
        return <Minus className={iconClass} />;
      case 'transfer':
        // Use direction-specific arrow for transfers
        // Transfer IN (masuk) = Arrow RIGHT (→)
        // Transfer OUT (keluar) = Arrow LEFT ()
        if (entry.metadata?.direction === 'in') {
          return <ArrowRight className={iconClass} />;
        } else {
          return <ArrowLeft className={iconClass} />;
        }
      default:
        return <Plus className={iconClass} />;
    }
  };
  
  // Helper to render pocket icon/emoji
  const renderPocketIcon = (iconOrEmoji?: string) => {
    const iconClass = "size-4";
    // Check if it's a Lucide icon name
    switch (iconOrEmoji) {
      case 'Wallet': return <Wallet className={iconClass} />;
      case 'Sparkles': return <Sparkles className={iconClass} />;
      default:
        // Treat as emoji
        return <span className="text-base">{iconOrEmoji || '💰'}</span>;
    }
  };

  const getColorClass = (color: string, isAmount: boolean = false) => {
    if (isAmount) {
      switch (color) {
        case 'green': return 'text-green-600';
        case 'red': return 'text-red-600';
        case 'blue': return 'text-blue-600';
        default: return 'text-foreground';
      }
    } else {
      switch (color) {
        case 'green': return 'bg-green-100 text-green-700';
        case 'red': return 'bg-red-100 text-red-700';
        case 'blue': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    }
  };

  // Shared timeline content
  const timelineContent = (
    <ScrollArea className={isMobile ? "h-full" : "h-[60vh]"}>
      <div className={isMobile ? "pr-2" : "pr-4"}>
      
      {loading ? (
        <div className="space-y-4 py-2">
          {/* Date Group 1 */}
          <div className="space-y-3">
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-2 border-b border-border/50">
              <Skeleton className="h-4 w-32" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 pb-3 border-b">
                <Skeleton className="size-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="space-y-1 text-right">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Date Group 2 */}
          <div className="space-y-3">
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-2 border-b border-border/50">
              <Skeleton className="h-4 w-32" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 pb-3 border-b">
                <Skeleton className="size-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <div className="space-y-1 text-right">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Belum ada aktivitas
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <div className="flex justify-center">
            <Search className="size-12 text-muted-foreground opacity-50" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Tidak ada hasil</p>
            <p className="text-sm text-muted-foreground">
              Coba kata kunci lain atau hapus filter
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
            {sortedDateKeys.map((dateKey) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-2 border-b border-border/50">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {formatDateHeader(groupedEntries[dateKey][0].date)}
                </h3>
              </div>

              {/* Entries for this date */}
              {groupedEntries[dateKey].map((entry) => {
                const isPast = isEntryInPast(entry.date);
                const showFutureStyle = isRealtimeMode && !isPast;
                
                // ✅ FASE 3: Check if this is initial balance entry
                const isInitialBalance = entry.type === 'initial_balance' || entry.metadata?.isInitialBalance;
                
                // ⚠️ BACKWARD COMPATIBILITY: Check if this is a transfer to/from unknown pocket (old data)
                const isUnknownPocket = entry.type === 'transfer' && entry.metadata?.isUnknownPocket;
                
                // Get category emoji for expenses
                const categoryId = entry.metadata?.category;
                const categoryConfig = categoryId ? getCategoryConfig(categoryId, settings) : null;
                const categoryEmoji = categoryConfig?.emoji || '';
                
                return (
                  <div 
                    key={entry.id}
                    className={`flex gap-3 pb-3 border-b last:border-b-0 ${showFutureStyle ? 'opacity-50' : ''} ${
                      isInitialBalance ? 'bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-3 -m-3 mb-0' : ''
                    } ${
                      isUnknownPocket ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Universal Icon (+ / - / →) */}
                    <div className={`rounded-full p-2 h-fit flex-shrink-0 ${getColorClass(entry.color)}`}>
                      {getIcon(entry)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Description with Category Emoji */}
                          <p className={`${isInitialBalance ? 'font-semibold' : 'font-medium'} break-words ${
                            isUnknownPocket ? 'text-muted-foreground' : ''
                          }`}>
                            {categoryEmoji && <span className="mr-1">{categoryEmoji}</span>}
                            {entry.description}
                          </p>
                          
                          {/* ⚠️ Unknown Pocket Warning */}
                          {isUnknownPocket && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                              <Info className="size-3" />
                              <span>Data lama dari sistem sebelumnya</span>
                            </p>
                          )}
                          
                          {/* Metadata: Badge + Date & Time (1 baris) */}
                          <p className="text-xs text-muted-foreground">
                            {showFutureStyle && (
                              <span className="inline-block">Akan Datang • </span>
                            )}
                            {formatDate(entry.date)}
                          </p>
                          
                          {/* ✅ FASE 3: Breakdown for Daily pocket initial balance */}
                          {isInitialBalance && entry.metadata?.pocketType === 'daily' && entry.metadata?.breakdown && (
                            <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                              <p className="flex items-center justify-between">
                                <span>Carry-over bulan lalu:</span>
                                <span className="font-medium">{formatCurrency(entry.metadata.breakdown.carryOver)}</span>
                              </p>
                              <p className="flex items-center justify-between">
                                <span>Budget baru:</span>
                                <span className="font-medium">{formatCurrency(entry.metadata.breakdown.newBudget)}</span>
                              </p>
                            </div>
                          )}
                          
                          {/* ✅ FASE 3: From month info for carry-over */}
                          {isInitialBalance && entry.metadata?.fromMonth && (
                            <p className="text-xs text-muted-foreground italic mt-1">
                              Dari {formatMonth(entry.metadata.fromMonth)}
                            </p>
                          )}
                          
                          {/* Transfer/Income Note */}
                          {entry.metadata?.note && (
                            <p className="text-xs text-muted-foreground italic mt-1 break-words">
                              {entry.metadata.note}
                            </p>
                          )}
                        </div>
                        
                        {/* Amount & Balance (Kanan) */}
                        <div className="text-right flex-shrink-0">
                          <p className={`font-semibold whitespace-nowrap ${getColorClass(entry.color, true)}`}>
                            {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            Saldo: {formatCurrency(entry.balanceAfter)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      </div>
    </ScrollArea>
  );

  // Info content
  const infoContent = balance && (
    <div className="flex flex-col gap-6 pt-4 px-4 pb-6">
      {/* Pocket Header */}
      <div className="flex items-center gap-3">
        <div 
          className="rounded-[14px] size-12 flex items-center justify-center"
          style={{
            backgroundColor: pocketColor ? `rgba(${pocketColor === 'purple' ? '139,92,246' : pocketColor === 'blue' ? '59,130,246' : pocketColor === 'green' ? '34,197,94' : '139,92,246'},0.1)` : 'rgba(59,130,246,0.1)',
            border: `1px solid rgba(${pocketColor === 'purple' ? '139,92,246' : pocketColor === 'blue' ? '59,130,246' : pocketColor === 'green' ? '34,197,94' : '139,92,246'},0.25)`
          }}
        >
          <span className="text-xl">{pocketIcon || '💰'}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg text-neutral-50">{pocketName}</h3>
          {pocketDescription && (
            <p className="text-sm text-[#a1a1a1] mt-0.5">{pocketDescription}</p>
          )}
        </div>
      </div>

      <div className="bg-neutral-800 h-px w-full" />

      {/* Realtime Toggle - ALWAYS SHOW */}
      <div className="bg-[rgba(38,38,38,0.5)] rounded-[10px] h-[52px] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="bg-[rgba(240,177,0,0.1)] rounded-[10px] size-7 flex items-center justify-center">
            <span className="text-base">✨</span>
          </div>
          <Label htmlFor="realtime-toggle" className="text-sm font-medium text-neutral-50 cursor-pointer">
            Mode Real-time
          </Label>
        </div>
        <Switch
          id="realtime-toggle"
          checked={isRealtimeMode}
          onCheckedChange={onToggleRealtime}
        />
      </div>

      {/* Balance Info */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[#a1a1a1]">
          {isRealtimeMode ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
        </p>
        <p className={`text-[30px] leading-9 ${
          (isRealtimeMode ? calculatedRealtimeBalance : projectedBalance) >= 0 
            ? 'text-[#05df72]' 
            : 'text-[#ff6467]'
        }`}>
          {formatCurrency(isRealtimeMode ? calculatedRealtimeBalance : projectedBalance)}
        </p>
        {isRealtimeMode && (
          <p className="text-xs text-[#a1a1a1]">
            Sampai {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>

      <div className="bg-neutral-800 h-px w-full" />

      {/* Breakdown */}
      <div className="flex flex-col gap-2">
        {/* Saldo Asli */}
        <div className="bg-[rgba(38,38,38,0.3)] rounded-[10px] h-11 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-[#a1a1a1]" />
            <span className="text-sm text-[#a1a1a1]">Saldo Asli</span>
          </div>
          <span className="text-sm text-neutral-50">{formatCurrency(balance.originalAmount)}</span>
        </div>

        {/* Pengeluaran */}
        <div className="bg-[rgba(38,38,38,0.3)] rounded-[10px] h-11 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-4 text-[#ff6467]" />
            <span className="text-sm text-[#ff6467]">Pengeluaran</span>
          </div>
          <span className="text-sm text-[#ff6467]">{formatCurrency(balance.expenses)}</span>
        </div>

        {/* Pemasukan */}
        {balance.income > 0 && (
          <div className="bg-[rgba(38,38,38,0.3)] rounded-[10px] h-11 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[#05df72]" />
              <span className="text-sm text-[#05df72]">Pemasukan</span>
            </div>
            <span className="text-sm text-[#05df72]">+{formatCurrency(balance.income)}</span>
          </div>
        )}

        {/* Transfer Keluar */}
        {balance.transferOut > 0 && (
          <div className="bg-[rgba(38,38,38,0.3)] rounded-[10px] h-11 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <ArrowLeft className="size-4 text-[#ff6467]" />
              <span className="text-sm text-[#ff6467]">Transfer Keluar</span>
            </div>
            <span className="text-sm text-[#ff6467]">-{formatCurrency(balance.transferOut)}</span>
          </div>
        )}

        {/* Transfer Masuk */}
        {balance.transferIn > 0 && (
          <div className="bg-[rgba(38,38,38,0.3)] rounded-[10px] h-11 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <ArrowRight className="size-4 text-[#05df72]" />
              <span className="text-sm text-[#05df72]">Transfer Masuk</span>
            </div>
            <span className="text-sm text-[#05df72]">+{formatCurrency(balance.transferIn)}</span>
          </div>
        )}
      </div>

      <div className="bg-neutral-800 h-px w-full" />

      {/* Wishlist Toggle - ALWAYS SHOW */}
      <div className="bg-[rgba(38,38,38,0.5)] rounded-[10px] min-h-[52px] flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="bg-[rgba(246,51,154,0.1)] rounded-[10px] size-7 flex items-center justify-center flex-shrink-0">
            <span className="text-base">💖</span>
          </div>
          <div className="flex flex-col">
            <Label htmlFor="wishlist-toggle" className="text-sm font-medium text-neutral-50 cursor-pointer">
              Simulasi Wishlist
            </Label>
            {isTogglingWishlist && (
              <span className="text-xs text-[#a1a1a1] flex items-center gap-1 mt-0.5">
                <Loader2 className="size-3 animate-spin" />
                Menyimpan...
              </span>
            )}
          </div>
        </div>
        <Switch
          id="wishlist-toggle"
          checked={enableWishlist || false}
          onCheckedChange={onToggleWishlist}
          disabled={isTogglingWishlist}
        />
      </div>

      <div className="bg-neutral-800 h-px w-full" />

      {/* Deskripsi - sesuai Figma */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm text-[#a1a1a1]">Deskripsi</h3>
        <div className="bg-[rgba(38,38,38,0.3)] rounded-[10px] min-h-[44px] flex items-center px-3 py-3">
          <p className="text-sm text-neutral-50">
            {pocketDescription || 'Tidak ada deskripsi'}
          </p>
        </div>
      </div>

      <div className="bg-neutral-800 h-px w-full" />

      {/* Tipe Kantong */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#a1a1a1]">Tipe Kantong</span>
        <Badge variant="secondary" className="bg-neutral-800 text-neutral-50 border-0">
          {pocketType === 'primary' ? 'Kantong Utama' : 'Kantong Custom'}
        </Badge>
      </div>
    </div>
  );

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <>
        <Drawer 
          open={open} 
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              // Reset view mode when closing
              setViewMode('timeline');
            }
            onOpenChange(isOpen);
          }} 
          dismissible={true}
        >
          <DrawerContent 
            className="h-[90vh] flex flex-col rounded-t-2xl p-0 z-[101]" 
            aria-describedby={undefined}
          >
            <DrawerHeader className="px-4 pt-6 pb-4 border-b flex-shrink-0">
              <DrawerTitle className="flex items-center justify-between">
                {viewMode === 'info' ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => setViewMode('timeline')}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <span>Info Kantong</span>
                  </div>
                ) : (
                  <span>Timeline {pocketName}</span>
                )}
                <div className="flex items-center gap-2">
                  {viewMode === 'timeline' && (
                    <>
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        {searchQuery ? `${filteredEntries.length} dari ${entries.length}` : `${entries.length} aktivitas`}
                      </Badge>
                      {onTransfer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={isMobile ? "h-8 w-8 p-0 rounded-full" : "h-8 px-3"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTransfer();
                            onOpenChange(false);
                          }}
                          title="Transfer"
                        >
                          <ArrowRightLeft className="size-4 sm:mr-1" />
                          <span className="hidden sm:inline">Transfer</span>
                        </Button>
                      )}
                      {onAddFunds && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={isMobile ? "h-8 w-8 p-0 rounded-full" : "h-8 px-3"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddFunds();
                            onOpenChange(false);
                          }}
                          title="Tambah Dana"
                        >
                          <Plus className="size-4 sm:mr-1" />
                          <span className="hidden sm:inline">Tambah</span>
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                            title="Menu Kantong"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-[102]">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isMobile && onShowDetailPage) {
                                onShowDetailPage();
                              } else {
                                setViewMode('info');
                              }
                            }}
                          >
                            <Info className="size-4 mr-2" />
                            Info Kantong
                          </DropdownMenuItem>
                          
                          {onEditPocket && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditPocket();
                                onOpenChange(false);
                              }}
                            >
                              <Edit3 className="size-4 mr-2" />
                              Edit Kantong
                            </DropdownMenuItem>
                          )}
                          {pocketType === 'custom' && onDeletePocket && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePocket();
                                onOpenChange(false);
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Hapus Kantong
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </DrawerTitle>
              
              {/* ✅ NEW: Search Bar - Only show in timeline mode */}
              {viewMode === 'timeline' && (
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      // Support Cmd/Ctrl+A for select all
                      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                        e.preventDefault();
                        e.currentTarget.select();
                      }
                    }}
                    className="pl-9 pr-16 h-9"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full relative"
                      onClick={() => setFilterOpen(true)}
                    >
                      <Filter className="size-3.5" />
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 size-3.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DrawerHeader>
            <div className="flex-1 overflow-hidden">
              {viewMode === 'timeline' ? (
                <div className="h-full px-4 py-4">
                  {timelineContent}
                </div>
              ) : (
                <ScrollArea className="h-full">
                  {infoContent}
                </ScrollArea>
              )}
            </div>
          </DrawerContent>
        </Drawer>
        
        {/* ✅ NEW: Filter Dialog/Drawer */}
        <TimelineFilterDialog
          open={filterOpen}
          onOpenChange={setFilterOpen}
          isMobile={isMobile}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          customDateStart={customDateStart}
          onCustomDateStartChange={setCustomDateStart}
          customDateEnd={customDateEnd}
          onCustomDateEndChange={setCustomDateEnd}
          amountMin={amountMin}
          onAmountMinChange={setAmountMin}
          amountMax={amountMax}
          onAmountMaxChange={setAmountMax}
          selectedCategories={selectedCategories}
          onSelectedCategoriesChange={setSelectedCategories}
          onReset={resetFilters}
          availableCategories={availableCategories}
        />
      </>
    );
  }

  // Desktop: Dialog
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span>Timeline {pocketName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {searchQuery ? `${filteredEntries.length} dari ${entries.length}` : `${entries.length} aktivitas`}
                  </Badge>
                </div>
              </div>
              
              {/* ✅ NEW: Search Bar for Desktop */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    // Support Cmd/Ctrl+A for select all
                    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                      e.preventDefault();
                      e.currentTarget.select();
                    }
                  }}
                  className="pl-9 pr-16 h-9"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full relative"
                    onClick={() => setFilterOpen(true)}
                  >
                    <Filter className="size-3.5" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 size-3.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {timelineContent}
        </DialogContent>
      </Dialog>
      
      {/* ✅ NEW: Filter Dialog/Drawer */}
      <TimelineFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        isMobile={isMobile}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customDateStart={customDateStart}
        onCustomDateStartChange={setCustomDateStart}
        customDateEnd={customDateEnd}
        onCustomDateEndChange={setCustomDateEnd}
        amountMin={amountMin}
        onAmountMinChange={setAmountMin}
        amountMax={amountMax}
        onAmountMaxChange={setAmountMax}
        selectedCategories={selectedCategories}
        onSelectedCategoriesChange={setSelectedCategories}
        onReset={resetFilters}
        availableCategories={availableCategories}
      />
    </>
  );
}