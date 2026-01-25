"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EnhancedDataTable } from "@/components/ui/table/enhanced-data-table";
import { columns, type BudgetLineRow } from "./columns";
import {
  updateBudgetLineAction,
  deleteBudgetLineAction,
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EngagementUpdateDialog } from "@/views/dashboard/budget/update-budget-dialog";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

interface BudgetTableProps {
  data: BudgetLineRow[];
}

export function BudgetTable({ data }: BudgetTableProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BudgetLineRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [ae, setAe] = useState(0);
  const [cp, setCp] = useState(0);
  const [engaged, setEngaged] = useState(0);

  const handleRowClick = (row: BudgetLineRow) => {
    setSelectedRow(row);
    setAe(row.ae);
    setCp(row.cp);
    setEngaged(row.engaged);
    setEditDialogOpen(true);
  };

  const handleRowDelete = async (row: BudgetLineRow) => {
    setLoading(true);
    const result = await deleteBudgetLineAction(row.id);
    setLoading(false);

    if (result.success) {
      toast.success("Budget line deleted successfully");
      router.refresh();
    } else {
      toast.error(result.message || "Delete failed");
    }
  };

  const handleSave = async () => {
    if (!selectedRow) return;

    setLoading(true);
    const result = await updateBudgetLineAction(selectedRow.id, {
      ae: Number(ae),
      cp: Number(cp),
      engaged: Number(engaged),
    });
    setLoading(false);

    if (result.success) {
      toast.success("Budget line updated successfully");
      setEditDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "Update failed");
    }
  };

  const executionRate = ae > 0 ? (engaged / ae) * 100 : 0;
  const disponible = ae - engaged;

  return (
    <>
      <EnhancedDataTable
        data={data}
        columns={columns}
        onRowClick={handleRowClick}
        onRowDelete={handleRowDelete}
        searchKey="globalSearch"
        defaultPageSize={20}
        pageSizeOptions={[10, 20, 30, 50, 100]}
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
