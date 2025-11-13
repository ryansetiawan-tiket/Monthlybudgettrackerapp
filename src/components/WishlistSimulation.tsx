import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { useIsMobile } from "./ui/use-mobile";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  DollarSign,
  X as XIcon,
  MoreVertical,
  Eye,
  EyeOff,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Lazy load wishlist dialog for better performance
const WishlistDialog = lazy(() => 
  import("./WishlistDialog").then(m => ({ default: m.WishlistDialog }))
);
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { useConfirm } from "../hooks/useConfirm";
import { getBaseUrl, createAuthHeaders } from "../utils/api";
import { formatCurrency } from "../utils/currency";
import { getRandomWishlistQuote } from "../data/wishlist-quotes";

interface WishlistItem {
  id: string;
  pocketId: string;
  name: string;
  amount: number;
  priority: 1 | 2 | 3;
  description?: string;
  url?: string;
  targetDate?: string;
  status: 'planned' | 'saving' | 'ready' | 'purchased';
  createdAt: string;
  notes?: string;
}

interface SimulationResult {
  pocketId: string;
  pocketName: string;
  currentBalance: number;
  wishlist: {
    total: number;
    count: number;
    byPriority: {
      high: { count: number; total: number };
      medium: { count: number; total: number };
      low: { count: number; total: number };
    };
  };
  affordableNow: string[];
  affordableSoon: Array<{
    itemId: string;
    amountNeeded: number;
    estimatedWeeks: number;
  }>;
  notAffordable: string[];
  scenarios: Array<{
    itemId: string;
    itemName: string;
    amount: number;
    currentBalance: number;
    balanceAfter: number;
    status: 'affordable' | 'low-balance' | 'insufficient';
    blockedItems: string[];
    warning?: string;
  }>;
  recommendations: Array<{
    type: 'warning' | 'info' | 'suggestion';
    message: string;
    actionable: boolean;
  }>;
}

interface WishlistSimulationProps {
  pocketId: string;
  pocketName: string;
  pocketColor: string;
  monthKey: string;
}

const PRIORITY_LABELS = {
  1: { label: '⭐ High', color: 'destructive' as const },
  2: { label: '🟡 Medium', color: 'default' as const },
  3: { label: '🔵 Low', color: 'secondary' as const }
};

// QuickInsightButton Component - Interactive Affordable Items Filter
interface QuickInsightButtonProps {
  affordableCount: number;
  isActive: boolean;
  onClick: () => void;
}

function QuickInsightButton({ affordableCount, isActive, onClick }: QuickInsightButtonProps) {
  if (affordableCount === 0) return null;

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className="w-full justify-start gap-2 transition-all"
      onClick={onClick}
    >
      <span className="text-base">💡</span>
      <span className="flex-1 text-left text-sm">
        Tampilkan {affordableCount} item yang bisa dibeli sekarang
      </span>
      {isActive && (
        <XIcon className="size-4 ml-auto" />
      )}
    </Button>
  );
}

