package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	"github.com/nguyenjessev/liquor-locker/internal/models"
)

type Repository struct {
	db *sql.DB
}

func New() *Repository {
	db, err := sql.Open("sqlite3", "./internal/database/app.db")
	if err != nil {
		panic(err)
	}

	return &Repository{db: db}
}

func (r *Repository) CloseDB() {
	r.db.Close()
}

func (r *Repository) RunMigrations() error {
	driver, err := sqlite3.WithInstance(r.db, &sqlite3.Config{})
	if err != nil {
		return fmt.Errorf("failed to create migrate driver: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance("file://./internal/database/migrations", "sqlite3", driver)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrations: %v", err)
	}

	return nil
}

var ErrNilBottle = errors.New("bottle cannot be nil")

func (r *Repository) CreateBottle(ctx context.Context, bottle *models.Bottle) (*models.Bottle, error) {
	if bottle == nil {
		return nil, ErrNilBottle
	}

	query := `
		INSERT INTO bottles (name, created_at, updated_at)
		VALUES (?, datetime('now'), datetime('now'))
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query, bottle.Name).Scan(&bottle.ID, &bottle.CreatedAt, &bottle.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create bottle: %v", err)
	}

	return bottle, nil
}

var ErrBottleNotFound = errors.New("bottle not found")

func (r *Repository) GetBottleByID(ctx context.Context, id int) (*models.Bottle, error) {
	query := `
		SELECT id, name, created_at, updated_at
		FROM bottles
		WHERE id = ?`

	var bottle models.Bottle
	err := r.db.QueryRowContext(ctx, query, id).Scan(&bottle.ID, &bottle.Name, &bottle.CreatedAt, &bottle.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrBottleNotFound
		}

		return nil, fmt.Errorf("failed to get bottle by ID: %v", err)
	}

	return &bottle, nil
}
