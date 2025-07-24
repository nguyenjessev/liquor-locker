package repository

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

type Repository struct {
	db *sql.DB
}

func New() *Repository {
	db, err := sql.Open("sqlite3", "../database/app.db")
	if err != nil {
		panic(err)
	}

	return &Repository{db: db}
}

func (r *Repository) CloseDB() {
	r.db.Close()
}
