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
import { Form } from "@/components/ui/form";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProgramAction } from "@/actions/budget-actions";

const programSchema = z.object({
	code: z.string().min(1, "Code is required").max(10, "Code too long"),
	name: z.string().min(1, "Name is required"),
});

type ProgramFormData = z.infer<typeof programSchema>;

export function CreateProgramForm() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const form = useForm<ProgramFormData>({
		resolver: zodResolver(programSchema),
		defaultValues: {
			code: "",
			name: "",
		},
	});

	const onSubmit = async (data: ProgramFormData) => {
		setLoading(true);
		try {
			const result = await createProgramAction(data);

			if (result.success) {
				toast.success("Program created successfully");
				setOpen(false);
				form.reset();
				router.refresh();
			} else {
				toast.error(result.message || "Failed to create program");
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
					New Program
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-112.5">
				<DialogHeader>
					<DialogTitle>Create Program</DialogTitle>
				</DialogHeader>
				<Form onSubmit={form.handleSubmit(onSubmit)} form={form} className="space-y-4">
					<FormInput
						control={form.control}
						name="code"
						label="Program Code"
						placeholder="116"
						required
					/>

					<FormInput
						control={form.control}
						name="name"
						label="Program Name"
						placeholder="Programme de développement..."
						required
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create Program"}
						</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>
	);
}