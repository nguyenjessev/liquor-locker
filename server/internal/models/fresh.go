package models

import "time"

type Fresh struct {
	ID           int64      `json:"id"`
	Name         string     `json:"name"`
	PreparedDate *time.Time `json:"prepared_date,omitempty"`
	PurchaseDate *time.Time `json:"purchase_date,omitempty"`
	Price        *float64   `json:"price,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type CreateFreshRequest struct {
	Name         string     `json:"name"`
	PreparedDate *time.Time `json:"prepared_date,omitempty"`
	PurchaseDate *time.Time `json:"purchase_date,omitempty"`
	Price        *float64   `json:"price,omitempty"`
}

type UpdateFreshRequest struct {
	Name         string     `json:"name"`
	PreparedDate *time.Time `json:"prepared_date,omitempty"`
	PurchaseDate *time.Time `json:"purchase_date,omitempty"`
	Price        *float64   `json:"price,omitempty"`
}

type FreshResponse struct {
	ID           int64      `json:"id"`
	Name         string     `json:"name"`
	PreparedDate *time.Time `json:"prepared_date,omitempty"`
	PurchaseDate *time.Time `json:"purchase_date,omitempty"`
	Price        *float64   `json:"price,omitempty"`
}
