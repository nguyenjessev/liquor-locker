package services

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"

	"github.com/joho/godotenv"
	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

func setupTestRepository(t *testing.T) *repository.Repository {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	createBottlesTableSQL := `
		CREATE TABLE bottles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			opened BOOLEAN NOT NULL DEFAULT FALSE,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			open_date DATETIME,
			purchase_date DATETIME
		)`

	if _, err := db.Exec(createBottlesTableSQL); err != nil {
		t.Fatalf("Failed to create bottles table: %v", err)
	}

	createFreshTableSQL := `
		CREATE TABLE fresh (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			prepared_date DATETIME,
			purchase_date DATETIME
		)`

	if _, err := db.Exec(createFreshTableSQL); err != nil {
		t.Fatalf("Failed to create fresh table: %v", err)
	}

	createMixersTableSQL := `
		CREATE TABLE mixers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			opened BOOLEAN NOT NULL DEFAULT FALSE,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			open_date DATETIME,
			purchase_date DATETIME
		)`

	if _, err := db.Exec(createMixersTableSQL); err != nil {
		t.Fatalf("Failed to create mixers table: %v", err)
	}

	_, err = db.Exec(`
		INSERT INTO bottles (name, opened, created_at, updated_at)
		VALUES ('Citadelle Jardin d Ete Gin', FALSE, datetime('now'), datetime('now')),
			   ('Hendricks Gin', FALSE, datetime('now'), datetime('now'))`)
	if err != nil {
		t.Fatalf("Failed to insert test bottles data: %v", err)
	}

	_, err = db.Exec(`
		INSERT INTO fresh (name, created_at, updated_at, prepared_date, purchase_date)
		VALUES ('Lemon Juice', datetime('now'), datetime('now'), datetime('now'), datetime('now')),
			   ('Simple Syrup', datetime('now'), datetime('now'), datetime('now'), datetime('now')),
			   ('Amarena Cherries', datetime('now'), datetime('now'), datetime('now'), datetime('now')),
			   ('Lime Juice', datetime('now'), datetime('now'), datetime('now'), datetime('now')),
			   ('Oranges', datetime('now'), datetime('now'), datetime('now'), datetime('now'))`)
	if err != nil {
		t.Fatalf("Failed to insert test fresh data: %v", err)
	}

	_, err = db.Exec(`
		INSERT INTO mixers (name, created_at, updated_at, open_date, purchase_date)
		VALUES ('Simple Syrup', datetime('now'), datetime('now'), datetime('now'), datetime('now')),
			   ('Seltzer Water', datetime('now'), datetime('now'), datetime('now'), datetime('now'))`)
	if err != nil {
		t.Fatalf("Failed to insert test mixers data: %v", err)
	}

	return &repository.Repository{DB: db}
}

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

	for _, model := range models {
		fmt.Println(model)
	}
}

func TestSendPrompt(t *testing.T) {
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

	resp, err := s.SendPrompt(ctx, os.Getenv("OPENAI_DEFAULT_MODEL"), "Say this is a test")
	if err != nil {
		t.Errorf("SendPrompt() error = %v", err)
	}
	if resp == "" {
		t.Errorf("SendPrompt() returned empty response")
	}

	fmt.Println(resp)
}

func TestRecommendCocktail(t *testing.T) {
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
	r := setupTestRepository(t)

	resp, err := s.RecommendCocktail(ctx, r, os.Getenv("OPENAI_DEFAULT_MODEL"))
	if err != nil {
		t.Errorf("RecommendCocktail() error = %v", err)
	}
	if resp == nil {
		t.Errorf("RecommendCocktail() returned empty response")
	}

	fmt.Println(resp)
}
