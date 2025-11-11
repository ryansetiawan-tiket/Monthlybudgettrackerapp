import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Plus, RefreshCw, CalendarIcon } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "./ui/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getBaseUrl, createAuthHeaders } from "../utils/api";
import { formatCurrencyInput, parseCurrencyInput, formatCurrency } from "../utils/currency";
import { InsufficientBalanceDialog } from "./InsufficientBalanceDialog";
import { getLocalDateFromISO } from "../utils/date-helpers";

interface Pocket {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface IncomeData {
  name: string;
  amount: number;
  currency: string;
  exchangeRate: number | null;
  amountIDR: number;
  conversionType: string;
  date: string;
  deduction: number;
  pocketId: string;
}

interface AdditionalIncomeFormProps {
  onAddIncome?: (income: IncomeData) => void;
  onUpdateIncome?: (income: IncomeData) => void;
  isAdding?: boolean;
  onSuccess?: () => void;
  inDialog?: boolean;
  pockets?: Pocket[];
  balances?: Map<string, {availableBalance: number}>;
  defaultTargetPocket?: string;
  // Edit mode props
  editMode?: boolean;
  initialValues?: Partial<IncomeData> & {
    name?: string;
    amount?: number;
    currency?: string;
    date?: string;
  };
  hideTargetPocket?: boolean; // For main income which can't change pocket
  submitButtonText?: string;
}

export function AdditionalIncomeForm({
  onAddIncome,
  onUpdateIncome,
  isAdding = false,
  onSuccess,
  inDialog = false,
  pockets = [],
  balances,
  defaultTargetPocket,
  editMode = false,
  initialValues,
  hideTargetPocket = false,
  submitButtonText,
}: AdditionalIncomeFormProps) {
  // Get local date (not UTC) for default value
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ✅ DEPRECATED: Use imported getLocalDateFromISO() instead!
  // Convert ISO date to YYYY-MM-DD format (timezone-safe)
  const convertISOToDateString = (isoDate: string) => {
    // ✅ FIX: Use utility function for consistent timezone handling
    return getLocalDateFromISO(isoDate);
  };
  
  const [name, setName] = useState(initialValues?.name || "");
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || "");
  const [currency, setCurrency] = useState<"IDR" | "USD">((initialValues?.currency as "IDR" | "USD") || "IDR");
  const [conversionType, setConversionType] = useState<"auto" | "manual">((initialValues?.conversionType as "auto" | "manual") || "manual");
  const [exchangeRate, setExchangeRate] = useState<number | null>(initialValues?.exchangeRate || null);
  const [manualRate, setManualRate] = useState(initialValues?.exchangeRate?.toString() || "");
  const [loadingRate, setLoadingRate] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [date, setDate] = useState(
    initialValues?.date 
      ? convertISOToDateString(initialValues.date)
      : getLocalDateString()
  );
  const [deduction, setDeduction] = useState(initialValues?.deduction?.toString() || "");
  const [targetPocketId, setTargetPocketId] = useState(initialValues?.pocketId || "");

