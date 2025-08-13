import type { Fresh } from "@/types/fresh";
import { FreshCard } from "./FreshCard";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface FreshListProps {
	freshIngredients: Fresh[];
	loading: boolean;
	onEditFresh: (fresh: Fresh) => void;
}

export function FreshList({
	freshIngredients,
	loading,
	onEditFresh,
}: FreshListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Your Fresh Ingredients ({freshIngredients.length})
				</CardTitle>
				<CardDescription>
					{freshIngredients.length === 0
						? "No fresh ingredients in your collection yet"
						: "Click a fresh ingredient to edit its details"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loading && freshIngredients.length === 0 ? (
					<p className="text-muted-foreground text-center py-8">
						Loading fresh ingredients...
					</p>
				) : freshIngredients.length === 0 ? (
					<p className="text-muted-foreground text-center py-8">
						Your collection is empty. Add your first fresh ingredient above!
					</p>
				) : (
					<div className="space-y-3">
						<div className="flex flex-col gap-3">
							{freshIngredients.map((fresh) => (
								<FreshCard key={fresh.id} fresh={fresh} onEdit={onEditFresh} />
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
