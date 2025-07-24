package main

import (
	"fmt"

	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

func main() {
	repo := repository.New()
	defer repo.CloseDB()

	err := repo.CreateBottlesTable()
	if err != nil {
		fmt.Println("Error creating bottles table:", err)
		return
	}
}
