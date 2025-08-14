package models

type Cocktail struct {
	ID          int          `json:"id"`
	Name        string       `json:"name"`
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
