import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Trash2, DollarSign, Pencil, X, Check, RefreshCw, CalendarIcon, ChevronDown, Minus, Eye, EyeOff, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "./ui/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface AdditionalIncome {
  id: string;
  name: string;
  amount: number;
  currency: string;
  exchangeRate: number | null;
  amountIDR: number;
  conversionType: string;
  date: string;
  deduction: number;
}

interface AdditionalIncomeListProps {
  incomes: AdditionalIncome[];
  onDeleteIncome: (id: string) => void;
  onUpdateIncome: (id: string, income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
    deduction: number;
  }) => void;
  globalDeduction: number;
  onUpdateGlobalDeduction: (deduction: number) => void;
  onExcludedIdsChange?: (ids: Set<string>) => void;
  isDeductionExcluded?: boolean;
  onDeductionExcludedChange?: (excluded: boolean) => void;
  onMoveToExpense?: (income: AdditionalIncome) => void;
}

export function AdditionalIncomeList({ 
  incomes, 
  onDeleteIncome, 
  onUpdateIncome, 
  globalDeduction, 
  onUpdateGlobalDeduction, 
  onExcludedIdsChange,
  isDeductionExcluded = false,
  onDeductionExcludedChange,
  onMoveToExpense
}: AdditionalIncomeListProps) {
  const [editingIncome, setEditingIncome] = useState<AdditionalIncome | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState<"IDR" | "USD">("IDR");
  const [editConversionType, setEditConversionType] = useState<"auto" | "manual">("auto");
  const [editExchangeRate, setEditExchangeRate] = useState<number | null>(null);
  const [editManualRate, setEditManualRate] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDeduction, setEditDeduction] = useState("");
  const [loadingRate, setLoadingRate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [excludedIncomeIds, setExcludedIncomeIds] = useState<Set<string>>(new Set());

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const fetchExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const response = await fetch(`${baseUrl}/exchange-rate`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate");
      }

      const data = await response.json();
      setEditExchangeRate(data.rate);
      toast.success(`Kurs berhasil diperbarui: ${formatCurrency(data.rate)}`);
    } catch (error) {
      console.log(`Error fetching exchange rate: ${error}`);
      toast.error("Gagal memuat kurs. Silakan gunakan manual.");
      setEditConversionType("manual");
    } finally {
      setLoadingRate(false);
    }
  };

  const handleEdit = (income: AdditionalIncome) => {
    setEditingIncome(income);
    setEditName(income.name);
    setEditAmount(income.amount.toString());
    setEditCurrency(income.currency as "IDR" | "USD");
    setEditConversionType(income.conversionType as "auto" | "manual");
    setEditExchangeRate(income.exchangeRate);
    setEditManualRate(income.exchangeRate?.toString() || "");
    setEditDate(income.date || new Date().toISOString().split('T')[0]);
    setEditDeduction((income.deduction || 0).toString());
    setIsOpen(true);
  };

  const calculateIDR = () => {
    if (editCurrency === "IDR") {
      return Number(editAmount) || 0;
    }

    const rate = editConversionType === "auto" 
      ? editExchangeRate 
      : Number(editManualRate);

    return rate ? (Number(editAmount) || 0) * rate : 0;
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editAmount) {
      toast.error("Nama dan nominal harus diisi");
      return;
    }

    if (editCurrency === "USD" && editConversionType === "manual" && !editManualRate) {
      toast.error("Kurs manual harus diisi");
      return;
    }

    if (editCurrency === "USD" && editConversionType === "auto" && !editExchangeRate) {
      toast.error("Kurs belum dimuat. Silakan tunggu atau gunakan manual.");
      return;
    }

    const rate = editConversionType === "auto" 
      ? editExchangeRate 
      : (editCurrency === "USD" ? Number(editManualRate) : null);

    onUpdateIncome(editingIncome!.id, {
      name: editName.trim(),
      amount: Number(editAmount),
      currency: editCurrency,
      exchangeRate: rate,
      amountIDR: calculateIDR(),
      conversionType: editCurrency === "USD" ? editConversionType : "manual",
      date: editDate,
      deduction: Number(editDeduction) || 0,
    });

    setEditingIncome(null);
    setIsOpen(false);
  };

  // Toggle exclude income from calculation
  const handleToggleExclude = useCallback((id: string) => {
    const income = incomes.find(inc => inc.id === id);
    setExcludedIncomeIds(prev => {
      const newSet = new Set(prev);
      const wasExcluded = newSet.has(id);
      if (wasExcluded) {
        newSet.delete(id);
        if (income) {
          toast.success(`${income.name} dimasukkan kembali dalam hitungan`);
        }
      } else {
        newSet.add(id);
        if (income) {
          toast.info(`${income.name} dikecualikan dari hitungan`);
        }
      }
      // Notify parent about the change
      if (onExcludedIdsChange) {
        onExcludedIdsChange(newSet);
      }
      return newSet;
    });
  }, [onExcludedIdsChange, incomes]);

  const handleToggleExcludeAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapsible toggle
    if (incomes.length === 0) return;

    setExcludedIncomeIds(prev => {
      const allExcluded = prev.size === incomes.length;
      const newSet = new Set<string>();
      
      if (allExcluded) {
        // Include all items
        toast.success(`Semua pemasukan tambahan dimasukkan kembali dalam hitungan`);
        // Also include the global deduction
        if (onDeductionExcludedChange) {
          onDeductionExcludedChange(false);
        }
      } else {
        // Exclude all items
        incomes.forEach(income => newSet.add(income.id));
        toast.info(`Semua pemasukan tambahan dikecualikan dari hitungan`);
        // Also exclude the global deduction
        if (onDeductionExcludedChange) {
          onDeductionExcludedChange(true);
        }
      }
      
      // Notify parent about the change
      if (onExcludedIdsChange) {
        onExcludedIdsChange(newSet);
      }
      return newSet;
    });
  }, [incomes, onExcludedIdsChange, onDeductionExcludedChange]);

  // Calculate totals excluding excluded items and apply individual deductions
  const totalIncomeBeforeIndividualDeduction = incomes
    .filter(income => !excludedIncomeIds.has(income.id))
    .reduce((sum, income) => sum + income.amountIDR, 0);
  const totalIndividualDeduction = incomes
    .filter(income => !excludedIncomeIds.has(income.id))
    .reduce((sum, income) => sum + (income.deduction || 0), 0);
  const totalIncome = totalIncomeBeforeIndividualDeduction - totalIndividualDeduction;
  const appliedDeduction = isDeductionExcluded ? 0 : globalDeduction;
  const netIncome = totalIncome - appliedDeduction;
  
  // Count excluded items
  const excludedCount = excludedIncomeIds.size;

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Pemasukan Tambahan
                  <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  {excludedCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {excludedCount} excluded
                    </Badge>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {incomes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleToggleExcludeAll}
                      title={excludedIncomeIds.size === incomes.length ? "Tampilkan semua" : "Sembunyikan semua"}
                    >
                      {excludedIncomeIds.size === incomes.length ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Eye className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                  <span className="text-sm text-green-600">{formatCurrency(netIncome)}</span>
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {incomes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada pemasukan tambahan untuk bulan ini
                </p>
              ) : (
                <div className="space-y-2">
                  {incomes.map((income) => {
                    const isExcluded = excludedIncomeIds.has(income.id);
                    return (
                      <div
                        key={income.id}
                        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors ${isExcluded ? 'opacity-50 bg-muted/30' : ''}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={isExcluded ? 'line-through' : ''}>{income.name}</p>
                            <span className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                              {formatDate(income.date)}
                            </span>
                          </div>
                          {income.currency === "USD" && (
                            <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                              <DollarSign className="size-3" />
                              <span>
                                {formatUSD(income.amount)} × {formatCurrency(income.exchangeRate || 0)}
                                <span className="ml-1 text-xs">
                                  ({income.conversionType === "auto" ? "realtime" : "manual"})
                                </span>
                              </span>
                            </div>
                          )}
                          {income.deduction && income.deduction > 0 && (
                            <div className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                              <Minus className="size-3 inline" /> Potongan: {formatCurrency(income.deduction)} (Kotor: {formatCurrency(income.amountIDR)})
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-green-600 ${isExcluded ? 'line-through' : ''}`}>
                              {formatCurrency(income.deduction && income.deduction > 0 ? income.amountIDR - income.deduction : income.amountIDR)}
                            </p>
                            {income.deduction && income.deduction > 0 && (
                              <p className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                                Kotor: {formatCurrency(income.amountIDR)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleExclude(income.id)}
                            title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                          >
                            {isExcluded ? (
                              <EyeOff className="size-4 text-muted-foreground" />
                            ) : (
                              <Eye className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onMoveToExpense?.(income)}
                            title="Pindahkan ke pengeluaran"
                          >
                            <ArrowDown className="size-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(income)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteIncome(income.id)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {incomes.length > 0 && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Kotor</span>
                    <span>{formatCurrency(totalIncomeBeforeIndividualDeduction)}</span>
                  </div>
                  
                  {totalIndividualDeduction > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Minus className="size-3 text-red-600" />
                        Potongan Individual
                      </span>
                      <span className="text-red-600">-{formatCurrency(totalIndividualDeduction)}</span>
                    </div>
                  )}
                  
                  {totalIndividualDeduction > 0 && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(totalIncome)}</span>
                    </div>
                  )}
                  
                  <div className={`space-y-2 ${isDeductionExcluded ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="globalDeduction" className="text-sm flex items-center gap-2">
                        <Minus className="size-3 text-red-600" />
                        <span className={isDeductionExcluded ? 'line-through' : ''}>Potongan Global</span>
                        {isDeductionExcluded && (
                          <Badge variant="secondary" className="text-xs">
                            excluded
                          </Badge>
                        )}
                      </Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => {
                          const newValue = !isDeductionExcluded;
                          if (onDeductionExcludedChange) {
                            onDeductionExcludedChange(newValue);
                          }
                          toast.info(newValue ? "Potongan dikecualikan dari hitungan" : "Potongan dimasukkan dalam hitungan");
                        }}
                        title={isDeductionExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                      >
                        {isDeductionExcluded ? (
                          <EyeOff className="size-3 text-muted-foreground" />
                        ) : (
                          <Eye className="size-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <Input
                      id="globalDeduction"
                      type="number"
                      value={globalDeduction || ""}
                      onChange={(e) => onUpdateGlobalDeduction(Number(e.target.value) || 0)}
                      placeholder="0"
                      className={`text-sm ${isDeductionExcluded ? 'line-through' : ''}`}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span>Total Bersih</span>
                    <span className="text-green-600">{formatCurrency(netIncome)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Dialog open={!!editingIncome} onOpenChange={(open) => !open && setEditingIncome(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pemasukan Tambahan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nama Pemasukan</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Contoh: Fiverr, Freelance, Bonus, dll"
              />
            </div>

            <div className="space-y-2">
              <Label>Mata Uang</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editCurrency === "IDR" ? "default" : "outline"}
                  onClick={() => setEditCurrency("IDR")}
                  className="flex-1"
                >
                  IDR (Rupiah)
                </Button>
                <Button
                  type="button"
                  variant={editCurrency === "USD" ? "default" : "outline"}
                  onClick={() => setEditCurrency("USD")}
                  className="flex-1"
                >
                  USD (Dollar)
                </Button>
              </div>
            </div>

            {editCurrency === "USD" && (
              <div className="space-y-2">
                <Label>Metode Konversi</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={editConversionType === "auto" ? "default" : "outline"}
                    onClick={() => setEditConversionType("auto")}
                    className="flex-1"
                  >
                    Auto (Realtime)
                  </Button>
                  <Button
                    type="button"
                    variant={editConversionType === "manual" ? "default" : "outline"}
                    onClick={() => setEditConversionType("manual")}
                    className="flex-1"
                  >
                    Manual
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="editAmount">
                Nominal {editCurrency === "USD" ? "(USD)" : "(IDR)"}
              </Label>
              <Input
                id="editAmount"
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            {editCurrency === "USD" && (
              <>
                {editConversionType === "auto" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Kurs Realtime</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={fetchExchangeRate}
                        disabled={loadingRate}
                      >
                        <RefreshCw className={`size-4 ${loadingRate ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <Input
                      value={editExchangeRate ? formatCurrency(editExchangeRate) : "Memuat..."}
                      disabled
                    />
                  </div>
                )}

                {editConversionType === "manual" && (
                  <div className="space-y-2">
                    <Label htmlFor="editManualRate">Kurs Manual (1 USD = ... IDR)</Label>
                    <Input
                      id="editManualRate"
                      type="number"
                      value={editManualRate}
                      onChange={(e) => setEditManualRate(e.target.value)}
                      placeholder="Contoh: 15000"
                    />
                  </div>
                )}

                <div className="p-3 bg-accent rounded-md">
                  <p className="text-sm text-muted-foreground">Konversi ke IDR:</p>
                  <p className="text-green-600">{formatCurrency(calculateIDR())}</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="editDate">Tanggal Pemasukan</Label>
              <Popover>
                <PopoverTrigger>
                  <Input
                    id="editDate"
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    placeholder="Pilih tanggal..."
                    className={cn(
                      "w-full pl-3 pr-10 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    initialFocus
                    mode="single"
                    selected={editDate ? new Date(editDate) : undefined}
                    onSelect={(date) => setEditDate(date ? format(date, "yyyy-MM-dd") : "")}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    className="p-2"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDeduction">Potongan Individual (Optional)</Label>
              <Input
                id="editDeduction"
                type="number"
                value={editDeduction}
                onChange={(e) => setEditDeduction(e.target.value)}
                placeholder="0"
              />
              {editDeduction && Number(editDeduction) > 0 && (
                <div className="p-2 bg-accent rounded-md space-y-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Nilai Bersih (Net):</p>
                    <p className="text-green-600">{formatCurrency(calculateIDR() - (Number(editDeduction) || 0))}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Kotor: {formatCurrency(calculateIDR())}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIncome(null)}>
              <X className="size-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>
              <Check className="size-4 mr-2" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}