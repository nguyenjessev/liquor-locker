package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/nguyenjessev/liquor-locker/internal/models"
	"github.com/nguyenjessev/liquor-locker/internal/repository"
)

type BottleHandler struct {
	repo *repository.Repository
}

func NewBottleHandler(repo *repository.Repository) *BottleHandler {
	return &BottleHandler{repo: repo}
}

func (h *BottleHandler) CreateBottle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateBottleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	bottle := &models.Bottle{
		Name:     req.Name,
		Opened:   req.Opened,
		OpenDate: req.OpenDate,
	}

	createdBottle, err := h.repo.CreateBottle(r.Context(), bottle)
	if err != nil {
		log.Printf("ERROR: CreateBottle failed - bottle=%+v, error=%v", bottle, err)
		if err == repository.ErrNilBottle {
			http.Error(w, "Invalid bottle data", http.StatusBadRequest)
			return
		}
		http.Error(w, "Unable to save bottle. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.BottleResponse{
		ID:        createdBottle.ID,
		Name:      createdBottle.Name,
		Opened:    createdBottle.Opened,
		OpenDate:  createdBottle.OpenDate,
		CreatedAt: createdBottle.CreatedAt,
		UpdatedAt: createdBottle.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *BottleHandler) GetBottle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/bottles/")
	if path == "" {
		http.Error(w, "Bottle ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid bottle ID", http.StatusBadRequest)
		return
	}

	bottle, err := h.repo.GetBottleByID(r.Context(), id)
	if err != nil {
		log.Printf("ERROR: GetBottleByID failed - id=%d, error=%v", id, err)
		if err == repository.ErrBottleNotFound {
			http.Error(w, fmt.Sprintf("Bottle with ID %d not found", id), http.StatusNotFound)
			return
		}
		http.Error(w, "Unable to retrieve bottle. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.BottleResponse{
		ID:        bottle.ID,
		Name:      bottle.Name,
		Opened:    bottle.Opened,
		OpenDate:  bottle.OpenDate,
		CreatedAt: bottle.CreatedAt,
		UpdatedAt: bottle.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *BottleHandler) DeleteBottle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/bottles/")
	if path == "" {
		http.Error(w, "Bottle ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid bottle ID", http.StatusBadRequest)
		return
	}

	err = h.repo.DeleteBottleByID(r.Context(), id)
	if err != nil {
		log.Printf("ERROR: DeleteBottleByID failed - id=%d, error=%v", id, err)
		if err == repository.ErrBottleNotFound {
			http.Error(w, fmt.Sprintf("Bottle with ID %d not found", id), http.StatusNotFound)
			return
		}
		http.Error(w, "Unable to delete bottle. Please try again.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *BottleHandler) GetAllBottles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	bottles, err := h.repo.GetAllBottles(r.Context())
	if err != nil {
		log.Printf("ERROR: GetAllBottles failed - error=%v", err)
		http.Error(w, "Unable to load bottles. Please refresh the page.", http.StatusInternalServerError)
		return
	}

	responses := make([]models.BottleResponse, 0)
	for _, bottle := range bottles {
		responses = append(responses, models.BottleResponse{
			ID:        bottle.ID,
			Name:      bottle.Name,
			Opened:    bottle.Opened,
			OpenDate:  bottle.OpenDate,
			CreatedAt: bottle.CreatedAt,
			UpdatedAt: bottle.UpdatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(responses); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
