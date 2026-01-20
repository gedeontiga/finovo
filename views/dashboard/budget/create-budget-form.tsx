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
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect, FormOption } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Form } from "@/components/ui/form";
import { IconPlus } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createBudgetLineAction } from "@/actions/budget-actions";

const budgetLineSchema = z.object({
  programId: z.string().min(1, "Program is required"),
  actionId: z.string().min(1, "Action is required"),
  activityId: z.string().min(1, "Activity is required"),
  adminUnitId: z.string().optional(),
  paragraphCode: z.string().min(6, "Paragraph code must be 6 digits").max(6),
  paragraphName: z.string().min(1, "Paragraph name is required"),
  ae: z.number().min(0, "AE must be positive"),
  cp: z.number().min(0, "CP must be positive"),
  engaged: z.number().min(0, "Engaged must be positive"),
});

type BudgetLineFormData = z.infer<typeof budgetLineSchema>;

interface CreateBudgetFormProps {
  programs: FormOption[];
  actions: Array<FormOption & { programId: string }>;
  activities: Array<FormOption & { actionId: string }>;
  adminUnits: FormOption[];
}

export function CreateBudgetForm({
  programs,
  actions,
  activities,
  adminUnits,
}: CreateBudgetFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<BudgetLineFormData>({
    resolver: zodResolver(budgetLineSchema),
    defaultValues: {
      programId: "",
      actionId: "",
      activityId: "",
      adminUnitId: "",
      paragraphCode: "",
      paragraphName: "",
      ae: 0,
      cp: 0,
      engaged: 0,
    },
  });

  const selectedProgram = form.watch("programId");
  const selectedAction = form.watch("actionId");

  // Filter actions by selected program
  const filteredActions = useMemo(() => {
    if (!selectedProgram) return [];
    return actions.filter((action) => action.programId === selectedProgram);
  }, [selectedProgram, actions]);

  // Filter activities by selected action
  const filteredActivities = useMemo(() => {
    if (!selectedAction) return [];
    return activities.filter((activity) => activity.actionId === selectedAction);
  }, [selectedAction, activities]);

  const onSubmit = async (data: BudgetLineFormData) => {
    setLoading(true);
    try {
      const result = await createBudgetLineAction({
        activityId: parseInt(data.activityId),
        adminUnitId: data.adminUnitId ? parseInt(data.adminUnitId) : undefined,
        paragraphCode: data.paragraphCode,
        paragraphName: data.paragraphName,
        ae: data.ae,
        cp: data.cp,
        engaged: data.engaged,
      });

      if (result.success) {
        toast.success("Budget line created successfully");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create budget line");
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
          New Budget Line
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Budget Line</DialogTitle>
        </DialogHeader>
        <Form onSubmit={form.handleSubmit(onSubmit)} form={form} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              placeholder="Select action"
              required
              disabled={!selectedProgram || filteredActions.length === 0}
            />

            <FormSelect
              control={form.control}
              name="activityId"
              label="Activity"
              options={filteredActivities}
              placeholder="Select activity"
              required
              disabled={!selectedAction || filteredActivities.length === 0}
              className="col-span-2"
            />

            <FormSelect
              control={form.control}
              name="adminUnitId"
              label="Administrative Unit"
              options={adminUnits}
              placeholder="Select unit (optional)"
              className="col-span-2"
            />

            <FormInput
              control={form.control}
              name="paragraphCode"
              label="Paragraph Code"
              placeholder="612024"
              required
            />

            <FormTextarea
              control={form.control}
              name="paragraphName"
              label="Paragraph Name"
              placeholder="Description of the budget line"
              required
              config={{ rows: 2 }}
              className="col-span-2"
            />

            <FormInput
              control={form.control}
              name="ae"
              type="number"
              label="AE (Authorized)"
              placeholder="0"
              required
            />

            <FormInput
              control={form.control}
              name="cp"
              type="number"
              label="CP (Credits)"
              placeholder="0"
              required
            />

            <FormInput
              control={form.control}
              name="engaged"
              type="number"
              label="Engaged"
              placeholder="0"
              required
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
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Budget Line"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}