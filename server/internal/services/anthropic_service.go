package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/nguyenjessev/liquor-locker/internal/models"
	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

// AnthropicService provides methods to interact with Claude models.
type AnthropicService struct {
	client *anthropic.Client
	closed bool
}

// NewAnthropicService creates a new AnthropicService with the given base URL and API key.
func NewAnthropicService(baseURL, apiKey string) *AnthropicService {
	opts := []option.RequestOption{}
	if apiKey != "" {
		opts = append(opts, option.WithAPIKey(apiKey))
	}
	if baseURL != "" {
		opts = append(opts, option.WithBaseURL(baseURL))
	}

	client := anthropic.NewClient(opts...)

	return &AnthropicService{
		client: &client,
		closed: false,
	}
}

// ListModels returns a slice of available model IDs from Anthropic.
func (s *AnthropicService) ListModels(ctx context.Context) ([]string, error) {
	page, err := s.client.Models.List(ctx, anthropic.ModelListParams{})
	if err != nil {
		return nil, err
	}

	var ids []string
	for page != nil {
		for _, model := range page.Data {
			ids = append(ids, model.ID)
		}

		page, err = page.GetNextPage()
		if err != nil {
			return nil, err
		}
	}

	return ids, nil
}

// RecommendCocktail assembles the user's inventory into the prompt and requests structured guidance.
func (s *AnthropicService) RecommendCocktail(ctx context.Context, repo *repository.Repository, model string) (*models.CocktailRecommendationResponse, error) {
	bottles, err := repo.GetAllBottles(ctx)
	if err != nil {
		return nil, err
	}

	fresh, err := repo.GetAllFresh(ctx)
	if err != nil {
		return nil, err
	}

	mixers, err := repo.GetAllMixers(ctx)
	if err != nil {
		return nil, err
	}

	inventoryPayload := struct {
		Bottles []*models.Bottle `json:"bottles"`
		Fresh   []*models.Fresh  `json:"fresh"`
		Mixers  []*models.Mixer  `json:"mixers"`
	}{
		Bottles: bottles,
		Fresh:   fresh,
		Mixers:  mixers,
	}

	inventoryJSON, err := json.Marshal(inventoryPayload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal inventory: %w", err)
	}

	schemaJSON, err := json.Marshal(CocktailRecommendationResponseSchema)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal response schema: %w", err)
	}

	systemPrompt := fmt.Sprintf(
		"You are an expert bartender. Return recommendations strictly as JSON matching this schema: %s. "+
			"Respond with JSON only and ensure ingredients reference the provided inventory when possible.",
		string(schemaJSON),
	)

	userPrompt := fmt.Sprintf(
		"Here is the user's current inventory:\n%s\n"+
			"Recommend cocktails that prefer opened or prepared ingredients when available, but sealed items are acceptable if needed.",
		string(inventoryJSON),
	)

	message, err := s.client.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     anthropic.Model(model),
		MaxTokens: 1024,
		System: []anthropic.TextBlockParam{
			{Text: systemPrompt},
		},
		Messages: []anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock(userPrompt)),
		},
	})
	if err != nil {
		return nil, err
	}

	var responseText strings.Builder
	for _, block := range message.Content {
		switch block := block.AsAny().(type) {
		case anthropic.TextBlock:
			responseText.WriteString(block.Text)
		}
	}

	parsed, err := parseAnthropicJSON(responseText.String())
	if err != nil {
		return nil, err
	}

	return parsed, nil
}

// Close cleans up any resources used by the Anthropic service.
func (s *AnthropicService) Close() error {
	if s.closed {
		return nil
	}

	s.client = nil
	s.closed = true

	return nil
}

func parseAnthropicJSON(body string) (*models.CocktailRecommendationResponse, error) {
	clean := strings.TrimSpace(body)

	if strings.HasPrefix(clean, "```") {
		clean = strings.TrimPrefix(clean, "```")
		clean = strings.TrimSpace(clean)
		if strings.HasPrefix(clean, "json") {
			clean = strings.TrimPrefix(clean, "json")
			clean = strings.TrimSpace(clean)
		}
		if idx := strings.LastIndex(clean, "```"); idx >= 0 {
			clean = clean[:idx]
		}
	}

	clean = strings.TrimSpace(clean)

	var resp models.CocktailRecommendationResponse
	if err := json.Unmarshal([]byte(clean), &resp); err != nil {
		return nil, fmt.Errorf("failed to decode anthropic response: %w", err)
	}

	return &resp, nil
}
