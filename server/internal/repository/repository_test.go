package repository

import (
	"context"
	"database/sql"
	"testing"

	_ "github.com/mattn/go-sqlite3"

	"github.com/nguyenjessev/liquor-locker/internal/models"
)

func setupTestRepository(t *testing.T) *Repository {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	createTableSQL := `
		CREATE TABLE bottles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL
		)`

	if _, err := db.Exec(createTableSQL); err != nil {
		t.Fatalf("Failed to create bottles table: %v", err)
	}

	return &Repository{db: db}
}

func TestCreateBottle_Success(t *testing.T) {
	repo := setupTestRepository(t)
	defer repo.CloseDB()

	ctx := context.Background()
	bottle := &models.Bottle{
		Name: "Test Whiskey",
	}

	result, err := repo.CreateBottle(ctx, bottle)
	if err != nil {
		t.Fatalf("CreateBottle() error = %v, want nil", err)
	}

	if result == nil {
		t.Fatal("CreateBottle() returned nil bottle")
	}

	if result.ID == 0 {
		t.Error("CreateBottle() did not set bottle ID")
	}

	if result.Name != "Test Whiskey" {
		t.Errorf("CreateBottle() name = %v, want %v", result.Name, "Test Whiskey")
	}

	if result.CreatedAt.IsZero() {
		t.Error("CreateBottle() did not set CreatedAt")
	}

	if result.UpdatedAt.IsZero() {
		t.Error("CreateBottle() did not set UpdatedAt")
	}

	var count int
	err = repo.db.QueryRow("SELECT COUNT(*) FROM bottles WHERE name = ? AND id = ?", result.Name, result.ID).Scan(&count)
	if err != nil {
		t.Fatalf("Failed to query database: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 bottle in database, got %d", count)
	}
}

func TestCreateBottle_NilBottle(t *testing.T) {
	repo := setupTestRepository(t)
	defer repo.CloseDB()

	ctx := context.Background()
	result, err := repo.CreateBottle(ctx, nil)

	if err != ErrNilBottle {
		t.Errorf("CreateBottle() error = %v, want %v", err, ErrNilBottle)
	}

	if result != nil {
		t.Errorf("CreateBottle() result = %v, want nil", result)
	}
}

func TestCreateBottle_EmptyName(t *testing.T) {
	repo := setupTestRepository(t)
	defer repo.CloseDB()

	ctx := context.Background()
	bottle := &models.Bottle{
		Name: "",
	}

	result, err := repo.CreateBottle(ctx, bottle)
	if err != nil {
		t.Fatalf("CreateBottle() error = %v, want nil", err)
	}

	if result == nil {
		t.Fatal("CreateBottle() returned nil bottle")
	}

	if result.Name != "" {
		t.Errorf("CreateBottle() name = %v, want empty string", result.Name)
	}

	if result.ID == 0 {
		t.Error("CreateBottle() did not set bottle ID")
	}
}

func TestCreateBottle_MultipleBottles(t *testing.T) {
	repo := setupTestRepository(t)
	defer repo.CloseDB()

	ctx := context.Background()
	bottles := []*models.Bottle{
		{Name: "Bourbon 1"},
		{Name: "Bourbon 2"},
		{Name: "Scotch 1"},
	}

	var createdBottles []*models.Bottle
	for _, bottle := range bottles {
		result, err := repo.CreateBottle(ctx, bottle)
		if err != nil {
			t.Fatalf("CreateBottle() error = %v, want nil", err)
		}
		createdBottles = append(createdBottles, result)
	}

	// Verify all bottles have unique IDs
	idMap := make(map[int64]bool)
	for _, bottle := range createdBottles {
		if bottle.ID == 0 {
			t.Error("CreateBottle() did not set bottle ID")
		}
		if idMap[bottle.ID] {
			t.Errorf("Duplicate ID found: %d", bottle.ID)
		}
		idMap[bottle.ID] = true
	}

	// Verify all bottles exist in database
	var totalCount int
	err := repo.db.QueryRow("SELECT COUNT(*) FROM bottles").Scan(&totalCount)
	if err != nil {
		t.Fatalf("Failed to query database: %v", err)
	}

	expectedCount := len(bottles)
	if totalCount != expectedCount {
		t.Errorf("Expected %d bottles in database, got %d", expectedCount, totalCount)
	}
}
