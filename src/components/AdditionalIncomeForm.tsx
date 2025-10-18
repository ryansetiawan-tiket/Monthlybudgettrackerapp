import { useState, useEffect } from "react";
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

interface AdditionalIncomeFormProps {
  onAddIncome: (income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
  }) => void;
  isAdding: boolean;
}

export function AdditionalIncomeForm({
  onAddIncome,
  isAdding,
}: AdditionalIncomeFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const [conversionType, setConversionType] = useState<"auto" | "manual">("auto");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [manualRate, setManualRate] = useState("");
  const [loadingRate, setLoadingRate] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1`;

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
      console.log(`Error loading name suggestions: ${error}`);
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
      console.log(`Error fetching exchange rate: ${error}`);
      toast.error("Gagal memuat kurs. Silakan gunakan manual.");
      setConversionType("manual");
    } finally {
      setLoadingRate(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

    if (currency === "USD" && conversionType === "manual" && !manualRate) {
      toast.error("Kurs manual harus diisi");
      return;
    }

    if (currency === "USD" && conversionType === "auto" && !exchangeRate) {
      toast.error("Kurs belum dimuat. Silakan tunggu atau gunakan manual.");
      return;
    }

    const rate = conversionType === "auto" 
      ? exchangeRate 
      : (currency === "USD" ? Number(manualRate) : null);

    onAddIncome({
      name: name.trim(),
      amount: Number(amount),
      currency,
      exchangeRate: rate,
      amountIDR: calculateIDR(),
      conversionType: currency === "USD" ? conversionType : "manual",
      date,
    });

    // Reset form
    setName("");
    setAmount("");
    setCurrency("IDR");
    setConversionType("auto");
    setManualRate("");
  };

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(name.toLowerCase())
  );

  const amountIDR = calculateIDR();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pemasukan Tambahan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            {showSuggestions && filteredSuggestions.length > 0 && name && (
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
                variant={conversionType === "auto" ? "default" : "outline"}
                onClick={() => setConversionType("auto")}
                className="flex-1"
              >
                Auto (Realtime)
              </Button>
              <Button
                type="button"
                variant={conversionType === "manual" ? "default" : "outline"}
                onClick={() => setConversionType("manual")}
                className="flex-1"
              >
                Manual
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
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
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
                  type="number"
                  value={manualRate}
                  onChange={(e) => setManualRate(e.target.value)}
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

        <Button 
          onClick={handleSubmit} 
          disabled={!name.trim() || !amount || isAdding}
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          {isAdding ? "Menambahkan..." : "Tambah Pemasukan"}
        </Button>
      </CardContent>
    </Card>
  );
}