// PriorityTabs Component - Interactive Priority Filter
interface PriorityTabsProps {
  items: WishlistItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

function PriorityTabs({ items, activeTab, onTabChange }: PriorityTabsProps) {
  const counts = useMemo(() => ({
    all: items.length,
    high: items.filter(i => i.priority === 1).length,
    medium: items.filter(i => i.priority === 2).length,
    low: items.filter(i => i.priority === 3).length,
  }), [items]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      {/* ✅ MOBILE: Horizontal scrollable | DESKTOP: Grid */}
      <div className="overflow-x-auto overflow-y-hidden -mx-1 px-1 sm:overflow-visible">
        <TabsList className="inline-flex sm:grid sm:w-full sm:grid-cols-4 h-auto min-w-full sm:min-w-0">
          <TabsTrigger value="all" className="text-xs sm:text-sm shrink-0">
            Semua ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="high" className="text-xs sm:text-sm shrink-0">
            <span className="mr-1">⭐</span>
            High ({counts.high})
          </TabsTrigger>
          <TabsTrigger value="medium" className="text-xs sm:text-sm shrink-0">
            <span className="mr-1">🟡</span>
            Med ({counts.medium})
          </TabsTrigger>
          <TabsTrigger value="low" className="text-xs sm:text-sm shrink-0">
            <span className="mr-1">🔵</span>
            Low ({counts.low})
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}

// SmartCTA Component - Always-visible CTA with contextual state
interface SmartCTAProps {
  itemId: string;
  itemName: string;
  isAffordable: boolean;
  shortage: number;
  onPurchase: (itemId: string) => void;
}

function SmartCTA({ itemId, itemName, isAffordable, shortage, onPurchase }: SmartCTAProps) {
  const tooltipContent = isAffordable
    ? `Klik untuk membeli ${itemName}`
    : `Kurang Rp ${shortage.toLocaleString('id-ID')} untuk membeli item ini`;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              onClick={() => onPurchase(itemId)}
              disabled={!isAffordable}
              variant={isAffordable ? "default" : "secondary"}
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAffordable ? 'Beli Sekarang' : 'Belum Bisa Dibeli'}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// SummaryHeader Component - Centralized Budget Summary with Cycling Quotes! 🎭
interface SummaryHeaderProps {
  currentBalance: number;
  totalWishlist: number;
  itemCount: number;
  quoteKey: number; // ✨ NEW: Triggers quote change when drawer reopens
}

function SummaryHeader({ currentBalance, totalWishlist, itemCount, quoteKey }: SummaryHeaderProps) {
  const shortage = totalWishlist - currentBalance;
  const isAffordable = currentBalance >= totalWishlist;
  const progressPercentage = useMemo(() => {
    if (totalWishlist === 0) return 0;
    return Math.min(Math.round((currentBalance / totalWishlist) * 100), 100);
  }, [currentBalance, totalWishlist]);

  // ✨ NEW: Random quote based on state - changes when quoteKey changes!
  const randomQuote = useMemo(() => {
    if (isAffordable) {
      return getRandomWishlistQuote('affordable');
    } else {
      return getRandomWishlistQuote('shortage', shortage);
    }
  }, [isAffordable, shortage, quoteKey]); // quoteKey dependency causes re-calculation

  return (
    <div className="bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg p-4 space-y-3">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-neutral-400 text-xs mb-1">💰 Saldo Kantong</span>
          <span className="text-neutral-50 text-base">
            Rp {currentBalance.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400 text-xs mb-1">🎯 Total Wishlist</span>
          <span className="text-neutral-50 text-base">
            Rp {totalWishlist.toLocaleString('id-ID')}
            <span className="text-neutral-500 text-sm ml-1">({itemCount} items)</span>
          </span>
        </div>
      </div>

      {/* Status Message - SUPER KOCAK TONE dengan Cycling Quotes! 🎉✨ */}
      {isAffordable ? (
        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          <span className="text-lg">🎉</span>
          <div className="flex-1">
            <p className="text-sm text-emerald-400">
              {randomQuote}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-[0px] mr-[0px] mb-[12px] ml-[0px] pt-[12px] pr-[12px] pb-[2px] pl-[12px]">
          <span className="text-lg">😅</span>
          <div className="flex-1">
            <p className="text-sm text-amber-400">
              {randomQuote}
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Rp {currentBalance.toLocaleString('id-ID')}</span>
          <span className="font-semibold">{progressPercentage}%</span>
          <span>Rp {totalWishlist.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
}

export function WishlistSimulation({ pocketId, pocketName, pocketColor, monthKey }: WishlistSimulationProps) {
  // 🐛 DEBUG: Log props yang diterima
  console.log('[WishlistSimulation] Component mounted with props:', {
    pocketId,
    pocketName,
    pocketColor,
    monthKey
  });
  
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { confirm, ConfirmDialog } = useConfirm();
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  
  // ✨ NEW: Quote cycling - increment setiap drawer dibuka!
  const [quoteKey, setQuoteKey] = useState(0);
  
  // ✅ NEW: Filter state
  const [filterState, setFilterState] = useState<{
    type: 'all' | 'affordable' | 'priority';
    value?: 1 | 2 | 3;
  }>({ type: 'all' });
  
  // ✅ Platform detection
  const isMobile = useIsMobile();
  
  // ✅ Track hidden items (excluded from simulation)
  const [hiddenItemIds, setHiddenItemIds] = useState<Set<string>>(new Set());
  
  // ✅ Show/hide hidden items section
  const [showHiddenItems, setShowHiddenItems] = useState(false);

  const [year, month] = monthKey.split('-');
  const baseUrl = getBaseUrl(projectId);
  
  // ✅ Filter simulation to exclude hidden items from ALL calculations
  const filteredSimulation = useMemo<SimulationResult | null>(() => {
    if (!simulation) return null;
    
    // Get visible items only
    const visibleItems = wishlist.filter(item => !hiddenItemIds.has(item.id));
    const visibleItemIds = new Set(visibleItems.map(item => item.id));
    
    // Recalculate totals for visible items only
    const visibleTotal = visibleItems.reduce((sum, item) => sum + item.amount, 0);
    const visibleCount = visibleItems.length;
    
    // Recalculate by priority
    const byPriority = {
      high: {
        count: visibleItems.filter(i => i.priority === 1).length,
        total: visibleItems.filter(i => i.priority === 1).reduce((sum, i) => sum + i.amount, 0)
      },
      medium: {
        count: visibleItems.filter(i => i.priority === 2).length,
        total: visibleItems.filter(i => i.priority === 2).reduce((sum, i) => sum + i.amount, 0)
      },
      low: {
        count: visibleItems.filter(i => i.priority === 3).length,
        total: visibleItems.filter(i => i.priority === 3).reduce((sum, i) => sum + i.amount, 0)
      }
    };
    
    return {
      ...simulation,
      wishlist: {
        total: visibleTotal,
        count: visibleCount,
        byPriority
      },
      affordableNow: simulation.affordableNow.filter(id => visibleItemIds.has(id)),
      affordableSoon: simulation.affordableSoon.filter(s => visibleItemIds.has(s.itemId)),
      notAffordable: simulation.notAffordable.filter(id => visibleItemIds.has(id)),
      scenarios: simulation.scenarios.filter(s => visibleItemIds.has(s.itemId))
    };
  }, [simulation, wishlist, hiddenItemIds]);
  
  // ✅ Calculate affordable items (excluding hidden)
  const affordableItems = useMemo(() => {
    if (!filteredSimulation) return [];
    return wishlist.filter(item => 
      filteredSimulation.affordableNow.includes(item.id) && !hiddenItemIds.has(item.id)
    );
  }, [wishlist, filteredSimulation, hiddenItemIds]);
  
  // ✅ Get hidden items list
  const hiddenItems = useMemo(() => {
    return wishlist.filter(item => hiddenItemIds.has(item.id));
  }, [wishlist, hiddenItemIds]);
  
  // ✅ Apply filters to get filtered items (visible only)
  const filteredItems = useMemo(() => {
    // First filter by visibility
    let items = wishlist.filter(item => !hiddenItemIds.has(item.id));
    
    if (filterState.type === 'affordable') {
      return items.filter(item => filteredSimulation?.affordableNow.includes(item.id));
    }
    
    if (filterState.type === 'priority' && filterState.value) {
      return items.filter(item => item.priority === filterState.value);
    }
    
    return items;
  }, [wishlist, hiddenItemIds, filteredSimulation, filterState]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/wishlist/${year}/${month}/${pocketId}`,
        {
          headers: createAuthHeaders(publicAnonKey)
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      
      const result = await response.json();
      setWishlist(result.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Gagal memuat wishlist');
    }
  };

  const fetchSimulation = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/wishlist/${year}/${month}/${pocketId}/simulate`,
        {
          method: 'POST',
          headers: createAuthHeaders(publicAnonKey)
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch simulation');
      
      const result = await response.json();
      setSimulation(result.data);
    } catch (error) {
      console.error('Error fetching simulation:', error);
      toast.error('Gagal memuat simulasi');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchWishlist(), fetchSimulation()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [pocketId, monthKey]);

  // ✨ NEW: Increment quoteKey setiap drawer dibuka untuk cycling quotes!
  useEffect(() => {
    setQuoteKey(prev => prev + 1);
  }, []); // Empty deps = runs on mount only

  // ✅ NEW: Filter handlers
  const toggleAffordableFilter = () => {
    if (filterState.type === 'affordable') {
      setFilterState({ type: 'all' });
    } else {
      setFilterState({ type: 'affordable' });
    }
  };

  const handlePriorityFilter = (value: string) => {
    if (value === 'all') {
      setFilterState({ type: 'all' });
    } else {
      const priorityValue = value === 'high' ? 1 : value === 'medium' ? 2 : 3;
      setFilterState({ 
        type: 'priority', 
        value: priorityValue as 1 | 2 | 3
      });
    }
  };

  // ✅ NEW: Mobile swipe handlers
  const handleSwipeLeft = (itemId: string) => {
    if (isMobile) {
      setSwipedItemId(swipedItemId === itemId ? null : itemId);
    }
  };

  const handleAddItem = async (itemData: Partial<WishlistItem>) => {
    try {
      const response = await fetch(
        `${baseUrl}/wishlist/${year}/${month}/${pocketId}`,
        {
          method: 'POST',
          headers: createAuthHeaders(publicAnonKey),
          body: JSON.stringify(itemData)
        }
      );

      if (!response.ok) throw new Error('Failed to add item');

      toast.success('Item ditambahkan ke wishlist');
      // Reload data to show updated wishlist (drawer utama tetap terbuka)
      await loadData();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Gagal menambah item');
      throw error;
    }
  };

  const handleUpdateItem = async (itemData: Partial<WishlistItem>) => {
    if (!editingItem) return;

    try {
      const response = await fetch(
        `${baseUrl}/wishlist/${year}/${month}/${pocketId}/${editingItem.id}`,
        {
          method: 'PUT',
          headers: createAuthHeaders(publicAnonKey),
          body: JSON.stringify(itemData)
        }
      );

      if (!response.ok) throw new Error('Failed to update item');

      toast.success('Item diupdate');
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Gagal mengupdate item');
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const confirmed = await confirm({
      title: "Hapus Item?",
      description: "Apakah Anda yakin ingin menghapus item dari wishlist?",
      confirmText: "Hapus",
      cancelText: "Batal",
      variant: "destructive",
    });
    
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${baseUrl}/wishlist/${year}/${month}/${pocketId}/${itemId}`,
        {
          method: 'DELETE',
          headers: createAuthHeaders(publicAnonKey)
        }
      );

      if (!response.ok) throw new Error('Failed to delete item');

      toast.success('Item dihapus');
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Gagal menghapus item');
    }
  };

  const handlePurchaseItem = async (itemId: string) => {
    const confirmed = await confirm({
      title: "Beli Item?",
      description: "Tandai item sebagai sudah dibeli? Item akan dikonversi menjadi pengeluaran.",
      confirmText: "Tandai Dibeli",
      cancelText: "Batal",
    });
    
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${baseUrl}/wishlist/${year}/${month}/${pocketId}/${itemId}/purchase`,
        {
          method: 'POST',
          headers: createAuthHeaders(publicAnonKey),
          body: JSON.stringify({
            purchaseDate: new Date().toISOString()
          })
        }
      );

      if (!response.ok) throw new Error('Failed to purchase item');

      toast.success('Item dibeli dan ditambahkan ke pengeluaran!');
      loadData();
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast.error('Gagal memproses pembelian');
    }
  };

  const handleToggleVisibility = (itemId: string) => {
    setHiddenItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        toast.success('Item ditampilkan di simulasi');
      } else {
        newSet.add(itemId);
        toast.success('Item disembunyikan dari simulasi');
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Header Skeleton */}
        <div className="bg-[rgba(38,38,38,0.3)] border border-neutral-800 rounded-lg p-4 space-y-3">
          {/* Balance Overview Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-36" />
            </div>
          </div>
          
          {/* Status Message Skeleton */}
          <div className="p-3 rounded-lg bg-muted/20">
            <Skeleton className="h-4 w-full max-w-xs" />
          </div>

          {/* Progress Bar Skeleton */}
          <div className="space-y-1.5">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        <Separator />

        {/* Wishlist Items Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header: Name + Badge | Action Buttons */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-4 w-full max-w-xs" />
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Skeleton className="size-9 rounded-md" />
                        <Skeleton className="size-9 rounded-md" />
                      </div>
                    </div>
                    {/* Affordability Status */}
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
          {/* ✅ NEW: Centralized Summary Header with Cycling Quotes! */}
          {filteredSimulation && (
            <SummaryHeader
              currentBalance={filteredSimulation.currentBalance}
              totalWishlist={filteredSimulation.wishlist.total}
              itemCount={filteredSimulation.wishlist.count}
              quoteKey={quoteKey}
            />
          )}

          {/* ✅ NEW: Interactive Filters */}
          {filteredSimulation && wishlist.length > 0 && (
            <div className="space-y-3">
              <QuickInsightButton
                affordableCount={affordableItems.length}
                isActive={filterState.type === 'affordable'}
                onClick={toggleAffordableFilter}
              />

              <PriorityTabs
                items={wishlist}
                activeTab={
                  filterState.type === 'priority' 
                    ? (filterState.value === 1 ? 'high' : filterState.value === 2 ? 'medium' : 'low')
                    : 'all'
                }
                onTabChange={handlePriorityFilter}
              />
            </div>
          )}

          {/* ✅ Hidden Items Notice */}
          {hiddenItemIds.size > 0 && (
            <Alert 
              className="border-amber-500/30 bg-amber-500/10 cursor-pointer hover:bg-amber-500/20 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                setShowHiddenItems(true);
                // Scroll to hidden section
                setTimeout(() => {
                  const hiddenSection = document.querySelector('[data-hidden-section]');
                  if (hiddenSection) {
                    hiddenSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }, 100);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowHiddenItems(true);
                }
              }}
              aria-label="Klik untuk lihat item yang disembunyikan"
            >
              <EyeOff className="h-4 w-4 text-amber-500 pointer-events-none" />
              <AlertDescription className="text-amber-500 flex items-center justify-between pointer-events-none">
                <span>
                  {hiddenItemIds.size} item disembunyikan dan tidak termasuk dalam simulasi budget
                </span>
                <span className="text-xs opacity-75">
                  Klik untuk lihat →
                </span>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Wishlist Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold flex-1 min-w-0">
                Items Wishlist
                <span className="text-sm text-muted-foreground ml-2">
                  ({filteredItems.length} 
                  {hiddenItemIds.size > 0 && ` + ${hiddenItemIds.size} hidden`})
                </span>
              </h3>
              {/* ✅ MOBILE: Icon only | DESKTOP: Full button */}
              {isMobile ? (
                <Button 
                  onClick={() => setShowDialog(true)}
                  aria-label="Tambah item wishlist baru"
                  size="icon"
                  className="min-w-[44px] min-h-[44px] shrink-0"
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowDialog(true)}
                  aria-label="Tambah item wishlist baru"
                  className="min-h-[44px] shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Tambah Item
                </Button>
              )}
            </div>
            
            {wishlist.length === 0 ? (
              <div 
                className="text-center py-12"
                role="status"
                aria-live="polite"
              >
                <Target className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" aria-hidden="true" />
                <p className="text-lg mb-2 text-foreground font-semibold">✨ Wishlist Kosong Nih!</p>
                <p className="text-sm mb-4 text-amber-400/90 px-4 max-w-md mx-auto">
                  {getRandomWishlistQuote('empty')}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDialog(true)}
                  aria-label="Tambah item wishlist pertama"
                  className="min-h-[44px]"
                >
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Tambah Item Pertama
                </Button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div 
                className="text-center py-12 text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-30" aria-hidden="true" />
                <p className="text-lg mb-2">Tidak ada item yang sesuai filter</p>
                <p className="text-sm mb-4 text-muted-foreground/80">
                  {filterState.type === 'affordable' 
                    ? 'Tidak ada item yang bisa dibeli dengan saldo saat ini. Coba tambahkan saldo atau pilih item dengan harga lebih rendah.'
                    : `Tidak ada item dengan prioritas ${
                        filterState.value === 1 ? 'High' : 
                        filterState.value === 2 ? 'Medium' : 'Low'
                      }. Coba pilih prioritas lain.`
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilterState({ type: 'all' })}
                  aria-label="Reset filter dan tampilkan semua item"
                  className="min-h-[44px]"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {filteredItems.sort((a, b) => a.priority - b.priority).map((item) => {
                    const scenario = filteredSimulation?.scenarios.find(s => s.itemId === item.id);
                    const isAffordable = filteredSimulation?.affordableNow.includes(item.id);
                    const isSoon = filteredSimulation?.affordableSoon.find(s => s.itemId === item.id);

                    const isHidden = hiddenItemIds.has(item.id);
                    
                    return (
                      <Card 
                        key={item.id}
                        className={`transition-all duration-200 ${isHidden ? 'opacity-50 border-dashed' : ''}`}
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-lg font-semibold truncate">{item.name}</h4>
                                  <Badge variant={PRIORITY_LABELS[item.priority].color} className="shrink-0">
                                    {PRIORITY_LABELS[item.priority].label}
                                  </Badge>
                                  {isHidden && (
                                    <Badge variant="outline" className="shrink-0 text-xs">
                                      <EyeOff className="h-3 w-3 mr-1" />
                                      Hidden
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xl">
                                  Rp {item.amount.toLocaleString('id-ID')}
                                </p>
                                {item.description && (
                                  <p className="text-muted-foreground mt-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              {/* ✅ More Menu Button (always visible) */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 min-w-[44px] min-h-[44px]"
                                    aria-label="More options"
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => handleToggleVisibility(item.id)}
                                  >
                                    {isHidden ? (
                                      <>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Tampilkan Item
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="h-4 w-4 mr-2" />
                                        Sembunyikan Item
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  {item.url && (
                                    <DropdownMenuItem
                                      onClick={() => window.open(item.url, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Buka Link
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingItem(item);
                                      setShowDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Item
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* ✅ DECLUTTERED: Only show contextual info */}
                            {scenario && (
                              <div className="space-y-3">
                                {/* Only show "Soon" indicator (yellow) - most actionable */}
                                {isSoon && !isAffordable && (
                                  <div className="flex items-center gap-2 text-amber-500">
                                    <Clock className="h-5 w-5" />
                                    <span className="text-sm">
                                      Kurang Rp {isSoon.amountNeeded.toLocaleString('id-ID')} 
                                      <span className="text-muted-foreground ml-1">
                                        (~{isSoon.estimatedWeeks} minggu)
                                      </span>
                                    </span>
                                  </div>
                                )}

                                {/* ✅ POLISHED: Only show warning for AFFORDABLE items (critical balance warnings) */}
                                {/* Don't show for unaffordable items - redundant with shortage info above */}
                                {scenario.warning && isAffordable && (
                                  <Alert variant="destructive" className="py-3">
                                    <AlertDescription className="!text-[rgb(239,68,68)] font-semibold">
                                      {scenario.warning}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            )}

                            {/* ✅ NEW: SmartCTA - Always visible, contextual state */}
                            {scenario && (
                              <SmartCTA
                                itemId={item.id}
                                itemName={item.name}
                                isAffordable={!!isAffordable}
                                shortage={isSoon?.amountNeeded || Math.max(0, item.amount - (filteredSimulation?.currentBalance || 0))}
                                onPurchase={handlePurchaseItem}
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          {/* ✅ Hidden Items Section (Collapsible) */}
          {hiddenItems.length > 0 && (
            <Collapsible 
              open={showHiddenItems} 
              onOpenChange={setShowHiddenItems}
              className="space-y-4"
              data-hidden-section
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between min-h-[44px]"
                    aria-label={showHiddenItems ? "Hide hidden items" : "Show hidden items"}
                  >
                    <span className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      Hidden Items ({hiddenItems.length})
                    </span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        showHiddenItems ? 'rotate-180' : ''
                      }`} 
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-4">
                <div className="bg-muted/30 border border-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    💡 Item yang disembunyikan tidak termasuk dalam simulasi budget. 
                    Klik tombol More (⋮) untuk menampilkan kembali.
                  </p>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    {hiddenItems.sort((a, b) => a.priority - b.priority).map((item) => {
                      return (
                        <Card 
                          key={item.id}
                          className="opacity-50 border-dashed"
                        >
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-lg font-semibold truncate">{item.name}</h4>
                                    <Badge variant={PRIORITY_LABELS[item.priority].color} className="shrink-0">
                                      {PRIORITY_LABELS[item.priority].label}
                                    </Badge>
                                    <Badge variant="outline" className="shrink-0 text-xs">
                                      <EyeOff className="h-3 w-3 mr-1" />
                                      Hidden
                                    </Badge>
                                  </div>
                                  <p className="text-xl">
                                    Rp {item.amount.toLocaleString('id-ID')}
                                  </p>
                                  {item.description && (
                                    <p className="text-muted-foreground mt-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {/* ✅ More Menu for Hidden Items */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0 min-w-[44px] min-h-[44px]"
                                      aria-label="More options"
                                    >
                                      <MoreVertical className="h-5 w-5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={() => handleToggleVisibility(item.id)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Tampilkan Item
                                    </DropdownMenuItem>
                                    {item.url && (
                                      <DropdownMenuItem
                                        onClick={() => window.open(item.url, '_blank')}
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Buka Link
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingItem(item);
                                        setShowDialog(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Item
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Hapus Item
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          )}
      </div>

      <Suspense fallback={null}>
        {showDialog && (
          <WishlistDialog
            open={showDialog}
            onOpenChange={(open) => {
              setShowDialog(open);
              if (!open) setEditingItem(null);
            }}
            pocketId={pocketId}
            pocketName={pocketName}
            item={editingItem}
            onSave={editingItem ? handleUpdateItem : handleAddItem}
          />
        )}
      </Suspense>
      
      <ConfirmDialog />
    </>
  );
}