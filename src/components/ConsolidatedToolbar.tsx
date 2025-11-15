import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowUpDown, Filter, Edit2, Trash2, ListChecks } from 'lucide-react';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { formatCurrency } from '../utils/currency';
import { useRef, useEffect, memo } from 'react';
import { useIsMobile } from './ui/use-mobile';

interface ConsolidatedToolbarProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchExpanded: boolean;
  onSearchToggle: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  
  // ✨ Smart Suggestions
  showSuggestions?: boolean;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  suggestionsRef?: React.RefObject<HTMLDivElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  selectedSuggestionIndex?: number;
  onSuggestionMouseEnter?: (index: number) => void;
  matchedCategories?: Set<string>;
  onCategoryClick?: (categoryId: string) => void;
  getCategoryEmoji?: (id: string) => string;
  getCategoryLabel?: (id: string) => string;
  
  // Selection
  isSelectionMode: boolean;
  onToggleSelection: () => void;
  hasItems: boolean;
  
  // Bulk actions (for selection mode)
  selectedCount?: number;
  allSelected?: boolean;
  onToggleSelectAll?: () => void;
  onBulkEdit?: () => void;
  onBulkDelete?: () => void;
  
  // Data
  totalAmount: number;
  activeTab: 'expense' | 'income';
  
  // Actions
  onSort?: () => void;
  onFilter?: () => void;
  
  // Sort/Filter indicators
  sortOrder?: 'newest' | 'oldest';
  hasActiveFilters?: boolean;
}

