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
	fmt.Println("  GET /api/bottles - Get all bottles")
	fmt.Println("  POST /api/bottles - Create a new bottle")
	fmt.Println("  GET /api/bottles/{id} - Get bottle by ID")
	fmt.Println("  DELETE /api/bottles/{id} - Delete bottle by ID")
	fmt.Println("  PUT /api/bottles/{id} - Update bottle by ID")
	fmt.Println("  GET /api/fresh - Get all fresh items")
	fmt.Println("  POST /api/fresh - Create a new fresh item")
	fmt.Println("  GET /api/fresh/{id} - Get fresh item by ID")
	fmt.Println("  DELETE /api/fresh/{id} - Delete fresh item by ID")
	fmt.Println("  PUT /api/fresh/{id} - Update fresh item by ID")
	fmt.Println("  GET /api/mixers - Get all mixers")
	fmt.Println("  POST /api/mixers - Create a new mixer")
	fmt.Println("  GET /api/mixers/{id} - Get mixer by ID")
	fmt.Println("  DELETE /api/mixers/{id} - Delete mixer by ID")
	fmt.Println("  PUT /api/mixers/{id} - Update mixer by ID")
	fmt.Println("  GET /health - Health check")

	if err := server.Start(port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
