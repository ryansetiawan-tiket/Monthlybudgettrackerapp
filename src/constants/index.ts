/**
 * Application constants
 */

// Currency
export const DEFAULT_EXCHANGE_RATE = 15000;
export const DEFAULT_DEDUCTION_PERCENTAGE = 10;

// Colors (matching globals.css design system)
export const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  danger: 'hsl(0, 84%, 60%)',
  info: 'hsl(199, 89%, 48%)',
} as const;

// Pocket System
export const POCKET_TYPES = {
  PRIMARY: 'primary',
  CUSTOM: 'custom',
} as const;

export const PRIMARY_POCKETS = {
  DAILY: 'pocket_daily',
  COLD_MONEY: 'pocket_cold_money',
} as const;

export const DEFAULT_POCKET_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
] as const;

// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds
export const RETRY_ATTEMPTS = 3;

// Limits
export const MAX_EXPENSE_ENTRIES = 10;
export const MAX_POCKETS = 20;
export const MIN_BUDGET_AMOUNT = 0;
export const MAX_BUDGET_AMOUNT = 999999999999;

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';
export const MONTH_FORMAT = 'YYYY-MM';

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LAST_MONTH: 'lastSelectedMonth',
  CACHE: 'budgetCache',
  EXCLUDE_STATE: 'excludeState',
} as const;

// API Routes (relative paths)
export const API_ROUTES = {
  BUDGET: '/budget',
  EXPENSES: '/expenses',
  INCOME: '/additional-incomes',
  POCKETS: '/pockets',
  TRANSFERS: '/transfers',
  TIMELINE: '/timeline',
  WISHLIST: '/wishlist',
  SIMULATION: '/wishlist/simulation',
} as const;

// Wishlist Priorities
export const WISHLIST_PRIORITIES = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

export const WISHLIST_PRIORITY_LABELS = {
  1: { label: '⭐ High', color: 'destructive' as const },
  2: { label: '🟡 Medium', color: 'default' as const },
  3: { label: '🔵 Low', color: 'secondary' as const },
} as const;

// Wishlist Status
export const WISHLIST_STATUS = {
  PLANNED: 'planned',
  SAVING: 'saving',
  READY: 'ready',
  PURCHASED: 'purchased',
} as const;

// Budget Health Thresholds
export const BUDGET_HEALTH = {
  HEALTHY: 50, // Below 50% usage
  WARNING: 80, // 50-80% usage
  DANGER: 80,  // Above 80% usage
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    BUDGET_SAVED: 'Budget berhasil disimpan!',
    EXPENSE_ADDED: 'Pengeluaran berhasil ditambahkan!',
    EXPENSE_DELETED: 'Pengeluaran berhasil dihapus!',
    INCOME_ADDED: 'Pemasukan tambahan berhasil ditambahkan!',
    INCOME_DELETED: 'Pemasukan berhasil dihapus!',
    POCKET_CREATED: 'Kantong baru berhasil dibuat!',
    POCKET_UPDATED: 'Kantong berhasil diupdate!',
    POCKET_ARCHIVED: 'Kantong berhasil diarsipkan!',
    TRANSFER_SUCCESS: 'Transfer berhasil!',
    WISHLIST_ADDED: 'Item berhasil ditambahkan ke wishlist!',
    WISHLIST_UPDATED: 'Item wishlist berhasil diupdate!',
    WISHLIST_DELETED: 'Item wishlist berhasil dihapus!',
  },
  ERROR: {
    GENERIC: 'Terjadi kesalahan. Silakan coba lagi.',
    NETWORK: 'Koneksi bermasalah. Cek internet Anda.',
    TIMEOUT: 'Request timeout. Silakan coba lagi.',
    INVALID_INPUT: 'Input tidak valid. Periksa kembali data Anda.',
    INSUFFICIENT_BALANCE: 'Saldo tidak mencukupi!',
  },
} as const;

// Expense Categories
export const DEFAULT_CATEGORIES = [
  { name: 'Makanan', icon: '🍔', color: '#f59e0b' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { name: 'Belanja', icon: '🛒', color: '#ec4899' },
  { name: 'Hiburan', icon: '🎮', color: '#8b5cf6' },
  { name: 'Tagihan', icon: '📄', color: '#ef4444' },
  { name: 'Kesehatan', icon: '💊', color: '#10b981' },
  { name: 'Pendidikan', icon: '📚', color: '#06b6d4' },
  { name: 'Lainnya', icon: '📦', color: '#6b7280' },
] as const;

// Animation Durations (in ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Debounce Delays (in ms)
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 200,
} as const;
