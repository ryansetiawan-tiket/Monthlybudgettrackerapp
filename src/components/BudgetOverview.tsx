import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface BudgetOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  showPockets?: boolean;
  onTogglePockets?: () => void;
}

export function BudgetOverview({ totalIncome, totalExpenses, remainingBudget, showPockets = true, onTogglePockets }: BudgetOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Pemasukan</p>
              <div className="size-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-2xl text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="h-px bg-border"></div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Pengeluaran</p>
              <div className="size-2 rounded-full bg-red-500"></div>
            </div>
            <p className="text-2xl text-red-600">{formatCurrency(totalExpenses)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className={`relative overflow-hidden ${remainingBudget >= 0 ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/50' : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Sisa Budget</CardTitle>
            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`size-7 hover:bg-background/50 ${showPockets ? 'bg-background/30' : ''}`}
                      onClick={() => onTogglePockets?.()}
                    >
                      <Wallet className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showPockets ? 'Sembunyikan' : 'Tampilkan'} Ringkasan Kantong</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-4xl font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(remainingBudget)}
          </div>
          <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${remainingBudget >= 0 ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
            {remainingBudget >= 0 ? '✓ Aman' : '⚠ Defisit'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}