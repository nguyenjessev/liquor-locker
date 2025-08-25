package models

import (
    "database/sql/driver"
    "encoding/json"
    "fmt"
)

type FavoriteIngredient struct {
	Name     string `json:"name"`
	Quantity string `json:"quantity"`
}

type FavoriteStep struct {
	Order int    `json:"order"`
	Text  string `json:"text"`
}

type Steps []FavoriteStep

func (s Steps) Value() (driver.Value, error) {
    return json.Marshal(s)
}

func (s *Steps) Scan(value interface{}) error {
    var bytes []byte
    switch v := value.(type) {
    case []byte:
        bytes = v
    case string:
        bytes = []byte(v)
    default:
        return fmt.Errorf("Failed to unmarshal Steps value: %v", value)
    }
    return json.Unmarshal(bytes, s)
}

type Ingredients []FavoriteIngredient

func (ing Ingredients) Value() (driver.Value, error) {
    return json.Marshal(ing)
}

func (ing *Ingredients) Scan(value interface{}) error {
    var bytes []byte
    switch v := value.(type) {
    case []byte:
        bytes = v
    case string:
        bytes = []byte(v)
    default:
        return fmt.Errorf("Failed to unmarshal Ingredients value: %v", value)
    }
    return json.Unmarshal(bytes, ing)
}

type Favorite struct {
    ID           int         `json:"id"`
    Name         string      `json:"name"`
    Description  string      `json:"description"`
    Ingredients  Ingredients `json:"ingredients"`
    Instructions Steps       `json:"instructions"`
    CreatedAt    int64       `json:"created_at"`
    UpdatedAt    int64       `json:"updated_at"`
}