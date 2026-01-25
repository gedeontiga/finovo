"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateEngagementAction } from "@/actions/engagement-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

interface EngagementUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetLine: {
    id: number;
    program: string | null;
    programName: string | null;
    action: string | null;
    actionName: string | null;
    activity: string | null;
    activityName: string | null;
    paragraph: string;
    paragraphName: string;
    ae: number;
    cp: number;
    engaged: number;
  };
}

export function EngagementUpdateDialog({
  open,
  onOpenChange,
  budgetLine,
}: EngagementUpdateDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [engaged, setEngaged] = useState(budgetLine?.engaged ?? 0);

  const executionRate =
    budgetLine && budgetLine.ae > 0 ? (engaged / budgetLine.ae) * 100 : 0;
  const disponible = budgetLine ? budgetLine.ae - engaged : 0;
  const isOverBudget = budgetLine ? engaged > budgetLine.ae : false;
  const isWarning = executionRate > 90 && executionRate <= 95;
  const isCritical = executionRate > 95;

  const handleSave = async () => {
    if (!budgetLine) {
      toast.error("Budget line not found");
      return;
    }

    if (engaged > budgetLine.ae) {
      toast.error(
        `Engagement cannot exceed authorized amount of ${formatCurrency(budgetLine.ae)} FCFA`,
      );
      return;
    }

    setLoading(true);
    const result = await updateEngagementAction({
      id: budgetLine.id,
      engaged: Number(engaged),
    });
    setLoading(false);

    if (result.success) {
      toast.success("Engagement updated successfully");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.message || "Update failed");
    }
  };

  const handleReset = () => {
    if (budgetLine) {
      setEngaged(budgetLine.engaged);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Update Engagement</DialogTitle>
          <DialogDescription>
            Modify the engaged amount for this budget line
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6">
          <div className="grid gap-6 py-4">
            {/* Budget Line Info */}
            <div className="space-y-3 rounded-lg bg-muted/50 p-4 border text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                <Label className="font-semibold text-muted-foreground">
                  Program
                </Label>
                <div className="sm:col-span-3">
                  <span className="font-mono font-semibold mr-2">
                    {budgetLine.program || "N/A"}
                  </span>
                  <span className="text-xs">
                    {budgetLine.programName || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                <Label className="font-semibold text-muted-foreground">
                  Paragraph
                </Label>
                <div className="sm:col-span-3">
                  <span className="font-mono font-bold text-primary mr-2">
                    {budgetLine.paragraph}
                  </span>
                  <span className="text-xs">{budgetLine.paragraphName}</span>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Authorized
                </div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                  {formatCurrency(budgetLine.ae)}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                  Current
                </div>
                <div className="text-lg font-bold text-green-700 dark:text-green-300 tabular-nums">
                  {formatCurrency(budgetLine.engaged)}
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  isOverBudget
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                    : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    isOverBudget
                      ? "text-red-600 dark:text-red-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  Available
                </div>
                <div
                  className={`text-lg font-bold tabular-nums ${
                    isOverBudget
                      ? "text-red-700 dark:text-red-300"
                      : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {formatCurrency(Math.max(0, disponible))}
                </div>
              </div>
            </div>

            {/* Engagement Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="engaged" className="text-base font-semibold">
                  New Engagement Amount
                </Label>
                <Input
                  id="engaged"
                  type="number"
                  value={engaged}
                  onChange={(e) => setEngaged(Number(e.target.value))}
                  className="font-mono text-lg h-12"
                  min="0"
                  max={budgetLine.ae}
                  step="0.01"
                />
              </div>

              {/* Real-time Validation Alerts */}
              {isOverBudget && (
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Engagement exceeds authorized amount by{" "}
                    <strong>{formatCurrency(Math.abs(disponible))} FCFA</strong>
                  </AlertDescription>
                </Alert>
              )}

              {isCritical && !isOverBudget && (
                <Alert className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
                  <IconAlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    Critical: {executionRate.toFixed(1)}% execution rate
                  </AlertDescription>
                </Alert>
              )}

              {isWarning && !isCritical && (
                <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
                  <IconAlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    Warning: {executionRate.toFixed(1)}% execution rate
                  </AlertDescription>
                </Alert>
              )}

              {!isOverBudget &&
                !isWarning &&
                !isCritical &&
                engaged !== budgetLine.engaged && (
                  <Alert className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
                    <IconCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      Valid engagement amount
                    </AlertDescription>
                  </Alert>
                )}

              {/* Execution Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Execution Progress</span>
                  <Badge
                    variant={
                      isCritical
                        ? "destructive"
                        : isWarning
                          ? "default"
                          : "secondary"
                    }
                  >
                    {executionRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress
                  value={Math.min(executionRate, 100)}
                  className={`h-3 ${
                    isCritical
                      ? "[&>div]:bg-red-600"
                      : isWarning
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-green-600"
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(engaged)} FCFA engaged</span>
                  <span>{formatCurrency(budgetLine.ae)} FCFA total</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-2 border-t mt-auto gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || isOverBudget || engaged === budgetLine.engaged}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
