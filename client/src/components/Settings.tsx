import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Label } from "@/components/ui/label";

export function Settings() {
	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Look & Feel</CardTitle>
					<CardDescription>
						Customize the appearance of your application
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<Label htmlFor="theme-toggle">Theme</Label>
							<ThemeToggle />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
