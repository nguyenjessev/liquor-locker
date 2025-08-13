import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
			className="hover:shadow-md transition-shadow relative cursor-pointer"
			onClick={() => onEdit(fresh)}
		>
			<CardHeader>
				<div className="flex justify-between items-start gap-2">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<div className="flex flex-wrap items-center gap-2">
								<CardTitle className="text-lg break-words">
									{fresh.name}
								</CardTitle>
							</div>
						</div>
						{fresh.purchase_date && (
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">Purchased:</span>
								<span className="text-sm text-muted-foreground">
									{formatDate(fresh.purchase_date)}
								</span>
							</div>
						)}
						{fresh.prepared_date && (
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">Prepared:</span>
								<span className="text-sm text-muted-foreground">
									{formatDate(fresh.prepared_date)}
								</span>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
