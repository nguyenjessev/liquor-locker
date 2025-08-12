import type { Bottle } from "@/types/bottle";
import { BottleCard } from "./BottleCard";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface BottleListProps {
	bottles: Bottle[];
	loading: boolean;
	onEditBottle: (bottle: Bottle) => void;
}

export function BottleList({
	bottles,
	loading,
	onEditBottle,
}: BottleListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Your Bottles ({bottles.length})</CardTitle>
				<CardDescription>
					{bottles.length === 0
						? "No bottles in your collection yet"
						: "Click a bottle to edit its details"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loading && bottles.length === 0 ? (
					<p className="text-muted-foreground text-center py-8">
						Loading bottles...
					</p>
				) : bottles.length === 0 ? (
					<p className="text-muted-foreground text-center py-8">
						Your collection is empty. Add your first bottle above!
					</p>
				) : (
					<div className="space-y-3">
						<div className="flex flex-col gap-3">
							{bottles.map((bottle) => (
								<BottleCard
									key={bottle.id}
									bottle={bottle}
									onEdit={onEditBottle}
								/>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
