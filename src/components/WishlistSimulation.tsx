import { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
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
  DollarSign
} from "lucide-react";

// Lazy load wishlist dialog for better performance
const WishlistDialog = lazy(() => 
  import("./WishlistDialog").then(m => ({ default: m.WishlistDialog }))
);
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { getBaseUrl, createAuthHeaders } from "../utils/api";
import { formatCurrency } from "../utils/currency";

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

export function WishlistSimulation({ pocketId, pocketName, pocketColor, monthKey }: WishlistSimulationProps) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  const [year, month] = monthKey.split('-');
  const baseUrl = getBaseUrl(projectId);

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
      loadData();
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
    if (!confirm('Hapus item dari wishlist?')) return;

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
    if (!confirm('Tandai item sebagai sudah dibeli? Item akan dikonversi jadi pengeluaran.')) return;

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Skeleton className="h-9 w-32" />
        </div>
        
        {/* Summary Skeleton */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          {/* Remaining Balance Skeleton */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-40" />
          </div>

          {/* Health Bar Skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>

          <Separator />

          {/* Priority Breakdown Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Wishlist Items Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <div className="flex gap-1">
                        <Skeleton className="size-9 rounded-md" />
                        <Skeleton className="size-9 rounded-md" />
                        <Skeleton className="size-9 rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
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

  // Health bar: menunjukkan sisa saldo setelah wishlist (100% = sehat, 0% = habis)
  const remainingBalance = simulation 
    ? simulation.currentBalance - simulation.wishlist.total
    : 0;
  
  const healthPercentage = simulation && simulation.currentBalance > 0
    ? Math.max(0, Math.min(100, (remainingBalance / simulation.currentBalance) * 100))
    : 0;
  
  // Tentukan warna berdasarkan health level
  const getHealthColor = () => {
    if (remainingBalance < 0) return 'text-red-600';
    if (healthPercentage > 50) return 'text-green-600';
    if (healthPercentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Item
          </Button>
        </div>
          {/* Summary */}
          {simulation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Saldo Saat Ini</p>
                  <p className="text-3xl">
                    Rp {simulation.currentBalance.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Total Wishlist</p>
                  <p className="text-3xl">
                    Rp {simulation.wishlist.total.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {simulation.wishlist.count} items
                  </p>
                </div>
              </div>
              
              {/* Sisa Saldo Setelah Wishlist */}
              <div className="p-6 rounded-lg bg-muted/50">
                <p className="text-muted-foreground mb-2">Sisa Saldo Setelah Wishlist</p>
                <p className={`text-3xl ${getHealthColor()}`}>
                  {remainingBalance < 0 ? '-' : ''}Rp {Math.abs(remainingBalance).toLocaleString('id-ID')}
                </p>
                {remainingBalance < 0 && (
                  <p className="text-red-500 mt-3 font-medium">
                    ⚠️ Kurang Rp {Math.abs(remainingBalance).toLocaleString('id-ID')} untuk beli semua items
                  </p>
                )}
              </div>

              {/* Health Bar - Sisa Saldo */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Health Saldo</span>
                  <span className={getHealthColor()}>
                    {healthPercentage.toFixed(0)}%
                  </span>
                </div>
                <div 
                  style={{
                    '--progress-color': healthPercentage > 50 
                      ? 'rgb(22 163 74)' // green-600
                      : healthPercentage > 20 
                      ? 'rgb(202 138 4)' // yellow-600
                      : 'rgb(220 38 38)' // red-600
                  } as React.CSSProperties}
                >
                  <Progress 
                    value={healthPercentage} 
                    className="h-3 [&>*]:bg-[var(--progress-color)]" 
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {healthPercentage > 50 && '💚 Saldo sehat'}
                  {healthPercentage > 20 && healthPercentage <= 50 && '⚠️ Saldo menipis'}
                  {healthPercentage <= 20 && healthPercentage > 0 && '🔴 Saldo kritis!'}
                  {healthPercentage === 0 && '❌ Saldo tidak cukup!'}
                </p>
              </div>

              {/* Recommendations - Only show affordable/purchase related */}
              {simulation.recommendations.length > 0 && (
                <div className="space-y-3">
                  {simulation.recommendations
                    .filter(rec => rec.message.toLowerCase().includes('bisa beli') || 
                                   rec.message.toLowerCase().includes('affordable') ||
                                   rec.message.toLowerCase().includes('mampu'))
                    .map((rec, idx) => (
                      <Alert key={idx} variant="default">
                        <AlertDescription>
                          {rec.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                </div>
              )}

              <Separator />

              {/* Priority Breakdown */}
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground">⭐ High</p>
                  <p className="text-xl font-semibold">
                    {simulation.wishlist.byPriority.high.count} items
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rp {simulation.wishlist.byPriority.high.total.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">🟡 Medium</p>
                  <p className="text-xl font-semibold">
                    {simulation.wishlist.byPriority.medium.count} items
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rp {simulation.wishlist.byPriority.medium.total.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">🔵 Low</p>
                  <p className="text-xl font-semibold">
                    {simulation.wishlist.byPriority.low.count} items
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rp {simulation.wishlist.byPriority.low.total.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Wishlist Items */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Items Wishlist</h3>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-4">Belum ada item di wishlist</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Item Pertama
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 pr-4">
                  {wishlist.map((item) => {
                    const scenario = simulation?.scenarios.find(s => s.itemId === item.id);
                    const isAffordable = simulation?.affordableNow.includes(item.id);
                    const isSoon = simulation?.affordableSoon.find(s => s.itemId === item.id);

                    return (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-lg font-semibold truncate">{item.name}</h4>
                                  <Badge variant={PRIORITY_LABELS[item.priority].color} className="shrink-0">
                                    {PRIORITY_LABELS[item.priority].label}
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

                              <div className="flex gap-1 shrink-0">
                                {item.url && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(item.url, '_blank')}
                                    title="Buka Link"
                                  >
                                    <ExternalLink className="h-5 w-5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setShowDialog(true);
                                  }}
                                >
                                  <Edit className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>

                            {/* Affordability Status */}
                            {scenario && (
                              <div className="space-y-3">
                                {isAffordable ? (
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span>Bisa dibeli sekarang</span>
                                  </div>
                                ) : isSoon ? (
                                  <div className="flex items-center gap-2 text-yellow-500 font-medium">
                                    <Clock className="h-5 w-5" />
                                    <span>
                                      Kurang Rp {isSoon.amountNeeded.toLocaleString('id-ID')} 
                                      (~{isSoon.estimatedWeeks} minggu)
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-red-600">
                                    <XCircle className="h-5 w-5" />
                                    <span>Belum bisa dibeli</span>
                                  </div>
                                )}

                                {scenario.warning && (
                                  <Alert variant="destructive" className="py-3">
                                    <AlertDescription className="!text-[rgb(239,68,68)] font-semibold">
                                      {scenario.warning}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {scenario.status !== 'insufficient' && (
                                  <div className="text-sm text-muted-foreground">
                                    Sisa saldo: Rp {scenario.balanceAfter.toLocaleString('id-ID')}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            {isAffordable && (
                              <Button 
                                onClick={() => handlePurchaseItem(item.id)}
                                className="w-full"
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Beli Sekarang
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
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
    </>
  );
}
