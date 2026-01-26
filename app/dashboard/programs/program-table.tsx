"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTableColumn } from "mantine-datatable";
import { MantineDataTable } from "@/components/ui/table/data-table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  updateProgramAction,
  deleteProgramAction,
} from "@/actions/budget-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export type ProgramRow = {
  id: number;
  code: string;
  name: string;
  ae: number;
  cp: number;
  engaged: number;
  executionRate: number;
  disponible: number;
  activitiesCount: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);

interface ProgramsTableProps {
  data: ProgramRow[];
}

export function ProgramsTable({ data }: ProgramsTableProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ProgramRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleRowClick = (record: ProgramRow) => {
    setSelectedRow(record);
    setCode(record.code);
    setName(record.name);
    setEditDialogOpen(true);
  };

  const handleRowDelete = async (record: ProgramRow) => {
    setLoading(true);
    const result = await deleteProgramAction(record.id);
    setLoading(false);

    if (result.success) {
      toast.success("Program deleted successfully");
      router.refresh();
    } else {
      toast.error(result.message || "Delete failed");
    }
  };

  const handleSave = async () => {
    if (!selectedRow) return;

    setLoading(true);
    const result = await updateProgramAction(selectedRow.id, { code, name });
    setLoading(false);

    if (result.success) {
      toast.success("Program updated successfully");
      setEditDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "Update failed");
    }
  };

  const columns: DataTableColumn<ProgramRow>[] = [
    {
      accessor: "code",
      title: "Code",
      sortable: true,
      width: 120,
      render: (record) => (
        <span className="font-bold font-mono text-primary whitespace-nowrap">
          {record.code || "-"}
        </span>
      ),
    },
    {
      accessor: "name",
      title: "Program Name",
      sortable: true,
      width: 300,
      render: (record) => (
        <span className="text-sm line-clamp-2" title={record.name}>
          {record.name || "-"}
        </span>
      ),
    },
    {
      accessor: "activitiesCount",
      title: "Lines",
      sortable: true,
      textAlign: "center",
      width: 100,
      render: (record) => (
        <span className="text-muted-foreground text-sm font-semibold whitespace-nowrap">
          {record.activitiesCount || 0}
        </span>
      ),
    },
    {
      accessor: "ae",
      title: "Auth (AE)",
      sortable: true,
      textAlign: "right",
      width: 150,
      render: (record) => (
        <div className="text-right font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap pr-4">
          {formatCurrency(record.ae || 0)}
        </div>
      ),
    },
    {
      accessor: "cp",
      title: "CP",
      sortable: true,
      textAlign: "right",
      width: 150,
      render: (record) => (
        <div className="text-right font-mono text-sm text-purple-600 dark:text-purple-400 whitespace-nowrap pr-4">
          {formatCurrency(record.cp || 0)}
        </div>
      ),
    },
    {
      accessor: "engaged",
      title: "Engaged",
      sortable: true,
      textAlign: "right",
      width: 150,
      render: (record) => (
        <div className="text-right font-mono text-sm text-green-600 dark:text-green-400 font-semibold whitespace-nowrap pr-4">
          {formatCurrency(record.engaged || 0)}
        </div>
      ),
    },
    {
      accessor: "executionRate",
      title: "Execution",
      sortable: true,
      width: 200,
      render: (record) => {
        const rate = record.executionRate || 0;
        const ae = record.ae || 0;
        const engaged = record.engaged || 0;
        const disponible = ae - engaged;

        return (
          <div className="min-w-37.5 max-w-50 space-y-2 pr-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span
                className={cn(
                  "font-semibold whitespace-nowrap",
                  rate > 95
                    ? "text-red-600 dark:text-red-400"
                    : rate > 90
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-green-600 dark:text-green-400",
                )}
              >
                {rate.toFixed(1)}%
              </span>
              <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                Disp: {formatCurrency(disponible)}
              </span>
            </div>
            <Progress
              value={Math.min(rate, 100)}
              className={cn(
                "h-2",
                rate > 95
                  ? "[&>div]:bg-red-600"
                  : rate > 90
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-green-600",
              )}
            />
          </div>
        );
      },
    },
  ];

  // Define searchable keys for global search
  const searchKeys: (keyof ProgramRow)[] = ["code", "name"];

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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Edit Program</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="code" className="sm:text-right font-semibold">
                  Code
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="sm:col-span-3 font-mono"
                  placeholder="e.g., P001"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="name" className="sm:text-right font-semibold">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="sm:col-span-3"
                  placeholder="Program name"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 pt-2 border-t mt-auto">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
