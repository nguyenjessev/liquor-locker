package services

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/invopop/jsonschema"
	"github.com/nguyenjessev/liquor-locker/internal/models"
	"github.com/nguyenjessev/liquor-locker/internal/repository"
	"github.com/openai/openai-go/v2"
	"github.com/openai/openai-go/v2/option"
)

// OpenAIService provides methods to interact with OpenAI-style APIs.
type OpenAIService struct {
	Client *openai.Client
	closed bool
}

// NewOpenAIService creates a new OpenAIService with the given base URL and API key.
func NewOpenAIService(baseURL, apiKey string) *OpenAIService {
	client := openai.NewClient(option.WithAPIKey(apiKey), option.WithBaseURL(baseURL))

	return &OpenAIService{
		Client: &client,
		closed: false,
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

// SendPrompt sends a prompt to the LLM and returns the response text.
func (s *OpenAIService) SendPrompt(ctx context.Context, model, prompt string) (string, error) {
	req := openai.ChatCompletionNewParams{
		Model: model,
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage("Say this is a test"),
		},
	}

	resp, err := s.Client.Chat.Completions.New(ctx, req)
	if err != nil {
		return "", err
	}
	if len(resp.Choices) == 0 {
		return "", nil
	}
	return resp.Choices[0].Message.Content, nil
}

func GenerateSchema[T any]() any {
	reflector := jsonschema.Reflector{
		AllowAdditionalProperties: false,
		DoNotReference:            true,
	}

	var v T

	schema := reflector.Reflect(v)
	return schema
}

var CocktailRecommendationResponseSchema = GenerateSchema[models.CocktailRecommendationResponse]()

func (s *OpenAIService) RecommendCocktail(ctx context.Context, repo *repository.Repository, model string) (*models.CocktailRecommendationResponse, error) {
	params := openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage("Recommend a cocktail based on the user's inventory, including bottles, fresh ingredients, and mixers. Prefer using open or prepared ingredients if possible, but you can use sealed ingredients if necessary. You may also assume that the user has common ingredients on hand, such as water and ice."),
		},
		Tools: []openai.ChatCompletionToolUnionParam{
			openai.ChatCompletionFunctionTool(openai.FunctionDefinitionParam{
				Name:        "list_bottles",
				Description: openai.String("Get list of bottles in the user's bar inventory"),
			}),
			openai.ChatCompletionFunctionTool(openai.FunctionDefinitionParam{
				Name:        "list_fresh_ingredients",
				Description: openai.String("Get list of fresh ingredients in the user's bar inventory"),
			}),
			openai.ChatCompletionFunctionTool(openai.FunctionDefinitionParam{
				Name:        "list_mixers",
				Description: openai.String("Get list of mixers in the user's bar inventory"),
			}),
		},
		Model: model,
	}

	resp, err := s.Client.Chat.Completions.New(ctx, params)
	if err != nil {
		return nil, err
	}
	if len(resp.Choices) == 0 {
		return nil, nil
	}

	toolCalls := resp.Choices[0].Message.ToolCalls
	if len(toolCalls) == 0 {
		return nil, nil
	}

	params.Messages = append(params.Messages, resp.Choices[0].Message.ToParam())
	for _, toolCall := range toolCalls {
		switch toolCall.Function.Name {
		case "list_bottles":
			bottles, err := repo.GetAllBottles(ctx)
			if err != nil {
				return nil, err
			}

			bottlesJSON, err := json.Marshal(bottles)
			if err != nil {
				return nil, err
			}
			params.Messages = append(params.Messages, openai.ToolMessage(string(bottlesJSON), toolCall.ID))
		case "list_fresh_ingredients":
			freshIngredients, err := repo.GetAllFresh(ctx)
			if err != nil {
				return nil, err
			}

			freshIngredientsJSON, err := json.Marshal(freshIngredients)
			if err != nil {
				return nil, err
			}
			params.Messages = append(params.Messages, openai.ToolMessage(string(freshIngredientsJSON), toolCall.ID))
		case "list_mixers":
			mixers, err := repo.GetAllMixers(ctx)
			if err != nil {
				return nil, err
			}

			mixersJSON, err := json.Marshal(mixers)
			if err != nil {
				return nil, err
			}
			params.Messages = append(params.Messages, openai.ToolMessage(string(mixersJSON), toolCall.ID))
		default:
			return nil, fmt.Errorf("unknown function name: %s", toolCall.Function.Name)
		}
	}

	schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
		Name:        "cocktail_recommendations",
		Description: openai.String("A list of recommended cocktails"),
		Schema:      CocktailRecommendationResponseSchema,
		Strict:      openai.Bool(true),
	}

	params.ResponseFormat = openai.ChatCompletionNewParamsResponseFormatUnion{
		OfJSONSchema: &openai.ResponseFormatJSONSchemaParam{
			JSONSchema: schemaParam,
		},
	}

	resp, err = s.Client.Chat.Completions.New(ctx, params)
	if err != nil {
		return nil, err
	}
	if len(resp.Choices) == 0 {
		return nil, nil
	}

	var cocktailRecommendations models.CocktailRecommendationResponse
	_ = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &cocktailRecommendations)

	return &cocktailRecommendations, nil
}

// Close cleans up any resources used by the OpenAI service
func (s *OpenAIService) Close() error {
	if s.closed {
		return nil
	}

	// Set client to nil to allow garbage collection
	s.Client = nil
	s.closed = true

	return nil
}
