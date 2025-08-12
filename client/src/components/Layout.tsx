import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottleManager } from "./BottleManager";
import { Settings } from "./Settings";
import { BottomNav } from "./BottomNav";

export function Layout() {
	const [activeSection, setActiveSection] = useState("bottles");

	const renderContent = () => {
		switch (activeSection) {
			case "bottles":
				return <BottleManager />;
			case "settings":
				return <Settings />;
			default:
				return <BottleManager />;
		}
	};

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar - hidden on mobile */}
			<div className="hidden md:block flex-shrink-0">
				<Sidebar
					activeSection={activeSection}
					onSectionChange={setActiveSection}
				/>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Content Area */}
				<main className="flex-1 overflow-auto pb-20 md:pb-0">
					{renderContent()}
				</main>
			</div>

			{/* Bottom Navigation - visible only on mobile */}
			<BottomNav
				activeSection={activeSection}
				onSectionChange={setActiveSection}
			/>
		</div>
	);
}
