import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { Fresh } from "@/types/fresh";
import { format } from "date-fns";

interface FreshCardProps {
	fresh: Fresh;
	onEdit: (fresh: Fresh) => void;
}

export function FreshCard({ fresh, onEdit }: FreshCardProps) {
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
			onClick={() => onEdit(fresh)}
		>
			<CardHeader>
				<CardTitle className="text-lg break-words">{fresh.name}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-1">
				{fresh.price && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Price:</span>
						<span className="text-sm text-muted-foreground">
							${fresh.price.toFixed(2)}
						</span>
					</div>
				)}

				{fresh.purchase_date && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Purchased:</span>
						<span className="text-sm text-muted-foreground">
							{formatDate(fresh.purchase_date)}
						</span>
					</div>
				)}

				{fresh.prepared_date && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Prepared:</span>
						<span className="text-sm text-muted-foreground">
							{formatDate(fresh.prepared_date)}
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
