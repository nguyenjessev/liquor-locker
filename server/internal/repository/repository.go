package repository

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
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
