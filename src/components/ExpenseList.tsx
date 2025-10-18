import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trash2, ChevronDown, ChevronUp, ArrowUpDown, Pencil, Plus, X, Search } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ExpenseItem {
  name: string;
  amount: number;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  items?: ExpenseItem[];
  color?: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
}

export function ExpenseList({ expenses, onDeleteExpense, onEditExpense }: ExpenseListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Omit<Expense, 'id'>>({ name: '', amount: 0, date: '', items: [], color: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Helper function to get day name
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  // Helper function to get date number
  const getDateNumber = (dateString: string): string => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  // Extract all unique names, day names, and dates from expenses
  const allNames = useMemo(() => {
    const namesSet = new Set<string>();
    const dayNamesSet = new Set<string>();
    const datesSet = new Set<string>();
    
    expenses.forEach(expense => {
      // Add expense name
      namesSet.add(expense.name);
      
      // Add day name
      dayNamesSet.add(getDayName(expense.date));
      
      // Add date number
      datesSet.add(getDateNumber(expense.date));
      
      // Add item names
      if (expense.items && expense.items.length > 0) {
        expense.items.forEach(item => {
          namesSet.add(item.name);
        });
      }
    });
    
    // Combine all unique values
    const allSuggestions = [
      ...Array.from(namesSet),
      ...Array.from(dayNamesSet),
      ...Array.from(datesSet)
    ];
    
    return allSuggestions.sort();
  }, [expenses]);

  // Filter suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const lowerQuery = searchQuery.toLowerCase();
    return allNames.filter(name => 
      name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Limit to 10 suggestions
  }, [allNames, searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName}, ${day} ${monthName}`;
  };

  const isWeekend = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Minggu, 6 = Sabtu
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isPast = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleEditExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setEditingExpenseId(id);
      setEditingExpense({ 
        name: expense.name, 
        amount: expense.amount, 
        date: expense.date, 
        items: expense.items ? [...expense.items] : [], 
        color: expense.color || '' 
      });
    }
  };

  const handleSaveEditExpense = () => {
    if (editingExpenseId) {
      // Recalculate amount if items exist
      let finalAmount = editingExpense.amount;
      if (editingExpense.items && editingExpense.items.length > 0) {
        finalAmount = editingExpense.items.reduce((sum, item) => sum + item.amount, 0);
      }
      
      onEditExpense(editingExpenseId, { ...editingExpense, amount: finalAmount });
      setEditingExpenseId(null);
      setEditingExpense({ name: '', amount: 0, date: '', items: [], color: '' });
    }
  };

  const handleCloseEditDialog = () => {
    setEditingExpenseId(null);
    setEditingExpense({ name: '', amount: 0, date: '', items: [], color: '' });
  };

  const handleUpdateItem = (index: number, field: 'name' | 'amount', value: string | number) => {
    const newItems = [...(editingExpense.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditingExpense({ ...editingExpense, items: newItems });
  };

  const handleAddItem = () => {
    setEditingExpense({ 
      ...editingExpense, 
      items: [...(editingExpense.items || []), { name: '', amount: 0 }] 
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...(editingExpense.items || [])];
    newItems.splice(index, 1);
    setEditingExpense({ ...editingExpense, items: newItems });
  };

  // Fuzzy search function - checks if expense name, items, day name, or date matches
  const fuzzyMatch = (expense: Expense, query: string): boolean => {
    if (!query) return true;
    
    const lowerQuery = query.toLowerCase();
    
    // Check expense name
    if (expense.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check items if they exist
    if (expense.items && expense.items.length > 0) {
      const itemMatch = expense.items.some(item => 
        item.name.toLowerCase().includes(lowerQuery)
      );
      if (itemMatch) return true;
    }
    
    // Check day name
    const dayName = getDayName(expense.date);
    if (dayName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check date number
    const dateNumber = getDateNumber(expense.date);
    if (dateNumber.includes(lowerQuery)) {
      return true;
    }
    
    return false;
  };

  // Sort and filter expenses
  const sortedAndFilteredExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => {
        // First sort by date
        const dateCompare = sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime() 
          : new Date(b.date).getTime() - new Date(a.date).getTime();
        
        // If dates are the same, prioritize template expenses (with items)
        if (dateCompare === 0) {
          const aHasItems = a.items && a.items.length > 0;
          const bHasItems = b.items && b.items.length > 0;
          
          // Template expenses (with items) come first
          if (aHasItems && !bHasItems) return -1;
          if (!aHasItems && bHasItems) return 1;
          return 0;
        }
        
        return dateCompare;
      })
      .filter((expense) => fuzzyMatch(expense, searchQuery));
  }, [expenses, sortOrder, searchQuery]);

  // Split into upcoming and history
  const upcomingExpenses = sortedAndFilteredExpenses.filter(exp => !isPast(exp.date));
  const historyExpenses = sortedAndFilteredExpenses.filter(exp => isPast(exp.date));

  // Calculate subtotals
  const upcomingTotal = upcomingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const historyTotal = historyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Render expense item function to avoid duplication
  const renderExpenseItem = (expense: Expense) => {
    if (expense.items && expense.items.length > 0) {
      return (
        <Collapsible key={expense.id} open={expandedItems.has(expense.id)} onOpenChange={() => toggleExpanded(expense.id)}>
          <div className={`border rounded-lg hover:bg-accent transition-colors ${isToday(expense.date) ? 'ring-2 ring-blue-500' : ''}`}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 cursor-pointer">
                <div className="flex-1 flex items-center gap-2">
                  {isToday(expense.date) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Hari ini" />
                  )}
                  <span 
                    className={isWeekend(expense.date) ? "text-green-600" : ""}
                    style={expense.color && !isWeekend(expense.date) ? { color: expense.color } : {}}
                  >
                    {formatDateShort(expense.date)}
                  </span>
                  <p className="text-sm text-muted-foreground">{expense.name}</p>
                  {expandedItems.has(expense.id) ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <p className="text-red-600">{formatCurrency(expense.amount)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteExpense(expense.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditExpense(expense.id)}
                  >
                    <Pencil className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-1 border-t pt-2 mt-1">
                {expense.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm pl-8">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="text-red-600">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    } else {
      return (
        <div
          key={expense.id}
          className={`flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors ${isToday(expense.date) ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex-1 flex items-center gap-2">
            {isToday(expense.date) && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Hari ini" />
            )}
            <div>
              <p>{expense.name}</p>
              <p className="text-sm text-muted-foreground">{formatDateShort(expense.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-red-600">{formatCurrency(expense.amount)}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteExpense(expense.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditExpense(expense.id)}
            >
              <Pencil className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daftar Pengeluaran</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSortOrder}
              className="h-8 w-8"
              title={sortOrder === 'asc' ? 'Terlama ke Terbaru' : 'Terbaru ke Terlama'}
            >
              <ArrowUpDown className="size-4" />
            </Button>
            <span className="text-sm text-red-600">{formatCurrency(totalExpenses)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada pengeluaran untuk bulan ini
          </p>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama, hari, atau tanggal..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={searchInputRef}
                className="pl-9"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute left-0 top-full mt-1 w-full bg-popover border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                        index === selectedSuggestionIndex 
                          ? 'bg-accent text-accent-foreground' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Collapsible open={upcomingExpanded} onOpenChange={setUpcomingExpanded}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      {upcomingExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                      <span>Hari Ini & Mendatang</span>
                      <span className="text-xs text-muted-foreground">({upcomingExpenses.length})</span>
                    </div>
                    <span className="text-sm text-red-600">{formatCurrency(upcomingTotal)}</span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    {upcomingExpenses.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        Tidak ada pengeluaran mendatang
                      </p>
                    ) : (
                      upcomingExpenses.map(renderExpenseItem)
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            {historyExpenses.length > 0 && (
              <div className="space-y-2">
                <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        {historyExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                        <span>Riwayat</span>
                        <span className="text-xs text-muted-foreground">({historyExpenses.length})</span>
                      </div>
                      <span className="text-sm text-red-600">{formatCurrency(historyTotal)}</span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2 mt-2">
                      {historyExpenses.map(renderExpenseItem)}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <Dialog open={editingExpenseId !== null} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pengeluaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                value={editingExpense.name}
                onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
              />
            </div>
            
            {(!editingExpense.items || editingExpense.items.length === 0) && (
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Jumlah</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingExpense.amount.toString()}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-date">Tanggal</Label>
              <Input
                id="edit-date"
                type="date"
                value={editingExpense.date}
                onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
              />
            </div>
            
            {editingExpense.items && editingExpense.items.length > 0 && (
              <div className="space-y-2">
                <Label>Item Pengeluaran</Label>
                <div className="space-y-2">
                  {editingExpense.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        placeholder="Nama Item"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={item.amount.toString()}
                        onChange={(e) => handleUpdateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Jumlah"
                        className="w-32"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="w-full"
                  >
                    <Plus className="size-4 mr-2" />
                    Tambah Item
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCloseEditDialog}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveEditExpense}
            >
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}