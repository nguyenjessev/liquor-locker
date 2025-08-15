package models

type Cocktail struct {
	ID          int          `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Ingredients []Ingredient `json:"ingredients"`
	Steps       []Step       `json:"steps"`
}

type Ingredient struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Quantity string `json:"quantity"`
}

type Step struct {
	ID    int    `json:"id"`
	Order int    `json:"order"`
	Text  string `json:"text"`
}

type CocktailRecommendationResponse struct {
	Cocktails []CocktailResponse `json:"cocktails"`
}

type CocktailResponse struct {
	Name        string               `json:"name" jsonschema_description:"Name of the cocktail"`
	Description string               `json:"description" jsonschema_description:"Description of the cocktail"`
	Ingredients []IngredientResponse `json:"ingredients" jsonschema_description:"All ingredients required for the cocktail, including bottles, mixers, and fresh ingredients"`
	Steps       []StepResponse       `json:"steps" jsonschema_description:"Ordered steps to prepare the cocktail"`
}

type IngredientResponse struct {
	Name     string `json:"name" jsonschema_description:"Name of the ingredient"`
	Quantity string `json:"quantity" jsonschema_description:"Quantity/measurement of the ingredient"`
}

type StepResponse struct {
	Order int    `json:"order" jsonschema_description:"Order of the step"`
	Text  string `json:"text" jsonschema_description:"Text of the step"`
}
