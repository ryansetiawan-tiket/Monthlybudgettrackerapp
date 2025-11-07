# Phase 8: Customization & Personalization - Technical Planning

**Status**: 📋 PLANNING COMPLETE - READY FOR IMPLEMENTATION  
**Estimated Time**: 2-3 hours  
**Priority**: HIGH (User explicitly likes this feature)  
**Complexity**: HIGH

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [Implementation Steps](#implementation-steps)
6. [Component Design](#component-design)
7. [State Management](#state-management)
8. [API Endpoints](#api-endpoints)
9. [Migration Strategy](#migration-strategy)
10. [Testing Checklist](#testing-checklist)

---

## Overview

### Goals
Enable users to **fully customize their category system**:
- Create custom categories with emoji & color
- Edit default categories (emoji, color, label)
- Set budget limits per category
- Category aliases for smart matching
- Category presets/templates
- Import/export category settings

### Benefits
- **Personalization**: Categories match user's lifestyle
- **Flexibility**: Not limited to 11 defaults
- **Budget control**: Per-category spending limits
- **Automation**: Smart categorization via keywords
- **Portability**: Export/import across devices

### Dependencies
- ✅ Phase 7 implementation (filtering system)
- ✅ Supabase KV Store (for persistence)
- ✅ emoji-picker-react (already installed)
- ⚠️ Color picker library (need to install)

---

## User Stories

### Story 1: Create Custom Category
```
AS A user
I WANT to create my own expense categories
SO THAT I can track expenses specific to my lifestyle

Example: User creates "Gaming" category
- Emoji: 🎮
- Label: Gaming
- Color: #FF5733
- Budget: Rp 500.000/month (optional)

Acceptance Criteria:
- Can create unlimited custom categories
- Custom categories appear in all dropdowns
- Custom categories work with filtering/sorting
- Custom categories persist across sessions
- Can delete custom categories
- Deleting category doesn't delete expenses (moves to "Lainnya")
```

### Story 2: Customize Default Categories
```
AS A user
I WANT to customize the default categories
SO THAT they match my preferences

Example: Change "Makanan" emoji from 🍔 to 🍜

Acceptance Criteria:
- Can change emoji for any default category
- Can change color for any default category
- Can change label for any default category
- Changes apply immediately to all expenses
- Can reset to default
- Original 11 categories always available
```

### Story 3: Set Category Budget Limits
```
AS A user
I WANT to set spending limits for each category
SO THAT I can control my budget

Example: Set "Makanan" limit to Rp 1.000.000/month

Acceptance Criteria:
- Can set budget limit for any category
- Visual indicator when approaching limit (70%, 90%, 100%)
- Pie chart colors reflect budget status (green/orange/red)
- Notification when limit exceeded
- Monthly reset (auto-resets on 1st of month)
- Can disable limit for a category
```

### Story 4: Category Manager Panel
```
AS A user
I WANT a centralized place to manage all categories
SO THAT I can organize my category system

Acceptance Criteria:
- Shows all default + custom categories
- Drag & drop to reorder categories
- Quick edit inline (emoji, color, label)
- Delete custom categories
- Reset default categories
- Export all settings to JSON
- Import settings from JSON
```

---

## Technical Architecture

### System Design

```
Frontend (React)
├── CategoryManager Component
│   ├── CategoryList (default + custom)
│   ├── CategoryEditor Dialog
│   ├── BudgetLimitEditor Dialog
│   └── Import/Export Buttons
│
├── App.tsx (State)
│   ├── customCategories: Map<string, CategoryConfig>
│   ├── categorySettings: CategorySettings
│   └── categoryBudgets: Map<string, BudgetConfig>
│
├── Utils
│   ├── getAllCategories() → merge default + custom
│   ├── getCategoryConfig(cat) → settings
│   └── isBudgetExceeded(cat, amount) → boolean
│
Backend (Supabase KV)
├── category_settings_{userId}
│   ├── custom: { [id]: CategoryConfig }
│   ├── overrides: { [category]: Partial<CategoryConfig> }
│   ├── budgets: { [category]: BudgetConfig }
│   ├── order: string[]
│   └── version: number
│
└── category_keywords_{userId}
    └── { [category]: string[] }
```

### Data Flow

```
User Creates Category
    ↓
CategoryEditor Dialog
    ↓
Validate Input (emoji, label, color)
    ↓
POST /make-server-3adbeaf1/categories/create
    ↓
Server saves to KV: category_settings_{userId}
    ↓
Server returns updated settings
    ↓
Frontend updates state
    ↓
All dropdowns reflect new category
    ↓
Local cache updated (localStorage)
```

---

## Database Schema

### KV Store Structure

#### Key: `category_settings_{userId}`
```typescript
interface CategorySettings {
  version: number;                    // Schema version (1)
  
  // Custom categories (user-created)
  custom: {
    [categoryId: string]: {
      id: string;                     // e.g., "gaming_abc123"
      emoji: string;                  // e.g., "🎮"
      label: string;                  // e.g., "Gaming"
      color: string;                  // e.g., "#FF5733"
      createdAt: string;              // ISO timestamp
      updatedAt: string;              // ISO timestamp
    }
  };
  
  // Overrides for default categories
  overrides: {
    [category in ExpenseCategory]?: {
      emoji?: string;                 // Override default emoji
      label?: string;                 // Override default label
      color?: string;                 // Override default color
    }
  };
  
  // Budget limits per category
  budgets: {
    [categoryKey: string]: {          // category or customId
      limit: number;                  // Rp amount
      warningAt: number;              // % threshold (default 80)
      enabled: boolean;
      resetDay: number;               // Day of month (1-31, default 1)
    }
  };
  
  // Category display order (for dropdowns)
  order: string[];                    // ['food', 'gaming_abc123', 'transport', ...]
  
  // Keywords for auto-categorization
  keywords: {
    [categoryKey: string]: string[];  // ['nasi', 'makan', 'resto']
  };
  
  // Aliases (one category, multiple names)
  aliases: {
    [alias: string]: string;          // 'jajan' -> 'food'
  };
}
```

**Example**:
```json
{
  "version": 1,
  "custom": {
    "gaming_abc123": {
      "id": "gaming_abc123",
      "emoji": "🎮",
      "label": "Gaming",
      "color": "#FF5733",
      "createdAt": "2025-11-07T10:00:00Z",
      "updatedAt": "2025-11-07T10:00:00Z"
    },
    "photography_xyz789": {
      "id": "photography_xyz789",
      "emoji": "📸",
      "label": "Photography",
      "color": "#8B5CF6",
      "createdAt": "2025-11-07T11:00:00Z",
      "updatedAt": "2025-11-07T11:00:00Z"
    }
  },
  "overrides": {
    "food": {
      "emoji": "🍜",
      "color": "#FFD700"
    }
  },
  "budgets": {
    "food": {
      "limit": 1000000,
      "warningAt": 80,
      "enabled": true,
      "resetDay": 1
    },
    "gaming_abc123": {
      "limit": 500000,
      "warningAt": 75,
      "enabled": true,
      "resetDay": 1
    }
  },
  "order": [
    "food",
    "transport",
    "gaming_abc123",
    "photography_xyz789",
    "savings",
    "bills",
    "health",
    "loan",
    "family",
    "entertainment",
    "installment",
    "shopping",
    "other"
  ],
  "keywords": {
    "food": ["nasi", "makan", "resto", "cafe", "warung", "jajan"],
    "transport": ["gojek", "grab", "bensin", "parkir", "toll"],
    "gaming_abc123": ["steam", "playstation", "xbox", "nintendo"]
  },
  "aliases": {
    "jajan": "food",
    "kuliner": "food",
    "makan": "food"
  }
}
```

#### Key: `category_budgets_tracking_{userId}_{month}`
```typescript
interface CategoryBudgetTracking {
  month: string;                      // "2025-11"
  tracking: {
    [categoryKey: string]: {
      spent: number;                  // Current spending
      limit: number;                  // Budget limit (snapshot)
      transactions: number;           // Count
      lastUpdated: string;            // ISO timestamp
    }
  };
}
```

**Example**:
```json
{
  "month": "2025-11",
  "tracking": {
    "food": {
      "spent": 850000,
      "limit": 1000000,
      "transactions": 7,
      "lastUpdated": "2025-11-07T15:30:00Z"
    },
    "gaming_abc123": {
      "spent": 450000,
      "limit": 500000,
      "transactions": 2,
      "lastUpdated": "2025-11-06T20:00:00Z"
    }
  }
}
```

---

## Implementation Steps

### Phase 8.1: Core Infrastructure (45 mins)

#### Step 1.1: Update Types (10 mins)
**File**: `/types/index.ts`

```typescript
export interface CustomCategory {
  id: string;
  emoji: string;
  label: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryOverride {
  emoji?: string;
  label?: string;
  color?: string;
}

export interface CategoryBudget {
  limit: number;
  warningAt: number;
  enabled: boolean;
  resetDay: number;
}

export interface CategorySettings {
  version: number;
  custom: Record<string, CustomCategory>;
  overrides: Partial<Record<ExpenseCategory, CategoryOverride>>;
  budgets: Record<string, CategoryBudget>;
  order: string[];
  keywords: Record<string, string[]>;
  aliases: Record<string, string>;
}

export interface CategoryConfig {
  id: string;
  emoji: string;
  label: string;
  color: string;
  isCustom: boolean;
  budget?: CategoryBudget;
}
```

#### Step 1.2: Create Category Utils (15 mins)
**File**: `/utils/categoryManager.ts` (NEW)

```typescript
import { ExpenseCategory, CategorySettings, CategoryConfig } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

/**
 * Merge default categories with custom categories and overrides
 */
export function getAllCategories(settings: CategorySettings | null): CategoryConfig[] {
  const categories: CategoryConfig[] = [];
  
  // Add default categories (with overrides)
  Object.entries(EXPENSE_CATEGORIES).forEach(([key, config]) => {
    const category = key as ExpenseCategory;
    const override = settings?.overrides[category];
    const budget = settings?.budgets[category];
    
    categories.push({
      id: category,
      emoji: override?.emoji || config.emoji,
      label: override?.label || config.label,
      color: override?.color || getCategoryColor(category),
      isCustom: false,
      budget
    });
  });
  
  // Add custom categories
  if (settings?.custom) {
    Object.values(settings.custom).forEach(custom => {
      categories.push({
        ...custom,
        isCustom: true,
        budget: settings.budgets[custom.id]
      });
    });
  }
  
  // Sort by order if provided
  if (settings?.order) {
    categories.sort((a, b) => {
      const aIndex = settings.order.indexOf(a.id);
      const bIndex = settings.order.indexOf(b.id);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
  
  return categories;
}

/**
 * Get category config by ID (handles default + custom)
 */
export function getCategoryConfig(
  categoryId: string, 
  settings: CategorySettings | null
): CategoryConfig | null {
  const all = getAllCategories(settings);
  return all.find(c => c.id === categoryId) || null;
}

/**
 * Generate unique ID for custom category
 */
export function generateCategoryId(label: string): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}_${random}`;
}

/**
 * Validate category input
 */
export function validateCategoryInput(
  emoji: string,
  label: string,
  color: string
): { valid: boolean; error?: string } {
  if (!emoji || emoji.trim().length === 0) {
    return { valid: false, error: 'Emoji is required' };
  }
  
  if (!label || label.trim().length === 0) {
    return { valid: false, error: 'Label is required' };
  }
  
  if (label.length > 50) {
    return { valid: false, error: 'Label must be less than 50 characters' };
  }
  
  if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
    return { valid: false, error: 'Invalid color format' };
  }
  
  return { valid: true };
}

/**
 * Check if budget is exceeded
 */
export function isBudgetExceeded(
  categoryId: string,
  currentSpent: number,
  settings: CategorySettings | null
): { exceeded: boolean; percentage: number; status: 'safe' | 'warning' | 'danger' } {
  const budget = settings?.budgets[categoryId];
  
  if (!budget || !budget.enabled) {
    return { exceeded: false, percentage: 0, status: 'safe' };
  }
  
  const percentage = (currentSpent / budget.limit) * 100;
  const warningThreshold = budget.warningAt || 80;
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (percentage >= 100) {
    status = 'danger';
  } else if (percentage >= warningThreshold) {
    status = 'warning';
  }
  
  return {
    exceeded: percentage >= 100,
    percentage,
    status
  };
}
```

#### Step 1.3: Create API Endpoints (20 mins)
**File**: `/supabase/functions/server/index.tsx`

Add routes for category management:

```typescript
// Category Management Routes

// Get user's category settings
app.get('/make-server-3adbeaf1/categories/settings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const settings = await kv.get(`category_settings_${user.id}`);
    
    return c.json({ 
      success: true, 
      settings: settings || getDefaultSettings() 
    });
  } catch (error) {
    console.error('Error fetching category settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Create custom category
app.post('/make-server-3adbeaf1/categories/create', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { emoji, label, color, budget } = await c.req.json();
    
    // Validate input
    if (!emoji || !label || !color) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const settings = await kv.get(`category_settings_${user.id}`) || getDefaultSettings();
    
    // Generate ID
    const id = generateCategoryId(label);
    
    // Add custom category
    settings.custom[id] = {
      id,
      emoji,
      label,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to order
    settings.order.push(id);
    
    // Add budget if provided
    if (budget) {
      settings.budgets[id] = budget;
    }
    
    // Save
    await kv.set(`category_settings_${user.id}`, settings);
    
    return c.json({ 
      success: true, 
      category: settings.custom[id],
      settings 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// Update category (custom or override default)
app.put('/make-server-3adbeaf1/categories/:categoryId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const categoryId = c.req.param('categoryId');
    const updates = await c.req.json();
    
    const settings = await kv.get(`category_settings_${user.id}`) || getDefaultSettings();
    
    // Check if custom category
    if (settings.custom[categoryId]) {
      settings.custom[categoryId] = {
        ...settings.custom[categoryId],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Override default category
      settings.overrides[categoryId] = {
        ...settings.overrides[categoryId],
        ...updates
      };
    }
    
    await kv.set(`category_settings_${user.id}`, settings);
    
    return c.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating category:', error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

// Delete custom category
app.delete('/make-server-3adbeaf1/categories/:categoryId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const categoryId = c.req.param('categoryId');
    
    const settings = await kv.get(`category_settings_${user.id}`) || getDefaultSettings();
    
    // Only allow deleting custom categories
    if (!settings.custom[categoryId]) {
      return c.json({ error: 'Cannot delete default category' }, 400);
    }
    
    // Delete category
    delete settings.custom[categoryId];
    
    // Remove from order
    settings.order = settings.order.filter(id => id !== categoryId);
    
    // Remove budget if exists
    delete settings.budgets[categoryId];
    
    await kv.set(`category_settings_${user.id}`, settings);
    
    return c.json({ success: true, settings });
  } catch (error) {
    console.error('Error deleting category:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// Update budget limit
app.put('/make-server-3adbeaf1/categories/:categoryId/budget', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const categoryId = c.req.param('categoryId');
    const budget = await c.req.json();
    
    const settings = await kv.get(`category_settings_${user.id}`) || getDefaultSettings();
    
    settings.budgets[categoryId] = budget;
    
    await kv.set(`category_settings_${user.id}`, settings);
    
    return c.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating budget:', error);
    return c.json({ error: 'Failed to update budget' }, 500);
  }
});

// Helper function
function getDefaultSettings(): CategorySettings {
  return {
    version: 1,
    custom: {},
    overrides: {},
    budgets: {},
    order: Object.keys(EXPENSE_CATEGORIES),
    keywords: {},
    aliases: {}
  };
}

function generateCategoryId(label: string): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}_${random}`;
}
```

### Phase 8.2: Category Manager UI (60 mins)

#### Step 2.1: Install Color Picker (5 mins)

Add to dependencies (auto-installed on import):
```typescript
import { HexColorPicker } from "react-colorful@5.6.1";
```

#### Step 2.2: Create CategoryEditor Dialog (30 mins)
**File**: `/components/CategoryEditorDialog.tsx` (NEW)

```typescript
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { HexColorPicker } from "react-colorful@5.6.1";
import EmojiPicker from "emoji-picker-react@4.12.0";
import { CustomCategory, CategoryBudget } from "../types";
import { validateCategoryInput } from "../utils/categoryManager";
import { toast } from "sonner@2.0.3";

interface CategoryEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CustomCategory | null;
  onSave: (data: {
    emoji: string;
    label: string;
    color: string;
    budget?: CategoryBudget;
  }) => Promise<void>;
  mode: 'create' | 'edit';
}

export function CategoryEditorDialog({
  open,
  onOpenChange,
  category,
  onSave,
  mode
}: CategoryEditorDialogProps) {
  const [emoji, setEmoji] = useState(category?.emoji || '📦');
  const [label, setLabel] = useState(category?.label || '');
  const [color, setColor] = useState(category?.color || '#10B981');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const validation = validateCategoryInput(emoji, label, color);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSaving(true);
    try {
      await onSave({ emoji, label, color });
      toast.success(mode === 'create' ? 'Kategori berhasil dibuat' : 'Kategori berhasil diperbarui');
      onOpenChange(false);
    } catch (error) {
      toast.error('Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Buat Kategori Baru' : 'Edit Kategori'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Emoji Picker */}
          <div>
            <Label>Emoji</Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-2xl h-12"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {emoji}
              </Button>
              {showEmojiPicker && (
                <div className="absolute top-full left-0 z-50 mt-2">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setEmoji(emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                    theme="auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Label Input */}
          <div>
            <Label htmlFor="label">Nama Kategori</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Gaming, Photography"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {label.length}/50 karakter
            </p>
          </div>

          {/* Color Picker */}
          <div>
            <Label>Warna</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-20 h-10 p-0"
                style={{ backgroundColor: color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#FF5733"
                maxLength={7}
              />
            </div>
            {showColorPicker && (
              <div className="mt-2">
                <HexColorPicker color={color} onChange={setColor} />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Step 2.3: Create CategoryManager Component (25 mins)
**File**: `/components/CategoryManager.tsx` (NEW)

```typescript
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw,
  DollarSign 
} from "lucide-react";
import { CategoryEditorDialog } from "./CategoryEditorDialog";
import { CategorySettings, CategoryConfig } from "../types";
import { getAllCategories } from "../utils/categoryManager";
import { toast } from "sonner@2.0.3";

interface CategoryManagerProps {
  settings: CategorySettings | null;
  onUpdateSettings: (settings: CategorySettings) => Promise<void>;
}

export function CategoryManager({ settings, onUpdateSettings }: CategoryManagerProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  const categories = getAllCategories(settings);
  const defaultCategories = categories.filter(c => !c.isCustom);
  const customCategories = categories.filter(c => c.isCustom);

  const handleCreate = useCallback(() => {
    setEditingCategory(null);
    setEditorMode('create');
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((category: CategoryConfig) => {
    setEditingCategory(category);
    setEditorMode('edit');
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async (categoryId: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Pengeluaran dengan kategori ini akan dipindahkan ke "Lainnya".')) {
      return;
    }

    try {
      // Call API to delete
      const response = await fetch(`/make-server-3adbeaf1/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${/* get token */}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete');

      const { settings: newSettings } = await response.json();
      await onUpdateSettings(newSettings);
      toast.success('Kategori berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus kategori');
    }
  }, [onUpdateSettings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">⚙️ Kelola Kategori</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="size-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Default Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📦 Kategori Default ({defaultCategories.length})
            <Button variant="ghost" size="sm">
              <RotateCcw className="size-4 mr-2" />
              Reset All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {defaultCategories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.emoji}</span>
                <div>
                  <p className="font-medium">{category.label}</p>
                  {category.budget?.enabled && (
                    <p className="text-xs text-muted-foreground">
                      Budget: Rp {category.budget.limit.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: category.color }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                >
                  <Edit2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Custom Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            ⭐ Kategori Custom ({customCategories.length})
            <Button size="sm" onClick={handleCreate}>
              <Plus className="size-4 mr-2" />
              Tambah Kategori
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Belum ada kategori custom</p>
              <Button variant="link" onClick={handleCreate}>
                Buat kategori pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {customCategories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <div>
                      <p className="font-medium">{category.label}</p>
                      {category.budget?.enabled && (
                        <p className="text-xs text-muted-foreground">
                          Budget: Rp {category.budget.limit.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: category.color }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Editor Dialog */}
      <CategoryEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        category={editingCategory}
        mode={editorMode}
        onSave={async (data) => {
          // Handle save via API
        }}
      />
    </div>
  );
}
```

### Phase 8.3: Integration & Hooks (30 mins)

#### Step 3.1: Create useCategorySettings Hook (15 mins)
**File**: `/hooks/useCategorySettings.ts` (NEW)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { CategorySettings } from '../types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function useCategorySettings() {
  const [settings, setSettings] = useState<CategorySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1/categories/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch settings');

      const { settings: fetchedSettings } = await response.json();
      setSettings(fetchedSettings);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching category settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: CategorySettings) => {
    setSettings(newSettings);
    // Optionally save to localStorage for offline access
    localStorage.setItem('categorySettings', JSON.stringify(newSettings));
  }, []);

  // Load on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings
  };
}
```

#### Step 3.2: Update App.tsx Integration (15 mins)
**File**: `/App.tsx`

```typescript
import { useCategorySettings } from './hooks/useCategorySettings';
import { CategoryManager } from './components/CategoryManager';
import { getAllCategories } from './utils/categoryManager';

function App() {
  // ... existing state
  
  // Category settings
  const { 
    settings: categorySettings, 
    loading: categorySettingsLoading,
    updateSettings: updateCategorySettings
  } = useCategorySettings();

  // Get all categories (default + custom)
  const allCategories = getAllCategories(categorySettings);

  return (
    <>
      {/* ... existing tabs */}
      
      {/* Category Manager Tab (Optional - settings icon) */}
      {activeTab === 'category-settings' && (
        <CategoryManager
          settings={categorySettings}
          onUpdateSettings={updateCategorySettings}
        />
      )}
    </>
  );
}
```

### Phase 8.4: Budget Limits & Warnings (30 mins)

#### Step 4.1: Create BudgetLimitEditor Dialog (15 mins)
**File**: `/components/BudgetLimitEditorDialog.tsx` (NEW)

```typescript
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { CategoryBudget } from "../types";
import { toast } from "sonner@2.0.3";

interface BudgetLimitEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryLabel: string;
  categoryEmoji: string;
  currentBudget?: CategoryBudget;
  onSave: (budget: CategoryBudget) => Promise<void>;
}

export function BudgetLimitEditorDialog({
  open,
  onOpenChange,
  categoryId,
  categoryLabel,
  categoryEmoji,
  currentBudget,
  onSave
}: BudgetLimitEditorDialogProps) {
  const [enabled, setEnabled] = useState(currentBudget?.enabled ?? false);
  const [limit, setLimit] = useState(currentBudget?.limit ?? 1000000);
  const [warningAt, setWarningAt] = useState(currentBudget?.warningAt ?? 80);
  const [resetDay, setResetDay] = useState(currentBudget?.resetDay ?? 1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (enabled && limit <= 0) {
      toast.error('Budget limit harus lebih dari 0');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        enabled,
        limit,
        warningAt,
        resetDay
      });
      toast.success('Budget limit berhasil diperbarui');
      onOpenChange(false);
    } catch (error) {
      toast.error('Gagal menyimpan budget limit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Budget Limit: {categoryEmoji} {categoryLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Aktifkan Budget Limit</Label>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              {/* Limit Amount */}
              <div>
                <Label htmlFor="limit">Limit per Bulan</Label>
                <Input
                  id="limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  placeholder="1000000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Rp {limit.toLocaleString('id-ID')}
                </p>
              </div>

              {/* Warning Threshold */}
              <div>
                <Label>Peringatan pada {warningAt}%</Label>
                <Slider
                  value={[warningAt]}
                  onValueChange={([value]) => setWarningAt(value)}
                  min={50}
                  max={95}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Peringatan muncul saat mencapai Rp {((limit * warningAt) / 100).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Reset Day */}
              <div>
                <Label htmlFor="resetDay">Reset Tanggal (1-31)</Label>
                <Input
                  id="resetDay"
                  type="number"
                  value={resetDay}
                  onChange={(e) => setResetDay(Number(e.target.value))}
                  min={1}
                  max={31}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Budget akan reset setiap tanggal {resetDay}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Step 4.2: Add Budget Indicators to CategoryBreakdown (15 mins)
**File**: `/components/CategoryBreakdown.tsx`

Modify pie chart to show budget status with colors:

```typescript
// Calculate budget status for each category
const categoryDataWithBudget = useMemo(() => {
  return categoryData.map(item => {
    const budget = categorySettings?.budgets[item.category];
    if (!budget || !budget.enabled) {
      return item;
    }

    const status = isBudgetExceeded(item.category, item.amount, categorySettings);
    
    // Override color based on budget status
    let color = item.color;
    if (status.status === 'danger') {
      color = '#EF4444'; // Red
    } else if (status.status === 'warning') {
      color = '#F59E0B'; // Orange
    } else {
      color = '#10B981'; // Green
    }

    return {
      ...item,
      color,
      budgetStatus: status
    };
  });
}, [categoryData, categorySettings]);

// Use categoryDataWithBudget in PieChart
<Pie
  data={categoryDataWithBudget}
  {...other props}
/>
```

---

## Testing Checklist

### Unit Tests
- [ ] `getAllCategories` returns merged list
- [ ] `getCategoryConfig` finds by ID
- [ ] `generateCategoryId` creates unique IDs
- [ ] `validateCategoryInput` catches errors
- [ ] `isBudgetExceeded` calculates correctly

### Integration Tests
- [ ] Create custom category → appears in dropdowns
- [ ] Edit custom category → changes reflected
- [ ] Delete custom category → expenses move to "Lainnya"
- [ ] Set budget limit → warnings show correctly
- [ ] Override default category → changes apply
- [ ] Export settings → JSON is valid
- [ ] Import settings → categories restored

### API Tests
- [ ] GET /categories/settings returns data
- [ ] POST /categories/create saves category
- [ ] PUT /categories/:id updates category
- [ ] DELETE /categories/:id removes category
- [ ] PUT /categories/:id/budget saves budget

### UI/UX Tests
- [ ] Emoji picker works smoothly
- [ ] Color picker updates in real-time
- [ ] Category list is scrollable (mobile)
- [ ] Delete confirmation prevents accidents
- [ ] Budget warnings are visible
- [ ] Pie chart colors reflect budget status

---

## Success Metrics
- Custom category creation rate: **> 40%** of users
- Average custom categories per user: **2-3**
- Budget limit usage: **> 25%** of users
- Feature satisfaction: **> 4.7/5** rating

---

**Status**: ✅ PLANNING COMPLETE  
**Ready for Implementation**: YES (after Phase 7)  
**Estimated Time**: 2-3 hours  
**Risk Level**: MEDIUM-HIGH (database migrations)

---

**Next**: Review planning, then implement Phase 7 first! 🚀
