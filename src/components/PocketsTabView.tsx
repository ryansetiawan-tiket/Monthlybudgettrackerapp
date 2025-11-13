import { motion } from 'motion/react';
import { cn } from './ui/utils';
import { formatCurrency } from '../utils/currency';
import { Clock, CalendarRange, Heart } from 'lucide-react';

interface Pocket {
  id: string;
  name: string;
  type: 'primary' | 'custom';
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  enableWishlist?: boolean;  // ✅ Add wishlist flag
}

interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
  realtimeBalance?: number;
  projectedBalance?: number;
}

interface PocketsTabViewProps {
  pockets: Pocket[];
  balances: Map<string, PocketBalance>;
  onPocketClick: (pocketId: string) => void;
  onWishlistClick?: (pocketId: string) => void;  // ✅ NEW: Callback untuk wishlist click
  selectedYear: number;
  selectedMonth: number;
  isRealtimeMode?: boolean;
}

export function PocketsTabView({
  pockets,
  balances,
  onPocketClick,
  onWishlistClick,
  selectedYear,
  selectedMonth,
  isRealtimeMode = false,
}: PocketsTabViewProps) {
  // Sort pockets by order
  const sortedPockets = [...pockets].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-background pb-[80px] pt-[36px] pr-[0px] pl-[0px]">
      {/* Header */}
      <div className="px-4 mb-6">
        <h1 className="text-foreground">Kantong</h1>
        <p className="text-muted-foreground mt-1">
          Kelola semua kantong budget Anda
        </p>
      </div>

      {/* Grid 2 Column */}
      <div className="px-4 grid grid-cols-2 gap-3 px-[16px] py-[0px]">
        {sortedPockets.map((pocket, index) => {
          const balanceData = balances.get(pocket.id);
          
          // Use realtime or projected balance based on mode
          const balance = isRealtimeMode 
            ? (balanceData?.realtimeBalance ?? balanceData?.availableBalance ?? 0)
            : (balanceData?.projectedBalance ?? balanceData?.availableBalance ?? 0);
          const isPositive = balance >= 0;
          
          return (
            <motion.div
              key={pocket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onPocketClick(pocket.id)}
              className={cn(
                "relative overflow-hidden",
                "bg-card rounded-xl",
                "p-4",
                "border border-border",
                "shadow-sm hover:shadow-md",
                "transition-all duration-200",
                "active:scale-95",
                "text-left",
                "min-h-[140px]",
                "flex flex-col justify-between",
                "cursor-pointer"  // ✅ Add cursor pointer since it's now a div
              )}
            >
              {/* Wishlist Heart Icon - Top Right */}
              {pocket.enableWishlist && onWishlistClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();  // Prevent card onClick
                    onWishlistClick(pocket.id);
                  }}
                  className={cn(
                    "absolute top-2 right-2 z-10",
                    "size-8 rounded-full",
                    "bg-pink-500/10 hover:bg-pink-500/20",
                    "flex items-center justify-center",
                    "transition-all duration-200",
                    "active:scale-90"
                  )}
                >
                  <Heart className="size-4 text-pink-600 dark:text-pink-500 fill-pink-600 dark:fill-pink-500" />
                </button>
              )}

              {/* Icon & Name */}
              <div>
                <div className="text-3xl mb-2">
                  {pocket.icon || '💰'}
                </div>
                <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                  {pocket.name}
                </h3>
              </div>

              {/* Balance */}
              <div className="mt-auto">
                <div className={cn(
                  "text-lg font-bold",
                  isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                )}>
                  {formatCurrency(Math.abs(balance))}
                </div>
                
                {/* Balance Type Indicator - Realtime vs Projected */}
                <div className="flex items-center gap-1 mt-1">
                  {isRealtimeMode ? (
                    <>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Saldo Hari Ini</span>
                    </>
                  ) : (
                    <>
                      <CalendarRange className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Saldo Proyeksi</span>
                    </>
                  )}
                </div>
              </div>

              {/* Subtle gradient background based on balance */}
              <div
                className={cn(
                  "absolute inset-0 opacity-5 pointer-events-none",
                  isPositive ? "bg-gradient-to-br from-green-500 to-transparent" : "bg-gradient-to-br from-red-500 to-transparent"
                )}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedPockets.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="text-5xl mb-4">💰</div>
          <p className="text-muted-foreground">Belum ada kantong</p>
          <p className="text-sm text-muted-foreground mt-1">
            Buat kantong baru untuk mengatur budget Anda
          </p>
        </div>
      )}
    </div>
  );
}