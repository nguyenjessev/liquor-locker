import { Card, CardContent } from "@/components/ui/card";

export function FreshManager() {
	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-2xl md:text-3xl font-bold">Fresh</h1>
				</div>
				<p className="text-muted-foreground">
					House-made syrups, infusions, and juices
				</p>
			</div>

			{/* Error display */}
			<Card className="mb-6">
				<CardContent className="pt-6">
					<p>Fresh page coming soon...</p>
				</CardContent>
			</Card>
		</div>
	);
}