const ConsolidatedToolbarComponent = memo(function ConsolidatedToolbar({
  searchQuery,
  onSearchChange,
  isSearchExpanded,
  onSearchToggle,
  searchInputRef,
  showSuggestions = false,
  suggestions = [],
  onSelectSuggestion,
  suggestionsRef,
  onKeyDown,
  selectedSuggestionIndex = -1,
  onSuggestionMouseEnter,
  matchedCategories = new Set(),
  onCategoryClick,
  getCategoryEmoji,
  getCategoryLabel,
  isSelectionMode,
  onToggleSelection,
  hasItems,
  selectedCount = 0,
  allSelected = false,
  onToggleSelectAll,
  onBulkEdit,
  onBulkDelete,
  totalAmount,
  activeTab,
  onSort,
  onFilter,
  sortOrder = 'newest',
  hasActiveFilters = false
}: ConsolidatedToolbarProps) {
  const internalSearchRef = useRef<HTMLInputElement>(null);
  const searchRef = searchInputRef || internalSearchRef;

  // Auto-focus when search expands
  useEffect(() => {
    if (isSearchExpanded && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchExpanded, searchRef]);

  const handleClearSearch = () => {
    onSearchChange('');
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };
  
  // Handle Ctrl/Cmd+A to select all text
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+A (Windows/Linux) or Cmd+A (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      console.log('🎯 Desktop Ctrl/Cmd+A detected!');
      e.preventDefault();
      e.stopPropagation();
      
      // Use setTimeout to ensure select happens after event processing
      setTimeout(() => {
        if (searchRef.current) {
          searchRef.current.select();
          console.log('✅ Text selected in desktop search');
        }
      }, 0);
      
      return; // Don't pass through to parent handler
    }
    
    // Pass through to parent onKeyDown handler for arrow keys etc
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-2 h-10">
      {/* LEFT SECTION: Action Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <AnimatePresence mode="wait">
          {isSelectionMode ? (
            // ✨ SELECTION MODE: 4 tombol (Pilih semua, Edit, Hapus, Batal)
            <motion.div
              key="selection-mode"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex items-center gap-1.5"
            >
              {isMobile ? (
                // Mobile: Compact version (icon only + counter)
                <>
                  {/* Checkbox: Pilih semua - Icon only */}
                  <div
                    className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    aria-label={allSelected ? "Batalkan pilih semua" : "Pilih semua"}
                    title={allSelected ? "Batalkan pilih semua" : "Pilih semua"}
                  >
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={onToggleSelectAll}
                    />
                  </div>

                  {/* Edit Kategori button - Icon only, only for Expense tab */}
                  {activeTab === 'expense' && (
                    <button
                      onClick={onBulkEdit}
                      disabled={selectedCount === 0}
                      className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Edit kategori"
                      title="Edit kategori"
                    >
                      <Edit2 className="size-4" />
                    </button>
                  )}

                  {/* Hapus button - Icon with badge counter */}
                  <button
                    onClick={onBulkDelete}
                    disabled={selectedCount === 0}
                    className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                    aria-label={`Hapus ${selectedCount} item`}
                    title={`Hapus ${selectedCount} item`}
                  >
                    <Trash2 className="size-4" />
                    {selectedCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center">
                        {selectedCount}
                      </span>
                    )}
                  </button>

                  {/* Batal button - Compact */}
                  <button
                    onClick={onToggleSelection}
                    className="px-2.5 h-10 rounded-lg bg-white text-black border border-input hover:bg-gray-50 transition-colors text-xs"
                    aria-label="Batal pilih"
                  >
                    Batal
                  </button>
                </>
              ) : (
                // Desktop: Full version (with text labels)
                <>
                  {/* Checkbox: Pilih semua */}
                  <label className="flex items-center gap-2 px-3 h-10 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={onToggleSelectAll}
                    />
                    <span className="text-sm whitespace-nowrap">Pilih semua</span>
                  </label>

                  {/* Edit Kategori button - Only for Expense tab */}
                  {activeTab === 'expense' && (
                    <button
                      onClick={onBulkEdit}
                      disabled={selectedCount === 0}
                      className="px-3 h-10 rounded-lg hover:bg-muted transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      aria-label="Edit kategori"
                    >
                      <Edit2 className="size-4" />
                      <span>Edit Kategori</span>
                    </button>
                  )}

                  {/* Hapus button with count */}
                  <button
                    onClick={onBulkDelete}
                    disabled={selectedCount === 0}
                    className="px-3 h-10 rounded-lg hover:bg-muted transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    aria-label={`Hapus ${selectedCount} item`}
                  >
                    <Trash2 className="size-4" />
                    <span>Hapus ({selectedCount})</span>
                  </button>

                  {/* Batal button */}
                  <button
                    onClick={onToggleSelection}
                    className="px-3 h-10 rounded-lg bg-white text-black border border-input hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
                    aria-label="Batal pilih"
                  >
                    Batal
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            // ✨ NORMAL MODE: Tombol Select (only when has items)
            <motion.div
              key="normal-mode"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {hasItems && (
                <button
                  onClick={onToggleSelection}
                  className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  aria-label="Pilih transaksi"
                  title="Pilih transaksi"
                >
                  <ListChecks className="size-5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search toggle button - Always visible, shifted when selection mode */}
        {/* On mobile, hide when selection mode is active */}
        {(!isMobile || !isSelectionMode) && (
          <button
            onClick={onSearchToggle}
            className={`h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors ${
              isSearchExpanded ? 'bg-muted' : ''
            }`}
            aria-label="Cari transaksi"
            title="Cari transaksi"
          >
            <Search className="size-5" />
          </button>
        )}

        {/* Sort button (only for expense tab) - Always visible, shifted when selection mode */}
        {/* On mobile, hide when selection mode is active */}
        {activeTab === 'expense' && onSort && (!isMobile || !isSelectionMode) && (
          <button
            onClick={() => {
              console.log('Sort button clicked!');
              onSort();
            }}
            className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Urutkan"
            title={sortOrder === 'oldest' ? 'Saat ini: Terlama ke Terbaru (Klik untuk balik)' : 'Saat ini: Terbaru ke Terlama (Klik untuk balik)'}
          >
            <ArrowUpDown className="size-4" />
          </button>
        )}

        {/* Filter button - Always visible, shifted when selection mode */}
        {/* On mobile, hide when selection mode is active */}
        {onFilter && (!isMobile || !isSelectionMode) && (
          <button
            onClick={onFilter}
            className={`h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors relative ${
              hasActiveFilters ? 'text-primary' : ''
            }`}
            aria-label="Filter lanjutan"
            title="Filter lanjutan"
          >
            <Filter className="size-4" />
            {hasActiveFilters && (
              <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full" />
            )}
          </button>
        )}
      </div>

      {/* MIDDLE SECTION: Search Bar - Appears when expanded (Desktop only, mobile has separate search below tabs) */}
      <AnimatePresence>
        {isSearchExpanded && !isMobile && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1 overflow-visible"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                type="text"
                placeholder={
                  activeTab === 'expense'
                    ? 'Cari nama, kategori, hari, atau tanggal...'
                    : 'Cari nama, hari, atau tanggal...'
                }
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-9 h-10 w-full"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="size-4" />
                </button>
              )}
              
              {/* ✨ Smart Suggestions - Desktop */}
              {showSuggestions && (suggestions.length > 0 || matchedCategories.size > 0) && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-lg z-[100] max-h-60 overflow-y-auto"
                >
                  {/* ✅ Matched categories section (clickable badges) */}
                  {matchedCategories.size > 0 && activeTab === 'expense' && onCategoryClick && getCategoryEmoji && getCategoryLabel && (
                    <div className="px-3 py-2 border-b border-border">
                      <div className="text-xs text-muted-foreground mb-2">Kategori ditemukan:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(matchedCategories).map(categoryId => (
                          <button
                            key={categoryId}
                            onClick={() => onCategoryClick(categoryId)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-accent/50 hover:bg-accent rounded-md text-xs transition-colors"
                          >
                            <span>{getCategoryEmoji(categoryId)}</span>
                            <span>{getCategoryLabel(categoryId)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Regular suggestions */}
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                        index === selectedSuggestionIndex 
                          ? 'bg-accent text-accent-foreground' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => onSelectSuggestion?.(suggestion)}
                      onMouseEnter={() => onSuggestionMouseEnter?.(index)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT SECTION: Total Amount - Always visible, pushed to right when search collapsed or on mobile */}
      <div className={`flex items-center gap-1.5 flex-shrink-0 ${(!isSearchExpanded || isMobile) ? 'ml-auto' : ''}`}>
        <span
          className={`text-sm font-medium whitespace-nowrap ${
            activeTab === 'expense'
              ? totalAmount < 0
                ? 'text-green-600'
                : 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {activeTab === 'expense'
            ? `${totalAmount < 0 ? '+' : '-'}${formatCurrency(Math.abs(totalAmount))}`
            : `+${formatCurrency(totalAmount)}`}
        </span>
      </div>
    </div>
  );
});

ConsolidatedToolbarComponent.displayName = 'ConsolidatedToolbar';
export { ConsolidatedToolbarComponent as ConsolidatedToolbar };