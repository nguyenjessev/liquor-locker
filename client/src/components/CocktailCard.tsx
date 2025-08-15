import type {
	CocktailRecommendation,
	Ingredient,
	Step,
} from "@/types/cocktail";
import { Card, CardContent } from "@/components/ui/card";

interface CocktailCardProps {
	cocktail: CocktailRecommendation;
	className?: string;
}

export function CocktailCard({ cocktail, className }: CocktailCardProps) {
	return (
		<Card className={className}>
			<CardContent>
				<h4 className="font-bold">{cocktail.name}</h4>
				<p className="mb-2">{cocktail.description}</p>
				{cocktail.ingredients && cocktail.ingredients.length > 0 && (
					<div>
						<strong>Ingredients:</strong>
						<ul className="list-disc ml-6">
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
						<strong>Steps:</strong>
						<ol className="list-decimal ml-6">
							{cocktail.steps.map((step: Step, i: number) => (
								<li key={i}>{step.text}</li>
							))}
						</ol>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
