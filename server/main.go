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
	fmt.Println("  PUT /bottles/{id} - Update bottle by ID")
	fmt.Println("  GET /fresh - Get all fresh items")
	fmt.Println("  POST /fresh - Create a new fresh item")
	fmt.Println("  GET /fresh/{id} - Get fresh item by ID")
	fmt.Println("  DELETE /fresh/{id} - Delete fresh item by ID")
	fmt.Println("  PUT /fresh/{id} - Update fresh item by ID")
	fmt.Println("  GET /mixers - Get all mixers")
	fmt.Println("  POST /mixers - Create a new mixer")
	fmt.Println("  GET /mixers/{id} - Get mixer by ID")
	fmt.Println("  DELETE /mixers/{id} - Delete mixer by ID")
	fmt.Println("  PUT /mixers/{id} - Update mixer by ID")
	fmt.Println("  GET /health - Health check")

	if err := server.Start(port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
