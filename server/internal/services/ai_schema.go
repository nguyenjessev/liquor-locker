package services

import (
	"github.com/invopop/jsonschema"
	"github.com/nguyenjessev/liquor-locker/internal/models"
)

// GenerateSchema returns the JSON schema for the provided type parameter.
func GenerateSchema[T any]() any {
	reflector := jsonschema.Reflector{
		AllowAdditionalProperties: false,
		DoNotReference:            true,
	}

	var v T

	return reflector.Reflect(v)
}

var CocktailRecommendationResponseSchema = GenerateSchema[models.CocktailRecommendationResponse]()
