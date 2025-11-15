/**
 * ExpenseListItem Component
 * 
 * Renders a single expense or income item in the expense list.
 * This is a mostly "dumb" presentational component - all logic and state
 * handling remains in the parent ExpenseList component.
 * 
 * Phase 4A: Component Extraction
 * Extracted from ExpenseList.tsx to reduce monolith size
 */

import React, { memo } from 'react';
import type { Expense } from '../../types/expense';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  ArrowRight,
  DollarSign,
  Minus
} from 'lucide-react';
import { cn } from '../ui/utils';
import { getCategoryEmoji } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { ExpenseItemWrapper } from '../ExpenseItemWrapper';

export interface ExpenseListItemProps {
  // Data
  expense: Expense;
  
  // State
  isBulkSelectMode: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  isMobile: boolean;
  categorySettings: any;
  
  // Handlers - these all come from parent
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (data: { id: string; name: string; amount: number }) => void;
  onLongPress?: (id: string, type: 'expense' | 'income') => void;
  onMoveToIncome?: (expense: Expense) => void;
  
  // Helper functions from parent
  getDisplayEmoji: (expense: Expense) => string | undefined;
  getPocketName: (pocketId: string) => string | undefined;
  formatUSD: (amount: number) => string;
}

const ExpenseListItemComponent = memo((props: ExpenseListItemProps) => {
  const {
    expense,
    isBulkSelectMode,
    isSelected,
    isExpanded,
    isMobile,
    categorySettings,
    onToggleExpand,
    onToggleSelect,
    onEdit,
    onDelete,
    onLongPress,
    onMoveToIncome,
    getDisplayEmoji,
    getPocketName,
    formatUSD,
  } = props;

  // Helper: Render category emoji with fallback logic
  const renderCategoryEmoji = () => {
    const templateEmoji = getDisplayEmoji(expense);
    if (templateEmoji) {
      return <span className="mr-1.5" title="From template">{templateEmoji}</span>;
    }
    
    if (expense.category) {
      return <span className="mr-1.5" title={`cat="${expense.category}"`}>
        {getCategoryEmoji(expense.category, categorySettings)}
      </span>;
    }
    
    if (expense.items && expense.items.length > 0) {
      const itemsWithCategories = expense.items.filter((item: any) => item.category);
      if (itemsWithCategories.length > 0) {
        const firstCategory = itemsWithCategories[0].category;
        return <span className="mr-1.5" title={`multi-cat (${itemsWithCategories.length} items)`}>
          {getCategoryEmoji(firstCategory, categorySettings)}
        </span>;
      }
    }
    
    return <span className="mr-1.5 text-yellow-500" title="No category">⚠️</span>;
  };

  // Render template items list (expandable)
  const renderTemplateItems = () => {
    if (!expense.items || expense.items.length === 0) return null;
    
    return (
      <CollapsibleContent>
        <div className="px-3 pb-3 space-y-2 border-t pt-3 mt-2 md:px-2 md:pb-2 md:space-y-1 md:pt-1 md:mt-1">
          {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
            <div className="flex items-center gap-2 text-xs text-green-600 pl-8 md:pl-6 mb-1">
              <DollarSign className="size-3" />
              <span>
                {formatUSD(expense.originalAmount)} × {formatCurrency(expense.exchangeRate)}
                <span className="ml-1 text-xs">
                  ({expense.conversionType === "auto" ? "realtime" : "manual"})
                </span>
              </span>
            </div>
          )}
          {expense.fromIncome && expense.deduction && expense.deduction > 0 && (
            <div className="text-xs text-muted-foreground pl-8 md:pl-6 mb-1">
              <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
            </div>
          )}
          {expense.items.map((item, index) => {
            const itemCategory = (item as any).category;
            const categoryEmoji = itemCategory ? getCategoryEmoji(itemCategory, categorySettings) : '';
            
            return (
              <div key={index} className="flex justify-between items-center text-sm md:text-xs pl-8 md:pl-6 py-1.5 md:py-0 rounded-lg md:rounded-none hover:bg-accent/30 md:hover:bg-transparent transition-colors">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  {categoryEmoji && <span className="text-base">{categoryEmoji}</span>}
                  <span>{item.name}</span>
                </span>
                <span className={expense.fromIncome ? 'text-green-600' : 'text-red-600'}>
                  {expense.fromIncome ? '+' : '-'}{formatCurrency(item.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    );
  };

  if (expense.items && expense.items.length > 0) {
    // Template expense with items - using collapsible
    return (
      <ExpenseItemWrapper
        id={expense.id}
        isMobile={isMobile}
        isBulkSelectMode={isBulkSelectMode}
        isSelected={isSelected}
        onLongPress={(id) => onLongPress?.(id, 'expense')}
      >
        {(longPressHandlers) => (
          <Collapsible 
            open={isExpanded} 
            onOpenChange={() => onToggleExpand(expense.id)}
          >
            <div 
              className={cn(
                'rounded-lg hover:bg-accent/30 transition-colors',
                isBulkSelectMode && isSelected ? 'bg-accent/30' : ''
              )}
            >
              <CollapsibleTrigger asChild>
                <div className="cursor-pointer rounded-lg hover:bg-accent/30 transition-colors">
                  {/* Mobile Layout */}
                  <div className="md:hidden p-2 pl-6" {...longPressHandlers}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        {isBulkSelectMode && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleSelect(expense.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5"
                          />
                        )}
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <p className={cn('text-sm', expense.fromIncome ? 'text-green-600' : '')}>
                            {renderCategoryEmoji()}
                            {expense.name}
                          </p>
                          {expense.pocketId && getPocketName(expense.pocketId) && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 w-fit">
                              {getPocketName(expense.pocketId)}
                            </Badge>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-3 text-muted-foreground shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="size-3 text-muted-foreground shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="flex items-center shrink-0 ml-auto">
                        <p className={cn('text-sm text-right', expense.fromIncome ? 'text-green-600' : 'text-red-600')}>
                          {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between p-2 pl-6 group">
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      {isBulkSelectMode && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(expense.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <p className={cn('text-sm', expense.fromIncome ? 'text-green-600' : 'text-muted-foreground')}>
                        {renderCategoryEmoji()}
                        {expense.name}
                      </p>
                      {expense.pocketId && getPocketName(expense.pocketId) && (
                        <Badge variant="secondary" className="text-xs">
                          {getPocketName(expense.pocketId)}
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="size-3" />
                      ) : (
                        <ChevronDown className="size-3" />
                      )}
                    </div>
                    <div className="flex items-center shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                      <p className={cn('text-sm text-right transition-all', expense.fromIncome ? 'text-green-600' : 'text-red-600')}>
                        {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                      </p>
                      {!isBulkSelectMode && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-0 group-hover:w-6 opacity-0 group-hover:opacity-100 transition-all overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {expense.fromIncome && onMoveToIncome && (
                              <DropdownMenuItem onClick={() => onMoveToIncome(expense)}>
                                <ArrowRight className="size-3.5 mr-2 text-green-600" />
                                Kembalikan ke Pemasukan
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(expense.id)}>
                              <Pencil className="size-3 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                onDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              {renderTemplateItems()}
            </div>
          </Collapsible>
        )}
      </ExpenseItemWrapper>
    );
  } else {
    // Single expense without items
    return (
      <ExpenseItemWrapper
        id={expense.id}
        isMobile={isMobile}
        isBulkSelectMode={isBulkSelectMode}
        isSelected={isSelected}
        onLongPress={(id) => onLongPress?.(id, 'expense')}
      >
        {(longPressHandlers) => (
          <div
            className={cn(
              'rounded-lg hover:bg-accent/30 transition-colors',
              isBulkSelectMode && isSelected ? 'bg-accent/30' : ''
            )}
          >
            {/* Mobile Layout */}
            <div 
              className="md:hidden p-2 pl-6"
              {...longPressHandlers}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  {isBulkSelectMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(expense.id)}
                      className="mt-0.5"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <p className={cn('text-sm', expense.fromIncome ? 'text-green-600' : '')}>
                        {renderCategoryEmoji()}
                        {expense.name}
                      </p>
                      {expense.pocketId && getPocketName(expense.pocketId) && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 w-fit">
                          {getPocketName(expense.pocketId)}
                        </Badge>
                      )}
                    </div>
                    {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                        <DollarSign className="size-3" />
                        <span className="truncate">
                          {formatUSD(expense.originalAmount)} × {formatCurrency(expense.exchangeRate)}
                          <span className="ml-1">
                            ({expense.conversionType === "auto" ? "realtime" : "manual"})
                          </span>
                        </span>
                      </div>
                    )}
                    {expense.fromIncome && expense.deduction && expense.deduction > 0 && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center shrink-0 ml-auto">
                  <p className={cn('text-sm text-right', expense.fromIncome ? 'text-green-600' : 'text-red-600')}>
                    {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between p-2 pl-6 group">
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {isBulkSelectMode && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(expense.id)}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm', expense.fromIncome ? 'text-green-600' : '')}>
                      {renderCategoryEmoji()}
                      {expense.name}
                    </p>
                    {expense.pocketId && getPocketName(expense.pocketId) && (
                      <Badge variant="secondary" className="text-xs">
                        {getPocketName(expense.pocketId)}
                      </Badge>
                    )}
                  </div>
                  {expense.fromIncome && expense.currency === "USD" && expense.originalAmount !== undefined && expense.exchangeRate !== undefined && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <DollarSign className="size-3" />
                      <span>
                        {formatUSD(expense.originalAmount)} × {formatCurrency(expense.exchangeRate)}
                        <span className="ml-1 text-xs">
                          ({expense.conversionType === "auto" ? "realtime" : "manual"})
                        </span>
                      </span>
                    </div>
                  )}
                  {expense.fromIncome && expense.deduction && expense.deduction > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <Minus className="size-3 inline" /> Potongan: {formatCurrency(expense.deduction)} (Kotor: {formatCurrency(expense.amount + expense.deduction)})
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center shrink-0 ml-auto">
                <p className={cn('text-sm text-right transition-all', expense.fromIncome ? 'text-green-600' : 'text-red-600')}>
                  {expense.fromIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                </p>
                {!isBulkSelectMode && (
                  <>
                    {expense.fromIncome && onMoveToIncome && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-0 group-hover:w-6 opacity-0 group-hover:opacity-100 transition-all overflow-hidden"
                        onClick={() => onMoveToIncome(expense)}
                        title="Kembalikan ke pemasukan tambahan"
                      >
                        <ArrowRight className="size-3 text-green-600" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-0 group-hover:w-6 opacity-0 group-hover:opacity-100 transition-all overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="size-3 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(expense.id)}>
                          <Pencil className="size-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            onDelete({ id: expense.id, name: expense.name, amount: expense.amount });
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </ExpenseItemWrapper>
    );
  }
});

ExpenseListItemComponent.displayName = 'ExpenseListItem';

export const ExpenseListItem = ExpenseListItemComponent;
