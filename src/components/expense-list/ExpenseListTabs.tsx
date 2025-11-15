/**
 * ExpenseListTabs Component
 * 
 * Simple tab switcher for Expense/Income toggle.
 * This is a minimal, focused component for Phase 4C.
 * 
 * Phase 4C: Component Extraction
 * Extracted from ExpenseList.tsx to reduce monolith size
 */

import React, { memo } from 'react';

export type TabType = 'expense' | 'income';

export interface ExpenseListTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const ExpenseListTabsComponent = memo((props: ExpenseListTabsProps) => {
  const { activeTab, onTabChange } = props;

  return (
    <div className="bg-neutral-800 rounded-[14px] p-[3px] flex gap-0 w-full">
      <button
        onClick={() => onTabChange('expense')}
        className={`flex-1 px-3 py-[6.5px] rounded-[10px] text-sm text-center transition-all ${
          activeTab === 'expense'
            ? 'bg-[rgba(255,76,76,0.1)] border border-[#ff4c4c] text-neutral-50'
            : 'bg-transparent border border-transparent text-[#a1a1a1]'
        }`}
      >
        Pengeluaran
      </button>
      <button
        onClick={() => onTabChange('income')}
        className={`flex-1 px-3 py-[6.5px] rounded-[10px] text-sm text-center transition-all ${
          activeTab === 'income'
            ? 'bg-[rgba(34,197,94,0.1)] border border-green-500 text-neutral-50'
            : 'bg-transparent border border-transparent text-[#a1a1a1]'
        }`}
      >
        Pemasukan
      </button>
    </div>
  );
});

ExpenseListTabsComponent.displayName = 'ExpenseListTabs';

export const ExpenseListTabs = ExpenseListTabsComponent;
