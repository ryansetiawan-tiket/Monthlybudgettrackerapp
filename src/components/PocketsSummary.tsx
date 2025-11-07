import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Wallet, Sparkles, ArrowRightLeft, TrendingUp, TrendingDown, Target, Trash2, Plus, Pencil, Settings, Calendar, BarChart3, Info, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "./ui/drawer";
import { WishlistSimulation } from "./WishlistSimulation";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { PocketTimeline } from "./PocketTimeline";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useIsMobile } from "./ui/use-mobile";
import svgPaths from "../imports/svg-f312o1132i";
import { Skeleton } from "./ui/skeleton";
import { motion } from "motion/react";

interface Pocket {
  id: string;
  name: string;
  type: 'primary' | 'custom';
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  enableWishlist?: boolean;
}

interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
}

interface PocketsSummaryProps {
  monthKey: string;
  onTransferClick: (defaultFromPocket?: string, defaultToPocket?: string) => void;
  onAddIncomeClick?: (targetPocketId?: string) => void;
  onManagePocketsClick?: () => void;
  onEditPocketClick?: (pocket: Pocket) => void;
  onOpenBudgetSettings?: () => void;
  onRefresh?: () => void;
  baseUrl: string;
  publicAnonKey: string;
}

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

// SVG Icon Components
function SparklesIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 19 19">
      <path 
        d={svgPaths.p18479600} 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="1.66604" 
      />
    </svg>
  );
}

function HeartIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 14 12">
      <path 
        d={svgPaths.p24525b80} 
        fill="currentColor"
      />
    </svg>
  );
}

