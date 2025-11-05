import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const MonthSelector = memo(function MonthSelector({ selectedMonth, selectedYear, onMonthChange }: MonthSelectorProps) {
  const handlePrevious = () => {
    if (selectedMonth === 1) {
      onMonthChange(12, selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 12) {
      onMonthChange(1, selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1, selectedYear);
    }
  };

  const handleMonthSelect = (value: string) => {
    onMonthChange(parseInt(value), selectedYear);
  };

  const handleYearSelect = (value: string) => {
    onMonthChange(selectedMonth, parseInt(value));
  };

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex items-center justify-center gap-3 px-4">
      <Button variant="outline" size="icon" onClick={handlePrevious}>
        <ChevronLeft className="size-4" />
      </Button>
      <div className="flex items-center gap-2">
        <Select value={selectedMonth.toString()} onValueChange={handleMonthSelect}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((month, index) => (
              <SelectItem key={index + 1} value={(index + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear.toString()} onValueChange={handleYearSelect}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="icon" onClick={handleNext}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
});