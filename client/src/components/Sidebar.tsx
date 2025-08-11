import { BottleWine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
	activeSection: string;
	onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
	const sections = [
		{
			id: "bottles",
			label: "Bottles",
			icon: BottleWine,
		},
		// Future sections will go here:
		// { id: "seasonings", label: "Seasonings", icon: Leaf },
		// { id: "garnishes", label: "Garnishes", icon: Cherry },
	];

	return (
		<Card className="h-full w-64 p-4 rounded-none">
			<div className="mb-6">
				<h2 className="text-lg font-semibold">Liquor Locker</h2>
			</div>

			<nav className="space-y-2">
				{sections.map((section) => {
					const Icon = section.icon;
					const isActive = activeSection === section.id;

					return (
						<Button
							key={section.id}
							variant={isActive ? "default" : "ghost"}
							className={`w-full justify-start gap-3 ${
								isActive ? "" : "hover:bg-accent hover:text-accent-foreground"
							}`}
							onClick={() => onSectionChange(section.id)}
						>
							<Icon className="h-4 w-4" />
							{section.label}
						</Button>
					);
				})}
			</nav>

			{/* Future: Add user profile or settings at bottom */}
			<div className="mt-auto pt-8">
				<div className="flex items-center justify-between">
					<div className="text-xs text-muted-foreground">
						Liquor Locker v1.0
					</div>
					<ThemeToggle />
				</div>
			</div>
		</Card>
	);
}
