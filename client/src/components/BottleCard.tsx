import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Bottle } from "@/types/bottle";
import { format } from "date-fns";

interface BottleCardProps {
	bottle: Bottle;
	onEdit: (bottle: Bottle) => void;
}

export function BottleCard({ bottle, onEdit }: BottleCardProps) {
	const formatDate = (date: Date | null) => {
		try {
			return date ? format(date, "PPP") : "Invalid date";
		} catch {
			return "Invalid date";
		}
	};

	return (
		<Card
			className="hover:shadow-md transition-shadow cursor-pointer gap-0"
			onClick={() => onEdit(bottle)}
		>
			<CardHeader>
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle className="text-lg break-words">{bottle.name}</CardTitle>
					<span
						className={`grid place-items-center px-4 h-5 rounded-full text-xs ${
							bottle.opened
								? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-200"
								: "bg-rose-100/80 text-rose-700 dark:bg-rose-800/50 dark:text-rose-200"
						}`}
					>
						{bottle.opened ? "Opened" : "Unopened"}
					</span>
				</div>
			</CardHeader>
			<CardContent className="space-y-1">
				{bottle.price && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Price:</span>
						<span className="text-sm text-muted-foreground">
							${bottle.price.toFixed(2)}
						</span>
					</div>
				)}

				{bottle.purchase_date && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Purchased:</span>
						<span className="text-sm text-muted-foreground">
							{formatDate(bottle.purchase_date)}
						</span>
					</div>
				)}

				{bottle.opened && bottle.open_date && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Opened:</span>
						<span className="text-sm text-muted-foreground">
							{formatDate(bottle.open_date)}
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
