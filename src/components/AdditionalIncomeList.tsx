import { useState, useCallback, memo } from "react";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Trash2, DollarSign, Pencil, X, Minus, Eye, EyeOff, ArrowLeft, ArrowUpDown, Lock, Unlock, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner@2.0.3";
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "../utils/currency";
import { useIsMobile } from "./ui/use-mobile";
import { AdditionalIncomeForm } from "./AdditionalIncomeForm";
import { useConfirm } from "../hooks/useConfirm";

// Default pocket IDs
const POCKET_IDS = {
  DAILY: 'pocket_daily',
  COLD_MONEY: 'pocket_cold_money'
} as const;

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
  pocketId?: string;
  createdAt?: string;
}

interface Pocket {
  id: string;
  name: string;
  icon?: string;
  color?: string;
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
    pocketId: string;
  }) => void;
  globalDeduction: number;
  onUpdateGlobalDeduction: (deduction: number) => void;
  excludedIncomeIds?: Set<string>;
  onExcludedIdsChange?: (ids: Set<string>) => void;
  isDeductionExcluded?: boolean;
  onDeductionExcludedChange?: (excluded: boolean) => void;
  isExcludeLocked?: boolean;
  onToggleExcludeLock?: () => void;
  pockets?: Pocket[]; // NEW: For edit pocket selection
}

