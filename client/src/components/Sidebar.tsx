import { BottleWine, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SidebarProps {
	activeSection: string;
	onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
	const mainSections = [
		{
			id: "bottles",
			label: "Bottles",
			icon: BottleWine,
		},
		{
			id: "settings",
			label: "Settings",
			icon: Settings,
		},
	];

	return (
		<Card className="h-screen w-64 p-4 rounded-none border-r flex flex-col">
			<div className="mb-6">
				<h2 className="text-lg font-semibold">Liquor Locker</h2>
			</div>

			<div className="flex-1 flex flex-col">
				<nav className="space-y-2">
					{mainSections.map((section) => {
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
			</div>

			{/* Version number at bottom */}
			<div className="border-t mt-4 pt-4">
				<div className="text-xs text-muted-foreground">Liquor Locker v1.0</div>
			</div>
		</Card>
	);
}
