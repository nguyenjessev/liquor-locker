import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Bottle } from "@/types/bottle";

interface BottleCardProps {
	bottle: Bottle;
	onDelete: (id: number) => void;
	loading?: boolean;
}

export function BottleCard({
	bottle,
	onDelete,
	loading = false,
}: BottleCardProps) {
	const formatDate = (dateString: string) => {
		// If the string is already in YYYY-MM-DD format, just return it formatted
		if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
			const [year, month, day] = dateString.split("-");
			return new Date(`${year}-${month}-${day}T00:00:00`).toLocaleDateString();
		}

		// Otherwise treat as a full timestamp
		const date = new Date(dateString);
		return date.toString() === "Invalid Date"
			? "Unknown date"
			: date.toLocaleDateString();
	};

	return (
		<Card className="hover:shadow-md transition-shadow relative flex flex-col">
			<CardHeader className="pb-3 flex-1">
				<CardTitle className="text-lg pr-8">{bottle.name}</CardTitle>
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">Status:</span>
						<span
							className={`text-sm font-medium ${
								bottle.opened ? "text-green-700/80" : "text-red-700/80"
							}`}
						>
							{bottle.opened ? "Opened" : "Unopened"}
						</span>
					</div>
					{bottle.opened && bottle.open_date && (
						<p className="text-sm text-muted-foreground">
							Opened: {formatDate(bottle.open_date)}
						</p>
					)}
					<p className="text-sm text-muted-foreground">
						Added: {formatDate(bottle.created_at)}
					</p>
				</div>
			</CardHeader>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onDelete(bottle.id)}
				disabled={loading}
				className="absolute bottom-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
				aria-label={`Delete ${bottle.name}`}
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</Card>
	);
}
