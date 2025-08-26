package handlers

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/nguyenjessev/liquor-locker/internal/repository"
	"github.com/nguyenjessev/liquor-locker/internal/services"
)

// AIHandler handles AI-related endpoints
type AIHandler struct {
	aiService *services.OpenAIService
	mu        sync.Mutex
}

// ListModels godoc
// @Summary List available AI models
// @Description Returns a list of available AI models
// @Tags ai
// @Produce json
// @Success 200 {array} string
// @Failure 405 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /ai/models [get]
func (h *AIHandler) ListModels(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	if h.aiService == nil {
		http.Error(w, "AI service not configured", http.StatusServiceUnavailable)
		return
	}

	models, err := h.aiService.ListModels(r.Context())
	if err != nil {
		http.Error(w, "Failed to list models: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(models); err != nil {
		http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

// NewAIHandler creates a new AIHandler
func NewAIHandler() *AIHandler {
	return &AIHandler{}
}

// RecommendCocktailHandler godoc
// @Summary Recommend a cocktail
// @Description Get a cocktail recommendation from the AI
// @Tags ai
// @Accept json
// @Produce json
// @Param request body object true "Model selection"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 405 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /cocktails/recommendation [post]
func (h *AIHandler) RecommendCocktailHandler(repo *repository.Repository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Model string `json:"model"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		if req.Model == "" {
			http.Error(w, "Missing required field: model", http.StatusBadRequest)
			return
		}

		h.mu.Lock()
		defer h.mu.Unlock()

		if h.aiService == nil {
			http.Error(w, "AI service not configured", http.StatusServiceUnavailable)
			return
		}

		resp, err := h.aiService.RecommendCocktail(r.Context(), repo, req.Model)
		if err != nil {
			http.Error(w, "Failed to recommend cocktail: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

// ConfigureRequest represents the request body for configuring the AI service
type ConfigureRequest struct {
	BaseURL string `json:"base_url"`
	APIKey  string `json:"api_key"`
}

// Configure godoc
// @Summary Configure the AI service
// @Description Configure the OpenAI service with base URL and API key
// @Tags ai
// @Accept json
// @Produce json
// @Param config body ConfigureRequest true "AI service configuration"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 405 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /ai/configure [post]
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

	if req.BaseURL == "" {
		http.Error(w, "Base URL is required", http.StatusBadRequest)
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

// ServiceStatusHandler godoc
// @Summary Get AI service status
// @Description Check if the AI service is initialized
// @Tags ai
// @Produce json
// @Success 200 {object} map[string]bool
// @Failure 405 {object} map[string]string
// @Router /ai/service [get]
func (h *AIHandler) ServiceStatusHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	status := map[string]bool{
		"initialized": h.aiService != nil,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(status); err != nil {
		http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
