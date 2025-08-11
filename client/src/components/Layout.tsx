import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottleManager } from "./BottleManager";

export function Layout() {
	const [activeSection, setActiveSection] = useState("bottles");

	const renderContent = () => {
		switch (activeSection) {
			case "bottles":
				return <BottleManager />;
			// Future sections will be added here:
			// case "seasonings":
			//   return <SeasoningManager />;
			// case "garnishes":
			//   return <GarnishManager />;
			default:
				return <BottleManager />;
		}
	};

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar */}
			<div className="flex-shrink-0">
				<Sidebar
					activeSection={activeSection}
					onSectionChange={setActiveSection}
				/>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Content Area */}
				<main className="flex-1 overflow-auto">{renderContent()}</main>
			</div>
		</div>
	);
}
