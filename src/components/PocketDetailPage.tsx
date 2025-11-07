import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { ChevronLeft, TrendingUp, TrendingDown, ArrowRightLeft, Plus, Wallet, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDialogRegistration } from "../hooks/useDialogRegistration";
import { useEffect } from "react";

interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
}

interface PocketDetailPageProps {
  open: boolean;
  onClose: () => void;
  pocketName: string;
  pocketIcon?: string;
  pocketColor?: string;
  pocketType?: 'primary' | 'custom';
  pocketId?: string;
  balance?: PocketBalance;
  realtimeBalance?: number | null;
  isRealtimeMode?: boolean;
  onToggleRealtime?: () => void;
  onTransfer?: () => void;
  onAddFunds?: () => void;
  enableWishlist?: boolean;
  onToggleWishlist?: () => void;
  onOpenWishlist?: () => void;
}

export function PocketDetailPage({
  open,
  onClose,
  pocketName,
  pocketIcon,
  pocketColor,
  pocketType,
  pocketId,
  balance,
  realtimeBalance,
  isRealtimeMode = false,
  onToggleRealtime,
  onTransfer,
  onAddFunds,
  enableWishlist,
  onToggleWishlist,
  onOpenWishlist,
  onShowInfo,
  onEditPocket,
  onSetBudget,
  onDeletePocket
}: PocketDetailPageProps) {
  // Register this page with dialog stack for back button handling
  useDialogRegistration({
    isOpen: open,
    onClose: onClose,
    priority: 150, // Higher than drawer (100) so it closes first
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayBalance = isRealtimeMode && realtimeBalance !== null && realtimeBalance !== undefined
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
            onClick={onClose}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h1 className="text-xl flex-1">Info Kantong</h1>
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
                backgroundColor: pocketColor ? `${pocketColor}1a` : 'rgba(59, 130, 246, 0.1)',
                borderColor: pocketColor ? `${pocketColor}40` : 'rgba(59, 130, 246, 0.25)'
              }}
            >
              {pocketIcon || '💰'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg">{pocketName}</h2>
              <Badge variant="secondary" className="mt-1">
                {pocketType === 'primary' ? 'Kantong Utama' : 'Kantong Custom'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Realtime Toggle */}
          {onToggleRealtime && (
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
                checked={isRealtimeMode}
                onCheckedChange={onToggleRealtime}
              />
            </div>
          )}

          {/* Balance Info - Sama seperti Desktop */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">
                {isRealtimeMode ? 'Saldo Hari Ini' : 'Saldo Proyeksi'}
              </p>
              <p className={`text-3xl ${displayBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(displayBalance)}
              </p>
            </div>
            {isRealtimeMode && (
              <p className="text-xs text-muted-foreground text-right">
                Sampai {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          <Separator />

          {/* Breakdown - Sama seperti Desktop */}
          {balance && (
            <div className="space-y-3">
              <h3 className="text-sm text-muted-foreground">Breakdown</h3>
              
              <div className="space-y-2 text-sm">
                {/* Saldo Asli - Only for primary pockets */}
                {pocketType === 'primary' && (
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

          {/* Wishlist Settings */}
          {onToggleWishlist && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-pink-500/10 flex items-center justify-center text-base">
                    💖
                  </div>
                  <Label htmlFor="wishlist-mode" className="cursor-pointer">
                    Simulasi Wishlist
                  </Label>
                </div>
                <Switch
                  id="wishlist-mode"
                  checked={enableWishlist || false}
                  onCheckedChange={onToggleWishlist}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
