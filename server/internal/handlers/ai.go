package handlers

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/nguyenjessev/liquor-locker/internal/services"
)

// AIHandler handles AI-related endpoints
type AIHandler struct {
	aiService *services.OpenAIService
	mu        sync.Mutex
}

// NewAIHandler creates a new AIHandler
func NewAIHandler() *AIHandler {
	return &AIHandler{}
}

// ConfigureRequest represents the request body for configuring the AI service
type ConfigureRequest struct {
	BaseURL string `json:"base_url"`
	APIKey  string `json:"api_key"`
}

// Configure handles the configuration of the OpenAI service
func (h *AIHandler) Configure(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ConfigureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.BaseURL == "" || req.APIKey == "" {
		http.Error(w, "Base URL and API key are required", http.StatusBadRequest)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	// Clean up old service if it exists
	if h.aiService != nil {
		if err := h.aiService.Close(); err != nil {
			http.Error(w, "Failed to clean up existing service", http.StatusInternalServerError)
			return
		}
	}

	h.aiService = services.NewOpenAIService(req.BaseURL, req.APIKey)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "configured"})
}

// GetAIService returns the configured OpenAI service
func (h *AIHandler) GetAIService() *services.OpenAIService {
	return h.aiService
}
