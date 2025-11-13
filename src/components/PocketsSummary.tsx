import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Wallet, Sparkles, ArrowRightLeft, TrendingUp, TrendingDown, Target, Trash2, Plus, Pencil, Settings as SettingsIcon, Calendar, BarChart3, Info, MoreVertical, Sliders, Heart, ChevronRight } from "lucide-react";
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
import { PocketDetailPage } from "./PocketDetailPage";
import { EditPocketDrawer } from "./EditPocketDrawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useIsMobile } from "./ui/use-mobile";
import svgPaths from "../imports/svg-f312o1132i";
import { Skeleton } from "./ui/skeleton";
import { motion } from "motion/react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Separator } from "./ui/separator";

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
  availableBalance: number;  // ✅ BACKWARD COMPAT: Defaults to projected balance
  realtimeBalance?: number;   // ✅ NEW (TUGAS 1): Balance up to today
  projectedBalance?: number;  // ✅ NEW (TUGAS 1): Balance including future transactions
}

interface PocketsSummaryProps {
  monthKey: string;
  onTransferClick: (defaultFromPocket?: string, defaultToPocket?: string) => void;
  onAddIncomeClick?: (targetPocketId?: string) => void;
  onManagePocketsClick?: () => void;
  onCreatePocketClick?: () => void;
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

export function PocketsSummary({ monthKey, onTransferClick, onAddIncomeClick, onManagePocketsClick, onCreatePocketClick, onEditPocketClick, onOpenBudgetSettings, onRefresh, baseUrl, publicAnonKey }: PocketsSummaryProps) {
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
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [detailPagePocket, setDetailPagePocket] = useState<Pocket | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [pocketToEdit, setPocketToEdit] = useState<Pocket | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const isMobile = useIsMobile();
  
  // NEW: Pocket Settings Modal state (Desktop only)
  const [showPocketSettings, setShowPocketSettings] = useState(false);
  const [pocketSettings, setPocketSettings] = useState<Pocket | null>(null);
  
  // Timeline prefetch cache
  const [timelineCache, setTimelineCache] = useState<Map<string, TimelineEntry[]>>(new Map());
  
  // Timeline loading state (per pocket)
  const [timelineLoading, setTimelineLoading] = useState<Map<string, boolean>>(new Map());
  
  // Realtime mode state (per pocket) - default ON
  const [realtimeMode, setRealtimeMode] = useState<Map<string, boolean>>(new Map());
  
  // Carousel state for paging dots
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Setup carousel API listeners for paging dots
  useEffect(() => {
    if (!carouselApi) return;

    setSlideCount(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Load realtime mode from localStorage and prefetch timeline data
  useEffect(() => {
    const loadRealtimeMode = async () => {
      const newMap = new Map<string, boolean>();
      
      pockets.forEach(pocket => {
        const saved = localStorage.getItem(`realtime-mode-${pocket.id}`);
        // Default to true (ON) if not set
        const isRealtime = saved !== null ? saved === 'true' : true;
        newMap.set(pocket.id, isRealtime);
      });
      
      setRealtimeMode(newMap);
      
      // ✅ FIX: Prefetch timeline for ALL pockets (both realtime AND projection modes need it!)
      // - Realtime mode needs timeline to calculate "Saldo Hari Ini"
      // - Projection mode needs timeline to calculate "Saldo Proyeksi" (end of month balance)
      if (pockets.length > 0) {
        Promise.all(pockets.map(pocket => prefetchTimeline(pocket.id)));
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
    
    // ✅ FIX: Prefetch timeline when switching modes (both directions need timeline!)
    // - Switching to Realtime → needs timeline for "Saldo Hari Ini"
    // - Switching to Projection → needs timeline for "Saldo Proyeksi"
    if (!timelineCache.has(pocketId)) {
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

  // Calculate projected balance (end of month) based on timeline
  const calculateProjectedBalance = useCallback((pocketId: string): number | null => {
    const timeline = timelineCache.get(pocketId);
    if (!timeline || timeline.length === 0) {
      // Timeline not loaded yet - return null to use server balance temporarily
      return null;
    }
    
    // Timeline is sorted DESC (newest first)
    // The FIRST entry has the latest date = projected balance at end of month
    // ✅ FIX: Use final balance from timeline (includes ALL transactions including future)
    return timeline[0].balanceAfter;
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
    // Check if it's a Lucide icon name
    if (iconName === 'Wallet') {
      return <Wallet className="size-5" />;
    }
    if (iconName === 'Sparkles') {
      return <Sparkles className="size-5" />;
    }
    // Otherwise, treat as emoji
    return <span className="text-xl">{iconName || '💰'}</span>;
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
      
      // ✅ MONTHLY STATEMENT MODEL: Fetch month-scoped timeline
      const response = await fetch(`${baseUrl}/timeline/${year}/${month}/${pocketId}?sortOrder=desc`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        // Silently fail for prefetch - it's not critical
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTimelineCache(prev => new Map(prev).set(pocketId, data.data.entries));
      }
    } catch (error) {
      // Silently fail for prefetch - network errors are expected during development
      // Only log if it's not a typical network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error - expected during dev, don't log
      } else {
        console.error('Error prefetching timeline:', error);
      }
    } finally {
      // Clear loading state
      setTimelineLoading(prev => new Map(prev).set(pocketId, false));
    }
  }, [monthKey, baseUrl, publicAnonKey, timelineCache, timelineLoading]);

  const handleDeletePocket = async () => {
    if (!pocketToDelete) return;

    const balance = balances.get(pocketToDelete.id);
    // ✅ TUGAS 1: Use projected balance for delete validation (must include ALL future transactions)
    const finalBalance = balance?.projectedBalance ?? balance?.availableBalance ?? 0;
    if (balance && finalBalance !== 0) {
      toast.error('Saldo kantong harus Rp 0 sebelum dihapus');
      setShowDeleteConfirm(false);
      setPocketToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      const [year, month] = monthKey.split('-');
      const response = await fetch(`${baseUrl}/archive/${year}/${month}`, {
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

  const handleEditPocket = async (pocketId: string, updates: Partial<Pocket>) => {
    setIsSavingEdit(true);
    try {
      const [year, month] = monthKey.split('-');
      const response = await fetch(`${baseUrl}/pockets/${year}/${month}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ 
          pocketId,
          updates
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update pocket');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Kantong berhasil diperbarui');
        // Close drawer
        setShowEditDrawer(false);
        setPocketToEdit(null);
        // Refresh pockets
        await fetchPockets();
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error: any) {
      console.error('Error updating pocket:', error);
      toast.error(error.message || 'Gagal memperbarui kantong');
    } finally {
      setIsSavingEdit(false);
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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36" />
              <div className="flex gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              /* MOBILE SKELETON - Carousel Layout */
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                  dragFree: false,
                  containScroll: "trimSnaps",
                  skipSnaps: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {[1, 2].map(i => (
                    <CarouselItem key={i} className="pl-2 md:pl-4 basis-[92%] md:basis-[48%] lg:basis-[31%]">
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="border rounded-lg bg-neutral-950 border-neutral-800 text-white p-3 h-full"
                      >
                        <div className="space-y-3">
                          {/* Header - Icon + Name + Icons Group */}
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                            <div className="flex items-center gap-2">
                              <Skeleton className="size-5 rounded-md bg-neutral-800" />
                              <Skeleton className="h-4 w-28 bg-neutral-800" />
                            </div>
                            {/* Right Icons Group - Shows both heart + chevron placeholders */}
                            <div className="flex items-center gap-1">
                              <Skeleton className="size-6 rounded-full bg-neutral-800" />
                              <Skeleton className="size-5 rounded-md bg-neutral-800" />
                            </div>
                          </div>

                          {/* Hero Balance Section */}
                          <div className="space-y-2">
                            <Skeleton className="h-9 w-40 bg-neutral-800" />
                            <Skeleton className="h-3 w-24 bg-neutral-800" />
                          </div>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            ) : (
              /* DESKTOP SKELETON - New Clean Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Card className="border border-border/50">
                      <CardContent className="p-4 flex flex-col h-full min-h-[220px]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="size-6 rounded-md" />
                            <Skeleton className="h-5 w-28" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton className="size-8 rounded-full" />
                            <Skeleton className="size-8 rounded-full" />
                          </div>
                        </div>
                        
                        {/* Hero Balance */}
                        <div className="flex-1 flex flex-col justify-center space-y-2 mb-4">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        
                        {/* Footer Actions */}
                        <div className="flex gap-2 pt-3 border-t mt-auto">
                          <Skeleton className="h-9 flex-1 rounded-md" />
                          <Skeleton className="h-9 flex-1 rounded-md" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
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
              {onCreatePocketClick && (
                <Button 
                  onClick={() => onCreatePocketClick()} 
                  variant="outline" 
                  size="sm"
                  title="Tambah Kantong"
                  aria-label="Tambah Kantong"
                >
                  <Plus className="size-4" />
                </Button>
              )}
              {onManagePocketsClick && (
                <Button 
                  onClick={() => onManagePocketsClick()} 
                  variant="outline" 
                  size="sm"
                  title="Kelola Kantong"
                  aria-label="Kelola Kantong"
                >
                  <SettingsIcon className="size-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-[-22px] mr-[0px] mb-[0px] ml-[0px]">
          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: false,
              containScroll: "trimSnaps",
              skipSnaps: false,
            }}
            setApi={setCarouselApi}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4 [&>*]:touch-pan-x [&>*]:touch-pan-y">
              {pockets.map(pocket => {
              const balance = balances.get(pocket.id);
              if (!balance) return null;

              const isRealtime = realtimeMode.get(pocket.id);
              
              // ✅ TUGAS 1: Use server-calculated realtime/projected balance
              // Server now returns both realtimeBalance and projectedBalance
              // Frontend timeline calculation is ONLY used as fallback for legacy data
              const serverRealtimeBalance = balance.realtimeBalance;
              const serverProjectedBalance = balance.projectedBalance;
              
              // Fallback to timeline calculation (for backward compat or if server doesn't return new fields)
              const timelineRealtimeBalance = isRealtime ? calculateRealtimeBalance(pocket.id, true) : null;
              const timelineProjectedBalance = !isRealtime ? calculateProjectedBalance(pocket.id) : null;
              
              // Priority: Server balance > Timeline calculation > Legacy availableBalance
              const displayBalance = isRealtime 
                ? (serverRealtimeBalance ?? timelineRealtimeBalance ?? balance.availableBalance)
                : (serverProjectedBalance ?? timelineProjectedBalance ?? balance.availableBalance);
                
              const isPositive = displayBalance >= 0;
              const balanceColor = isPositive ? 'text-green-600' : 'text-red-600';

              return (
                <CarouselItem key={pocket.id} className="pl-2 md:pl-4 basis-[92%] md:basis-[48%] lg:basis-[31%]">
                  <div 
                    className={`border rounded-lg transition-shadow relative h-full cursor-pointer ${
                      isMobile 
                        ? 'bg-neutral-950 border-neutral-800 text-white p-3' 
                        : 'hover:shadow-md p-4 flex flex-col min-h-[220px]'
                    }`}
                    onMouseEnter={() => prefetchTimeline(pocket.id)}
                    onTouchStart={() => prefetchTimeline(pocket.id)}
                    onClick={(e) => {
                      // Always allow opening timeline on card click
                      setTimelinePocket(pocket);
                      setShowTimeline(true);
                    }}
                  >
                  {isMobile ? (
                    /* ========== MOBILE VIEW - CONSISTENT HEIGHT LAYOUT ========== */
                    <div className="space-y-3">
                      {/* Header - Icon + Name + Status Icons Group */}
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <div className="flex items-center gap-2">
                          <div className="text-white text-xl">
                            {getIcon(pocket.icon)}
                          </div>
                          <h3 className="font-medium tracking-tight">{pocket.name}</h3>
                        </div>
                        
                        {/* Right Icons Group: Heart (conditional) + Chevron (always) */}
                        <div className="flex items-center gap-1">
                          {/* Heart Icon - Wishlist Status Indicator */}
                          {pocket.enableWishlist && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPocket(pocket);
                                setShowWishlist(true);
                              }}
                              className="p-1 rounded-full hover:bg-neutral-800/50 transition-colors"
                              title="Buka Wishlist"
                            >
                              <Heart className="size-4 text-red-500 fill-current" />
                            </button>
                          )}
                          
                          {/* Chevron - Affordance for interaction (always visible) */}
                          <ChevronRight className="size-5 text-neutral-500" />
                        </div>
                      </div>

                      {/* Hero Balance Section - Now consistent across all cards */}
                      <div className="space-y-2">
                        {/* Hero Balance - Main Focus */}
                        {timelineLoading.get(pocket.id) ? (
                          <Skeleton className="h-9 w-40 bg-neutral-800" />
                        ) : (
                          <p className={`text-3xl font-bold tracking-tight ${
                            displayBalance >= 0 ? 'text-[#00c950]' : 'text-red-500'
                          }`}>
                            {formatCurrency(displayBalance)}
                          </p>
                        )}
                        
                        {/* Sub-label - Status below balance */}
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] text-neutral-400">
                            {realtimeMode.get(pocket.id) ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
                          </p>
                          {/* Loading indicator - shown when fetching timeline */}
                          {timelineLoading.get(pocket.id) && (
                            <div className="size-3 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ========== DESKTOP VIEW - NEW CLEAN LAYOUT ========== */
                    <>
                      {/* ========== HEADER ========== */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Left Side: Icon + Name */}
                        <div className="flex items-center gap-2">
                          <div className={`text-${pocket.color || 'blue'}-600`}>
                            {getIcon(pocket.icon)}
                          </div>
                          <h3 className="font-medium">{pocket.name}</h3>
                        </div>
                        
                        {/* Right Side: Heart + Menu */}
                        <div className="flex items-center gap-1">
                          {/* Heart Icon - Wishlist Indicator & Shortcut */}
                          {pocket.enableWishlist && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPocket(pocket);
                                setShowWishlist(true);
                              }}
                              className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-background/50"
                              title="Buka Wishlist"
                            >
                              <Heart className="size-4 fill-current" />
                            </button>
                          )}
                          
                          {/* More Options Menu */}
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
                                setPocketSettings(pocket);
                                setShowPocketSettings(true);
                              }}
                              className="cursor-pointer"
                            >
                              <SettingsIcon className="size-4 mr-2" />
                              Kelola Pengaturan
                            </DropdownMenuItem>
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
                            {pocket.type === 'custom' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const pocketBalance = balances.get(pocket.id);
                                  // ✅ TUGAS 1: Use projected balance for delete validation
                                  const finalBalance = pocketBalance?.projectedBalance ?? pocketBalance?.availableBalance ?? 0;
                                  if (pocketBalance && finalBalance !== 0) {
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
                            )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* ========== BODY (HERO BALANCE) ========== */}
                      <div className="flex-1 flex flex-col justify-center space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {isRealtime ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
                          </span>
                          {/* Loading indicator */}
                          {timelineLoading.get(pocket.id) && (
                            <div className="size-3 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                          )}
                        </div>
                        
                        {timelineLoading.get(pocket.id) ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <p className={`text-4xl font-semibold tracking-tight ${balanceColor}`}>
                            {formatCurrency(displayBalance)}
                          </p>
                        )}
                      </div>

                      {/* ========== FOOTER (ACTION BUTTONS) ========== */}
                      <div className="flex gap-2 pt-3 border-t mt-auto" onClick={(e) => e.stopPropagation()}>
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
                    </>
                  )}
                  </div>
                </CarouselItem>
              );
            })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
          
          {/* Paging Dots */}
          {slideCount > 1 && (
            <div className="flex justify-center gap-1.5 pt-3 pb-2">
              {Array.from({ length: slideCount }).map((_, index) => (
                <div
                  key={index}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? isMobile 
                        ? 'h-1 w-4 bg-white' 
                        : 'h-2 w-8 bg-neutral-900 dark:bg-neutral-100'
                      : isMobile
                        ? 'h-1 w-1 bg-neutral-600'
                        : 'h-2 w-2 bg-neutral-400 dark:bg-neutral-600'
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== POCKET SETTINGS MODAL (Desktop Only) ========== */}
      {!isMobile && pocketSettings && (
        <Dialog open={showPocketSettings} onOpenChange={setShowPocketSettings}>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Pengaturan - {pocketSettings.name}</DialogTitle>
              <DialogDescription>
                Kelola pengaturan dan lihat detail kantong
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Realtime Toggle */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Mode Tampilan</h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`settings-realtime-${pocketSettings.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                      {realtimeMode.get(pocketSettings.id) ? (
                        <>
                          <Calendar className="size-4" />
                          Realtime
                        </>
                      ) : (
                        <>
                          <BarChart3 className="size-4" />
                          Proyeksi
                        </>
                      )}
                    </Label>
                    {realtimeMode.get(pocketSettings.id) ? (
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
                    id={`settings-realtime-${pocketSettings.id}`}
                    checked={realtimeMode.get(pocketSettings.id) || false}
                    onCheckedChange={() => handleToggleRealtimeMode(pocketSettings.id, realtimeMode.get(pocketSettings.id) || false)}
                  />
                </div>
              </div>

              {/* Wishlist Toggle */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Fitur Wishlist</h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor={`settings-wishlist-${pocketSettings.id}`} className="text-sm cursor-pointer">
                    Simulasi Wishlist
                  </Label>
                  <Switch
                    id={`settings-wishlist-${pocketSettings.id}`}
                    checked={pocketSettings.enableWishlist || false}
                    onCheckedChange={() => handleToggleWishlist(pocketSettings.id, pocketSettings.enableWishlist || false)}
                  />
                </div>
              </div>

              <Separator />

              {/* Balance Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Detail Saldo</h4>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const balance = balances.get(pocketSettings.id);
                    if (!balance) return null;
                    
                    return (
                      <>
                        {pocketSettings.type === 'primary' && (
                          <div className="flex justify-between p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">Saldo Asli</span>
                            <span className="font-medium">{formatCurrency(balance.originalAmount)}</span>
                          </div>
                        )}
                        {balance.transferIn > 0 && (
                          <div className="flex justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded">
                            <span className="text-green-600 flex items-center gap-1">
                              <TrendingUp className="size-3.5" />
                              Transfer Masuk
                            </span>
                            <span className="font-medium text-green-600">+{formatCurrency(balance.transferIn)}</span>
                          </div>
                        )}
                        {balance.transferOut > 0 && (
                          <div className="flex justify-between p-2 bg-red-50 dark:bg-red-950/30 rounded">
                            <span className="text-red-600 flex items-center gap-1">
                              <TrendingDown className="size-3.5" />
                              Transfer Keluar
                            </span>
                            <span className="font-medium text-red-600">-{formatCurrency(balance.transferOut)}</span>
                          </div>
                        )}
                        {balance.expenses > 0 && (
                          <div className="flex justify-between p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">Pengeluaran</span>
                            <span className="font-medium">-{formatCurrency(balance.expenses)}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Description (if exists) */}
              {pocketSettings.description && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Deskripsi</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded">
                      {pocketSettings.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Wishlist Dialog - Responsive */}
      {isMobile ? (
        <Drawer open={showWishlist} onOpenChange={setShowWishlist} dismissible={true}>
          <DrawerContent 
            className="h-[90vh] flex flex-col rounded-t-2xl p-0 z-[50]"
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
          pocketDescription={timelinePocket.description}
          pocketIcon={timelinePocket.icon}
          pocketColor={timelinePocket.color}
          pocketType={timelinePocket.type}
          enableWishlist={timelinePocket.enableWishlist}
          balance={balances.get(timelinePocket.id)}
          realtimeBalance={realtimeMode.get(timelinePocket.id) ? calculateRealtimeBalance(timelinePocket.id, true) : null}
          onToggleRealtime={() => {
            const isCurrentlyRealtime = realtimeMode.get(timelinePocket.id) || false;
            const newValue = !isCurrentlyRealtime;
            
            // Update state
            setRealtimeMode(prev => {
              const newMap = new Map(prev);
              newMap.set(timelinePocket.id, newValue);
              return newMap;
            });
            
            // Save to localStorage
            localStorage.setItem(`pocket_realtime_${timelinePocket.id}`, JSON.stringify(newValue));
          }}
          onToggleWishlist={() => handleToggleWishlist(timelinePocket.id, timelinePocket.enableWishlist || false)}
          onTransfer={() => onTransferClick(timelinePocket.id)}
          onAddFunds={() => onAddIncomeClick?.(timelinePocket.id)}
          onShowDetailPage={() => {
            // Close timeline drawer first, then open detail page
            setShowTimeline(false);
            setDetailPagePocket(timelinePocket);
            setShowDetailPage(true);
          }}
          onEditPocket={() => {
            setShowTimeline(false);
            setPocketToEdit(timelinePocket);
            setShowEditDrawer(true);
          }}
          onDeletePocket={() => {
            setShowTimeline(false);
            setPocketToDelete(timelinePocket);
            setShowDeleteConfirm(true);
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
            <DrawerHeader className="px-0">
              <DrawerTitle>Hapus Kantong?</DrawerTitle>
              <DrawerDescription>
                Apakah Anda yakin ingin menghapus kantong "{pocketToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPocketToDelete(null);
                }}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeletePocket}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Kantong?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus kantong "{pocketToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeletePocket();
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Detail Page Drawer - Mobile only */}
      {isMobile && detailPagePocket && (
        <PocketDetailPage
          pocket={detailPagePocket}
          monthKey={monthKey}
          open={showDetailPage}
          onOpenChange={setShowDetailPage}
          baseUrl={baseUrl}
          publicAnonKey={publicAnonKey}
          onRealtimeModeChange={(pocketId, isRealtime) => {
            // ✅ Update realtime mode in parent when user toggles in detail page
            handleToggleRealtimeMode(pocketId, !isRealtime);
          }}
        />
      )}

      {/* Edit Pocket Drawer */}
      {pocketToEdit && (
        <EditPocketDrawer
          open={showEditDrawer}
          onOpenChange={setShowEditDrawer}
          pocket={pocketToEdit}
          onSave={(updates) => handleEditPocket(pocketToEdit.id, updates)}
          isSaving={isSavingEdit}
        />
      )}
    </>
  );
}