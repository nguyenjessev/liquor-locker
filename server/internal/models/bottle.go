package models

import (
	"time"
)

type Bottle struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Opened    bool      `json:"opened"`
	OpenDate  *string   `json:"open_date"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateBottleRequest struct {
	Name     string  `json:"name"`
	Opened   bool    `json:"opened"`
	OpenDate *string `json:"open_date"`
}

type UpdateBottleRequest struct {
	Name     string  `json:"name"`
	Opened   bool    `json:"opened"`
	OpenDate *string `json:"open_date"`
}

type BottleResponse struct {
	ID       int64   `json:"id"`
	Name     string  `json:"name"`
	Opened   bool    `json:"opened"`
	OpenDate *string `json:"open_date"`
}
