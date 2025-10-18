import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowDownToLine } from "lucide-react";

interface BudgetFormProps {
  initialBudget: number;
  carryover: number;
  notes: string;
  onBudgetChange: (field: string, value: string | number) => void;
  onSave: () => void;
  isSaving: boolean;
  suggestedCarryover: number | null;
  isLoadingCarryover: boolean;
}

export function BudgetForm({
  initialBudget,
  carryover,
  notes,
  onBudgetChange,
  onSave,
  isSaving,
  suggestedCarryover,
  isLoadingCarryover,
}: BudgetFormProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAutoFill = () => {
    if (suggestedCarryover !== null) {
      onBudgetChange("carryover", suggestedCarryover);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Bulanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="initialBudget">Budget Awal</Label>
          <Input
            id="initialBudget"
            type="number"
            value={initialBudget || ""}
            onChange={(e) => onBudgetChange("initialBudget", e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="carryover">Carryover Bulan Sebelumnya (Opsional)</Label>
            {suggestedCarryover !== null && suggestedCarryover !== 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAutoFill}
                disabled={isLoadingCarryover}
                className="h-auto py-1 px-2"
              >
                <ArrowDownToLine className="size-3 mr-1" />
                Auto-fill
              </Button>
            )}
          </div>
          <Input
            id="carryover"
            type="number"
            value={carryover || ""}
            onChange={(e) => onBudgetChange("carryover", e.target.value)}
            placeholder="0"
          />
          {suggestedCarryover !== null && (
            <p className="text-xs text-muted-foreground">
              {isLoadingCarryover ? (
                "Memuat sisa bulan lalu..."
              ) : (
                <>
                  Sisa bulan lalu: {" "}
                  <span className={suggestedCarryover >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(suggestedCarryover)}
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onBudgetChange("notes", e.target.value)}
            placeholder="Tulis catatan untuk bulan ini..."
            rows={3}
          />
        </div>

        <Button onClick={onSave} disabled={isSaving} className="w-full">
          {isSaving ? "Menyimpan..." : "Simpan Budget"}
        </Button>
      </CardContent>
    </Card>
  );
}