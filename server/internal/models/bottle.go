package models

import (
	"time"
)

type Bottle struct {
	ID        int64
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type CreateBottleRequest struct {
	Name string
}

type UpdateBottleRequest struct {
	Name string
}

type BottleResponse struct {
	ID        int64
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
