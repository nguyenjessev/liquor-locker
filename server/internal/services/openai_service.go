package services

import (
	"context"

	"github.com/openai/openai-go/v2"
	"github.com/openai/openai-go/v2/option"
)

// OpenAIService provides methods to interact with OpenAI-style APIs.
type OpenAIService struct {
	Client *openai.Client
}

// NewOpenAIService creates a new OpenAIService with the given base URL and API key.
func NewOpenAIService(baseURL, apiKey string) *OpenAIService {
	client := openai.NewClient(option.WithAPIKey(apiKey), option.WithBaseURL(baseURL))

	return &OpenAIService{
		Client: &client,
	}
}

// ListModels returns a slice of available model IDs from OpenAI.
func (s *OpenAIService) ListModels(ctx context.Context) ([]string, error) {
	resp, err := s.Client.Models.List(ctx)
	if err != nil {
		return nil, err
	}
	var ids []string
	for _, model := range resp.Data {
		ids = append(ids, model.ID)
	}
	return ids, nil
}