  // USD amount with decimal & math operations support
  const [amountExpression, setAmountExpression] = useState(initialValues?.amount?.toString() || "");
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);

  // Balance validation state (for deduction validation)
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);
  
  // Reactive validation dialog state
  const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
  const [insufficientDetails, setInsufficientDetails] = useState<{
    pocketName: string;
    availableBalance: number;
    attemptedAmount: number;
  } | null>(null);

  const baseUrl = getBaseUrl(projectId);

  /**
   * Math expression evaluator - supports decimal and operations
   * Examples: "1234.56", "100+50", "1000-10%", "500*2"
   */
  const evaluateExpression = (expression: string): number | null => {
    try {
      // Remove spaces and validate
      const cleaned = expression.replace(/\s/g, '');
      if (!cleaned) return null;
      
      // Only allow numbers, operators, decimal point, and parentheses
      if (!/^[0-9+\-*/.()%]+$/.test(cleaned)) {
        return null;
      }

      // Handle percentage calculations
      let processed = cleaned;
      
      // Match pattern: number followed by operator followed by number followed by %
      const percentPattern = /([0-9.]+)([\+\-\*\/])([0-9.]+)%/g;
      processed = processed.replace(percentPattern, (match, base, operator, percent) => {
        return `${base}${operator}(${base}*${percent}/100)`;
      });
      
      // Match pattern: just number followed by %
      const simplePercentPattern = /([0-9.]+)%/g;
      processed = processed.replace(simplePercentPattern, (match, num) => {
        return `(${num}/100)`;
      });

      // Safely evaluate using Function constructor
      const result = new Function('return ' + processed)();
      
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        // For USD, keep 2 decimal places
        return currency === 'USD' ? Math.round(result * 100) / 100 : Math.round(result);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Update calculation when amount expression changes
  useEffect(() => {
    const result = evaluateExpression(amountExpression);
    setCalculatedAmount(result);
    // Sync with old amount state for backward compatibility
    if (result !== null) {
      setAmount(result.toString());
    } else {
      setAmount(amountExpression);
    }
  }, [amountExpression, currency]);

  // Set default target pocket when prop changes
  useEffect(() => {
    if (defaultTargetPocket) {
      setTargetPocketId(defaultTargetPocket);
    } else if (pockets.length > 0) {
      // Default to first pocket if no default specified
      setTargetPocketId(pockets[0].id);
    }
  }, [defaultTargetPocket, pockets]);

  useEffect(() => {
    loadNameSuggestions();
  }, []);

  useEffect(() => {
    if (currency === "USD" && conversionType === "auto") {
      fetchExchangeRate();
    }
  }, [currency, conversionType]);

  const loadNameSuggestions = async () => {
    try {
      const response = await fetch(`${baseUrl}/income-names`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      // Error loading suggestions - silently fail
    }
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
      setExchangeRate(data.rate);
      toast.success(`Kurs berhasil diperbarui: ${formatCurrency(data.rate)}`);
    } catch (error) {
      toast.error("Gagal memuat kurs. Silakan gunakan manual.");
      setConversionType("manual");
    } finally {
      setLoadingRate(false);
    }
  };

  /**
   * Validates if deduction amount exceeds target pocket balance
   * Shows inline error and disables submit if insufficient
   */
  const validateDeductionBalance = useCallback((
    deduction: number,
    targetPocketId: string
  ) => {
    // Skip validation if no deduction or no target pocket
    if (!targetPocketId || !deduction || deduction <= 0) {
      setBalanceError(null);
      setIsInsufficientBalance(false);
      return true;
    }

    // Skip if balances not loaded yet
    if (!balances) {
      setBalanceError(null);
      setIsInsufficientBalance(false);
      return true;
    }

    // Get target pocket balance
    const pocket = balances.get(targetPocketId);
    if (!pocket) {
      setBalanceError(null);
      setIsInsufficientBalance(false);
      return true;
    }

    const available = pocket.availableBalance;
    
    // Check if deduction exceeds available balance
    if (deduction > available) {
      const pocketName = pockets.find(p => p.id === targetPocketId)?.name || 'kantong ini';
      setBalanceError(
        `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
        `nggak cukup buat potong ${formatCurrency(deduction)}.`
      );
      setIsInsufficientBalance(true);
      return false;
    }

    // All good!
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }, [balances, pockets]);

  // Validate when deduction changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const deductionAmount = Number(deduction) || 0;
      validateDeductionBalance(deductionAmount, targetPocketId);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [deduction, targetPocketId, validateDeductionBalance]);

  // Validate when target pocket changes (immediate)
  useEffect(() => {
    if (targetPocketId && deduction) {
      const deductionAmount = Number(deduction) || 0;
      validateDeductionBalance(deductionAmount, targetPocketId);
    }
  }, [targetPocketId, deduction, validateDeductionBalance]);

  const calculateIDR = () => {
    if (currency === "IDR") {
      return Number(amount) || 0;
    }

    const rate = conversionType === "auto" 
      ? exchangeRate 
      : Number(manualRate);

    return rate ? (Number(amount) || 0) * rate : 0;
  };

  const handleSubmit = () => {
    if (!name.trim() || !amount) {
      toast.error("Nama dan nominal harus diisi");
      return;
    }

    if (!hideTargetPocket && !targetPocketId) {
      toast.error("Kantong tujuan harus dipilih");
      return;
    }

    if (currency === "USD" && conversionType === "manual" && !manualRate) {
      toast.error("Kurs manual harus diisi");
      return;
    }

    if (currency === "USD" && conversionType === "auto" && !exchangeRate) {
      toast.error("Kurs belum dimuat. Silakan tunggu atau gunakan manual.");
      return;
    }

    // DEDUCTION BALANCE VALIDATION (Reactive fail-safe)
    const deductionAmount = Number(deduction) || 0;
    if (targetPocketId && deductionAmount > 0 && balances) {
      const pocket = balances.get(targetPocketId);
      if (pocket && deductionAmount > pocket.availableBalance) {
        const pocketName = pockets.find(p => p.id === targetPocketId)?.name || 'kantong ini';
        setInsufficientDetails({
          pocketName,
          availableBalance: pocket.availableBalance,
          attemptedAmount: deductionAmount,
        });
        setShowInsufficientDialog(true);
        return; // BLOCK SUBMISSION!
      }
    }

    const rate = conversionType === "auto" 
      ? exchangeRate 
      : (currency === "USD" ? Number(manualRate) : null);

    // 🔧 FIX: Keep date in YYYY-MM-DD format to avoid timezone conversion
    // Just use the date string directly - backend will handle time if needed
    const finalDate = date;

    const incomeData: IncomeData = {
      name: name.trim(),
      amount: Number(amount),
      currency,
      exchangeRate: rate,
      amountIDR: calculateIDR(),
      conversionType: currency === "USD" ? conversionType : "manual",
      date: finalDate,
      deduction: Number(deduction) || 0,
      pocketId: targetPocketId || initialValues?.pocketId || 'pocket_daily',
    };

    if (editMode && onUpdateIncome) {
      onUpdateIncome(incomeData);
    } else if (onAddIncome) {
      onAddIncome(incomeData);
    }

    // Reset form only in add mode
    if (!editMode) {
      setName("");
      setAmount("");
      setAmountExpression("");
      setCalculatedAmount(null);
      setCurrency("IDR");
      setConversionType("manual");
      setManualRate("");
      setDeduction("");
      setTargetPocketId(defaultTargetPocket || (pockets.length > 0 ? pockets[0].id : ""));
    }
    
    // Call onSuccess callback if provided (for dialog)
    if (onSuccess) {
      onSuccess();
    }
  };

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(name.toLowerCase())
  );

  const amountIDR = calculateIDR();

  // If in dialog, render without Card wrapper
  const formContent = (
    <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="incomeName">Nama Pemasukan</Label>
          <div className="relative">
            <Input
              id="incomeName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Contoh: Fiverr, Freelance, Bonus, dll"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                    onClick={() => {
                      setName(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mata Uang</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={currency === "IDR" ? "default" : "outline"}
              onClick={() => setCurrency("IDR")}
              className="flex-1"
            >
              IDR (Rupiah)
            </Button>
            <Button
              type="button"
              variant={currency === "USD" ? "default" : "outline"}
              onClick={() => setCurrency("USD")}
              className="flex-1"
            >
              USD (Dollar)
            </Button>
          </div>
        </div>

        {currency === "USD" && (
          <div className="space-y-2">
            <Label>Metode Konversi</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={conversionType === "manual" ? "default" : "outline"}
                onClick={() => setConversionType("manual")}
                className="flex-1"
              >
                Manual
              </Button>
              <Button
                type="button"
                variant={conversionType === "auto" ? "default" : "outline"}
                onClick={() => setConversionType("auto")}
                className="flex-1"
              >
                Auto (Realtime)
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="incomeAmount">
            Nominal {currency === "USD" ? "(USD)" : "(IDR)"}
          </Label>
          <Input
            id="incomeAmount"
            type="text"
            inputMode="numeric"
            value={amountExpression}
            onChange={(e) => setAmountExpression(e.target.value)}
            placeholder={currency === "USD" ? "0 atau 1234.56 atau 100+50" : "0 atau 50000+4000-20%"}
          />
          {/* Show calculation preview for USD */}
          {currency === "USD" && calculatedAmount !== null && amountExpression !== calculatedAmount.toString() && (
            <div className="p-2 bg-accent rounded-md">
              <p className="text-sm text-muted-foreground">Hasil perhitungan:</p>
              <p className="text-primary">
                ${calculatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {/* Show calculation preview for IDR */}
          {currency === "IDR" && calculatedAmount !== null && amountExpression !== calculatedAmount.toString() && (
            <div className="p-2 bg-accent rounded-md">
              <p className="text-sm text-muted-foreground">Hasil perhitungan:</p>
              <p className="text-primary">{formatCurrency(calculatedAmount)}</p>
            </div>
          )}
        </div>

        {currency === "USD" && (
          <>
            {conversionType === "auto" && (
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
                  value={exchangeRate ? formatCurrency(exchangeRate) : "Memuat..."}
                  disabled
                />
              </div>
            )}

            {conversionType === "manual" && (
              <div className="space-y-2">
                <Label htmlFor="manualRate">Kurs Manual (1 USD = ... IDR)</Label>
                <Input
                  id="manualRate"
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyInput(manualRate)}
                  onChange={(e) => setManualRate(parseCurrencyInput(e.target.value).toString())}
                  placeholder="Contoh: 15000"
                />
              </div>
            )}

            <div className="p-3 bg-accent rounded-md">
              <p className="text-sm text-muted-foreground">Konversi ke IDR:</p>
              <p className="text-green-600">{formatCurrency(amountIDR)}</p>
            </div>
          </>
        )}

        {!hideTargetPocket && pockets.length > 0 && (
          <div className="space-y-2">
            <Label>Ke Kantong</Label>
            <Select value={targetPocketId} onValueChange={setTargetPocketId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kantong tujuan" />
              </SelectTrigger>
              <SelectContent>
                {pockets.map(pocket => (
                  <SelectItem key={pocket.id} value={pocket.id}>
                    {pocket.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="incomeDate">Tanggal Pemasukan</Label>
          <Popover>
            <PopoverTrigger>
              <Input
                id="incomeDate"
                type="text"
                value={format(new Date(date), "dd/MM/yyyy")}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  "w-full pl-3 pr-10 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                )}
                placeholder="Pilih tanggal..."
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                initialFocus
                mode="single"
                selected={(() => {
                  const [year, month, day] = date.split('-').map(Number);
                  return new Date(year, month - 1, day);
                })()}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    setDate(`${year}-${month}-${day}`);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incomeDeduction">Potongan Individual (Optional)</Label>
          <Input
            id="incomeDeduction"
            type="text"
            inputMode="numeric"
            value={formatCurrencyInput(deduction)}
            onChange={(e) => setDeduction(parseCurrencyInput(e.target.value).toString())}
            placeholder="0"
            className={balanceError ? "border-red-500" : ""}
          />
          {deduction && Number(deduction) > 0 && (
            <div className="p-2 bg-accent rounded-md">
              <p className="text-sm text-muted-foreground">Nilai Bersih:</p>
              <p className="text-green-600">{formatCurrency(amountIDR - (Number(deduction) || 0))}</p>
            </div>
          )}
          {/* Deduction Balance Error Message */}
          {balanceError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="text-red-500 text-lg flex-shrink-0">⛔️</span>
              <p className="text-sm text-red-500 leading-relaxed">{balanceError}</p>
            </div>
          )}
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!name.trim() || !amount || isAdding || isInsufficientBalance}
          className="w-full"
        >
          {!editMode && <Plus className="size-4 mr-2" />}
          {submitButtonText || (isAdding ? "Menambahkan..." : editMode ? "Simpan" : "Tambah Pemasukan")}
        </Button>
      </div>
  );

  // Return with or without Card wrapper based on inDialog prop
  if (inDialog) {
    return (
      <>
        {formContent}
        
        {/* Insufficient Balance Dialog (Reactive Fail-safe) */}
        {insufficientDetails && (
          <InsufficientBalanceDialog
            open={showInsufficientDialog}
            onOpenChange={setShowInsufficientDialog}
            pocketName={insufficientDetails.pocketName}
            availableBalance={insufficientDetails.availableBalance}
            attemptedAmount={insufficientDetails.attemptedAmount}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tambah Pemasukan Tambahan</CardTitle>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
      
      {/* Insufficient Balance Dialog (Reactive Fail-safe) */}
      {insufficientDetails && (
        <InsufficientBalanceDialog
          open={showInsufficientDialog}
          onOpenChange={setShowInsufficientDialog}
          pocketName={insufficientDetails.pocketName}
          availableBalance={insufficientDetails.availableBalance}
          attemptedAmount={insufficientDetails.attemptedAmount}
        />
      )}
    </>
  );
}