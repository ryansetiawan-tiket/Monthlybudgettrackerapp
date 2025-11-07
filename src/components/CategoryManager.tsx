/**
 * Category Manager Component
 * Phase 8: Manage custom categories, overrides, and budgets
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Settings, Download, Upload, RotateCcw, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer';
import { useIsMobile } from './ui/use-mobile';
import { useCategorySettings } from '../hooks/useCategorySettings';
import { getAllCategories } from '../utils/categoryManager';
import { CategoryConfig } from '../types';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { CategoryEditor } from './CategoryEditor';
import { BudgetLimitEditor } from './BudgetLimitEditor';
import { useConfirm } from '../hooks/useConfirm';
import { formatCurrency } from '../utils/currency';
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManager({ open, onOpenChange }: CategoryManagerProps) {
  const isMobile = useIsMobile();
  const { confirm, ConfirmDialog } = useConfirm();
  
  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    'category-manager'
  );
  
  const {
    settings,
    isLoading,
    createCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    updateCategoryOverride,
    resetCategoryOverride,
    setCategoryBudget,
    removeCategoryBudget,
    resetAllSettings,
    importSettings,
  } = useCategorySettings();

  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [editingBudget, setEditingBudget] = useState<CategoryConfig | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Get all categories (default + custom)
  const categories = useMemo(() => getAllCategories(settings), [settings]);

  // Handle create custom category
  const handleCreate = async (data: { label: string; emoji: string; color: string }) => {
    const success = await createCustomCategory(data);
    if (success) {
      toast.success('Kategori berhasil dibuat!');
      setShowCreateDialog(false);
    } else {
      toast.error('Gagal membuat kategori');
    }
  };

  // Handle edit category
  const handleEdit = async (
    categoryId: string,
    isCustom: boolean,
    data: { label?: string; emoji?: string; color?: string }
  ) => {
    let success;
    if (isCustom) {
      success = await updateCustomCategory(categoryId, data);
    } else {
      success = await updateCategoryOverride(categoryId, data);
    }

    if (success) {
      toast.success('Kategori berhasil diupdate!');
      setEditingCategory(null);
    } else {
      toast.error('Gagal mengupdate kategori');
    }
  };

  // Handle delete custom category
  const handleDelete = async (categoryId: string) => {
    const confirmed = await confirm({
      title: "Hapus Kategori?",
      description: 'Yakin ingin menghapus kategori ini? Pengeluaran akan dipindahkan ke "Lainnya"',
      confirmText: "Hapus",
      cancelText: "Batal",
      variant: "destructive",
    });
    
    if (!confirmed) return;

    const success = await deleteCustomCategory(categoryId);
    if (success) {
      toast.success('Kategori berhasil dihapus!');
    } else {
      toast.error('Gagal menghapus kategori');
    }
  };

  // Handle reset to default
  const handleReset = async (categoryId: string) => {
    const confirmed = await confirm({
      title: "Reset Kategori?",
      description: "Reset kategori ini ke pengaturan default?",
      confirmText: "Reset",
      cancelText: "Batal",
    });
    
    if (!confirmed) return;

    const success = await resetCategoryOverride(categoryId);
    if (success) {
      toast.success('Kategori berhasil direset!');
    } else {
      toast.error('Gagal mereset kategori');
    }
  };

  // Handle budget update
  const handleBudgetUpdate = async (
    categoryId: string,
    budget: { limit: number; warningAt: number; enabled: boolean; resetDay: number }
  ) => {
    const success = await setCategoryBudget(categoryId, budget);
    if (success) {
      toast.success('Budget berhasil disimpan!');
      setEditingBudget(null);
    } else {
      toast.error('Gagal menyimpan budget');
    }
  };

  // Handle budget remove
  const handleBudgetRemove = async (categoryId: string) => {
    const success = await removeCategoryBudget(categoryId);
    if (success) {
      toast.success('Budget berhasil dihapus!');
    } else {
      toast.error('Gagal menghapus budget');
    }
  };

  // Handle export
  const handleExport = () => {
    if (!settings) return;

    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `category-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Settings berhasil diexport!');
  };

  // Handle import
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        const confirmed = await confirm({
          title: "Import Settings?",
          description: "Import akan menimpa semua settings saat ini. Lanjutkan?",
          confirmText: "Import",
          cancelText: "Batal",
          variant: "destructive",
        });
        
        if (!confirmed) return;

        const success = await importSettings(imported);
        if (success) {
          toast.success('Settings berhasil diimport!');
        } else {
          toast.error('Gagal mengimport settings');
        }
      } catch (error) {
        toast.error('File tidak valid');
        console.error('Import error:', error);
      }
    };
    input.click();
  };

  // Handle reset all
  const handleResetAll = async () => {
    const confirmed = await confirm({
      title: "Reset Semua Settings?",
      description: "Reset semua settings ke default? Semua custom categories akan dihapus!",
      confirmText: "Reset Semua",
      cancelText: "Batal",
      variant: "destructive",
    });
    
    if (!confirmed) return;

    const success = await resetAllSettings();
    if (success) {
      toast.success('Settings berhasil direset!');
    } else {
      toast.error('Gagal mereset settings');
    }
  };

  const content = (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => setShowCreateDialog(true)}
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          <Plus className="size-4 mr-2" />
          Buat Kategori
        </Button>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="size-4 mr-2" />
          Export
        </Button>
        <Button onClick={handleImport} variant="outline" size="sm">
          <Upload className="size-4 mr-2" />
          Import
        </Button>
        <Button onClick={handleResetAll} variant="outline" size="sm">
          <RotateCcw className="size-4 mr-2" />
          Reset All
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          Loading categories...
        </div>
      )}

      {/* Category List */}
      {!isLoading && (
        <div className="space-y-2">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Drag Handle (future drag & drop) */}
                    <div className="cursor-grab text-muted-foreground">
                      <GripVertical className="size-4" />
                    </div>

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.emoji}</span>
                        <span className="font-medium truncate">{category.label}</span>
                        {category.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {category.color}
                        </span>
                        {category.budget?.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Budget: {formatCurrency(category.budget.limit)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingBudget(category)}
                        title="Set Budget"
                      >
                        <Settings className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingCategory(category)}
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {category.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(category.id)}
                          title="Delete"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                      {!category.isCustom && settings?.overrides[category.id as keyof typeof settings.overrides] && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleReset(category.id)}
                          title="Reset to Default"
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Tidak ada kategori. Buat kategori pertama Anda!
        </div>
      )}
    </div>
  );

  // Category Editor Dialog
  const editorDialog = editingCategory && (
    <CategoryEditor
      open={!!editingCategory}
      onOpenChange={(open) => !open && setEditingCategory(null)}
      category={editingCategory}
      onSave={(data) => handleEdit(editingCategory.id, editingCategory.isCustom, data)}
    />
  );

  // Budget Editor Dialog
  const budgetDialog = editingBudget && (
    <BudgetLimitEditor
      open={!!editingBudget}
      onOpenChange={(open) => !open && setEditingBudget(null)}
      category={editingBudget}
      onSave={(budget) => handleBudgetUpdate(editingBudget.id, budget)}
      onRemove={() => handleBudgetRemove(editingBudget.id)}
    />
  );

  // Create Dialog
  const createDialog = showCreateDialog && (
    <CategoryEditor
      open={showCreateDialog}
      onOpenChange={setShowCreateDialog}
      category={null}
      onSave={handleCreate}
    />
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Kelola Kategori</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
              {content}
            </div>
          </DrawerContent>
        </Drawer>
        {editorDialog}
        {budgetDialog}
        {createDialog}
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Kategori</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
      {editorDialog}
      {budgetDialog}
      {createDialog}
      <ConfirmDialog />
    </>
  );
}
