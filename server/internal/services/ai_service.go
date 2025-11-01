package services

import (
	"context"

	"github.com/nguyenjessev/liquor-locker/internal/models"
	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

// Provider identifies a backing AI API implementation.
type Provider string

const (
	ProviderOpenAI    Provider = "openai"
	ProviderAnthropic Provider = "anthropic"
)

// AIService captures the shared capabilities required by the AI handler.
type AIService interface {
	ListModels(ctx context.Context) ([]string, error)
	RecommendCocktail(ctx context.Context, repo *repository.Repository, model string) (*models.CocktailRecommendationResponse, error)
	Close() error
}
