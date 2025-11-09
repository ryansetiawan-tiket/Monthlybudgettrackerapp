# Backup: Key Sections Before Refactor

## renderGroupedExpenseItem() - Line 1036-1185

**Key Logic:**
- Line 1038-1040: `if (expenses.length === 1) return renderExpenseItem(expenses[0]);`
- Line 1046: `const isGroupExpanded = expandedItems.has(\`group-${groupKey}\`);`
- Line 1066-1081: Collapsible component for date header
- Line 1082: Card styling: `border rounded-lg`
- Line 1083-1176: CollapsibleTrigger with date header
- Line 1177-1181: CollapsibleContent with items

**To Remove:**
- ❌ Single item special case (line 1038-1040)
- ❌ Collapsible wrapper (line 1066)
- ❌ isGroupExpanded state (line 1046)
- ❌ CollapsibleTrigger (line 1083)
- ❌ Chevron icons (line 1163-1167)
- ❌ Card border styling (line 1082)

**To Keep:**
- ✅ Date header with today/weekend indicators
- ✅ All item rendering logic
- ✅ Bulk select functionality

## renderIndividualExpenseInGroup() - Line 1188-1639

**Key Logic:**
- Line 1196: Card-like styling with bg-accent
- Line 1198: hover:bg-accent/30
- Individual item with sub-items has Collapsible

**To Simplify:**
- Remove card styling
- Simplify to 2-row layout
- Keep Collapsible for items with sub-items

## renderExpenseItem() - Line 1642-1850+

**Key Logic:**
- Line 1648: `border rounded-lg` (card styling)
- Single expense rendering when not in group

**To Remove:**
- This function won't be called anymore (always use date header + simple list)

---

**State to Clean Up:**
- `expandedItems` state - remove date group keys, keep only item keys for sub-items
