package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

type Server struct {
	repo          *repository.Repository
	bottleHandler *BottleHandler
}

func NewServer(repo *repository.Repository) *Server {
	return &Server{
		repo:          repo,
		bottleHandler: NewBottleHandler(repo),
	}
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Handle CORS for development
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := r.URL.Path

	// Route handling
	switch {
	case path == "/bottles" && r.Method == http.MethodPost:
		s.bottleHandler.CreateBottle(w, r)
	case strings.HasPrefix(path, "/bottles/") && r.Method == http.MethodGet:
		s.bottleHandler.GetBottle(w, r)
	case path == "/health":
		s.handleHealth(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status": "ok"}`)
}

func (s *Server) Start(port string) error {
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s\n", port)
	return http.ListenAndServe(":"+port, s)
}
