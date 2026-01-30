"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { importBudgetAction } from "@/actions/import-budget";
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import { Upload, Loader2 } from "lucide-react"; // Import Icons

export function BudgetUploader() {
  const [loading, setLoading] = useState(false);
  // 1. Create a ref to access the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        toast.error(result.error || "Unknown error occurred");
      }
    } catch (error) {
      toast.error("Failed to process file");
      console.error(error);
    } finally {
      setLoading(false);
      // Optional: Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 2. Function to simulate a click on the hidden input
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      {/* 3. The Hidden Input */}
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        style={{ display: "none" }}
      />

      {/* 4. The Icon Button Trigger */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleButtonClick}
        disabled={loading}
        title="Upload Budget" // Accessibility tooltip
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span className="sr-only">Upload Budget</span>
      </Button>
    </div>
  );
}
