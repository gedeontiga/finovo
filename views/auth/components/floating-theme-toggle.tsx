'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

export function FloatingThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const handleThemeToggle = React.useCallback(
		(e?: React.MouseEvent) => {
			const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
			const root = document.documentElement;

			if (!document.startViewTransition) {
				setTheme(newMode);
				return;
			}

			// Set coordinates from the click event
			if (e) {
				root.style.setProperty('--x', `${e.clientX}px`);
				root.style.setProperty('--y', `${e.clientY}px`);
			}

			document.startViewTransition(() => {
				setTheme(newMode);
			});
		},
		[resolvedTheme, setTheme]
	);

	if (!mounted) {
		return null;
	}

	return (
		<button
			onClick={handleThemeToggle}
			className="fixed top-6 right-6 z-50 group"
			aria-label="Toggle theme"
		>
			{/* Main button - minimalist design */}
			<div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:border-primary/50">
				{/* Icon with smooth transition */}
				<div className="relative w-8 h-8">
					<Sun
						className="absolute inset-0 w-8 h-8 text-amber-500 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
					/>
					<Moon
						className="absolute inset-0 w-8 h-8 text-blue-500 transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100"
					/>
				</div>
			</div>
		</button>
	);
}