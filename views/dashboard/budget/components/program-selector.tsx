"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Program {
  value: string;
  label: string;
}

interface ProgramSelectorProps {
  programs: Program[];
  currentProgramId?: string;
}

export function ProgramSelector({
  programs,
  currentProgramId,
}: ProgramSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleProgramChange = (programId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("programId", programId);
    router.push(`/dashboard/budget?${params.toString()}`);
  };

  return (
    <Select value={currentProgramId} onValueChange={handleProgramChange}>
      <SelectTrigger id="program-select" className="w-full sm:w-70">
        <SelectValue placeholder="Select a program" />
      </SelectTrigger>
      <SelectContent>
        {programs.map((program) => (
          <SelectItem key={program.value} value={program.value}>
            {program.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
