import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Wallet, Sparkles, ArrowRightLeft, TrendingUp, TrendingDown, Target, Trash2, Plus, Pencil, Settings, Calendar, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
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
  
  // Realtime mode state (per pocket) - default ON
  const [realtimeMode, setRealtimeMode] = useState<Map<string, boolean>>(new Map());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Load realtime mode from localStorage
  useEffect(() => {
    const loadRealtimeMode = () => {
      const newMap = new Map<string, boolean>();
      pockets.forEach(pocket => {
        const saved = localStorage.getItem(`realtime-mode-${pocket.id}`);
        // Default to true (ON) if not set
        newMap.set(pocket.id, saved !== null ? saved === 'true' : true);
      });
      setRealtimeMode(newMap);
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
  };

  // Calculate realtime balance based on timeline
  const calculateRealtimeBalance = (pocketId: string, isRealtime: boolean): number | null => {
    if (!isRealtime) return null; // Return null to use server balance
    
    const timeline = timelineCache.get(pocketId);
    if (!timeline || timeline.length === 0) return null; // No timeline data yet
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter timeline items up to today
    const pastItems = timeline.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate <= today;
    });
    
    // If no past items, return 0
    if (pastItems.length === 0) return 0;
    
    // Return the balance after the most recent past item
    // Timeline is sorted desc, so first past item has the latest balanceAfter for past dates
    return pastItems[0].balanceAfter;
  };

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

  // Prefetch timeline data for a pocket
  const prefetchTimeline = async (pocketId: string) => {
    // Skip if already cached
    if (timelineCache.has(pocketId)) {
      return;
    }
    
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
    }
  };

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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Ringkasan Kantong</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-[rgb(0,0,0)] rounded w-3/4"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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

              return (
                <div 
                  key={pocket.id} 
                  className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow cursor-pointer relative"
                  onMouseEnter={() => prefetchTimeline(pocket.id)}
                  onClick={() => {
                    setTimelinePocket(pocket);
                    setShowTimeline(true);
                  }}
                >
                  {/* Header */}
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
                    {/* Settings button - only for Sehari-hari pocket */}
                    {pocket.name === 'Sehari-hari' && onOpenBudgetSettings && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-background/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBudgetSettings();
                        }}
                        title="Pengaturan Budget"
                      >
                        <Settings className="size-4" />
                      </Button>
                    )}
                    {/* Edit & Delete buttons - only for custom pockets */}
                    {pocket.type === 'custom' && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditPocketClick) {
                              onEditPocketClick(pocket);
                            }
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
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
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
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
                    </div>
                    {realtimeMode.get(pocket.id) && (
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
                        <Target className="size-4 mr-2" />
                        Buka Simulasi
                      </Button>
                    )}
                  </div>
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
            className="h-[75vh] flex flex-col rounded-t-2xl p-0"
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
        />
      )}

      {/* Delete Confirmation Dialog - Responsive */}
      {isMobile ? (
        <Drawer open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} dismissible={true}>
          <DrawerContent 
            className="rounded-t-2xl p-4"
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
