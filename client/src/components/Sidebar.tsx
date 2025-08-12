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
	];

	const bottomSections = [
		{
			id: "settings",
			label: "Settings",
			icon: Settings,
		},
	];

	return (
		<Card className="h-screen w-64 p-4 rounded-none border-r">
			<div className="mb-6">
				<h2 className="text-lg font-semibold">Liquor Locker</h2>
			</div>

			<div className="flex flex-col h-[calc(100%-8rem)]">
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

				<nav className="mt-auto">
					{bottomSections.map((section) => {
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
			<div className="absolute bottom-0 left-0 right-0 p-4">
				<div className="border-t pt-4">
					<div className="text-xs text-muted-foreground">
						Liquor Locker v1.0
					</div>
				</div>
			</div>
		</Card>
	);
}
