import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface BudgetOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
}

export function BudgetOverview({ totalIncome, totalExpenses, remainingBudget }: BudgetOverviewProps) {
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
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Pemasukan</p>
              <div className="size-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-2xl text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="h-px bg-border"></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Pengeluaran</p>
              <div className="size-2 rounded-full bg-red-500"></div>
            </div>
            <p className="text-2xl text-red-600">{formatCurrency(totalExpenses)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className={`relative overflow-hidden ${remainingBudget >= 0 ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/50' : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/50'}`}>
        <CardHeader>
          <CardTitle className="text-sm">Sisa Budget</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className={`text-4xl font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(remainingBudget)}
          </div>
          <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${remainingBudget >= 0 ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
            {remainingBudget >= 0 ? '✓ Aman' : '⚠ Defisit'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}