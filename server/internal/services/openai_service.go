package services

import (
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
