import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { RotateCcw, Calendar } from "lucide-react";
import { getCategoryConfig } from "../utils/categoryManager";
import { useCategorySettings } from "../hooks/useCategorySettings";

interface TimelineFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
  
  // Date filter
  dateFilter: 'all' | 'today' | '3days' | '7days' | 'custom';
  onDateFilterChange: (value: 'all' | 'today' | '3days' | '7days' | 'custom') => void;
  customDateStart: string;
  onCustomDateStartChange: (value: string) => void;
  customDateEnd: string;
  onCustomDateEndChange: (value: string) => void;
  
  // Amount filter
  amountMin: string;
  onAmountMinChange: (value: string) => void;
  amountMax: string;
  onAmountMaxChange: (value: string) => void;
  
  // Category filter
  selectedCategories: string[];
  onSelectedCategoriesChange: (value: string[]) => void;
  
  // Reset
  onReset: () => void;
  
  // Available categories in entries
  availableCategories: string[];
}

export function TimelineFilterDialog({
  open,
  onOpenChange,
  isMobile,
  dateFilter,
  onDateFilterChange,
  customDateStart,
  onCustomDateStartChange,
  customDateEnd,
  onCustomDateEndChange,
  amountMin,
  onAmountMinChange,
  amountMax,
  onAmountMaxChange,
  selectedCategories,
  onSelectedCategoriesChange,
  onReset,
  availableCategories,
}: TimelineFilterDialogProps) {
  const { settings } = useCategorySettings();
  
  const formatRupiah = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    // Format with thousand separators
    return new Intl.NumberFormat('id-ID').format(parseInt(numbers));
  };
  
  const handleAmountMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    onAmountMinChange(value);
  };
  
  const handleAmountMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    onAmountMaxChange(value);
  };
  
  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectedCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onSelectedCategoriesChange([...selectedCategories, categoryId]);
    }
  };
  
  const filterContent = (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Filter Waktu</Label>
        <RadioGroup value={dateFilter} onValueChange={(value: any) => onDateFilterChange(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="date-all" />
            <Label htmlFor="date-all" className="font-normal cursor-pointer">
              Semua Waktu
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="today" id="date-today" />
            <Label htmlFor="date-today" className="font-normal cursor-pointer">
              Hari Ini
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3days" id="date-3days" />
            <Label htmlFor="date-3days" className="font-normal cursor-pointer">
              3 Hari Terakhir
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="7days" id="date-7days" />
            <Label htmlFor="date-7days" className="font-normal cursor-pointer">
              7 Hari Terakhir
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="date-custom" />
            <Label htmlFor="date-custom" className="font-normal cursor-pointer">
              Pilih Tanggal
            </Label>
          </div>
        </RadioGroup>
        
        {/* Custom Date Range */}
        {dateFilter === 'custom' && (
          <div className="ml-6 space-y-2 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="date-start" className="text-xs text-muted-foreground">
                Dari Tanggal
              </Label>
              <Input
                id="date-start"
                type="date"
                value={customDateStart}
                onChange={(e) => onCustomDateStartChange(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date-end" className="text-xs text-muted-foreground">
                Sampai Tanggal
              </Label>
              <Input
                id="date-end"
                type="date"
                value={customDateEnd}
                onChange={(e) => onCustomDateEndChange(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="h-px bg-border" />
      
      {/* Amount Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Filter Jumlah Transaksi</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="amount-min" className="text-xs text-muted-foreground">
              Minimum
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                Rp
              </span>
              <Input
                id="amount-min"
                type="text"
                placeholder="0"
                value={formatRupiah(amountMin)}
                onChange={handleAmountMinChange}
                className="h-9 pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount-max" className="text-xs text-muted-foreground">
              Maksimum
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                Rp
              </span>
              <Input
                id="amount-max"
                type="text"
                placeholder="0"
                value={formatRupiah(amountMax)}
                onChange={handleAmountMaxChange}
                className="h-9 pl-9"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-px bg-border" />
      
      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Filter Kategori</Label>
        {availableCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tidak ada kategori tersedia
          </p>
        ) : (
          <div className="space-y-2">
            {availableCategories.map((categoryId) => {
              const categoryConfig = getCategoryConfig(categoryId, settings);
              if (!categoryConfig) return null;
              
              return (
                <div key={categoryId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${categoryId}`}
                    checked={selectedCategories.includes(categoryId)}
                    onCheckedChange={() => handleCategoryToggle(categoryId)}
                  />
                  <Label
                    htmlFor={`category-${categoryId}`}
                    className="font-normal cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{categoryConfig.emoji}</span>
                    <span>{categoryConfig.label}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
  
  // Mobile: Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] z-[110]" aria-describedby={undefined}>
          <DrawerHeader className="border-b">
            <DrawerTitle className="flex items-center justify-between">
              <span>Filter Transaksi</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 px-3 text-xs"
              >
                <RotateCcw className="size-3 mr-1" />
                Reset
              </Button>
            </DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 py-6">
              {filterContent}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Terapkan Filter
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  
  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter Transaksi</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-3 text-xs"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset
            </Button>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {filterContent}
          </div>
        </ScrollArea>
        <div className="border-t pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Terapkan Filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}