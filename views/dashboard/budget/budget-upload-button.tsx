"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // or your toast library
import { importBudgetAction } from "@/actions/import-budget";

export function BudgetUploader() {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await importBudgetAction(formData);
      if (result.success) {
        toast.success(`Successfully imported ${result.count} budget lines!`);
      } else {
        toast.error(result.success ? result.error : result.count);
      }
    } catch (error) {
      toast.error("Failed to process file");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        disabled={loading}
        className="w-full"
      />
      {loading && (
        <span className="text-sm text-muted-foreground">Processing...</span>
      )}
    </div>
  );
}
