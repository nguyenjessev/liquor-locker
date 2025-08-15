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
