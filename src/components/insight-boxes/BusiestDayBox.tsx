/**
 * 📌 Busiest Day Box Component
 * 
 * The "Reflective" static insight box
 * Shows the day with highest spending
 * Button to view detailed transactions for that day
 * 
 * Platform-aware: Desktop (full) vs Mobile (compact)
 * 
 * Created: 2025-11-09
 * Part of: Hybrid Insight Boxes v3 feature
 */

import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { BusiestDayData } from '../../utils/insightEngine';

interface BusiestDayBoxProps {
  data: BusiestDayData;
  onShowDetail: () => void;
  compact?: boolean; // Mobile mode
}

export const BusiestDayBox = memo(function BusiestDayBox({
  data,
  onShowDetail,
  compact = false,
}: BusiestDayBoxProps) {
  if (compact) {
    // Mobile (Drawer) styling
    return (
      <div className="mx-4 mb-3 p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-xl flex-shrink-0" aria-hidden="true">
            💸
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-0.5">
              Hari Paling Boros
            </p>
            <p className="text-xs font-medium text-foreground">
              {data.dayName}
            </p>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(data.total)}
            </p>
            <button
              onClick={onShowDetail}
              className="mt-1.5 text-[10px] text-red-600 font-medium flex items-center gap-0.5 active:scale-95 transition-transform"
              aria-label={`Lihat detail transaksi ${data.dayName}`}
            >
              Lihat Detail
              <ChevronRight className="size-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop (Modal) styling
  return (
    <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          💸
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            Hari Paling Boros Anda
          </p>
          <p className="text-sm font-medium text-foreground">
            {data.dayName}
          </p>
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(data.total)}
          </p>
          <button
            onClick={onShowDetail}
            className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            aria-label={`Lihat detail transaksi ${data.dayName}`}
          >
            Lihat Detail Transaksi
            <ChevronRight className="size-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
});
