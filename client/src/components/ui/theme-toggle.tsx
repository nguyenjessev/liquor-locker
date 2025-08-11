import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		// Simplified: just toggle between light and dark
		if (theme === "dark") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	return (
		<button
			onClick={toggleTheme}
			className={`relative inline-flex h-9 w-16 items-center rounded-full border-2 border-border transition-colors duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
				isDark ? "bg-secondary" : "bg-muted"
			}`}
			role="switch"
			aria-checked={isDark}
		>
			{/* Sliding thumb */}
			<div
				className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-md transition-all duration-300 ease-in-out ${
					isDark ? "translate-x-7" : "translate-x-1"
				}`}
			>
				{isDark ? (
					<Moon className="h-3.5 w-3.5 text-gray-300" />
				) : (
					<Sun className="h-3.5 w-3.5 text-gray-600" />
				)}
			</div>

			{/* Background icons for inactive state */}
			<div className="absolute inset-0 flex items-center justify-between px-2">
				<Sun
					className={`h-3 w-3 transition-opacity duration-300 ${
						isDark ? "opacity-50 text-gray-300" : "opacity-0"
					}`}
				/>
				<Moon
					className={`h-3 w-3 transition-opacity duration-300 ${
						isDark ? "opacity-0" : "opacity-50 text-gray-700"
					}`}
				/>
			</div>

			<span className="sr-only">Toggle theme</span>
		</button>
	);
}
