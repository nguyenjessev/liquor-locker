import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
			className="hover:shadow-md transition-shadow relative cursor-pointer"
			onClick={() => onEdit(mixer)}
		>
			<CardHeader>
				<div className="flex justify-between items-start gap-2">
					<div>
						<div className="flex items-center gap-2">
							<div className="flex flex-wrap items-center gap-2">
								<CardTitle className="text-lg break-words">
									{mixer.name}
								</CardTitle>
								<span
									className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
										mixer.opened
											? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-200"
											: "bg-rose-100/80 text-rose-700 dark:bg-rose-800/50 dark:text-rose-200"
									}`}
								>
									{mixer.opened ? "Opened" : "Unopened"}
								</span>
							</div>
						</div>
						{mixer.purchase_date && (
							<div className="flex items-center gap-2 mt-2">
								<span className="text-sm font-medium">Purchased:</span>
								<span className="text-sm text-muted-foreground">
									{formatDate(mixer.purchase_date)}
								</span>
							</div>
						)}
						{mixer.opened && mixer.open_date && (
							<div className="flex items-center gap-2 mt-2">
								<span className="text-sm font-medium">Opened:</span>
								<span className="text-sm text-muted-foreground">
									{formatDate(mixer.open_date)}
								</span>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
