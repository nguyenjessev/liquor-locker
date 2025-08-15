import { Apple, Blend, BottleWine, Settings, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomNavProps {
	activeSection: string;
	onSectionChange: (section: string) => void;
}

export function BottomNav({ activeSection, onSectionChange }: BottomNavProps) {
	const sections = [
		{
			id: "bottles",
			label: "Bottles",
			icon: BottleWine,
		},
		{
			id: "mixers",
			label: "Mixers",
			icon: Blend,
		},
		{
			id: "fresh",
			label: "Fresh",
			icon: Apple,
		},
		{
			id: "magic-bartender",
			label: "Magic Bartender",
			icon: Wand2,
		},
		{
			id: "settings",
			label: "Settings",
			icon: Settings,
		},
	];

	return (
		<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t md:border-t-0 shadow-lg overflow-scroll">
			<div className="flex items-center justify-around p-1">
				{sections.map((section) => {
					const Icon = section.icon;
					const isActive = activeSection === section.id;

					return (
						<Button
							key={section.id}
							variant={isActive ? "default" : "ghost"}
							size="sm"
							className={cn(
								"flex-col h-14 px-3 hover:bg-accent hover:text-accent-foreground",
								isActive && "",
								"rounded-lg m-1",
							)}
							onClick={() => onSectionChange(section.id)}
						>
							<Icon className="h-4 w-4 mb-1" />
							<span className="text-xs">{section.label}</span>
						</Button>
					);
				})}
			</div>
		</nav>
	);
}
