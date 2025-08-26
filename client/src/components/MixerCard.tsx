import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { Mixer } from "@/types/mixer";
import { format } from "date-fns";

interface MixerCardProps {
	mixer: Mixer;
	onEdit: (mixer: Mixer) => void;
}

export function MixerCard({ mixer, onEdit }: MixerCardProps) {
	const formatDate = (date: Date | null) => {
		try {
			return date ? format(date, "PPP") : "Invalid date";
		} catch {
			return "Invalid date";
		}
	};

	return (
		<Card
			className="hover:shadow-md transition-shadow cursor-pointer gap-1"
			onClick={() => onEdit(mixer)}
		>
			<CardHeader>
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle className="text-lg break-words">{mixer.name}</CardTitle>
					<span
						className={`grid place-items-center px-4 h-5 rounded-full text-xs ${
							mixer.opened
								? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-200"
								: "bg-rose-100/80 text-rose-700 dark:bg-rose-800/50 dark:text-rose-200"
						}`}
					>
						{mixer.opened ? "Opened" : "Unopened"}
					</span>
				</div>
			</CardHeader>
			<CardContent className="space-y-1">
				{mixer.price && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Price:</span>
						<span className="text-sm text-muted-foreground">
							${mixer.price.toFixed(2)}
						</span>
					</div>
				)}

				{mixer.purchase_date && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Purchased:</span>
						<span className="text-sm text-muted-foreground">
							{formatDate(mixer.purchase_date)}
						</span>
					</div>
				)}

				{mixer.opened && mixer.open_date && (
					<div className="text-sm flex flex-wrap gap-x-2">
						<span>Opened:</span>
						<span className="text-sm text-muted-foreground">
							{formatDate(mixer.open_date)}
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
