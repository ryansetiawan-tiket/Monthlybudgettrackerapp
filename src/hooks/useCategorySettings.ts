/**
 * Category Settings Hook
 * Phase 8: Manages custom categories, overrides, and budgets
 */

import { useState, useCallback, useEffect } from 'react';
import { CategorySettings, CustomCategory, CategoryOverride, CategoryBudget } from '../types';
import { getDefaultCategorySettings } from '../utils/categoryManager';
import { getBaseUrl, createAuthHeaders } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const CACHE_KEY = 'category_settings_cache';

export function useCategorySettings() {
  const [settings, setSettings] = useState<CategorySettings | null>(() => {
    // Try to load from localStorage cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error loading category settings from cache:', error);
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = getBaseUrl(projectId);

  /**
   * Load category settings from server
   */
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${baseUrl}/categories/settings`,
        {
          method: 'GET',
          headers: createAuthHeaders(publicAnonKey)
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No settings yet, use defaults
          const defaults = getDefaultCategorySettings();
          setSettings(defaults);
          localStorage.setItem(CACHE_KEY, JSON.stringify(defaults));
          return defaults;
        }
        throw new Error(`Failed to load category settings: ${response.statusText}`);
      }

      const data = await response.json();
      const loadedSettings = data.settings || getDefaultCategorySettings();
      
      setSettings(loadedSettings);
      localStorage.setItem(CACHE_KEY, JSON.stringify(loadedSettings));
      
      return loadedSettings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Error loading category settings:', err);
      
      // Fallback to defaults on error
      const defaults = getDefaultCategorySettings();
      setSettings(defaults);
      return defaults;
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, publicAnonKey]);

  /**
   * Save category settings to server
   */
  const saveSettings = useCallback(async (newSettings: CategorySettings) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${baseUrl}/categories/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...createAuthHeaders(publicAnonKey)
          },
          body: JSON.stringify({ settings: newSettings })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save category settings: ${response.statusText}`);
      }

      setSettings(newSettings);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newSettings));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      console.error('Error saving category settings:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, publicAnonKey]);

  /**
   * Create a custom category
   */
  const createCustomCategory = useCallback(async (data: {
    label: string;
    emoji: string;
    color: string;
  }) => {
    if (!settings) {
      const loaded = await loadSettings();
      if (!loaded) return false;
    }

    const currentSettings = settings || getDefaultCategorySettings();
    
    const id = `${data.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.random().toString(36).substring(2, 8)}`;
    
    const newCategory: CustomCategory = {
      id,
      emoji: data.emoji,
      label: data.label,
      color: data.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newSettings: CategorySettings = {
      ...currentSettings,
      custom: {
        ...currentSettings.custom,
        [id]: newCategory
      },
      order: [...currentSettings.order, id]
    };

    return await saveSettings(newSettings);
  }, [settings, loadSettings, saveSettings]);

  /**
   * Update a custom category
   */
  const updateCustomCategory = useCallback(async (
    id: string, 
    data: Partial<Pick<CustomCategory, 'label' | 'emoji' | 'color'>>
  ) => {
    if (!settings?.custom[id]) return false;

    const updatedCategory: CustomCategory = {
      ...settings.custom[id],
      ...data,
      updatedAt: new Date().toISOString()
    };

    const newSettings: CategorySettings = {
      ...settings,
      custom: {
        ...settings.custom,
        [id]: updatedCategory
      }
    };

    return await saveSettings(newSettings);
  }, [settings, saveSettings]);

  /**
   * Delete a custom category
   */
  const deleteCustomCategory = useCallback(async (id: string) => {
    if (!settings?.custom[id]) return false;

    const { [id]: deleted, ...remainingCustom } = settings.custom;
    const newOrder = settings.order.filter(catId => catId !== id);
    
    // Remove budget if exists
    const { [id]: deletedBudget, ...remainingBudgets } = settings.budgets;

    const newSettings: CategorySettings = {
      ...settings,
      custom: remainingCustom,
      order: newOrder,
      budgets: remainingBudgets
    };

    return await saveSettings(newSettings);
  }, [settings, saveSettings]);

  /**
   * Update default category override
   */
  const updateCategoryOverride = useCallback(async (
    category: string,
    override: CategoryOverride
  ) => {
    if (!settings) {
      const loaded = await loadSettings();
      if (!loaded) return false;
    }

    const currentSettings = settings || getDefaultCategorySettings();

    const newSettings: CategorySettings = {
      ...currentSettings,
      overrides: {
        ...currentSettings.overrides,
        [category]: {
          ...currentSettings.overrides[category as keyof typeof currentSettings.overrides],
          ...override
        }
      }
    };

    return await saveSettings(newSettings);
  }, [settings, loadSettings, saveSettings]);

  /**
   * Reset category override to default
   */
  const resetCategoryOverride = useCallback(async (category: string) => {
    if (!settings) return false;

    const { [category]: deleted, ...remainingOverrides } = settings.overrides;

    const newSettings: CategorySettings = {
      ...settings,
      overrides: remainingOverrides as CategorySettings['overrides']
    };

    return await saveSettings(newSettings);
  }, [settings, saveSettings]);

  /**
   * Set budget for a category
   */
  const setCategoryBudget = useCallback(async (
    categoryId: string,
    budget: CategoryBudget
  ) => {
    if (!settings) {
      const loaded = await loadSettings();
      if (!loaded) return false;
    }

    const currentSettings = settings || getDefaultCategorySettings();

    const newSettings: CategorySettings = {
      ...currentSettings,
      budgets: {
        ...currentSettings.budgets,
        [categoryId]: budget
      }
    };

    return await saveSettings(newSettings);
  }, [settings, loadSettings, saveSettings]);

  /**
   * Remove budget for a category
   */
  const removeCategoryBudget = useCallback(async (categoryId: string) => {
    if (!settings) return false;

    const { [categoryId]: deleted, ...remainingBudgets } = settings.budgets;

    const newSettings: CategorySettings = {
      ...settings,
      budgets: remainingBudgets
    };

    return await saveSettings(newSettings);
  }, [settings, saveSettings]);

  /**
   * Reorder categories
   */
  const reorderCategories = useCallback(async (newOrder: string[]) => {
    if (!settings) return false;

    const newSettings: CategorySettings = {
      ...settings,
      order: newOrder
    };

    return await saveSettings(newSettings);
  }, [settings, saveSettings]);

  /**
   * Import settings from JSON
   */
  const importSettings = useCallback(async (importedSettings: CategorySettings) => {
    return await saveSettings(importedSettings);
  }, [saveSettings]);

  /**
   * Reset all settings to defaults
   */
  const resetAllSettings = useCallback(async () => {
    const defaults = getDefaultCategorySettings();
    return await saveSettings(defaults);
  }, [saveSettings]);

  // Load settings on mount
  useEffect(() => {
    if (!settings) {
      loadSettings();
    }
  }, []);

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    saveSettings,
    createCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    updateCategoryOverride,
    resetCategoryOverride,
    setCategoryBudget,
    removeCategoryBudget,
    reorderCategories,
    importSettings,
    resetAllSettings
  };
}
