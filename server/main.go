package main

import (
	"fmt"
	"log"
	"os"

	"github.com/nguyenjessev/liquor-locker/internal/handlers"
	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

func main() {
	repo := repository.New()
	defer repo.CloseDB()

	if err := repo.RunMigrations(); err != nil {
		fmt.Println("Error running migrations:", err)
		return
	}

	server := handlers.NewServer(repo)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Starting server on port %s\n", port)
	fmt.Println("Available endpoints:")
	fmt.Println("  GET /bottles - Get all bottles")
	fmt.Println("  POST /bottles - Create a new bottle")
	fmt.Println("  GET /bottles/{id} - Get bottle by ID")
	fmt.Println("  DELETE /bottles/{id} - Delete bottle by ID")
	fmt.Println("  GET /health - Health check")

	if err := server.Start(port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
