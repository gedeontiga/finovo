"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTableColumn } from "mantine-datatable";
import { MantineDataTable } from "@/components/ui/table/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  updateBudgetLineAction,
  deleteBudgetLineAction,
} from "@/actions/budget-actions";
import { EngagementUpdateDialog } from "@/views/dashboard/budget/update-budget-dialog";

export type BudgetLineRow = {
  id: number;
  program: string | null;
  programName: string | null;
  action: string | null;
  actionName: string | null;
  activity: string | null;
  activityName: string | null;
  taskName: string | null;
  adminCode: string | null;
  adminName: string | null;
  paragraph: string;
  paragraphName: string;
  ae: number;
  cp: number;
  engaged: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

const safeString = (
  value: string | null | undefined,
  fallback: string = "N/A",
): string => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

interface BudgetTableProps {
  data: BudgetLineRow[];
}

export function BudgetTable({ data }: BudgetTableProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BudgetLineRow | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRowClick = (record: BudgetLineRow) => {
    setSelectedRow(record);
    setEditDialogOpen(true);
  };

  const handleRowDelete = async (record: BudgetLineRow) => {
    setLoading(true);
    const result = await deleteBudgetLineAction(record.id);
    setLoading(false);

    if (result.success) {
      toast.success("Budget line deleted successfully");
      router.refresh();
    } else {
      toast.error(result.message || "Delete failed");
    }
  };

  const columns: DataTableColumn<BudgetLineRow>[] = [
    {
      accessor: "program",
      title: "Program",
      sortable: true,
      width: 200,
      render: (record) => (
        <div className="space-y-1 min-w-35 max-w-50">
          <span className="font-mono text-xs font-semibold block whitespace-nowrap">
            {safeString(record.program)}
          </span>
          <p
            className="text-xs text-muted-foreground line-clamp-2"
            title={safeString(record.programName)}
          >
            {safeString(record.programName)}
          </p>
        </div>
      ),
    },
    {
      accessor: "action",
      title: "Action",
      sortable: true,
      width: 200,
      render: (record) => (
        <div className="space-y-1 min-w-35 max-w-50">
          <span className="font-mono text-xs font-semibold block whitespace-nowrap">
            {safeString(record.action)}
          </span>
          <p
            className="text-xs text-muted-foreground line-clamp-2"
            title={safeString(record.actionName)}
          >
            {safeString(record.actionName)}
          </p>
        </div>
      ),
    },
    {
      accessor: "activity",
      title: "Activity",
      sortable: true,
      width: 220,
      render: (record) => (
        <div className="space-y-1 min-w-37.5 max-w-55">
          <span className="font-mono text-xs font-semibold block whitespace-nowrap">
            {safeString(record.activity)}
          </span>
          <p
            className="text-xs text-muted-foreground line-clamp-2"
            title={safeString(record.activityName)}
          >
            {safeString(record.activityName)}
          </p>
        </div>
      ),
    },
    {
      accessor: "adminCode",
      title: "Admin Unit",
      sortable: true,
      width: 180,
      render: (record) => (
        <div className="space-y-1 min-w-30 max-w-45">
          <span className="font-mono text-xs font-semibold block whitespace-nowrap">
            {safeString(record.adminCode)}
          </span>
          <p
            className="text-xs text-muted-foreground line-clamp-2"
            title={safeString(record.adminName)}
          >
            {safeString(record.adminName)}
          </p>
        </div>
      ),
    },
    {
      accessor: "paragraph",
      title: "Paragraph",
      sortable: true,
      width: 280,
      render: (record) => (
        <div className="space-y-1 min-w-50 max-w-70">
          <span className="font-mono text-xs font-bold text-primary block whitespace-nowrap">
            {safeString(record.paragraph)}
          </span>
          <p
            className="text-xs text-muted-foreground line-clamp-2"
            title={safeString(record.paragraphName)}
          >
            {safeString(record.paragraphName)}
          </p>
        </div>
      ),
    },
    {
      accessor: "ae",
      title: "AE",
      sortable: true,
      textAlign: "right",
      width: 120,
      render: (record) => (
        <div className="text-right font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap pr-4">
          {formatCurrency(record.ae)}
        </div>
      ),
    },
    {
      accessor: "engaged",
      title: "Engaged",
      sortable: true,
      textAlign: "right",
      width: 140,
      render: (record) => {
        const val = record.engaged || 0;
        const ae = record.ae || 0;
        const ratio = ae > 0 ? (val / ae) * 100 : 0;

        return (
          <div className="flex flex-col items-end space-y-1 min-w-30 pr-4">
            <span className="font-mono text-xs font-semibold whitespace-nowrap">
              {formatCurrency(val)}
            </span>
            <Badge
              variant={ratio > 95 ? "destructive" : "secondary"}
              className={cn(
                "text-[10px] px-1.5 py-0 whitespace-nowrap",
                ratio > 90 &&
                  ratio <= 95 &&
                  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
              )}
            >
              {ratio.toFixed(1)}%
            </Badge>
          </div>
        );
      },
    },
  ];

  // Define searchable keys for global search
  const searchKeys: (keyof BudgetLineRow)[] = [
    "program",
    "programName",
    "action",
    "actionName",
    "activity",
    "activityName",
    "adminCode",
    "adminName",
    "paragraph",
    "paragraphName",
  ];

  return (
    <>
      <MantineDataTable
        data={data}
        columns={columns}
        onRowClick={handleRowClick}
        onRowDelete={handleRowDelete}
        searchable={true}
        searchKeys={searchKeys}
        defaultPageSize={20}
        pageSizeOptions={[10, 20, 30, 50, 100]}
        minHeight={400}
      />

      {selectedRow && (
        <EngagementUpdateDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          budgetLine={selectedRow}
        />
      )}
    </>
  );
}
