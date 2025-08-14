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
	DB *sql.DB
}

func New() *Repository {
	db, err := sql.Open("sqlite3", "./internal/database/app.db")
	if err != nil {
		panic(err)
	}

	return &Repository{DB: db}
}

func (r *Repository) CloseDB() {
	r.DB.Close()
}

func (r *Repository) RunMigrations() error {
	driver, err := sqlite3.WithInstance(r.DB, &sqlite3.Config{})
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

var (
	ErrNilBottle     = errors.New("bottle cannot be nil")
	ErrNilFresh      = errors.New("fresh item cannot be nil")
	ErrFreshNotFound = errors.New("fresh item not found")
)

func (r *Repository) CreateBottle(ctx context.Context, bottle *models.Bottle) (*models.Bottle, error) {
	if bottle == nil {
		return nil, ErrNilBottle
	}

	query := `
		INSERT INTO bottles (name, opened, open_date, purchase_date, created_at, updated_at)
		VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
		RETURNING id, created_at, updated_at`

	err := r.DB.QueryRowContext(ctx, query, bottle.Name, bottle.Opened, bottle.OpenDate, bottle.PurchaseDate).Scan(&bottle.ID, &bottle.CreatedAt, &bottle.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create bottle: %v", err)
	}

	return bottle, nil
}

var ErrBottleNotFound = errors.New("bottle not found")

func (r *Repository) GetBottleByID(ctx context.Context, id int) (*models.Bottle, error) {
	query := `
		SELECT id, name, opened, open_date, purchase_date, created_at, updated_at
		FROM bottles
		WHERE id = ?`

	var bottle models.Bottle
	err := r.DB.QueryRowContext(ctx, query, id).Scan(&bottle.ID, &bottle.Name, &bottle.Opened, &bottle.OpenDate, &bottle.PurchaseDate, &bottle.CreatedAt, &bottle.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrBottleNotFound
		}

		return nil, fmt.Errorf("failed to get bottle by ID: %v", err)
	}

	return &bottle, nil
}

func (r *Repository) DeleteBottleByID(ctx context.Context, id int) error {
	query := `DELETE FROM bottles WHERE id = ?`

	result, err := r.DB.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete bottle: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return ErrBottleNotFound
	}

	return nil
}

func (r *Repository) GetAllBottles(ctx context.Context) ([]*models.Bottle, error) {
	query := `
		SELECT id, name, opened, open_date, purchase_date, created_at, updated_at
		FROM bottles
		ORDER BY created_at DESC`

	rows, err := r.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get bottles: %v", err)
	}
	defer rows.Close()

	var bottles []*models.Bottle
	for rows.Next() {
		var bottle models.Bottle
		err := rows.Scan(&bottle.ID, &bottle.Name, &bottle.Opened, &bottle.OpenDate, &bottle.PurchaseDate, &bottle.CreatedAt, &bottle.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan bottle: %v", err)
		}

		bottles = append(bottles, &bottle)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over bottles: %v", err)
	}

	return bottles, nil
}

func (r *Repository) UpdateBottle(ctx context.Context, id int, updates *models.Bottle) (*models.Bottle, error) {
	if updates == nil {
		return nil, ErrNilBottle
	}

	query := `
		UPDATE bottles
		SET name = ?, opened = ?, open_date = ?, purchase_date = ?, updated_at = datetime('now')
		WHERE id = ?
		RETURNING id, name, opened, open_date, purchase_date, created_at, updated_at`

	var bottle models.Bottle
	err := r.DB.QueryRowContext(ctx, query, updates.Name, updates.Opened, updates.OpenDate, updates.PurchaseDate, id).Scan(
		&bottle.ID,
		&bottle.Name,
		&bottle.Opened,
		&bottle.OpenDate,
		&bottle.PurchaseDate,
		&bottle.CreatedAt,
		&bottle.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrBottleNotFound
		}
		return nil, fmt.Errorf("failed to update bottle: %v", err)
	}

	return &bottle, nil
}

func (r *Repository) CreateFresh(ctx context.Context, fresh *models.Fresh) (*models.Fresh, error) {
	if fresh == nil {
		return nil, ErrNilFresh
	}

	query := `
		INSERT INTO fresh (name, prepared_date, purchase_date, created_at, updated_at)
		VALUES (?, ?, ?, datetime('now'), datetime('now'))
		RETURNING id, created_at, updated_at`

	err := r.DB.QueryRowContext(ctx, query, fresh.Name, fresh.PreparedDate, fresh.PurchaseDate).Scan(&fresh.ID, &fresh.CreatedAt, &fresh.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create fresh item: %v", err)
	}

	return fresh, nil
}

func (r *Repository) GetFreshByID(ctx context.Context, id int) (*models.Fresh, error) {
	query := `
		SELECT id, name, prepared_date, purchase_date, created_at, updated_at
		FROM fresh
		WHERE id = ?`

	var fresh models.Fresh
	err := r.DB.QueryRowContext(ctx, query, id).Scan(&fresh.ID, &fresh.Name, &fresh.PreparedDate, &fresh.PurchaseDate, &fresh.CreatedAt, &fresh.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrFreshNotFound
		}

		return nil, fmt.Errorf("failed to get fresh item by ID: %v", err)
	}

	return &fresh, nil
}

func (r *Repository) DeleteFreshByID(ctx context.Context, id int) error {
	query := `DELETE FROM fresh WHERE id = ?`

	result, err := r.DB.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete fresh item: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return ErrFreshNotFound
	}

	return nil
}

func (r *Repository) GetAllFresh(ctx context.Context) ([]*models.Fresh, error) {
	query := `
		SELECT id, name, prepared_date, purchase_date, created_at, updated_at
		FROM fresh
		ORDER BY created_at DESC`

	rows, err := r.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get fresh items: %v", err)
	}
	defer rows.Close()

	var freshItems []*models.Fresh
	for rows.Next() {
		var fresh models.Fresh
		err := rows.Scan(&fresh.ID, &fresh.Name, &fresh.PreparedDate, &fresh.PurchaseDate, &fresh.CreatedAt, &fresh.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan fresh item: %v", err)
		}

		freshItems = append(freshItems, &fresh)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over fresh items: %v", err)
	}

	return freshItems, nil
}

func (r *Repository) UpdateFresh(ctx context.Context, id int, updates *models.Fresh) (*models.Fresh, error) {
	if updates == nil {
		return nil, ErrNilFresh
	}

	query := `
		UPDATE fresh
		SET name = ?, prepared_date = ?, purchase_date = ?, updated_at = datetime('now')
		WHERE id = ?
		RETURNING id, name, prepared_date, purchase_date, created_at, updated_at`

	var fresh models.Fresh
	err := r.DB.QueryRowContext(ctx, query, updates.Name, updates.PreparedDate, updates.PurchaseDate, id).Scan(
		&fresh.ID,
		&fresh.Name,
		&fresh.PreparedDate,
		&fresh.PurchaseDate,
		&fresh.CreatedAt,
		&fresh.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrFreshNotFound
		}
		return nil, fmt.Errorf("failed to update fresh item: %v", err)
	}

	return &fresh, nil
}
