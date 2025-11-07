import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Wallet, Sparkles, ShoppingBag, ArrowRight, ArrowLeft, TrendingUp, Info, ArrowRightLeft, Plus, ChevronLeft, TrendingDown, BarChart3, MoreVertical, Edit3, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
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

interface TimelineEntry {
  id: string;
  type: 'income' | 'expense' | 'transfer';
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
  balance?: PocketBalance;
  realtimeBalance?: number | null;
  onToggleRealtime?: () => void;
  onToggleWishlist?: () => void;
  onTransfer?: () => void;
  onAddFunds?: () => void;
  onShowDetailPage?: () => void;
  onEditPocket?: () => void;
  onDeletePocket?: () => void;
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
  const [viewMode, setViewMode] = useState<'timeline' | 'info'>('timeline');
  const isMobile = useIsMobile();

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

  // Group entries by date using useMemo for performance
  const { groupedEntries, sortedDateKeys } = useMemo(() => {
    const grouped = entries.reduce((groups, entry) => {
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
  }, [entries]);

  const getIcon = (iconName?: string) => {
    const iconClass = "size-4";
    // Check if it's a Lucide icon name
    switch (iconName) {
      case 'Wallet': return <Wallet className={iconClass} />;
      case 'Sparkles': return <Sparkles className={iconClass} />;
      case 'DollarSign': return <DollarSign className={iconClass} />;
      case 'ShoppingBag': return <ShoppingBag className={iconClass} />;
      case 'ArrowRight': return <ArrowRight className={iconClass} />;
      case 'ArrowLeft': return <ArrowLeft className={iconClass} />;
      case 'TrendingUp': return <TrendingUp className={iconClass} />;
      default:
        // If not a known icon name, treat as emoji
        return <span className="text-base">{iconName || '💰'}</span>;
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
                
                return (
                  <div 
                    key={entry.id}
                    className={`flex gap-3 pb-3 border-b last:border-b-0 ${showFutureStyle ? 'opacity-50' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`rounded-full p-2 h-fit flex-shrink-0 ${getColorClass(entry.color)}`}>
                      {getIcon(entry.icon)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium break-words">{entry.description}</p>
                            {showFutureStyle && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Akan Datang
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                          {entry.metadata?.note && (
                            <p className="text-xs text-muted-foreground italic mt-1 break-words">
                              {entry.metadata.note}
                            </p>
                          )}
                        </div>
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
    <div className="space-y-6 p-4">
      {/* Pocket Header */}
      <div className="flex items-center gap-3">
        <div className={`text-${pocketColor || 'blue'}-600`}>
          {getIcon(pocketIcon)}
        </div>
        <div>
          <h3 className="font-semibold">{pocketName}</h3>
          {pocketDescription && (
            <p className="text-sm text-muted-foreground">{pocketDescription}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Realtime Toggle */}
      {onToggleRealtime && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="realtime-toggle">Toggle Realtime</Label>
            {isRealtimeMode && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Hari Ini
              </Badge>
            )}
          </div>
          <Switch
            id="realtime-toggle"
            checked={isRealtimeMode}
            onCheckedChange={onToggleRealtime}
          />
        </div>
      )}

      {/* Balance Info */}
      <div className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {isRealtimeMode ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
            </p>
            <p className={`text-2xl font-semibold ${
              (realtimeBalance !== null ? realtimeBalance : balance.availableBalance) >= 0 
                ? 'text-[#00c950]' 
                : 'text-red-500'
            }`}>
              {formatCurrency(realtimeBalance !== null ? realtimeBalance : balance.availableBalance)}
            </p>
            {isRealtimeMode && (
              <p className="text-xs text-muted-foreground">
                Sampai {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Saldo Asli</span>
            </div>
            <span className="font-medium">{formatCurrency(balance.originalAmount)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Pengeluaran</span>
            </div>
            <span className="font-medium text-red-600">{formatCurrency(balance.expenses)}</span>
          </div>

          {balance.transferIn > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Transfer Masuk</span>
              </div>
              <span className="font-medium text-green-600">+{formatCurrency(balance.transferIn)}</span>
            </div>
          )}

          {balance.transferOut > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="size-4 text-orange-600" />
                <span className="text-sm text-muted-foreground">Transfer Keluar</span>
              </div>
              <span className="font-medium text-orange-600">-{formatCurrency(balance.transferOut)}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {onTransfer && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onTransfer();
              onOpenChange(false);
            }}
          >
            <ArrowRightLeft className="size-4 mr-2" />
            Transfer
          </Button>
        )}
        {onAddFunds && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onAddFunds();
              onOpenChange(false);
            }}
          >
            <Plus className="size-4 mr-2" />
            Tambah Dana
          </Button>
        )}
      </div>

      {/* Wishlist Toggle */}
      {onToggleWishlist && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="wishlist-toggle">Simulasi Wishlist</Label>
            <Switch
              id="wishlist-toggle"
              checked={enableWishlist || false}
              onCheckedChange={onToggleWishlist}
            />
          </div>
        </>
      )}

      {/* Pocket Type Info */}
      <Separator />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Tipe Kantong</span>
        <Badge variant="secondary">
          {pocketType === 'primary' ? 'Kantong Utama' : 'Kantong Custom'}
        </Badge>
      </div>
    </div>
  );

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
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
          className="h-[75vh] flex flex-col rounded-t-2xl p-0 z-[101]" 
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
                    <Badge variant="secondary" className="hidden sm:inline-flex">{entries.length} aktivitas</Badge>
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
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Timeline {pocketName}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{entries.length} aktivitas</Badge>
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
                      setViewMode('info');
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
            </div>
          </DialogTitle>
        </DialogHeader>
        {timelineContent}
      </DialogContent>
    </Dialog>
  );
}
