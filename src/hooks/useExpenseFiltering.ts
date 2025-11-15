/**
 * useExpenseFiltering Hook
 * 
 * Handles all filtering, searching, and sorting logic for expenses and incomes.
 * Extracted from ExpenseList.tsx (Phase 3 - Hook 1)
 * 
 * Features:
 * - Search query with smart suggestions
 * - Category detection and matching
 * - Advanced multi-filter (categories, pockets, income sources)
 * - Fuzzy matching for expenses and incomes
 * - Sort by date (asc/desc) with upcoming/history split
 * - Keyboard navigation for suggestions
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Expense, AdditionalIncome } from '../types/expense';
import type { ExpenseCategory } from '../types';
import { getCategoryLabel } from '../utils/calculations';
import { normalizeCategoryId } from '../utils/expenseHelpers';
import { toast } from 'sonner@2.0.3';

interface FilterState {
  categories: Set<string>;
  pockets: Set<string>;
  incomeSources: Set<string>;
}

interface UseExpenseFilteringProps {
  expenses: Expense[];
  incomes: AdditionalIncome[];
  activeTab: 'expense' | 'income';
  sortOrder: 'asc' | 'desc';
  allCategories: Array<{ id: string; name: string; emoji: string }>;
  allNames: string[];
  settings: any;
  getPocketName: (pocketId: string) => string;
  getDayName: (date: string) => string;
  getDateNumber: (date: string) => string;
  isPast: (date: string) => boolean;
}

export function useExpenseFiltering({
  expenses,
  incomes,
  activeTab,
  sortOrder,
  allCategories,
  allNames,
  settings,
  getPocketName,
  getDayName,
  getDateNumber,
  isPast,
}: UseExpenseFilteringProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [matchedCategories, setMatchedCategories] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  // Filter state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<Set<string>>(new Set());
  const [selectedPocketFilters, setSelectedPocketFilters] = useState<Set<string>>(new Set());
  const [selectedIncomeSourceFilters, setSelectedIncomeSourceFilters] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: new Set(),
    pockets: new Set(),
    incomeSources: new Set(),
  });
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<Set<ExpenseCategory>>(new Set());
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  // Fuzzy match for expenses
  const fuzzyMatchExpense = useCallback((expense: Expense, query: string): boolean => {
    if (!query || !query.trim()) return true;
    
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
    
    // Check category label
    if (expense.items && expense.items.length > 0) {
      // For template expenses, check item categories
      const categoryMatch = expense.items.some(item => {
        const rawCategory = ((item as any).category || 'other');
        const normalizedCategory = normalizeCategoryId(rawCategory);
        const categoryLabel = getCategoryLabel(normalizedCategory as any, settings);
        return categoryLabel.toLowerCase().includes(lowerQuery);
      });
      if (categoryMatch) return true;
    } else {
      // For regular expenses, check expense category
      const rawCategory = (expense.category || 'other');
      const normalizedCategory = normalizeCategoryId(rawCategory);
      const categoryLabel = getCategoryLabel(normalizedCategory as any, settings);
      if (categoryLabel.toLowerCase().includes(lowerQuery)) {
        return true;
      }
    }
    
    // Check pocket name
    const pocketName = getPocketName(expense.pocketId);
    if (pocketName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  }, [getDayName, getDateNumber, getPocketName, settings]);
  
  // Fuzzy match for incomes
  const fuzzyMatchIncome = useCallback((income: AdditionalIncome, query: string): boolean => {
    if (!query || !query.trim()) return true;
    
    const lowerQuery = query.toLowerCase();
    
    // Check income name
    if (income.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check day name
    const dayName = getDayName(income.date);
    if (dayName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check date number
    const dateNumber = getDateNumber(income.date);
    if (dateNumber.includes(lowerQuery)) {
      return true;
    }
    
    // Check pocket name
    const pocketName = getPocketName(income.pocketId);
    if (pocketName.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  }, [getDayName, getDateNumber, getPocketName]);

  // Filter by category first, then by tab
  const categoryFilteredExpenses = useMemo(() => {
    let filtered = expenses;
    
    // Filter by tab (expense or income)
    filtered = filtered.filter(expense => {
      if (activeTab === 'expense') {
        return !expense.fromIncome; // Show only expenses
      } else {
        return expense.fromIncome; // Show only income
      }
    });
    
    // Advanced Category Filter (multi-select) - takes priority
    if (activeFilters.categories.size > 0) {
      filtered = filtered.filter(expense => {
        // Support filtering by item-level categories (template expenses)
        if (expense.items && expense.items.length > 0) {
          return expense.items.some(item => {
            const rawCategory = ((item as any).category || 'other');
            const normalizedCategory = normalizeCategoryId(rawCategory);
            return activeFilters.categories.has(normalizedCategory);
          });
        }
        
        // Regular expense-level category filter
        const rawCategory = (expense.category || 'other');
        const normalizedCategory = normalizeCategoryId(rawCategory);
        return activeFilters.categories.has(normalizedCategory);
      });
    }
    // Pie chart category filter (single category) - only if advanced filter is NOT active
    else if (activeCategoryFilter.size > 0) {
      filtered = filtered.filter(expense => {
        // Support filtering by item-level categories
        if (expense.items && expense.items.length > 0) {
          return expense.items.some(item => {
            const rawCategory = ((item as any).category || 'other');
            const normalizedCategory = normalizeCategoryId(rawCategory);
            return activeCategoryFilter.has(normalizedCategory as ExpenseCategory);
          });
        }
        
        const rawCategory = (expense.category || 'other');
        const normalizedCategory = normalizeCategoryId(rawCategory);
        return activeCategoryFilter.has(normalizedCategory as ExpenseCategory);
      });
    }
    
    // Advanced Pocket Filter (multi-select)
    if (activeFilters.pockets.size > 0) {
      filtered = filtered.filter(expense => activeFilters.pockets.has(expense.pocketId));
    }
    
    return filtered;
  }, [expenses, activeTab, activeFilters, activeCategoryFilter]);

  // Sort and filter expenses
  const sortedAndFilteredExpenses = useMemo(() => {
    if (activeTab !== 'expense') return { sortedUpcoming: [], sortedHistory: [], combined: [] };
    
    let filtered = [...categoryFilteredExpenses];
    
    // If category detected AND user is searching, show all from that category OR match search
    if (matchedCategories.size > 0 && searchQuery.trim()) {
      filtered = filtered.filter(expense => {
        // Support item-level categories (template expenses)
        let categoryMatches = false;
        
        if (expense.items && expense.items.length > 0) {
          // Check if ANY item's category matches
          categoryMatches = expense.items.some(item => {
            const rawCategory = ((item as any).category || 'other');
            const normalizedCategory = normalizeCategoryId(rawCategory);
            return matchedCategories.has(normalizedCategory);
          });
        } else {
          // Check expense-level category
          const rawCategory = (expense.category || 'other');
          const normalizedCategory = normalizeCategoryId(rawCategory);
          categoryMatches = matchedCategories.has(normalizedCategory);
        }
        
        // Show if category matches OR if search text matches
        return categoryMatches || fuzzyMatchExpense(expense, searchQuery);
      });
    } else {
      // Regular search filter
      filtered = filtered.filter((expense) => fuzzyMatchExpense(expense, searchQuery));
    }
    
    // Split into upcoming (today & future) and history (past)
    const upcoming = filtered.filter(exp => !isPast(exp.date));
    const history = filtered.filter(exp => isPast(exp.date));
    
    // Sort upcoming based on user preference (sortOrder)
    const sortedUpcoming = upcoming.sort((a, b) => {
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
    });
    
    // Sort history ALWAYS desc (newest first) - fixed, not affected by sortOrder
    const sortedHistory = history.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      
      if (dateCompare === 0) {
        const aHasItems = a.items && a.items.length > 0;
        const bHasItems = b.items && b.items.length > 0;
        
        if (aHasItems && !bHasItems) return -1;
        if (!aHasItems && bHasItems) return 1;
        return 0;
      }
      
      return dateCompare;
    });
    
    // Combine: upcoming first, then history
    const combined = [...sortedUpcoming, ...sortedHistory];
    
    return { sortedUpcoming, sortedHistory, combined };
  }, [categoryFilteredExpenses, sortOrder, searchQuery, matchedCategories, activeTab, fuzzyMatchExpense, isPast]);

  // Filter and sort incomes
  const filteredAndSortedIncomes = useMemo(() => {
    let filtered = [...incomes];
    
    // Apply income source filter
    if (activeFilters.incomeSources.size > 0) {
      filtered = filtered.filter(income => activeFilters.incomeSources.has(income.name));
    }
    
    // Apply search filter
    filtered = filtered.filter(income => fuzzyMatchIncome(income, searchQuery));
    
    // Sort by date (newest first by default)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, activeFilters.incomeSources, searchQuery, fuzzyMatchIncome]);

  // Search handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    // Show suggestions when there's text (both mobile and desktop)
    setShowSuggestions(value.trim().length > 0);
    setSelectedSuggestionIndex(-1);
    
    // Category detection: Check if query matches any category
    if (value.trim() && activeTab === 'expense') {
      const lowerQuery = value.toLowerCase();
      const matched = new Set<string>();
      
      allCategories.forEach(cat => {
        const categoryLabel = getCategoryLabel(cat.id as any, settings);
        if (categoryLabel.toLowerCase().includes(lowerQuery)) {
          matched.add(cat.id);
        }
      });
      
      setMatchedCategories(matched);
    } else {
      setMatchedCategories(new Set());
    }
  }, [activeTab, allCategories, settings]);
  
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setMatchedCategories(new Set());
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }, []);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Ctrl/Cmd+A to select all text
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      if (searchInputRef.current) {
        searchInputRef.current.select();
      }
      return;
    }
    
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
  }, [showSuggestions, suggestions, selectedSuggestionIndex, handleSelectSuggestion]);

  // Advanced filter handlers
  const toggleCategoryFilter = useCallback((categoryId: string) => {
    setSelectedCategoryFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const togglePocketFilter = useCallback((pocketId: string) => {
    setSelectedPocketFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pocketId)) {
        newSet.delete(pocketId);
      } else {
        newSet.add(pocketId);
      }
      return newSet;
    });
  }, []);

  const toggleIncomeSourceFilter = useCallback((sourceName: string) => {
    setSelectedIncomeSourceFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceName)) {
        newSet.delete(sourceName);
      } else {
        newSet.add(sourceName);
      }
      return newSet;
    });
  }, []);

  const applyFilters = useCallback(() => {
    // Copy temporary selections to active filters
    setActiveFilters({
      categories: new Set(selectedCategoryFilters),
      pockets: new Set(selectedPocketFilters),
      incomeSources: new Set(selectedIncomeSourceFilters),
    });
    
    // Clear the pie chart category filter if advanced filter is active
    if (selectedCategoryFilters.size > 0) {
      setActiveCategoryFilter(new Set());
    }
    
    // Close drawer
    setIsFilterDrawerOpen(false);
    
    // Show success toast
    const filterCount = selectedCategoryFilters.size + selectedPocketFilters.size + selectedIncomeSourceFilters.size;
    if (filterCount > 0) {
      toast.success(`✅ ${filterCount} filter diterapkan`);
    }
  }, [selectedCategoryFilters, selectedPocketFilters, selectedIncomeSourceFilters]);

  const resetFilters = useCallback(() => {
    // Clear all selections
    setSelectedCategoryFilters(new Set());
    setSelectedPocketFilters(new Set());
    setSelectedIncomeSourceFilters(new Set());
    setActiveFilters({
      categories: new Set(),
      pockets: new Set(),
      incomeSources: new Set(),
    });
    
    // Clear existing category filter badge
    setActiveCategoryFilter(new Set());
    
    // Close drawer
    setIsFilterDrawerOpen(false);
    
    // Show toast
    toast.info('🔄 Filter direset');
  }, []);

  return {
    // Search state
    searchQuery,
    isSearchExpanded,
    setIsSearchExpanded,
    setSearchQuery,
    setShowSuggestions,
    matchedCategories,
    setMatchedCategories,
    showSuggestions,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
    searchInputRef,
    suggestionsRef,
    suggestions,
    
    // Filter state
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    selectedCategoryFilters,
    setSelectedCategoryFilters,
    selectedPocketFilters,
    setSelectedPocketFilters,
    selectedIncomeSourceFilters,
    setSelectedIncomeSourceFilters,
    activeFilters,
    setActiveFilters,
    activeCategoryFilter,
    setActiveCategoryFilter,
    
    // Filtered data
    sortedAndFilteredExpenses,
    filteredAndSortedIncomes,
    categoryFilteredExpenses,
    
    // Search handlers
    handleSearchChange,
    handleClearSearch,
    handleSelectSuggestion,
    handleKeyDown,
    
    // Filter handlers
    toggleCategoryFilter,
    togglePocketFilter,
    toggleIncomeSourceFilter,
    applyFilters,
    resetFilters,
  };
}