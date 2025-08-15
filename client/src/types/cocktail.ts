export interface Ingredient {
	name: string;
	quantity: string;
}

export interface Step {
	order: number;
	text: string;
}

export interface CocktailRecommendation {
	name: string;
	description: string;
	ingredients: Ingredient[];
	steps: Step[];
}
