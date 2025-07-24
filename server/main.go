package main

import (
	"fmt"

	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

func main() {
	repo := repository.New()
	defer repo.CloseDB()

	if err := repo.RunMigrations(); err != nil {
		fmt.Println("Error running migrations:", err)
		return
	}
}