function AdditionalIncomeListComponent({ 
  incomes, 
  onDeleteIncome, 
  onUpdateIncome, 
  globalDeduction, 
  onUpdateGlobalDeduction, 
  excludedIncomeIds: excludedIncomeIdsProp,
  onExcludedIdsChange,
  isDeductionExcluded = false,
  onDeductionExcludedChange,
  isExcludeLocked = false,
  onToggleExcludeLock,
  pockets = []
}: AdditionalIncomeListProps) {
  const isMobile = useIsMobile();
  const confirm = useConfirm();
  const [editingIncome, setEditingIncome] = useState<AdditionalIncome | null>(null);
  
  // Exclude from calculation states - use prop or default to empty Set
  const excludedIncomeIds = excludedIncomeIdsProp || new Set<string>();
  
  const [sortBy, setSortBy] = useState<'date' | 'createdAt'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Bulk selection states
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<Set<string>>(new Set());

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

  const handleEdit = (income: AdditionalIncome) => {
    setEditingIncome(income);
  };

  // Bulk selection handlers
  const handleActivateBulkMode = () => {
    setIsBulkSelectMode(true);
    setSelectedIncomeIds(new Set());
  };

  const handleCancelBulkMode = () => {
    setIsBulkSelectMode(false);
    setSelectedIncomeIds(new Set());
  };

  const handleToggleSelectIncome = (id: string) => {
    setSelectedIncomeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIncomeIds.size === incomes.length) {
      setSelectedIncomeIds(new Set());
    } else {
      setSelectedIncomeIds(new Set(incomes.map(inc => inc.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIncomeIds.size === 0) return;

    const confirmed = await confirm({
      title: "Hapus Pemasukan Terpilih?",
      description: `Anda yakin ingin menghapus ${selectedIncomeIds.size} pemasukan yang dipilih? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus",
      cancelText: "Batal"
    });

    if (confirmed) {
      selectedIncomeIds.forEach(id => {
        onDeleteIncome(id);
      });
      toast.success(`${selectedIncomeIds.size} pemasukan berhasil dihapus`);
      setIsBulkSelectMode(false);
      setSelectedIncomeIds(new Set());
    }
  };

  const isAllSelected = incomes.length > 0 && selectedIncomeIds.size === incomes.length;

  // Toggle exclude income from calculation
  const handleToggleExclude = useCallback((id: string) => {
    const income = incomes.find(inc => inc.id === id);
    const wasExcluded = excludedIncomeIds.has(id);
    const newSet = new Set(excludedIncomeIds);
    
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
  }, [excludedIncomeIds, onExcludedIdsChange, incomes]);

  const handleToggleExcludeAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapsible toggle
    if (incomes.length === 0) return;

    const allExcluded = excludedIncomeIds.size === incomes.length;
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
  }, [incomes, excludedIncomeIds, onExcludedIdsChange, onDeductionExcludedChange]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Toggle sort type
  const toggleSortBy = () => {
    setSortBy(prev => prev === 'date' ? 'createdAt' : 'date');
  };

  // Sort incomes
  const sortedIncomes = [...incomes].sort((a, b) => {
    let compareValue = 0;
    
    if (sortBy === 'date') {
      const dateA = new Date(a.date || '');
      const dateB = new Date(b.date || '');
      compareValue = dateA.getTime() - dateB.getTime();
    } else {
      // Sort by createdAt (entry creation time)
      // If createdAt is not available, fallback to id (which might contain timestamp)
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : parseInt(a.id) || 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : parseInt(b.id) || 0;
      compareValue = timeA - timeB;
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col gap-2">
            {!isBulkSelectMode ? (
              // Normal Mode
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-base sm:text-lg">
                    Pemasukan Tambahan
                    {excludedCount > 0 && (
                      <Badge variant="secondary" className="text-xs h-6 px-1.5">
                        {excludedCount} excluded
                      </Badge>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {incomes.length > 0 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-11 px-3 bg-[rgba(38,38,38,0.3)] border-[0.5px] border-neutral-800 rounded-lg hover:bg-[rgba(38,38,38,0.5)] transition-colors text-xs"
                          onClick={handleActivateBulkMode}
                        >
                          Pilih
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={toggleSortBy}
                          title={sortBy === 'date' ? 'Urutkan berdasarkan: Tanggal Masuk' : 'Urutkan berdasarkan: Tanggal Entry'}
                        >
                          <Badge variant="outline" className="text-xs px-1 h-6 px-[4px] py-[2px] m-[0px]">
                            {sortBy === 'date' ? 'Masuk' : 'Entry'}
                          </Badge>
                        </Button>
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
                      </>
                    )}
                    {onToggleExcludeLock && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          isExcludeLocked 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => onToggleExcludeLock()}
                        title={isExcludeLocked ? "Unlock - perubahan tidak akan tersimpan" : "Lock - simpan state exclude saat refresh"}
                      >
                        {isExcludeLocked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                      </Button>
                    )}
                    <span className="text-sm font-normal text-green-600 whitespace-nowrap">{formatCurrency(netIncome)}</span>
                  </div>
                </div>
              </>
            ) : (
              // Bulk Select Mode
              <>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm">
                    {selectedIncomeIds.size > 0
                      ? `${selectedIncomeIds.size} dipilih`
                      : "Pilih semua"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={selectedIncomeIds.size === 0}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Hapus ({selectedIncomeIds.size})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelBulkMode}
                  >
                    Batal
                  </Button>
                </div>
              </>
            )}
          </CardTitle>
        </CardHeader>
            <CardContent className="space-y-3">
              {incomes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada pemasukan tambahan untuk bulan ini
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedIncomes.map((income) => {
                    const isExcluded = excludedIncomeIds.has(income.id);
                    const isSelected = selectedIncomeIds.has(income.id);
                    return (
                      <div
                        key={income.id}
                        className={`flex items-start gap-2 p-3 border rounded-lg transition-all ${
                          isExcluded ? 'opacity-50 bg-muted/30' : ''
                        } ${
                          isBulkSelectMode 
                            ? 'cursor-pointer hover:bg-accent/50' 
                            : 'hover:bg-accent/50 hover:scale-[1.005]'
                        } ${
                          isSelected ? 'bg-accent border-primary' : ''
                        }`}
                        onClick={() => isBulkSelectMode && handleToggleSelectIncome(income.id)}
                      >
                        {isBulkSelectMode && (
                          <div className="pt-0.5">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleSelectIncome(income.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`${isExcluded ? 'line-through' : ''} truncate`}>{income.name}</p>
                              <span className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''} whitespace-nowrap`}>
                                {formatDate(income.date)}
                              </span>
                            </div>
                            {income.currency === "USD" && (
                              <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                                <DollarSign className="size-3" />
                                <span className="text-xs">
                                  {formatUSD(income.amount)} × {formatCurrency(income.exchangeRate || 0)}
                                  <span className="ml-1">
                                    ({income.conversionType === "auto" ? "realtime" : "manual"})
                                  </span>
                                </span>
                              </div>
                            )}
                            {income.deduction > 0 && (
                              <div className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''}`}>
                                <Minus className="size-3 inline" /> Potongan: {formatCurrency(income.deduction)} (Kotor: {formatCurrency(income.amountIDR)})
                              </div>
                            )}
                          </div>
                          {!isBulkSelectMode && (
                            <div className="flex items-center justify-between sm:justify-end gap-1">
                              <div className="text-right">
                                <p className={`text-sm sm:text-base text-green-600 ${isExcluded ? 'line-through' : ''} whitespace-nowrap`}>
                                  {formatCurrency(income.deduction > 0 ? income.amountIDR - income.deduction : income.amountIDR)}
                                </p>
                                {income.deduction > 0 && (
                                  <p className={`text-xs text-muted-foreground ${isExcluded ? 'line-through' : ''} whitespace-nowrap`}>
                                    Kotor: {formatCurrency(income.amountIDR)}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleExclude(income.id);
                                  }}
                                  title={isExcluded ? "Masukkan dalam hitungan" : "Exclude dari hitungan"}
                                >
                                  {isExcluded ? (
                                    <EyeOff className="size-3.5 text-muted-foreground" />
                                  ) : (
                                    <Eye className="size-3.5 text-muted-foreground" />
                                  )}
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                      title="More"
                                    >
                                      <MoreVertical className="size-3.5 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(income)}>
                                      <Pencil className="size-3.5 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => onDeleteIncome(income.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="size-3.5 mr-2" />
                                      Hapus
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}
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
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyInput(globalDeduction || "")}
                      onChange={(e) => onUpdateGlobalDeduction(parseCurrencyInput(e.target.value))}
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
        </Card>

      {/* Edit Dialog/Drawer - Using AdditionalIncomeForm */}
      {editingIncome && (
        isMobile ? (
          <Drawer open={true} onOpenChange={(open) => !open && setEditingIncome(null)} dismissible={true}>
            <DrawerContent className="max-h-[90vh] flex flex-col">
              <DrawerHeader className="text-left border-b">
                <DrawerTitle>Edit Pemasukan Tambahan</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <AdditionalIncomeForm
                  editMode={true}
                  initialValues={{
                    name: editingIncome.name,
                    amount: editingIncome.amount,
                    currency: editingIncome.currency,
                    exchangeRate: editingIncome.exchangeRate || null,
                    conversionType: editingIncome.conversionType || 'auto',
                    date: editingIncome.date,
                    deduction: editingIncome.deduction || 0,
                    pocketId: editingIncome.pocketId || POCKET_IDS.COLD_MONEY,
                    amountIDR: editingIncome.amountIDR || editingIncome.amount,
                  }}
                  onUpdateIncome={(incomeData) => {
                    onUpdateIncome(editingIncome.id, incomeData);
                    setEditingIncome(null);
                    toast.success("Pemasukan berhasil diupdate");
                  }}
                  pockets={pockets}
                  hideTargetPocket={false}
                  submitButtonText="Simpan"
                  inDialog={true}
                />
              </div>
              <div className="px-4 py-4 border-t bg-background flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingIncome(null)}>
                  <X className="size-4 mr-2" />
                  Batal
                </Button>
              </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={true} onOpenChange={(open) => !open && setEditingIncome(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Edit Pemasukan Tambahan</DialogTitle>
            </DialogHeader>
            <AdditionalIncomeForm
              editMode={true}
              initialValues={{
                name: editingIncome.name,
                amount: editingIncome.amount,
                currency: editingIncome.currency,
                exchangeRate: editingIncome.exchangeRate || null,
                conversionType: editingIncome.conversionType || 'auto',
                date: editingIncome.date,
                deduction: editingIncome.deduction || 0,
                pocketId: editingIncome.pocketId || POCKET_IDS.COLD_MONEY,
                amountIDR: editingIncome.amountIDR || editingIncome.amount,
              }}
              onUpdateIncome={(incomeData) => {
                onUpdateIncome(editingIncome.id, incomeData);
                setEditingIncome(null);
                toast.success("Pemasukan berhasil diupdate");
              }}
              pockets={pockets}
              hideTargetPocket={false}
              submitButtonText="Simpan"
              inDialog={true}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingIncome(null)}>
                <X className="size-4 mr-2" />
                Batal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}

// Export memoized component for performance
export const AdditionalIncomeList = memo(AdditionalIncomeListComponent);