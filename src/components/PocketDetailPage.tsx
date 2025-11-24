import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { usePreventPullToRefresh } from "../hooks/usePreventPullToRefresh";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { toast } from "sonner@2.0.3";
import { useIsMobile } from "./ui/use-mobile";
import { WishlistSimulation } from "./WishlistSimulation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ChevronLeft, Heart, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

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

interface PocketDetailPageProps {
  pocket: Pocket;
  monthKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUrl: string;
  publicAnonKey: string;
  onRealtimeModeChange?: (pocketId: string, isRealtime: boolean) => void;  // ✅ NEW: Callback untuk notify parent
}

export function PocketDetailPage({
  pocket,
  monthKey,
  open,
  onOpenChange,
  baseUrl,
  publicAnonKey,
  onRealtimeModeChange
}: PocketDetailPageProps) {
  const [balance, setBalance] = useState<PocketBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeMode, setRealtimeMode] = useState(false);
  const [timelineCache, setTimelineCache] = useState<TimelineEntry[]>([]);
  const [localWishlistEnabled, setLocalWishlistEnabled] = useState(pocket.enableWishlist || false);
  const [showWishlist, setShowWishlist] = useState(false);  // ✅ NEW: State untuk wishlist dialog
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);  // ✅ NEW: Loading state untuk toggle wishlist
  const isMobile = useIsMobile();

  // Register this page with dialog stack for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    150, // Higher priority than drawers so it closes first
    `pocket-detail-${pocket.id}`
  );

  // 📱 Prevent pull-to-refresh on mobile when wishlist drawer is open
  usePreventPullToRefresh(showWishlist);

  // Prevent background scroll when detail page is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Load realtime mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`realtime-mode-${pocket.id}`);
    setRealtimeMode(saved !== null ? saved === 'true' : true);
  }, [pocket.id]);

  // Sync localWishlistEnabled with pocket prop
  useEffect(() => {
    setLocalWishlistEnabled(pocket.enableWishlist || false);
  }, [pocket.enableWishlist]);

  // Fetch balance data
  useEffect(() => {
    if (!open) return;
    
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const [year, month] = monthKey.split('-');
        
        const response = await fetch(`${baseUrl}/pockets/${year}/${month}`, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch balance');
        }
        
        const data = await response.json();
        
        if (data.success) {
          const pocketBalance = data.data.balances.find(
            (b: PocketBalance) => b.pocketId === pocket.id
          );
          setBalance(pocketBalance || null);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, [open, pocket.id, monthKey, baseUrl, publicAnonKey]);

  // Fetch timeline data when in realtime mode
  useEffect(() => {
    if (!open || !realtimeMode) return;
    
    const fetchTimeline = async () => {
      try {
        const [year, month] = monthKey.split('-');
        const response = await fetch(`${baseUrl}/timeline/${year}/${month}/${pocket.id}?sortOrder=desc`, {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success) {
          setTimelineCache(data.data.entries);
        }
      } catch (error) {
        console.error('Error fetching timeline:', error);
      }
    };
    
    fetchTimeline();
  }, [open, realtimeMode, pocket.id, monthKey, baseUrl, publicAnonKey]);

  const handleToggleRealtimeMode = () => {
    const newValue = !realtimeMode;
    setRealtimeMode(newValue);
    localStorage.setItem(`realtime-mode-${pocket.id}`, String(newValue));
    toast.success(newValue ? 'Mode Realtime diaktifkan' : 'Mode Proyeksi diaktifkan');
    if (onRealtimeModeChange) {
      onRealtimeModeChange(pocket.id, newValue);
    }
  };

  const handleToggleWishlist = async () => {
    setIsTogglingWishlist(true);
    try {
      const newValue = !localWishlistEnabled;
      const [year, month] = monthKey.split('-');
      
      const response = await fetch(`${baseUrl}/pockets/${year}/${month}/${pocket.id}/wishlist-setting`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ enableWishlist: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist setting');
      }

      const data = await response.json();
      
      if (data.success) {
        setLocalWishlistEnabled(newValue);
        // Update the pocket object as well
        pocket.enableWishlist = newValue;
        toast.success(newValue ? 'Wishlist diaktifkan' : 'Wishlist dinonaktifkan');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Gagal mengubah setting wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const calculateRealtimeBalance = useCallback((): number | null => {
    if (!realtimeMode || timelineCache.length === 0) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    for (const item of timelineCache) {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      const itemTime = itemDate.getTime();
      
      if (itemTime <= todayTime) {
        return item.balanceAfter;
      }
    }
    
    return null;
  }, [realtimeMode, timelineCache]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const realtimeBalance = calculateRealtimeBalance();
  const displayBalance = realtimeMode && realtimeBalance !== null
    ? realtimeBalance
    : balance?.availableBalance ?? 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[150] bg-background flex flex-col"
        >
          {/* Header */}
          <div className="px-4 pt-6 pb-4 border-b flex-shrink-0 bg-background">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <h1 className="text-xl flex-1">Info Kantong</h1>
              
              {/* Heart Icon - Wishlist Shortcut Button */}
              {localWishlistEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
                  onClick={() => setShowWishlist(true)}
                  title="Buka Wishlist"
                >
                  <Heart className="size-5 fill-current" />
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 pb-6 space-y-6 min-h-full">
              {/* Pocket Header */}
              <div className="flex items-center gap-3">
                <div 
                  className="size-12 rounded-xl flex items-center justify-center text-xl border"
                  style={{ 
                    backgroundColor: pocket.color ? `${pocket.color}1a` : 'rgba(59, 130, 246, 0.1)',
                    borderColor: pocket.color ? `${pocket.color}40` : 'rgba(59, 130, 246, 0.25)'
                  }}
                >
                  {pocket.icon || '💰'}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg">{pocket.name}</h2>
                  <Badge variant="secondary" className="mt-1">
                    {pocket.type === 'primary' ? 'Kantong Utama' : 'Kantong Custom'}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Realtime Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-yellow-500/10 flex items-center justify-center text-base">
                    ✨
                  </div>
                  <Label htmlFor="realtime-mode" className="cursor-pointer">
                    Mode Real-time
                  </Label>
                </div>
                <Switch
                  id="realtime-mode"
                  checked={realtimeMode}
                  onCheckedChange={handleToggleRealtimeMode}
                />
              </div>

              {/* Balance Info */}
              {loading ? (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-40" />
                  </div>
                  <Skeleton className="h-3 w-32 ml-auto" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-muted-foreground">
                      {realtimeMode ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
                    </p>
                    <p className={`text-3xl ${displayBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(displayBalance)}
                    </p>
                  </div>
                  {realtimeMode && (
                    <p className="text-xs text-muted-foreground text-right">
                      Sampai {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Breakdown */}
              {loading ? (
                <div className="space-y-3">
                  <h3 className="text-sm text-muted-foreground">Breakdown</h3>
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                </div>
              ) : balance && (
                <div className="space-y-3">
                  <h3 className="text-sm text-muted-foreground">Breakdown</h3>
                  
                  <div className="space-y-2 text-sm">
                    {/* Saldo Asli - Only for primary pockets */}
                    {pocket.type === 'primary' && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-muted-foreground">Saldo Asli</span>
                        <span>{formatCurrency(balance.originalAmount)}</span>
                      </div>
                    )}

                    {/* Transfer Masuk */}
                    {balance.transferIn > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <TrendingUp className="size-4" />
                          Transfer Masuk
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          +{formatCurrency(balance.transferIn)}
                        </span>
                      </div>
                    )}

                    {/* Transfer Keluar */}
                    {balance.transferOut > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <TrendingDown className="size-4" />
                          Transfer Keluar
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          -{formatCurrency(balance.transferOut)}
                        </span>
                      </div>
                    )}

                    {/* Pengeluaran */}
                    {balance.expenses > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-muted-foreground">Pengeluaran</span>
                        <span>-{formatCurrency(balance.expenses)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Wishlist Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-pink-500/10 flex items-center justify-center text-base">
                      💖
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="wishlist-mode" className="cursor-pointer">
                        Simulasi Wishlist
                      </Label>
                      {isTogglingWishlist && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Loader2 className="size-3 animate-spin" />
                          Menyimpan...
                        </span>
                      )}
                    </div>
                  </div>
                  <Switch
                    id="wishlist-mode"
                    checked={localWishlistEnabled}
                    onCheckedChange={handleToggleWishlist}
                    disabled={isTogglingWishlist}
                  />
                </div>
              </div>

              <Separator />

              {/* Description (if exists) */}
              {pocket.description && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm text-muted-foreground">Deskripsi</h3>
                    <p className="text-sm p-3 rounded-lg bg-muted/30">
                      {pocket.description}
                    </p>
                  </div>
                  <Separator />
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Wishlist Dialog - Responsive */}
      {isMobile ? (
        <Drawer open={showWishlist} onOpenChange={setShowWishlist} dismissible={true}>
          <DrawerContent 
            className="h-[90vh] flex flex-col rounded-t-2xl p-0 z-[200]"
            aria-describedby={undefined}
          >
            <DrawerHeader className="px-4 pt-6 pb-4 border-b">
              <DrawerTitle>
                Simulasi Wishlist - {pocket.name}
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <WishlistSimulation
                pocketId={pocket.id}
                pocketName={pocket.name}
                pocketColor={pocket.color || 'blue'}
                monthKey={monthKey}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showWishlist} onOpenChange={setShowWishlist}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto z-[200]" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Simulasi Wishlist - {pocket.name}
              </DialogTitle>
            </DialogHeader>
            <WishlistSimulation
              pocketId={pocket.id}
              pocketName={pocket.name}
              pocketColor={pocket.color || 'blue'}
              monthKey={monthKey}
            />
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}