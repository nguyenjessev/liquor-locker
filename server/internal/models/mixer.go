package models

import "time"

type Mixer struct {
	ID           int64      `json:"id"`
	Name         string     `json:"name"`
	Opened       bool       `json:"opened"`
	OpenDate     *time.Time `json:"open_date,omitempty"`
	PurchaseDate *time.Time `json:"purchase_date,omitempty"`
	Price        *float64   `json:"price,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type CreateMixerRequest struct {
	Name         string     `json:"name"`
	Opened       bool       `json:"opened"`
	OpenDate     *time.Time `json:"open_date,omitempty"`
	PurchaseDate *time.Time `json:"purchase_date,omitempty"`
	Price        *float64   `json:"price,omitempty"`
}

type UpdateMixerRequest struct {
	Name         string     `json:"name"`
	Opened       bool       `json:"opened"`
	OpenDate     *time.Time `json:"open_date,omitempty"`
	PurchaseDate *time.Time `json:"purchase_date,omitempty"`
	Price        *float64   `json:"price,omitempty"`
}

type MixerResponse struct {
	ID           int64      `json:"id"`
	Name         string     `json:"name"`
	Opened       bool       `json:"opened"`
	OpenDate     *time.Time `json:"open_date,omitempty"`
	PurchaseDate *time.Time `json:"purchase_date,omitempty"`
	Price        *float64   `json:"price,omitempty"`
}
