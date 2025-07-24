package repository

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
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

func (r *Repository) CreateBottlesTable() error {
	if _, err := r.db.Exec(`
		CREATE TABLE IF NOT EXISTS bottles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`); err != nil {
		return fmt.Errorf("CreateBottlesTable(): %v", err)
	}

	return nil
}
