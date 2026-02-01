"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect, FormOption } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Form } from "@/components/ui/form";
import { IconPlus, IconInfoCircle } from "@tabler/icons-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createBudgetLineAction } from "@/actions/budget-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";

const engagementSchema = z.object({
  programId: z.string().min(1, "Program is required"),
  actionId: z.string().min(1, "Action is required"),
  activityId: z.string().min(1, "Activity is required"),
  adminUnitId: z.string().optional(),
  description: z.string().min(3, "Description is required (min 3 characters)"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
});

type EngagementFormData = z.infer<typeof engagementSchema>;

interface CreateEngagementFormProps {
  programs: FormOption[];
  actions: Array<FormOption & { programId: string }>;
  activities: Array<FormOption & { actionId: string }>;
  adminUnits: FormOption[];
}

export function CreateEngagementForm({
  programs,
  actions,
  activities,
  adminUnits,
}: CreateEngagementFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<EngagementFormData>({
    resolver: zodResolver(engagementSchema),
    defaultValues: {
      programId: "",
      actionId: "",
      activityId: "",
      adminUnitId: "",
      description: "",
      amount: 0,
    },
  });

  const selectedProgram = form.watch("programId");
  const selectedAction = form.watch("actionId");
  const selectedActivity = form.watch("activityId");

  // Filter actions by selected program
  const filteredActions = useMemo(() => {
    if (!selectedProgram) return [];
    return actions.filter((action) => action.programId === selectedProgram);
  }, [selectedProgram, actions]);

  // Filter activities by selected action
  const filteredActivities = useMemo(() => {
    if (!selectedAction) return [];
    return activities.filter(
      (activity) => activity.actionId === selectedAction,
    );
  }, [selectedAction, activities]);

  // Auto-generate codes
  const generatedCodes = useMemo(() => {
    if (!selectedProgram || !selectedAction || !selectedActivity) {
      return { paragraphCode: "", taskCode: "" };
    }

    // Find the actual codes
    const program = programs.find((p) => p.value === selectedProgram);
    const action = actions.find((a) => a.value === selectedAction);
    const activity = activities.find((a) => a.value === selectedActivity);

    // Extract codes from labels (format: "CODE - Name")
    const programCode = program?.label.split(" - ")[0] || "000";
    const actionCode = action?.label.split(" - ")[0] || "00";
    const activityCode = activity?.label.split(" - ")[0] || "00";

    // Generate 6-digit paragraph code: [ProgramCode][ActionCode][ActivityCode]
    const paragraphCode = `${programCode}${actionCode}${activityCode}`
      .padEnd(6, "0")
      .substring(0, 6);

    // Generate task code (timestamp-based for uniqueness)
    const taskCode = `T${Date.now().toString().slice(-6)}`;

    return { paragraphCode, taskCode };
  }, [
    selectedProgram,
    selectedAction,
    selectedActivity,
    programs,
    actions,
    activities,
  ]);

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (
      selectedProgram &&
      !filteredActions.some((a) => a.value === selectedAction)
    ) {
      form.setValue("actionId", "");
      form.setValue("activityId", "");
    }
  }, [selectedProgram, filteredActions, selectedAction, form]);

  useEffect(() => {
    if (
      selectedAction &&
      !filteredActivities.some((a) => a.value === selectedActivity)
    ) {
      form.setValue("activityId", "");
    }
  }, [selectedAction, filteredActivities, selectedActivity, form]);

  const onSubmit = async (data: EngagementFormData) => {
    setLoading(true);
    try {
      const result = await createBudgetLineAction({
        taskId: parseInt(data.activityId), // This will need to be updated to create/find task
        adminUnitId: data.adminUnitId ? parseInt(data.adminUnitId) : undefined,
        paragraphCode: generatedCodes.paragraphCode,
        paragraphName: data.description,
        ae: data.amount,
        cp: data.amount,
        engaged: 0, // New engagement starts with 0 engaged
      });

      if (result.success) {
        toast.success("Engagement created successfully");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create engagement");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          New Engagement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Budget Engagement</DialogTitle>
          <DialogDescription>
            Select the budget structure and amount. Codes will be generated
            automatically.
          </DialogDescription>
        </DialogHeader>
        <Form
          onSubmit={form.handleSubmit(onSubmit)}
          form={form}
          className="space-y-4"
        >
          {/* Budget Structure Selection */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <IconInfoCircle className="h-4 w-4" />
              Budget Structure
            </h4>

            <FormSelect
              control={form.control}
              name="programId"
              label="Program"
              options={programs}
              placeholder="Select program"
              required
            />

            <FormSelect
              control={form.control}
              name="actionId"
              label="Action"
              options={filteredActions}
              placeholder={
                selectedProgram ? "Select action" : "Select program first"
              }
              required
              disabled={!selectedProgram || filteredActions.length === 0}
            />

            <FormSelect
              control={form.control}
              name="activityId"
              label="Activity"
              options={filteredActivities}
              placeholder={
                selectedAction ? "Select activity" : "Select action first"
              }
              required
              disabled={!selectedAction || filteredActivities.length === 0}
            />

            <FormSelect
              control={form.control}
              name="adminUnitId"
              label="Administrative Unit"
              options={adminUnits}
              placeholder="Select unit (optional)"
            />
          </div>

          {/* Auto-generated Codes Display */}
          {selectedActivity && (
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <IconInfoCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-xs space-y-1">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  Auto-generated Codes:
                </div>
                <div className="font-mono">
                  Paragraph Code:{" "}
                  <span className="font-bold">
                    {generatedCodes.paragraphCode}
                  </span>
                </div>
                <div className="text-muted-foreground text-[10px]">
                  Based on selected program, action, and activity
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Engagement Details */}
          <div className="space-y-4">
            <FormTextarea
              control={form.control}
              name="description"
              label="Engagement Description"
              placeholder="Describe the purpose of this budget engagement..."
              required
              config={{ rows: 3 }}
            />

            <FormInput
              control={form.control}
              name="amount"
              type="number"
              label="Authorized Amount (AE)"
              placeholder="0"
              required
              step="0.01"
              min="0"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedActivity}>
              {loading ? "Creating..." : "Create Engagement"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
