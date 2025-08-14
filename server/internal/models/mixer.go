package models

import "time"

type Mixer struct {
	ID           int64      `json:"id"`
	Name         string     `json:"name"`
	Opened       bool       `json:"opened"`
	OpenDate     *time.Time `json:"open_date"`
	PurchaseDate *time.Time `json:"purchase_date"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type CreateMixerRequest struct {
	Name         string     `json:"name"`
	Opened       bool       `json:"opened"`
	OpenDate     *time.Time `json:"open_date"`
	PurchaseDate *time.Time `json:"purchase_date"`
}

type UpdateMixerRequest struct {
	Name         string     `json:"name"`
	Opened       bool       `json:"opened"`
	OpenDate     *time.Time `json:"open_date"`
	PurchaseDate *time.Time `json:"purchase_date"`
}

type MixerResponse struct {
	ID           int64      `json:"id"`
	Name         string     `json:"name"`
	Opened       bool       `json:"opened"`
	OpenDate     *time.Time `json:"open_date"`
	PurchaseDate *time.Time `json:"purchase_date"`
}
