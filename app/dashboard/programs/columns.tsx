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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { IconEdit, IconTrash, IconArrowUp, IconArrowDown, IconSelector } from "@tabler/icons-react";
import { useState } from "react";
import {
	updateProgramAction,
	deleteProgramAction,
} from "@/actions/budget-actions";
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
	new Intl.NumberFormat("fr-FR", {
		style: "decimal",
		maximumFractionDigits: 0,
	}).format(value);

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
						<Label htmlFor="code" className="text-right">
							Code
						</Label>
						<Input
							id="code"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							Name
						</Label>
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
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-destructive hover:text-destructive"
				>
					<IconTrash className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Program</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete program {row.code} - {row.name}?
						This action cannot be undone and will fail if there are associated
						budget lines.
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

// Sortable Header Component
const SortableHeader = ({ column, children }: { column: any; children: React.ReactNode }) => {
	if (!column.getCanSort()) {
		return <div className="font-medium">{children}</div>;
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-accent/50"
			onClick={column.getToggleSortingHandler()}
		>
			<span className="font-medium">{children}</span>
			{column.getIsSorted() === 'asc' ? (
				<IconArrowUp className="ml-2 h-4 w-4" />
			) : column.getIsSorted() === 'desc' ? (
				<IconArrowDown className="ml-2 h-4 w-4" />
			) : (
				<IconSelector className="ml-2 h-4 w-4 opacity-50" />
			)}
		</Button>
	);
};

export const columns: ColumnDef<ProgramRow>[] = [
	{
		accessorKey: "code",
		header: ({ column }) => <SortableHeader column={column}>Code</SortableHeader>,
		cell: ({ row }) => {
			const code = row.original.code;
			return (
				<span className="font-bold font-mono text-primary min-w-15 block">
					{code}
				</span>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: "includesString",
		meta: {
			label: "Code",
		},
	},
	{
		accessorKey: "name",
		header: ({ column }) => <SortableHeader column={column}>Program Name</SortableHeader>,
		cell: ({ row }) => {
			const name = row.original.name;
			return (
				<span className="text-sm min-w-50 block" title={name}>
					{name}
				</span>
			);
		},
		enableSorting: true,
		enableColumnFilter: true,
		filterFn: "includesString",
		meta: {
			label: "Program Name",
		},
	},
	{
		accessorKey: "activitiesCount",
		header: ({ column }) => <SortableHeader column={column}>Budget Lines</SortableHeader>,
		cell: ({ row }) => {
			const count = row.original.activitiesCount;
			return (
				<span className="text-muted-foreground text-sm min-w-15 block text-center">
					{count}
				</span>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "Budget Lines",
		},
	},
	{
		accessorKey: "ae",
		header: ({ column }) => (
			<div className="text-right">
				<SortableHeader column={column}>Auth (AE)</SortableHeader>
			</div>
		),
		cell: ({ row }) => {
			const value = row.original.ae;
			return (
				<div className="text-right font-mono text-sm min-w-30 text-blue-600 dark:text-blue-400">
					{formatCurrency(value)}
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "Auth (AE)",
		},
	},
	{
		accessorKey: "engaged",
		header: ({ column }) => (
			<div className="text-right">
				<SortableHeader column={column}>Engaged</SortableHeader>
			</div>
		),
		cell: ({ row }) => {
			const value = row.original.engaged;
			return (
				<div className="text-right font-mono text-sm min-w-30 text-green-600 dark:text-green-400">
					{formatCurrency(value)}
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "Engaged",
		},
	},
	{
		accessorKey: "executionRate",
		header: ({ column }) => <SortableHeader column={column}>Execution</SortableHeader>,
		cell: ({ row }) => {
			const rate = row.original.executionRate;
			return (
				<div className="min-w-32">
					<div className="flex justify-between text-xs mb-1.5">
						<span className="font-semibold">{rate.toFixed(1)}%</span>
					</div>
					<Progress
						value={Math.min(rate, 100)}
						className={`h-2.5 ${rate > 90
							? "bg-red-100 dark:bg-red-950"
							: rate > 70
								? "bg-yellow-100 dark:bg-yellow-950"
								: "bg-green-100 dark:bg-green-950"
							}`}
					/>
				</div>
			);
		},
		enableSorting: true,
		enableColumnFilter: false,
		sortingFn: 'basic',
		meta: {
			label: "Execution",
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<div className="flex gap-1 justify-center">
				<EditProgramCell row={row.original} />
				<DeleteProgramCell row={row.original} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];