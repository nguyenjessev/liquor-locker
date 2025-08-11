package models

import (
	"time"
)

type Bottle struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateBottleRequest struct {
	Name string `json:"name"`
}

type UpdateBottleRequest struct {
	Name string `json:"name"`
}

type BottleResponse struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
