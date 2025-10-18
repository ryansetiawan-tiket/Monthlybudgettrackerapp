# Monthly Budget Tracker - Perencanaan Awal

## Deskripsi Aplikasi
Aplikasi tracking budget bulanan yang memungkinkan user untuk mengelola pemasukan dan pengeluaran per bulan, dengan data tersimpan di Supabase.

## Fitur Utama

### 1. Input Budget
- **Budget Awal**: Input nominal budget awal untuk bulan berjalan
- **Carryover Bulan Sebelumnya**: Optional, sisa budget dari bulan sebelumnya
- **Additional Income**: Pemasukan tambahan di bulan berjalan

### 2. Manajemen Pengeluaran
- Bisa menambah item pengeluaran
- Setiap pengeluaran punya: nama item, nominal, tanggal (optional)
- Pengeluaran dikurangi dari total (budget awal + carryover + additional income)

### 3. Summary & Hasil
- Total Pemasukan = Budget Awal + Carryover + Additional Income
- Total Pengeluaran = Sum semua expenses
- **Sisa Budget** = Total Pemasukan - Total Pengeluaran

### 4. Catatan
- Field untuk notes/catatan bebas

### 5. Data Per Bulan
- User bisa memilih bulan/tahun yang ingin dilihat
- Setiap bulan punya data budget sendiri

## Struktur Database (Supabase)

### Table: `budgets`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference ke user (optional untuk MVP) |
| month | integer | Bulan (1-12) |
| year | integer | Tahun |
| initial_budget | decimal | Budget awal |
| carryover | decimal | Sisa bulan sebelumnya |
| additional_income | decimal | Pemasukan tambahan |
| notes | text | Catatan |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu update |

### Table: `expenses`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| budget_id | uuid | Foreign key ke budgets |
| name | text | Nama pengeluaran |
| amount | decimal | Nominal |
| date | date | Tanggal (optional) |
| created_at | timestamp | Waktu dibuat |

## Komponen React

### 1. `/App.tsx`
- Main component
- Handle routing/navigation bulan
- Container utama

### 2. `/components/BudgetOverview.tsx`
- Menampilkan summary total pemasukan, pengeluaran, sisa
- Card-based layout

### 3. `/components/BudgetForm.tsx`
- Form input untuk budget awal, carryover, additional income
- Form untuk notes

### 4. `/components/ExpenseList.tsx`
- Menampilkan list semua pengeluaran
- Bisa delete expense
- Menampilkan total

### 5. `/components/AddExpenseForm.tsx`
- Form untuk menambah pengeluaran baru
- Input: nama, nominal, tanggal (optional)

### 6. `/components/MonthSelector.tsx`
- Selector untuk memilih bulan dan tahun
- Navigation prev/next month

## User Flow

1. User membuka app → tampil bulan saat ini
2. User input budget awal, carryover (jika ada), additional income
3. User menambah pengeluaran satu per satu
4. App otomatis menghitung dan menampilkan sisa budget
5. User bisa tambah catatan
6. User bisa switch ke bulan lain untuk melihat/edit data bulan tersebut

## Tech Stack
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Card, Input, Button, Select, Dialog, dll)
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks (useState, useEffect)
- **Form Handling**: React Hook Form (optional)

## Prioritas Development

### Phase 1 (MVP)
- Setup Supabase tables
- Month selector
- Budget form (input budget awal, carryover, additional income)
- Add expense functionality
- Display expenses list
- Calculate dan display summary
- Notes field

### Phase 2 (Future Iterations)
- Edit expense
- Categories untuk expenses
- Charts/visualizations
- Export to CSV/PDF
- Multi-user support with authentication
- Recurring expenses
- Budget goals & alerts

## UI/UX Notes
- Clean, minimalist design
- Mobile responsive
- Use Card components untuk sections
- Color coding: green untuk income, red untuk expenses
- Toast notifications untuk success/error actions
