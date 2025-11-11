import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { formatCurrency } from "../utils/currency";

interface BudgetOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  showPockets?: boolean;
  onTogglePockets?: () => void;
  // Breakdown data for income popover
  initialBudget?: number;
  additionalIncome?: number;
  globalDeduction?: number;
  // 🏗️ ARCHITECTURE FIX: New props for carry-over breakdown
  carryOverAssets?: number;
  currentMonthExpenses?: number;
  carryOverLiabilities?: number;
}

export const BudgetOverview = memo(function BudgetOverview({ 
  totalIncome, 
  totalExpenses, 
  remainingBudget, 
  showPockets = true, 
  onTogglePockets,
  initialBudget = 0,
  additionalIncome = 0,
  globalDeduction = 0,
  carryOverAssets = 0,
  currentMonthExpenses = 0,
  carryOverLiabilities = 0
}: BudgetOverviewProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium leading-none">Total Pemasukan</p>
                {/* ✨ Info icon with breakdown popover (click-based) */}
                {initialBudget > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                        style={{ padding: '0px', margin: '0px' }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Lihat breakdown pemasukan"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-[260px] p-3">
                      <div className="space-y-1.5 text-xs">
                        <div className="font-semibold mb-2 text-foreground">Breakdown Pemasukan:</div>
                        {initialBudget > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground">Budget Awal:</span>
                            <span className="text-green-600 font-medium">+{formatCurrency(initialBudget)}</span>
                          </div>
                        )}
                        {additionalIncome > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground">Pemasukan Tambahan:</span>
                            <span className="text-green-600 font-medium">+{formatCurrency(additionalIncome)}</span>
                          </div>
                        )}
                        {/* 🏗️ ARCHITECTURE FIX: NEW - Carry-Over Aset */}
                        {carryOverAssets > 0 && (
                          <div className="flex justify-between gap-2">
                            <span className="text-muted-foreground">
                              Carry-Over Aset (Sisa Kantong<sup>+</sup>):
                            </span>
                            <span className="text-green-600 font-medium">+{formatCurrency(carryOverAssets)}</span>
                          </div>
                        )}
                        {globalDeduction > 0 && (
                          <>
                            <div className="h-px bg-border my-1.5"></div>
                            <div className="flex justify-between gap-2">
                              <span className="text-muted-foreground">Potongan Global:</span>
                              <span className="text-red-600 font-medium">-{formatCurrency(globalDeduction)}</span>
                            </div>
                          </>
                        )}
                        <div className="h-px bg-border my-1.5"></div>
                        <div className="flex justify-between gap-2 font-semibold">
                          <span className="text-foreground">Total Bersih:</span>
                          <span className="text-green-600">+{formatCurrency(totalIncome)}</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="size-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-2xl text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="h-px bg-border"></div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium leading-none">Total Pengeluaran</p>
                {/* 🏗️ ARCHITECTURE FIX: NEW - Info icon for Total Pengeluaran */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                      style={{ padding: '0px', margin: '0px' }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Lihat breakdown pengeluaran"
                    >
                      <Info className="size-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-[280px] p-3">
                    <div className="space-y-1.5 text-xs">
                      <div className="font-semibold mb-2 text-foreground">Breakdown Pengeluaran:</div>
                      {/* Pengeluaran Bulan Ini */}
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Pengeluaran Bulan Ini:</span>
                        <span className="text-red-600 font-medium">-{formatCurrency(currentMonthExpenses)}</span>
                      </div>
                      {/* 🏗️ ARCHITECTURE FIX: NEW - Carry-Over Kewajiban (Utang) */}
                      {carryOverLiabilities > 0 && (
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">
                            Carry-Over Kewajiban (Utang Kantong<sup>-</sup>):
                          </span>
                          <span className="text-red-600 font-medium">-{formatCurrency(carryOverLiabilities)}</span>
                        </div>
                      )}
                      <div className="h-px bg-border my-1.5"></div>
                      <div className="flex justify-between gap-2 font-semibold">
                        <span className="text-foreground">Total Pengeluaran:</span>
                        <span className="text-red-600">-{formatCurrency(totalExpenses)}</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="size-2 rounded-full bg-red-500"></div>
            </div>
            <p className="text-2xl text-red-600">{formatCurrency(totalExpenses)}</p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${remainingBudget >= 0 ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/50 hover:border-green-500/70' : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/50 hover:border-red-500/70'}`}
        onClick={() => onTogglePockets?.()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Sisa Budget</CardTitle>
            <div className="flex items-center gap-1">
              {showPockets ? (
                <ChevronUp className="size-5 text-muted-foreground transition-transform duration-300" />
              ) : (
                <ChevronDown className="size-5 text-muted-foreground transition-transform duration-300" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 m-[0px]">
          <div className={`mt-[-30px] md:mt-0 text-4xl font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(remainingBudget)}
          </div>
          <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${remainingBudget >= 0 ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
            {remainingBudget >= 0 ? '✓ Aman' : '⚠ Defisit'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
