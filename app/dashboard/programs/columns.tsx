"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { updateProgramAction, deleteProgramAction } from "@/actions/budget-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 }).format(value);

export type ProgramRow = {
	id: number;
	code: string;
	name: string;
	ae: number;
	cp: number;
	engaged: number;
	executionRate: number;
	activitiesCount: number;
};

const EditProgramCell = ({ row }: { row: ProgramRow }) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const [code, setCode] = useState(row.code);
	const [name, setName] = useState(row.name);

	const handleSave = async () => {
		setLoading(true);
		const result = await updateProgramAction(row.id, { code, name });
		setLoading(false);

		if (result.success) {
			toast.success("Program updated successfully");
			setOpen(false);
			router.refresh();
		} else {
			toast.error(result.message || "Update failed");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<IconEdit className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Program</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="code" className="text-right">Code</Label>
						<Input
							id="code"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="col-span-3"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={handleSave} disabled={loading}>
						{loading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const DeleteProgramCell = ({ row }: { row: ProgramRow }) => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		setLoading(true);
		const result = await deleteProgramAction(row.id);
		setLoading(false);

		if (result.success) {
			toast.success("Program deleted successfully");
			router.refresh();
		} else {
			toast.error(result.message || "Delete failed");
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
					<IconTrash className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Program</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete program {row.code} - {row.name}?
						This action cannot be undone and will fail if there are associated budget lines.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} disabled={loading}>
						{loading ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export const columns: ColumnDef<ProgramRow>[] = [
	{
		accessorKey: "code",
		header: "Code",
		cell: ({ row }) => <span className="font-bold">{row.getValue("code")}</span>,
	},
	{
		accessorKey: "name",
		header: "Program Name",
	},
	{
		accessorKey: "activitiesCount",
		header: "Budget Lines",
		cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("activitiesCount")}</span>,
	},
	{
		accessorKey: "ae",
		header: () => <div className="text-right">Auth (AE)</div>,
		cell: ({ row }) => <div className="text-right font-mono">{formatCurrency(row.getValue("ae"))}</div>,
	},
	{
		accessorKey: "engaged",
		header: () => <div className="text-right">Engaged</div>,
		cell: ({ row }) => <div className="text-right font-mono">{formatCurrency(row.getValue("engaged"))}</div>,
	},
	{
		accessorKey: "executionRate",
		header: "Execution",
		cell: ({ row }) => {
			const rate = row.getValue("executionRate") as number;
			return (
				<div className="w-25">
					<div className="flex justify-between text-xs mb-1">
						<span>{rate.toFixed(1)}%</span>
					</div>
					<Progress value={rate} className={`h-2 ${rate > 90 ? "bg-red-100" : ""}`} />
				</div>
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<div className="flex gap-1">
				<EditProgramCell row={row.original} />
				<DeleteProgramCell row={row.original} />
			</div>
		),
	},
];