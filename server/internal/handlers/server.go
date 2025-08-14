package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

type Server struct {
	repo           *repository.Repository
	bottleHandler  *BottleHandler
	freshHandler   *FreshHandler
	aiHandler      *AIHandler
	allowedOrigins []string
	apiKey         string
}

func NewServer(repo *repository.Repository) *Server {
	// Get allowed origins from environment, default to localhost for development
	allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	if len(allowedOrigins) == 1 && allowedOrigins[0] == "" {
		allowedOrigins = []string{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"}
	}

	// Get API key from environment
	apiKey := os.Getenv("API_KEY")
	if apiKey == "" && os.Getenv("GO_ENV") != "development" {
		log.Println("WARNING: API_KEY not set. API will be unsecured.")
	}

	return &Server{
		repo:           repo,
		bottleHandler:  NewBottleHandler(repo),
		freshHandler:   NewFreshHandler(repo),
		aiHandler:      NewAIHandler(),
		allowedOrigins: allowedOrigins,
		apiKey:         apiKey,
	}
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Security middleware
	if !s.handleSecurity(w, r) {
		return
	}

	path := r.URL.Path

	// Route handling
	switch {
	case path == "/bottles" && r.Method == http.MethodPost:
		s.bottleHandler.CreateBottle(w, r)
	case path == "/bottles" && r.Method == http.MethodGet:
		s.bottleHandler.GetAllBottles(w, r)
	case strings.HasPrefix(path, "/bottles/") && r.Method == http.MethodGet:
		s.bottleHandler.GetBottle(w, r)
	case strings.HasPrefix(path, "/bottles/") && r.Method == http.MethodDelete:
		s.bottleHandler.DeleteBottle(w, r)
	case strings.HasPrefix(path, "/bottles/") && r.Method == http.MethodPut:
		s.bottleHandler.UpdateBottle(w, r)
	case path == "/fresh" && r.Method == http.MethodPost:
		s.freshHandler.CreateFresh(w, r)
	case path == "/fresh" && r.Method == http.MethodGet:
		s.freshHandler.GetAllFresh(w, r)
	case strings.HasPrefix(path, "/fresh/") && r.Method == http.MethodGet:
		s.freshHandler.GetFresh(w, r)
	case strings.HasPrefix(path, "/fresh/") && r.Method == http.MethodDelete:
		s.freshHandler.DeleteFresh(w, r)
	case strings.HasPrefix(path, "/fresh/") && r.Method == http.MethodPut:
		s.freshHandler.UpdateFresh(w, r)
	case path == "/health":
		s.handleHealth(w, r)
	case path == "/ai/configure":
		s.aiHandler.Configure(w, r)
	default:
		http.NotFound(w, r)
	}
}

// handleSecurity applies security middleware and returns false if request should be blocked
func (s *Server) handleSecurity(w http.ResponseWriter, r *http.Request) bool {
	origin := r.Header.Get("Origin")

	// Handle CORS
	if !s.isAllowedOrigin(origin) {
		if origin != "" { // Only log when Origin header is present
			log.Printf("SECURITY: Blocked request from unauthorized origin: %s", origin)
			http.Error(w, "Unauthorized origin", http.StatusForbidden)
			return false
		}
	}

	// Set CORS headers for allowed origins
	if origin != "" && s.isAllowedOrigin(origin) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	} else if origin == "" && os.Getenv("GO_ENV") == "development" {
		// Allow requests without Origin header in development (e.g., Postman, curl)
		w.Header().Set("Access-Control-Allow-Origin", "*")
	}

	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
	w.Header().Set("Access-Control-Allow-Credentials", "true")

	// Handle preflight requests
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return false
	}

	// API Key validation (skip for health endpoint and in development mode)
	if r.URL.Path != "/health" && s.apiKey != "" {
		providedKey := r.Header.Get("X-API-Key")
		if providedKey != s.apiKey {
			log.Printf("SECURITY: Blocked request with invalid/missing API key from %s", r.RemoteAddr)
			http.Error(w, "Invalid or missing API key", http.StatusUnauthorized)
			return false
		}
	}

	// Additional security headers
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("X-XSS-Protection", "1; mode=block")

	return true
}

// isAllowedOrigin checks if the origin is in the allowed list
func (s *Server) isAllowedOrigin(origin string) bool {
	if origin == "" {
		return true // Allow requests without Origin header (e.g., same-origin, Postman)
	}

	for _, allowed := range s.allowedOrigins {
		if origin == allowed {
			return true
		}
	}
	return false
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
