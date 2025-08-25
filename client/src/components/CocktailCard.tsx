import type {
	CocktailRecommendation,
	Ingredient,
	Step,
} from "@/types/cocktail";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Trash } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

interface CocktailCardProps {
	cocktail: CocktailRecommendation;
	className?: string;
	hideStar?: boolean;
	showDelete?: boolean;
}

export function CocktailCard({ cocktail, className, hideStar = false, showDelete = false }: CocktailCardProps) {
	const addFavorite = async () => {
		// Logic to add the cocktail to favorites
		await fetch(`${API_BASE_URL}/favorites`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: cocktail.name,
				description: cocktail.description,
				ingredients: cocktail.ingredients,
				instructions: cocktail.steps,
			}),
		});
	};

	const deleteFavorite = async () => {
		if (!cocktail.id) return;
		// Logic to delete the cocktail from favorites
		await fetch(`${API_BASE_URL}/favorites?id=${cocktail.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};

	return (
		<Card className={className}>
			<CardContent>
				<span className="flex justify-between">
					<h4 className="font-bold">{cocktail.name}</h4>
					{!hideStar && (
						<button onClick={addFavorite} className="cursor-pointer">
							<Star className="ml-2" />
						</button>
					)}
					{showDelete && (
						<button onClick={deleteFavorite} className="cursor-pointer">
							<Trash className="ml-2" />
						</button>
					)}

				</span>
				<p className="mb-3 text-muted-foreground text-sm italic">
					{cocktail.description}
				</p>
				{cocktail.ingredients && cocktail.ingredients.length > 0 && (
					<div>
						<strong>Ingredients:</strong>
						<ul className="ml-2 text-muted-foreground text-sm space-y-1 list-none">
							{cocktail.ingredients.map((ing: Ingredient, i: number) => (
								<li key={i}>
									{ing.quantity ? `${ing.quantity} ` : ""}
									{ing.name}
								</li>
							))}
						</ul>
					</div>
				)}
				{cocktail.steps && cocktail.steps.length > 0 && (
					<div className="mt-2">
						<strong>Instructions:</strong>
						<ol className="mt-1 space-y-2 ml-2">
							{cocktail.steps.map((step: Step, i: number) => (
								<li
									key={i}
									className="flex items-start text-muted-foreground text-sm"
								>
									<span className="inline-block min-w-[1.5em] font-semibold text-primary">
										{i + 1}.
									</span>
									<span className="ml-2">{step.text}</span>
								</li>
							))}
						</ol>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
