/**
 * Category Editor Component
 * Phase 8: Edit or create category (emoji, label, color)
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from './ui/drawer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useIsMobile } from './ui/use-mobile';
import { CategoryConfig } from '../types';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { useDialogRegistration } from '../hooks/useDialogRegistration';
import { DialogPriority } from '../constants';

interface CategoryEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryConfig | null; // null = create mode
  onSave: (data: { label: string; emoji: string; color: string }) => void;
}

export function CategoryEditor({ open, onOpenChange, category, onSave }: CategoryEditorProps) {
  const isMobile = useIsMobile();
  const isEditing = !!category;

  // Register dialog for back button handling
  useDialogRegistration(
    open,
    onOpenChange,
    DialogPriority.MEDIUM,
    `category-editor-${category?.id || 'new'}`
  );

  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [errors, setErrors] = useState<{ label?: string; emoji?: string; color?: string }>({});

  // Load category data when editing
  useEffect(() => {
    if (category) {
      setLabel(category.label);
      setEmoji(category.emoji);
      setColor(category.color);
    } else {
      setLabel('');
      setEmoji('');
      setColor('#3B82F6');
    }
    setErrors({});
  }, [category, open]);

  // Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!label || label.trim().length === 0) {
      newErrors.label = 'Label is required';
    } else if (label.length > 50) {
      newErrors.label = 'Label must be less than 50 characters';
    }

    if (!emoji || emoji.trim().length === 0) {
      newErrors.emoji = 'Emoji is required';
    }

    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      newErrors.color = 'Valid hex color required (e.g., #FF5733)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) return;

    onSave({
      label: label.trim(),
      emoji,
      color: color.toUpperCase()
    });
  };

  // Predefined colors
  const predefinedColors = [
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#F59E0B', // amber
    '#EF4444', // red
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#6B7280', // gray
    '#F43F5E', // rose
  ];

  const content = (
    <div className="space-y-4">
      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="label">Label *</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Gaming, Photography"
          maxLength={50}
        />
        {errors.label && (
          <p className="text-sm text-destructive">{errors.label}</p>
        )}
      </div>

      {/* Emoji */}
      <div className="space-y-2">
        <Label>Emoji *</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-16 h-16 text-3xl"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            {emoji || <Smile className="size-6" />}
          </Button>
          <div className="flex-1">
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Select or paste emoji"
              maxLength={2}
            />
          </div>
        </div>
        {errors.emoji && (
          <p className="text-sm text-destructive">{errors.emoji}</p>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="border rounded-lg p-2 bg-background">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setEmoji(emojiData.emoji);
                setShowEmojiPicker(false);
              }}
              theme={Theme.AUTO}
              width="100%"
              height={350}
              searchPlaceHolder="Search emoji..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label htmlFor="color">Color *</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#3B82F6"
            maxLength={7}
            className="flex-1"
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 rounded border border-border cursor-pointer"
          />
        </div>
        {errors.color && (
          <p className="text-sm text-destructive">{errors.color}</p>
        )}

        {/* Predefined Colors */}
        <div className="flex flex-wrap gap-2">
          {predefinedColors.map((preColor) => (
            <button
              key={preColor}
              type="button"
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                color.toUpperCase() === preColor ? 'border-primary ring-2 ring-primary' : 'border-border'
              }`}
              style={{ backgroundColor: preColor }}
              onClick={() => setColor(preColor)}
              title={preColor}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 border rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji || '❓'}</span>
          <div>
            <p className="font-medium">{label || 'Category Name'}</p>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{color}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        {isEditing ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
            {content}
          </div>
          <DrawerFooter>
            {footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
        </DialogHeader>
        {content}
        <DialogFooter>
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
