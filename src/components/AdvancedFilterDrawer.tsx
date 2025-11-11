import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { useIsMobile } from "./ui/use-mobile";
import { getCategoryEmoji, getCategoryLabel } from "../utils/calculations";
import type { CategorySettings } from "../types";
import { Filter } from "lucide-react";

interface Category {
  id: string;
  emoji: string;
  label: string;
}

interface Pocket {
  id: string;
  name: string;
  emoji: string;
  balance: number;
  isActive?: boolean;
}

interface IncomeSource {
  name: string;
  count: number;
}

interface AdvancedFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Tab context
  activeTab: 'expense' | 'income';
  
  // Category filter (expense only)
  selectedCategories: Set<string>;
  onCategoryToggle: (categoryId: string) => void;
  
  // Pocket filter (expense only)
  selectedPockets: Set<string>;
  onPocketToggle: (pocketId: string) => void;
  
  // Income source filter (income only)
  selectedIncomeSources: Set<string>;
  onIncomeSourceToggle: (sourceName: string) => void;
  
  // Actions
  onApply: () => void;
  onReset: () => void;
  
  // Data
  allCategories: Category[];
  allPockets: Pocket[];
  allIncomeSources: IncomeSource[];
  settings: CategorySettings;
}

// CategoryFilterSection component
function CategoryFilterSection({
  selectedCategories,
  onToggle,
  allCategories,
  settings
}: {
  selectedCategories: Set<string>;
  onToggle: (id: string) => void;
  allCategories: Category[];
  settings: CategorySettings;
}) {
  return (
    <div className="space-y-3">
      <Label className="font-medium">Filter berdasarkan Kategori</Label>
      <div className="space-y-2 max-h-[180px] overflow-y-auto border rounded-lg p-3">
        {allCategories.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Tidak ada kategori tersedia
          </p>
        ) : (
          allCategories.map(category => (
            <div 
              key={category.id}
              className="flex items-center gap-2 hover:bg-accent/50 p-2 rounded cursor-pointer transition-colors"
              onClick={() => onToggle(category.id)}
            >
              <Checkbox
                checked={selectedCategories.has(category.id)}
                onCheckedChange={() => onToggle(category.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-lg">{getCategoryEmoji(category.id as any, settings)}</span>
              <span>{getCategoryLabel(category.id as any, settings)}</span>
            </div>
          ))
        )}
      </div>
      
      {selectedCategories.size > 0 && (
        <p className="text-muted-foreground">
          ✓ {selectedCategories.size} kategori dipilih
        </p>
      )}
    </div>
  );
}

// PocketFilterSection component
function PocketFilterSection({
  selectedPockets,
  onToggle,
  allPockets
}: {
  selectedPockets: Set<string>;
  onToggle: (id: string) => void;
  allPockets: Pocket[];
}) {
  const activePockets = allPockets.filter(p => p.isActive !== false);
  
  return (
    <div className="space-y-3">
      <Label className="font-medium">Filter berdasarkan Sumber Dana</Label>
      <div className="space-y-2 max-h-[150px] overflow-y-auto border rounded-lg p-3">
        {activePockets.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Tidak ada kantong tersedia
          </p>
        ) : (
          activePockets.map(pocket => (
            <div 
              key={pocket.id}
              className="flex items-center gap-2 hover:bg-accent/50 p-2 rounded cursor-pointer transition-colors"
              onClick={() => onToggle(pocket.id)}
            >
              <Checkbox
                checked={selectedPockets.has(pocket.id)}
                onCheckedChange={() => onToggle(pocket.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-lg">{pocket.emoji}</span>
              <span className="flex-1">{pocket.name}</span>
            </div>
          ))
        )}
      </div>
      
      {selectedPockets.size > 0 && (
        <p className="text-muted-foreground">
          ✓ {selectedPockets.size} kantong dipilih
        </p>
      )}
    </div>
  );
}

// IncomeSourceFilterSection component
function IncomeSourceFilterSection({
  selectedSources,
  onToggle,
  allSources
}: {
  selectedSources: Set<string>;
  onToggle: (name: string) => void;
  allSources: IncomeSource[];
}) {
  return (
    <div className="space-y-3">
      <Label className="font-medium">Filter berdasarkan Nama Pemasukan</Label>
      <div className="space-y-2 max-h-[180px] overflow-y-auto border rounded-lg p-3">
        {allSources.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Belum ada pemasukan
          </p>
        ) : (
          allSources.map(source => (
            <div 
              key={source.name}
              className="flex items-center gap-2 hover:bg-accent/50 p-2 rounded cursor-pointer transition-colors"
              onClick={() => onToggle(source.name)}
            >
              <Checkbox
                checked={selectedSources.has(source.name)}
                onCheckedChange={() => onToggle(source.name)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="flex-1">{source.name}</span>
              <span className="text-muted-foreground">
                ({source.count})
              </span>
            </div>
          ))
        )}
      </div>
      
      {selectedSources.size > 0 && (
        <p className="text-muted-foreground">
          ✓ {selectedSources.size} sumber dipilih
        </p>
      )}
    </div>
  );
}

export function AdvancedFilterDrawer({
  open,
  onOpenChange,
  activeTab,
  selectedCategories,
  onCategoryToggle,
  selectedPockets,
  onPocketToggle,
  selectedIncomeSources,
  onIncomeSourceToggle,
  onApply,
  onReset,
  allCategories,
  allPockets,
  allIncomeSources,
  settings
}: AdvancedFilterDrawerProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex flex-col max-h-[85vh]">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle className="flex items-center gap-2">
              <Filter className="size-5" />
              <span>Filter Lanjutan</span>
            </DrawerTitle>
          </DrawerHeader>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 space-y-6">
            {/* Expense Tab Filters */}
            {activeTab === 'expense' && (
              <>
                {/* Category Filter Section */}
                <CategoryFilterSection
                  selectedCategories={selectedCategories}
                  onToggle={onCategoryToggle}
                  allCategories={allCategories}
                  settings={settings}
                />
                
                {/* Pocket Filter Section */}
                <PocketFilterSection
                  selectedPockets={selectedPockets}
                  onToggle={onPocketToggle}
                  allPockets={allPockets}
                />
              </>
            )}
            
            {/* Income Tab Filter */}
            {activeTab === 'income' && (
              <IncomeSourceFilterSection
                selectedSources={selectedIncomeSources}
                onToggle={onIncomeSourceToggle}
                allSources={allIncomeSources}
              />
            )}
          </div>
          
          {/* Sticky Action Buttons */}
          <div className="flex-shrink-0 border-t bg-background px-4 py-4">
            <div className="flex gap-2">
              <Button 
                onClick={onApply} 
                className="flex-1"
              >
                ✅ Terapkan Filter
              </Button>
              <Button 
                onClick={onReset} 
                variant="outline" 
                className="flex-1"
              >
                ❌ Reset
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  
  // Desktop Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            <span>Filter Lanjutan</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Expense Tab Filters */}
          {activeTab === 'expense' && (
            <>
              {/* Category Filter Section */}
              <CategoryFilterSection
                selectedCategories={selectedCategories}
                onToggle={onCategoryToggle}
                allCategories={allCategories}
                settings={settings}
              />
              
              {/* Pocket Filter Section */}
              <PocketFilterSection
                selectedPockets={selectedPockets}
                onToggle={onPocketToggle}
                allPockets={allPockets}
              />
            </>
          )}
          
          {/* Income Tab Filter */}
          {activeTab === 'income' && (
            <IncomeSourceFilterSection
              selectedSources={selectedIncomeSources}
              onToggle={onIncomeSourceToggle}
              allSources={allIncomeSources}
            />
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={onApply} 
              className="flex-1"
            >
              ✅ Terapkan Filter
            </Button>
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="flex-1"
            >
              ❌ Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
