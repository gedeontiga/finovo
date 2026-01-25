'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProgramEngagement {
	program: string;
	programName: string;
	ae: number;
	engaged: number;
	disponible: number;
	executionRate: number;
}

interface ProgramEngagementTableProps {
	data: Array<{
		program: string | null;
		programName: string | null;
		ae: number;
		engaged: number;
	}>;
}

export function ProgramEngagementTable({ data }: ProgramEngagementTableProps) {
	// Group data by program
	const programData = data.reduce((acc, item) => {
		const key = item.program || 'Unknown';
		if (!acc[key]) {
			acc[key] = {
				program: key,
				programName: item.programName || 'Unknown Program',
				ae: 0,
				engaged: 0,
				disponible: 0,
				executionRate: 0
			};
		}
		acc[key].ae += item.ae || 0;
		acc[key].engaged += item.engaged || 0;
		return acc;
	}, {} as Record<string, ProgramEngagement>);

	// Calculate disponible and execution rate
	const programs = Object.values(programData).map(p => ({
		...p,
		disponible: p.ae - p.engaged,
		executionRate: p.ae > 0 ? (p.engaged / p.ae) * 100 : 0
	})).sort((a, b) => b.ae - a.ae);

	const [selectedProgram, setSelectedProgram] = useState<string>(
		programs[0]?.program || ''
	);

	const currentProgram = programs.find(p => p.program === selectedProgram) || programs[0];

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('fr-FR', {
			style: 'decimal',
			maximumFractionDigits: 0,
		}).format(value);

	const formatCompact = (value: number) =>
		new Intl.NumberFormat('fr-FR', {
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits: 1
		}).format(value);

	return (
		<Card className='border-border/50'>
			<CardHeader>
				<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
					<div>
						<CardTitle>Program Engagement Details</CardTitle>
						<CardDescription>
							Select a program to view its budget execution
						</CardDescription>
					</div>
					<Select value={selectedProgram} onValueChange={setSelectedProgram}>
						<SelectTrigger className='w-full sm:w-70'>
							<SelectValue placeholder='Select program' />
						</SelectTrigger>
						<SelectContent>
							{programs.map((p) => (
								<SelectItem key={p.program} value={p.program}>
									<span className='font-mono font-semibold'>{p.program}</span>
									{' - '}
									<span className='text-xs'>{p.programName}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{currentProgram ? (
					<div className='space-y-6'>
						{/* Program Header */}
						<div className='bg-muted/30 p-4 rounded-lg border'>
							<div className='flex items-center justify-between mb-2'>
								<div>
									<span className='text-sm text-muted-foreground'>Program</span>
									<h3 className='text-xl font-bold font-mono'>{currentProgram.program}</h3>
								</div>
								<Badge
									variant={
										currentProgram.executionRate > 95 ? "destructive" :
											currentProgram.executionRate > 90 ? "default" :
												"secondary"
									}
									className='text-lg px-3 py-1'
								>
									{currentProgram.executionRate.toFixed(1)}%
								</Badge>
							</div>
							<p className='text-sm text-muted-foreground line-clamp-2'>
								{currentProgram.programName}
							</p>
						</div>

						{/* Budget Breakdown */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div className='bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900'>
								<div className='text-xs text-blue-600 dark:text-blue-400 font-medium mb-1'>
									Authorized (AE)
								</div>
								<div className='text-2xl font-bold text-blue-700 dark:text-blue-300 tabular-nums'>
									{formatCompact(currentProgram.ae)}
								</div>
								<div className='text-xs text-muted-foreground mt-1'>
									{formatCurrency(currentProgram.ae)} FCFA
								</div>
							</div>

							<div className='bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900'>
								<div className='text-xs text-green-600 dark:text-green-400 font-medium mb-1'>
									Engaged
								</div>
								<div className='text-2xl font-bold text-green-700 dark:text-green-300 tabular-nums'>
									{formatCompact(currentProgram.engaged)}
								</div>
								<div className='text-xs text-muted-foreground mt-1'>
									{formatCurrency(currentProgram.engaged)} FCFA
								</div>
							</div>

							<div className={cn(
								'p-4 rounded-lg border',
								currentProgram.disponible < 0
									? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
									: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
							)}>
								<div className={cn(
									'text-xs font-medium mb-1',
									currentProgram.disponible < 0
										? 'text-red-600 dark:text-red-400'
										: 'text-amber-600 dark:text-amber-400'
								)}>
									{currentProgram.disponible < 0 ? 'Overrun' : 'Available'}
								</div>
								<div className={cn(
									'text-2xl font-bold tabular-nums',
									currentProgram.disponible < 0
										? 'text-red-700 dark:text-red-300'
										: 'text-amber-700 dark:text-amber-300'
								)}>
									{formatCompact(Math.abs(currentProgram.disponible))}
								</div>
								<div className='text-xs text-muted-foreground mt-1'>
									{formatCurrency(Math.abs(currentProgram.disponible))} FCFA
								</div>
							</div>
						</div>

						{/* Execution Progress */}
						<div className='space-y-2'>
							<div className='flex items-center justify-between text-sm'>
								<span className='font-medium'>Execution Progress</span>
								<span className='text-muted-foreground'>
									{formatCurrency(currentProgram.engaged)} / {formatCurrency(currentProgram.ae)} FCFA
								</span>
							</div>
							<Progress
								value={Math.min(currentProgram.executionRate, 100)}
								className={cn(
									'h-3',
									currentProgram.executionRate > 95
										? '[&>div]:bg-red-600'
										: currentProgram.executionRate > 90
											? '[&>div]:bg-amber-500'
											: '[&>div]:bg-green-600'
								)}
							/>
							<p className='text-xs text-muted-foreground'>
								{currentProgram.executionRate > 95 && 'Critical: Over 95% executed'}
								{currentProgram.executionRate > 90 && currentProgram.executionRate <= 95 && 'Warning: Over 90% executed'}
								{currentProgram.executionRate <= 90 && 'On track'}
							</p>
						</div>
					</div>
				) : (
					<div className='text-center py-8 text-muted-foreground'>
						No program data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}