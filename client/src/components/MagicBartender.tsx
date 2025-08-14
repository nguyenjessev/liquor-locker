import { Card, CardContent } from "@/components/ui/card";

export function MagicBartender() {
	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-2xl md:text-3xl font-bold">Magic Bartender</h1>
				</div>
				<p className="text-muted-foreground">
					Get personalized cocktail recommendations from our AI-powered
					bartender based on your inventory
				</p>
			</div>

			{/* Initially display a placeholder card */}
			<Card>
				<CardContent className="pt-6">
					<p className="text-muted-foreground">
						Ready to discover new cocktails? Click below to get started.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
