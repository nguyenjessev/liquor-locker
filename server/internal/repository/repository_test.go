package repository

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"

	_ "github.com/mattn/go-sqlite3"

	"github.com/nguyenjessev/liquor-locker/internal/models"
)

func setupTestRepository(t *testing.T) *Repository {
	t.Helper()

	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	applyMigrations(t, db)

	return &Repository{DB: db}
}

func applyMigrations(t *testing.T, db *sql.DB) {
	t.Helper()

	migrationsDir := filepath.Join("..", "database", "migrations")
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		t.Fatalf("Failed to read migrations directory: %v", err)
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Name() < entries[j].Name()
	})

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".up.sql") {
			continue
		}

		path := filepath.Join(migrationsDir, entry.Name())
		content, err := os.ReadFile(path)
		if err != nil {
			t.Fatalf("Failed to read migration %s: %v", entry.Name(), err)
		}

		if _, err := db.Exec(string(content)); err != nil {
			t.Fatalf("Failed to execute migration %s: %v", entry.Name(), err)
		}
	}
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
	err = repo.DB.QueryRow("SELECT COUNT(*) FROM bottles WHERE name = ? AND id = ?", result.Name, result.ID).Scan(&count)
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
	err := repo.DB.QueryRow("SELECT COUNT(*) FROM bottles").Scan(&totalCount)
	if err != nil {
		t.Fatalf("Failed to query database: %v", err)
	}

	expectedCount := len(bottles)
	if totalCount != expectedCount {
		t.Errorf("Expected %d bottles in database, got %d", expectedCount, totalCount)
	}
}

func TestGetBottleByID(t *testing.T) {
	repo := setupTestRepository(t)
	defer repo.CloseDB()

	ctx := context.Background()

	// First, create a test bottle to retrieve
	bottle := &models.Bottle{Name: "Test Bottle"}
	createdBottle, err := repo.CreateBottle(ctx, bottle)
	if err != nil {
		t.Fatalf("Failed to create test bottle: %v", err)
	}

	tests := []struct {
		name       string
		id         int
		wantBottle *models.Bottle
		wantErr    error
	}{
		{
			name:       "existing bottle",
			id:         int(createdBottle.ID),
			wantBottle: createdBottle,
			wantErr:    nil,
		},
		{
			name:       "non-existent bottle",
			id:         99999,
			wantBottle: nil,
			wantErr:    ErrBottleNotFound,
		},
		{
			name:       "zero id",
			id:         0,
			wantBottle: nil,
			wantErr:    ErrBottleNotFound,
		},
		{
			name:       "negative id",
			id:         -1,
			wantBottle: nil,
			wantErr:    ErrBottleNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := repo.GetBottleByID(ctx, tt.id)

			if tt.wantErr != nil {
				if err != tt.wantErr {
					t.Errorf("GetBottleByID() error = %v, want %v", err, tt.wantErr)
				}
				if result != nil {
					t.Errorf("GetBottleByID() result = %v, want nil", result)
				}
			} else {
				if err != nil {
					t.Errorf("GetBottleByID() error = %v, want nil", err)
				}
				if result == nil {
					t.Fatal("GetBottleByID() returned nil bottle")
				}
				if result.ID != tt.wantBottle.ID {
					t.Errorf("GetBottleByID() ID = %v, want %v", result.ID, tt.wantBottle.ID)
				}
				if result.Name != tt.wantBottle.Name {
					t.Errorf("GetBottleByID() Name = %v, want %v", result.Name, tt.wantBottle.Name)
				}
				if result.CreatedAt.IsZero() {
					t.Error("GetBottleByID() did not populate CreatedAt")
				}
				if result.UpdatedAt.IsZero() {
					t.Error("GetBottleByID() did not populate UpdatedAt")
				}
			}
		})
	}
}

func TestDeleteBottleByID(t *testing.T) {
	repo := setupTestRepository(t)
	defer repo.CloseDB()

	ctx := context.Background()

	// First, create a test bottle to delete
	bottle := &models.Bottle{Name: "Test Bottle to Delete"}
	createdBottle, err := repo.CreateBottle(ctx, bottle)
	if err != nil {
		t.Fatalf("Failed to create test bottle: %v", err)
	}

	tests := []struct {
		name    string
		id      int
		wantErr error
	}{
		{
			name:    "existing bottle",
			id:      int(createdBottle.ID),
			wantErr: nil,
		},
		{
			name:    "non-existent bottle",
			id:      99999,
			wantErr: ErrBottleNotFound,
		},
		{
			name:    "zero id",
			id:      0,
			wantErr: ErrBottleNotFound,
		},
		{
			name:    "negative id",
			id:      -1,
			wantErr: ErrBottleNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := repo.DeleteBottleByID(ctx, tt.id)

			if tt.wantErr != nil {
				if err != tt.wantErr {
					t.Errorf("DeleteBottleByID() error = %v, want %v", err, tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("DeleteBottleByID() error = %v, want nil", err)
				}

				// Verify the bottle was actually deleted
				_, getErr := repo.GetBottleByID(ctx, tt.id)
				if getErr != ErrBottleNotFound {
					t.Errorf("Bottle should be deleted but still exists")
				}

				// Verify it's not in the database
				var count int
				countErr := repo.DB.QueryRow("SELECT COUNT(*) FROM bottles WHERE id = ?", tt.id).Scan(&count)
				if countErr != nil {
					t.Fatalf("Failed to query database: %v", countErr)
				}
				if count != 0 {
					t.Errorf("Expected 0 bottles with ID %d in database, got %d", tt.id, count)
				}
			}
		})
	}
}

func TestDeleteBottleByID_MultipleDeletes(t *testing.T) {
	repo := setupTestRepository(t)
	defer repo.CloseDB()

	ctx := context.Background()

	// Create a bottle and delete it
	bottle := &models.Bottle{Name: "Test Bottle"}
	createdBottle, err := repo.CreateBottle(ctx, bottle)
	if err != nil {
		t.Fatalf("Failed to create test bottle: %v", err)
	}

	// First delete should succeed
	err = repo.DeleteBottleByID(ctx, int(createdBottle.ID))
	if err != nil {
		t.Fatalf("First delete failed: %v", err)
	}

	// Second delete should fail with ErrBottleNotFound
	err = repo.DeleteBottleByID(ctx, int(createdBottle.ID))
	if err != ErrBottleNotFound {
		t.Errorf("Second delete error = %v, want %v", err, ErrBottleNotFound)
	}
}