export function PocketsSummary({ monthKey, onTransferClick, onAddIncomeClick, onManagePocketsClick, onEditPocketClick, onOpenBudgetSettings, onRefresh, baseUrl, publicAnonKey }: PocketsSummaryProps) {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [balances, setBalances] = useState<Map<string, PocketBalance>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showWishlist, setShowWishlist] = useState(false);
  const [selectedPocket, setSelectedPocket] = useState<Pocket | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelinePocket, setTimelinePocket] = useState<Pocket | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pocketToDelete, setPocketToDelete] = useState<Pocket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();
  
  // Timeline prefetch cache
  const [timelineCache, setTimelineCache] = useState<Map<string, TimelineEntry[]>>(new Map());
  
  // Timeline loading state (per pocket)
  const [timelineLoading, setTimelineLoading] = useState<Map<string, boolean>>(new Map());
  
  // Realtime mode state (per pocket) - default ON
  const [realtimeMode, setRealtimeMode] = useState<Map<string, boolean>>(new Map());
  
  // Expanded cards state (for mobile compact view)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Load realtime mode from localStorage and prefetch timeline data
  useEffect(() => {
    const loadRealtimeMode = async () => {
      const newMap = new Map<string, boolean>();
      const pocketsToPrefetch: string[] = [];
      
      pockets.forEach(pocket => {
        const saved = localStorage.getItem(`realtime-mode-${pocket.id}`);
        // Default to true (ON) if not set
        const isRealtime = saved !== null ? saved === 'true' : true;
        newMap.set(pocket.id, isRealtime);
        
        // Queue for prefetch if realtime mode is ON
        if (isRealtime) {
          pocketsToPrefetch.push(pocket.id);
        }
      });
      
      setRealtimeMode(newMap);
      
      // Prefetch timeline for all realtime-enabled pockets IN PARALLEL (faster!)
      if (pocketsToPrefetch.length > 0) {
        Promise.all(pocketsToPrefetch.map(pocketId => prefetchTimeline(pocketId)));
      }
    };
    
    if (pockets.length > 0) {
      loadRealtimeMode();
    }
  }, [pockets]);

  // Toggle realtime mode
  const handleToggleRealtimeMode = (pocketId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setRealtimeMode(prev => new Map(prev).set(pocketId, newValue));
    localStorage.setItem(`realtime-mode-${pocketId}`, String(newValue));
    toast.success(newValue ? 'Mode Realtime diaktifkan' : 'Mode Proyeksi diaktifkan');
    
    // Prefetch timeline immediately when switching to realtime mode
    if (newValue && !timelineCache.has(pocketId)) {
      prefetchTimeline(pocketId);
    }
  };

  // Calculate realtime balance based on timeline - memoized for performance
  const calculateRealtimeBalance = useCallback((pocketId: string, isRealtime: boolean): number | null => {
    if (!isRealtime) return null; // Return null to use server balance
    
    const timeline = timelineCache.get(pocketId);
    if (!timeline || timeline.length === 0) {
      // Timeline not loaded yet - return null to show server balance temporarily
      return null;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    // Find the last transaction that happened today or before
    // Timeline is sorted DESC (newest first, most recent transaction appears first)
    for (const item of timeline) {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      const itemTime = itemDate.getTime();
      
      // If item is today or in the past, return its balanceAfter
      // This gives us the balance after the most recent transaction up to today
      if (itemTime <= todayTime) {
        return item.balanceAfter;
      }
    }
    
    // If all items are in the future (shouldn't happen in normal use), return null
    // This means there are only future-dated transactions, so we fall back to server balance
    return null;
  }, [timelineCache]);

  const fetchPockets = async () => {
    try {
      setLoading(true);
      const [year, month] = monthKey.split('-');
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${baseUrl}/pockets/${year}/${month}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pockets: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPockets(data.data.pockets);
        const balanceMap = new Map(
          data.data.balances.map((b: PocketBalance) => [b.pocketId, b])
        );
        setBalances(balanceMap);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Request timeout - silakan refresh halaman');
      } else {
        toast.error('Gagal memuat data kantong');
      }
      // Set empty data on error
      setPockets([]);
      setBalances(new Map());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (monthKey) {
      fetchPockets();
    }
  }, [monthKey]);

  // Expose refresh to parent
  useEffect(() => {
    if (onRefresh) {
      (window as any).__refreshPockets = fetchPockets;
    }
  }, [onRefresh]);

  const getIcon = (iconName?: string) => {
    // If it's an emoji, render it directly
    if (iconName && iconName.length <= 2 && /[\u{1F300}-\u{1F9FF}]/u.test(iconName)) {
      return <span className="text-xl">{iconName}</span>;
    }
    // Fallback for old Lucide icon names
    switch (iconName) {
      case 'Wallet': return <Wallet className="size-5" />;
      case 'Sparkles': return <Sparkles className="size-5" />;
      default: return <Wallet className="size-5" />;
    }
  };

  const handleToggleWishlist = async (pocketId: string, currentValue: boolean) => {
    try {
      const [year, month] = monthKey.split('-');
      const response = await fetch(`${baseUrl}/pockets/${year}/${month}/${pocketId}/wishlist-setting`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ enableWishlist: !currentValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist setting');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setPockets(prevPockets => 
          prevPockets.map(p => 
            p.id === pocketId 
              ? { ...p, enableWishlist: !currentValue }
              : p
          )
        );
        
        toast.success(!currentValue ? 'Wishlist diaktifkan' : 'Wishlist dinonaktifkan');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Gagal mengubah setting wishlist');
    }
  };

  const handleToggleCardExpand = (pocketId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pocketId)) {
        newSet.delete(pocketId);
      } else {
        newSet.add(pocketId);
      }
      return newSet;
    });
  };

  // Prefetch timeline data for a pocket - memoized to prevent recreating on every render
  const prefetchTimeline = useCallback(async (pocketId: string) => {
    // Skip if already cached or currently loading
    if (timelineCache.has(pocketId) || timelineLoading.get(pocketId)) {
      return;
    }
    
    // Set loading state
    setTimelineLoading(prev => new Map(prev).set(pocketId, true));
    
    try {
      const [year, month] = monthKey.split('-');
      const response = await fetch(`${baseUrl}/timeline/${year}/${month}/${pocketId}?sortOrder=desc`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to prefetch timeline: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTimelineCache(prev => new Map(prev).set(pocketId, data.data.entries));
      }
    } catch (error) {
      console.error('Error prefetching timeline:', error);
    } finally {
      // Clear loading state
      setTimelineLoading(prev => new Map(prev).set(pocketId, false));
    }
  }, [monthKey, baseUrl, publicAnonKey, timelineCache, timelineLoading]);

  const handleDeletePocket = async () => {
    if (!pocketToDelete) return;

    const balance = balances.get(pocketToDelete.id);
    if (balance && balance.availableBalance !== 0) {
      toast.error('Saldo kantong harus Rp 0 sebelum dihapus');
      setShowDeleteConfirm(false);
      setPocketToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      const [year, month] = monthKey.split('-');
      const response = await fetch(`${baseUrl}/pockets/${year}/${month}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          pocketId: pocketToDelete.id,
          reason: 'Dihapus oleh user'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete pocket');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Kantong "${pocketToDelete.name}" berhasil dihapus`);
        // Refresh pockets
        await fetchPockets();
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error: any) {
      console.error('Error deleting pocket:', error);
      toast.error(error.message || 'Gagal menghapus kantong');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setPocketToDelete(null);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader className="pb-3 px-4 pt-4 md:px-6 md:pt-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32 md:h-6 md:w-36" />
              <div className="flex gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[1, 2].map(i => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card className="border border-border/50">
                    <CardContent className="p-3 md:p-4 space-y-3">
                      {/* Header with icon and title */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-8 md:size-9 rounded-md" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24 md:w-32" />
                            <Skeleton className="h-3 w-16 md:w-24" />
                          </div>
                        </div>
                        <Skeleton className="size-7 rounded-full" />
                      </div>

                      {/* Realtime Toggle */}
                      <div className="flex items-center justify-between py-2 border-t border-b">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-10 rounded-full" />
                      </div>

                      {/* Balance */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-6 w-28 md:h-7 md:w-32" />
                        </div>
                        <Skeleton className="h-2.5 w-32" />
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t">
                        <Skeleton className="h-9 flex-1 rounded-md" />
                        <Skeleton className="h-9 flex-1 rounded-md" />
                      </div>

                      {/* Wishlist Section */}
                      <div className="space-y-2 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-5 w-10 rounded-full" />
                        </div>
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Ringkasan Kantong</span>
            <div className="flex gap-2">
              {onManagePocketsClick && (
                <Button 
                  onClick={() => onManagePocketsClick?.()} 
                  variant="outline" 
                  size="sm"
                  title="Tambah Kantong"
                  aria-label="Tambah Kantong"
                >
                  <Plus className="size-4" />
                </Button>
              )}
              <Button 
                onClick={() => onTransferClick()} 
                variant="outline" 
                size="sm"
                title="Transfer"
                aria-label="Transfer"
              >
                <ArrowRightLeft className="size-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pockets.map(pocket => {
              const balance = balances.get(pocket.id);
              if (!balance) return null;

              const isPositive = balance.availableBalance >= 0;
              const balanceColor = isPositive ? 'text-green-600' : 'text-red-600';

              const isExpanded = expandedCards.has(pocket.id);
              const showCompact = isMobile && !isExpanded;

              return (
                <div 
                  key={pocket.id} 
                  className={`border rounded-lg p-4 transition-shadow relative ${
                    showCompact 
                      ? 'bg-neutral-950 border-neutral-800 text-white cursor-pointer' 
                      : 'hover:shadow-md cursor-pointer'
                  }`}
                  onMouseEnter={() => prefetchTimeline(pocket.id)}
                  onTouchStart={() => prefetchTimeline(pocket.id)}
                  onClick={(e) => {
                    // Always allow opening timeline on card click
                    setTimelinePocket(pocket);
                    setShowTimeline(true);
                  }}
                >
                  {showCompact ? (
                    /* COMPACT VIEW - Mobile Only */
                    <div className="space-y-3">
                      {/* Compact Header - Icon + Name + Info Button */}
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                        <div className="flex items-center gap-2">
                          <div className="text-white">
                            {getIcon(pocket.icon)}
                          </div>
                          <h3 className="text-base font-medium tracking-tight">{pocket.name}</h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCardExpand(pocket.id);
                          }}
                          className="size-6 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors"
                        >
                          <Info className="size-4 text-white" />
                        </button>
                      </div>

                      {/* Compact Balance Section */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-neutral-400">
                            {realtimeMode.get(pocket.id) ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
                          </p>
                          {/* Loading indicator - shown when fetching timeline */}
                          {timelineLoading.get(pocket.id) && (
                            <div className="size-3 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            {timelineLoading.get(pocket.id) ? (
                              <Skeleton className="h-7 w-32 bg-neutral-800" />
                            ) : (
                              <p className={`text-lg font-semibold tracking-tight ${
                                (() => {
                                  const isRealtime = realtimeMode.get(pocket.id);
                                  const realtimeBalance = isRealtime ? calculateRealtimeBalance(pocket.id, true) : null;
                                  const displayBalance = realtimeBalance !== null ? realtimeBalance : balance.availableBalance;
                                  return displayBalance >= 0 ? 'text-[#00c950]' : 'text-red-500';
                                })()
                              }`}>
                                {(() => {
                                  const isRealtime = realtimeMode.get(pocket.id);
                                  const realtimeBalance = isRealtime ? calculateRealtimeBalance(pocket.id, true) : null;
                                  const displayBalance = realtimeBalance !== null ? realtimeBalance : balance.availableBalance;
                                  return formatCurrency(displayBalance);
                                })()}
                              </p>
                            )}
                          </div>
                          {/* Compact Wishlist Button - Only if enabled */}
                          {pocket.enableWishlist && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <button
                                className="bg-neutral-800/30 border border-neutral-800 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-neutral-800/50 transition-colors whitespace-nowrap"
                                onClick={() => {
                                  setSelectedPocket(pocket);
                                  setShowWishlist(true);
                                }}
                              >
                                <HeartIcon className="size-[11.62px] text-white" />
                                <span className="text-[10.17px] font-medium tracking-tight">Wishlist</span>
                              </button>
                            </div>
                          )}
                        </div>
                        {realtimeMode.get(pocket.id) && !timelineLoading.get(pocket.id) && (
                          <p className="text-[10px] text-neutral-400 tracking-wide">
                            Sampai {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* FULL VIEW - Desktop or Expanded Mobile */
                    <>
                      {/* Full Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`text-${pocket.color || 'blue'}-600`}>
                            {getIcon(pocket.icon)}
                          </div>
                          <div>
                            <h3 className="font-medium">{pocket.name}</h3>
                            {pocket.description && (
                              <p className="text-xs text-muted-foreground">{pocket.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Collapse button - Mobile Only */}
                          {isMobile && isExpanded && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCardExpand(pocket.id);
                              }}
                              title="Tutup Detail"
                            >
                              <Info className="size-4" />
                            </Button>
                          )}
                          {/* Settings button - only for Sehari-hari pocket */}
                          {pocket.name === 'Sehari-hari' && onOpenBudgetSettings && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-background/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenBudgetSettings();
                              }}
                              title="Pengaturan Budget"
                            >
                              <Settings className="size-4" />
                            </Button>
                          )}
                          {/* More options dropdown - only for custom pockets */}
                          {pocket.type === 'custom' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full hover:bg-background/50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  title="Opsi Lainnya"
                                >
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEditPocketClick) {
                                      onEditPocketClick(pocket);
                                    }
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="size-4 mr-2" />
                                  Edit Kantong
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const pocketBalance = balances.get(pocket.id);
                                    if (pocketBalance && pocketBalance.availableBalance !== 0) {
                                      toast.error('Saldo kantong harus Rp 0 sebelum dihapus');
                                    } else {
                                      setPocketToDelete(pocket);
                                      setShowDeleteConfirm(true);
                                    }
                                  }}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Hapus Kantong
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      {/* Realtime Toggle */}
                      <div className="flex items-center justify-between py-2 border-b" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`realtime-${pocket.id}`} className="text-xs cursor-pointer flex items-center gap-1.5">
                            {realtimeMode.get(pocket.id) ? (
                              <>
                                <Calendar className="size-3.5" />
                                Realtime
                              </>
                            ) : (
                              <>
                                <BarChart3 className="size-3.5" />
                                Proyeksi
                              </>
                            )}
                          </Label>
                          {realtimeMode.get(pocket.id) ? (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              Hari Ini
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Total
                            </Badge>
                          )}
                        </div>
                        <Switch
                          id={`realtime-${pocket.id}`}
                          checked={realtimeMode.get(pocket.id) || false}
                          onCheckedChange={() => handleToggleRealtimeMode(pocket.id, realtimeMode.get(pocket.id) || false)}
                        />
                      </div>

                      {/* Balance */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-muted-foreground">
                            {realtimeMode.get(pocket.id) ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
                          </span>
                          {timelineLoading.get(pocket.id) ? (
                            <Skeleton className="h-7 w-32" />
                          ) : (
                            <span className={`text-lg font-semibold ${balanceColor}`}>
                              {(() => {
                                const isRealtime = realtimeMode.get(pocket.id);
                                const realtimeBalance = isRealtime ? calculateRealtimeBalance(pocket.id, true) : null;
                                const displayBalance = realtimeBalance !== null ? realtimeBalance : balance.availableBalance;
                                const displayColor = displayBalance >= 0 ? 'text-green-600' : 'text-red-600';
                                return (
                                  <span className={displayColor}>
                                    {formatCurrency(displayBalance)}
                                  </span>
                                );
                              })()}
                            </span>
                          )}
                        </div>
                        {realtimeMode.get(pocket.id) && !timelineLoading.get(pocket.id) && (
                          <p className="text-[10px] text-muted-foreground">
                            Sampai {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-1 pt-2 border-t text-xs">
                        {/* Only show "Saldo Asli" for primary pockets (custom pocket always has originalAmount = 0) */}
                        {pocket.type === 'primary' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Saldo Asli</span>
                            <span>{formatCurrency(balance.originalAmount)}</span>
                          </div>
                        )}
                        {balance.transferIn > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="size-3" />
                              Transfer Masuk
                            </span>
                            <span>+{formatCurrency(balance.transferIn)}</span>
                          </div>
                        )}
                        {balance.transferOut > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span className="flex items-center gap-1">
                              <TrendingDown className="size-3" />
                              Transfer Keluar
                            </span>
                            <span>-{formatCurrency(balance.transferOut)}</span>
                          </div>
                        )}
                        {balance.expenses > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pengeluaran</span>
                            <span>-{formatCurrency(balance.expenses)}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                          onClick={() => {
                            onTransferClick(pocket.id, undefined);
                          }}
                        >
                          <ArrowRightLeft className="size-4 mr-2" />
                          Transfer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                          onClick={() => {
                            onTransferClick(undefined, pocket.id);
                          }}
                        >
                          <Plus className="size-4 mr-2" />
                          Tambah Dana
                        </Button>
                      </div>

                      {/* Wishlist Settings & Button */}
                      <div className="space-y-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`wishlist-${pocket.id}`} className="text-xs text-muted-foreground cursor-pointer">
                            Simulasi Wishlist
                          </Label>
                          <Switch
                            id={`wishlist-${pocket.id}`}
                            checked={pocket.enableWishlist || false}
                            onCheckedChange={() => handleToggleWishlist(pocket.id, pocket.enableWishlist || false)}
                          />
                        </div>
                        
                        {pocket.enableWishlist && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              setSelectedPocket(pocket);
                              setShowWishlist(true);
                            }}
                          >
                            <HeartIcon className="size-4 mr-2" />
                            Wishlist
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Dialog - Responsive */}
      {isMobile ? (
        <Drawer open={showWishlist} onOpenChange={setShowWishlist} dismissible={true}>
          <DrawerContent 
            className="h-[85vh] flex flex-col rounded-t-2xl p-0 z-[102]"
            aria-describedby={undefined}
          >
            <DrawerHeader className="px-4 pt-6 pb-4 border-b">
              <DrawerTitle>
                Simulasi Wishlist - {selectedPocket?.name || 'Kantong'}
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {selectedPocket && (
                <WishlistSimulation
                  pocketId={selectedPocket.id}
                  pocketName={selectedPocket.name}
                  pocketColor={selectedPocket.color || 'blue'}
                  monthKey={monthKey}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showWishlist} onOpenChange={setShowWishlist}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Simulasi Wishlist - {selectedPocket?.name || 'Kantong'}
              </DialogTitle>
            </DialogHeader>
            {selectedPocket && (
              <WishlistSimulation
                pocketId={selectedPocket.id}
                pocketName={selectedPocket.name}
                pocketColor={selectedPocket.color || 'blue'}
                monthKey={monthKey}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Timeline Dialog */}
      {timelinePocket && (
        <PocketTimeline
          pocketId={timelinePocket.id}
          pocketName={timelinePocket.name}
          monthKey={monthKey}
          baseUrl={baseUrl}
          publicAnonKey={publicAnonKey}
          open={showTimeline}
          onOpenChange={setShowTimeline}
          prefetchedEntries={timelineCache.get(timelinePocket.id)}
          isRealtimeMode={realtimeMode.get(timelinePocket.id) || false}
          drawerClassName="z-[101]" // Add higher z-index for nested drawer
          onTimelineLoaded={(entries) => {
            // Update cache when timeline loads new data
            setTimelineCache(prev => new Map(prev).set(timelinePocket.id, entries));
          }}
        />
      )}

      {/* Delete Confirmation Dialog - Responsive */}
      {isMobile ? (
        <Drawer open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} dismissible={true}>
          <DrawerContent 
            className="rounded-t-2xl p-4 z-[103]"
            aria-describedby={undefined}
          >
            <DrawerHeader className="text-left px-0">
              <DrawerTitle>Hapus Kantong?</DrawerTitle>
              <DrawerDescription>
                Apakah Anda yakin ingin menghapus kantong "{pocketToDelete?.name}"? 
                Kantong yang dihapus akan diarsipkan dan tidak dapat digunakan lagi.
                {balances.get(pocketToDelete?.id || '')?.availableBalance !== 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Saldo kantong harus Rp 0 sebelum dihapus.
                  </span>
                )}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeletePocket}
                disabled={isDeleting || (balances.get(pocketToDelete?.id || '')?.availableBalance !== 0)}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus Kantong'}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Kantong?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus kantong "{pocketToDelete?.name}"? 
                Kantong yang dihapus akan diarsipkan dan tidak dapat digunakan lagi.
                {balances.get(pocketToDelete?.id || '')?.availableBalance !== 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Saldo kantong harus Rp 0 sebelum dihapus.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePocket}
                disabled={isDeleting || (balances.get(pocketToDelete?.id || '')?.availableBalance !== 0)}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus Kantong'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
