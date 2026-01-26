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
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-2xl p-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh]">
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle className="text-primary text-lg sm:text-xl">
            Update Engagement
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Modify the engaged amount for this budget line
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(95vh-12rem)] sm:max-h-[70vh] px-4 sm:px-6">
          <div className="grid gap-4 sm:gap-6 py-3 sm:py-4">
            {/* Budget Line Info */}
            <div className="space-y-2 sm:space-y-3 rounded-lg bg-muted/50 p-3 sm:p-4 border text-xs sm:text-sm">
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <Label className="font-semibold text-muted-foreground text-xs">
                    Program
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="font-mono text-secondary-foreground font-semibold text-xs sm:text-sm">
                      {budgetLine.program || "N/A"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {budgetLine.programName || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="font-semibold text-muted-foreground text-xs">
                    Paragraph
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="font-mono font-bold text-secondary-foreground text-xs sm:text-sm">
                      {budgetLine.paragraph}
                    </span>
                    <span className="text-xs text-muted-foreground wrap-break-word">
                      {budgetLine.paragraphName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-2 sm:p-3 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5 sm:mb-1">
                  Authorized
                </div>
                <div className="text-sm sm:text-lg font-bold text-blue-700 dark:text-blue-300 tabular-nums break-all">
                  {formatCurrency(budgetLine.ae)}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-2 sm:p-3 rounded-lg border border-green-200 dark:border-green-900">
                <div className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium mb-0.5 sm:mb-1">
                  Current
                </div>
                <div className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-300 tabular-nums break-all">
                  {formatCurrency(budgetLine.engaged)}
                </div>
              </div>

              <div
                className={`p-2 sm:p-3 rounded-lg border ${
                  isOverBudget
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                    : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                }`}
              >
                <div
                  className={`text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 ${
                    isOverBudget
                      ? "text-red-600 dark:text-red-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  Available
                </div>
                <div
                  className={`text-sm sm:text-lg font-bold tabular-nums break-all ${
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
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="engaged"
                  className="text-sm sm:text-base text-primary-foreground font-semibold"
                >
                  New Engagement Amount
                </Label>
                <Input
                  id="engaged"
                  type="number"
                  value={engaged}
                  onChange={(e) => setEngaged(Number(e.target.value))}
                  className="font-mono text-secondary-foreground text-base sm:text-lg h-10 sm:h-12"
                  min="0"
                  max={budgetLine.ae}
                  step="0.01"
                />
              </div>

              {/* Real-time Validation Alerts */}
              {isOverBudget && (
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    Engagement exceeds authorized amount by{" "}
                    <strong className="break-all">
                      {formatCurrency(Math.abs(disponible))} FCFA
                    </strong>
                  </AlertDescription>
                </Alert>
              )}

              {isCritical && !isOverBudget && (
                <Alert className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
                  <IconAlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300 text-xs sm:text-sm">
                    Critical: {executionRate.toFixed(1)}% execution rate
                  </AlertDescription>
                </Alert>
              )}

              {isWarning && !isCritical && (
                <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
                  <IconAlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
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
                    <AlertDescription className="text-green-700 dark:text-green-300 text-xs sm:text-sm">
                      Valid engagement amount
                    </AlertDescription>
                  </Alert>
                )}

              {/* Execution Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-secondary-foreground">
                    Execution Progress
                  </span>
                  <Badge
                    variant={
                      isCritical
                        ? "destructive"
                        : isWarning
                          ? "default"
                          : "secondary"
                    }
                    className="text-[10px] sm:text-xs"
                  >
                    {executionRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress
                  value={Math.min(executionRate, 100)}
                  className={`h-2 sm:h-3 ${
                    isCritical
                      ? "[&>div]:bg-red-600"
                      : isWarning
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-green-600"
                  }`}
                />
                <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="break-all">
                    {formatCurrency(engaged)} FCFA engaged
                  </span>
                  <span className="break-all">
                    {formatCurrency(budgetLine.ae)} FCFA total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-3 sm:p-6 text-secondary-foreground pt-2 border-t mt-auto gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || isOverBudget || engaged === budgetLine.engaged}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
