import type { Mixer } from "@/types/mixer";
import { MixerCard } from "./MixerCard";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface MixerListProps {
	mixers: Mixer[];
	loading: boolean;
	onEditMixer: (mixer: Mixer) => void;
}

export function MixerList({ mixers, loading, onEditMixer }: MixerListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Your Mixers ({mixers.length})</CardTitle>
				<CardDescription>
					{mixers.length === 0
						? "No mixers in your collection yet"
						: "Click a mixer to edit its details"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loading && mixers.length === 0 ? (
					<p className="text-muted-foreground text-center py-8">
						Loading mixers...
					</p>
				) : mixers.length === 0 ? (
					<p className="text-muted-foreground text-center py-8">
						Your collection is empty. Add your first mixer above!
					</p>
				) : (
					<div className="space-y-3">
						<div className="flex flex-col gap-3">
							{mixers.map((mixer) => (
								<MixerCard key={mixer.id} mixer={mixer} onEdit={onEditMixer} />
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
