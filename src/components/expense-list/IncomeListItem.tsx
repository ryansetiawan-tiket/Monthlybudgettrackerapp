/**
 * IncomeListItem Component
 * 
 * Renders a single income item in the income list.
 * This is a mostly "dumb" presentational component - all logic and state
 * handling remains in the parent ExpenseList component.
 * 
 * Phase 4B: Component Extraction
 * Extracted from ExpenseList.tsx to reduce monolith size
 */

import React, { memo } from 'react';
import type { AdditionalIncome } from '../../types/expense';
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
} from 'lucide-react';
import { cn } from '../ui/utils';
import { formatCurrency } from '../../utils/currency';
import { formatDateSafe, getLocalDateFromISO } from '../../utils/date-helpers';
import { ExpenseItemWrapper } from '../ExpenseItemWrapper';

export interface IncomeListItemProps {
  // Data
  income: AdditionalIncome;
  
  // State
  isBulkSelectMode: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  isMobile: boolean;
  
  // Handlers - these all come from parent
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onEdit: (id: string, income: AdditionalIncome, datePart: string) => void;
  onDelete: (id: string) => void;
  onLongPress?: (id: string, type: 'income') => void;
  
  // Helper functions from parent
  getLocalDateFromISO: (isoDate: string) => string;
}

const IncomeListItemComponent = memo((props: IncomeListItemProps) => {
  const {
    income,
    isBulkSelectMode,
    isSelected,
    isExpanded,
    isMobile,
    onToggleExpand,
    onToggleSelect,
    onEdit,
    onDelete,
    onLongPress,
    getLocalDateFromISO,
  } = props;

  const netAmount = income.deduction > 0 ? income.amountIDR - income.deduction : income.amountIDR;

  // Helper: Format USD amount
  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <ExpenseItemWrapper
      key={income.id}
      id={income.id}
      isMobile={isMobile}
      isBulkSelectMode={isBulkSelectMode}
      isSelected={isSelected}
      onLongPress={(id) => onLongPress?.(id, 'income')}
    >
      {(longPressHandlers) => (
        <Collapsible open={isExpanded} onOpenChange={() => onToggleExpand(income.id)}>
          <div 
            className={cn(
              'rounded-lg hover:bg-accent/30 transition-colors',
              isBulkSelectMode && isSelected ? 'bg-accent/30' : ''
            )}
          >
            <CollapsibleTrigger asChild>
              <div className="group cursor-pointer rounded-lg hover:bg-accent/30 transition-colors">
                {/* Mobile: Compact layout with long-press */}
                <div 
                  className="md:hidden p-2 pl-6"
                  {...longPressHandlers}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Name + metadata */}
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {isBulkSelectMode && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(income.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate text-green-600">{income.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDateSafe(income.date)}
                          {income.conversionType === "auto" && " • (Auto)"}
                          {income.currency === "USD" && income.amount && ` • ${formatUSD(income.amount)}`}
                        </span>
                      </div>
                      
                      {!isBulkSelectMode && (
                        isExpanded ? (
                          <ChevronUp className="size-3 text-muted-foreground shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="size-3 text-muted-foreground shrink-0 mt-1" />
                        )
                      )}
                    </div>
                    
                    {/* Right: Amount + actions (forced right-aligned) */}
                    <div className="flex items-center shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                      <p className="text-sm text-right text-green-600">
                        +{formatCurrency(netAmount)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Desktop: Single-line layout */}
                <div className="hidden md:flex items-center justify-between p-2 pl-6">
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {isBulkSelectMode && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(income.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-green-600">{income.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDateSafe(income.date)}
                        {income.conversionType === "auto" && " • (Auto)"}
                        {income.currency === "USD" && income.amount && ` • ${formatUSD(income.amount)}`}
                      </span>
                    </div>
                    
                    {!isBulkSelectMode && (
                      isExpanded ? (
                        <ChevronUp className="size-3" />
                      ) : (
                        <ChevronDown className="size-3" />
                      )
                    )}
                  </div>
                  
                  <div className="flex items-center shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm text-right text-green-600 transition-all">
                      +{formatCurrency(netAmount)}
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
                          <DropdownMenuItem
                            onClick={() => {
                              const datePart = getLocalDateFromISO(income.date);
                              onEdit(income.id, income, datePart);
                            }}
                          >
                            <Pencil className="size-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(income.id)}
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
            
            {/* Expandable details */}
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-2 border-t pt-3 mt-2 md:px-2 md:pb-2 md:space-y-1 md:pt-1 md:mt-1">
                {income.currency === "USD" && (
                  <div className="text-xs text-muted-foreground pl-8 md:pl-6">
                    <span className="font-medium">Kotor:</span> {formatUSD(income.amount || 0)} × {formatCurrency(income.exchangeRate || 0)} = {formatCurrency(income.amountIDR)}
                  </div>
                )}
                {income.deduction > 0 && (
                  <div className="text-xs text-muted-foreground pl-8 md:pl-6">
                    <span className="font-medium">Potongan:</span> -{formatCurrency(income.deduction)}
                  </div>
                )}
                {(!income.currency || income.currency === "IDR") && (
                  <div className="text-xs text-muted-foreground pl-8 md:pl-6">
                    <span className="font-medium">Jumlah:</span> {formatCurrency(income.amountIDR)}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </ExpenseItemWrapper>
  );
});

IncomeListItemComponent.displayName = 'IncomeListItem';

export const IncomeListItem = IncomeListItemComponent;
