package services

import (
	"context"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestListModels(t *testing.T) {
	err := godotenv.Load()
	if err != nil {
		t.Log("No .env file found or error loading .env file")
	}
	ctx := context.Background()
	baseURL := os.Getenv("OPENAI_BASE_URL")
	apiKey := os.Getenv("OPENAI_API_KEY")
	if baseURL == "" || apiKey == "" {
		t.Fatal("OPENAI_BASE_URL or OPENAI_API_KEY environment variable not set")
	}

	s := NewOpenAIService(baseURL, apiKey)

	models, err := s.ListModels(ctx)
	if err != nil {
		t.Errorf("ListModels() error = %v", err)
	}
	if len(models) == 0 {
		t.Errorf("ListModels() returned no models")
	}
}
