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

type FreshHandler struct {
	repo *repository.Repository
}

func NewFreshHandler(repo *repository.Repository) *FreshHandler {
	return &FreshHandler{repo: repo}
}

// CreateFresh godoc
// @Summary Create a new fresh item
// @Description Add a new fresh item to the collection
// @Tags fresh
// @Accept json
// @Produce json
// @Param fresh body models.CreateFreshRequest true "Fresh item to create"
// @Success 201 {object} models.FreshResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /fresh [post]
func (h *FreshHandler) CreateFresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateFreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	fresh := &models.Fresh{
		Name:         req.Name,
		PreparedDate: req.PreparedDate,
		PurchaseDate: req.PurchaseDate,
		Price:        req.Price,
	}

	createdFresh, err := h.repo.CreateFresh(r.Context(), fresh)
	if err != nil {
		log.Printf("ERROR: CreateFresh failed - fresh=%+v, error=%v", fresh, err)
		if err == repository.ErrNilFresh {
			http.Error(w, "Invalid fresh data", http.StatusBadRequest)
			return
		}
		http.Error(w, "Unable to save fresh item. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.FreshResponse{
		ID:           createdFresh.ID,
		Name:         createdFresh.Name,
		PreparedDate: createdFresh.PreparedDate,
		PurchaseDate: createdFresh.PurchaseDate,
		Price:        createdFresh.Price,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GetFresh godoc
// @Summary Get a fresh item by ID
// @Description Get details of a specific fresh item
// @Tags fresh
// @Produce json
// @Param id path int true "Fresh ID"
// @Success 200 {object} models.FreshResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /fresh/{id} [get]
func (h *FreshHandler) GetFresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/fresh/")
	if path == "" {
		http.Error(w, "Fresh ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid fresh ID", http.StatusBadRequest)
		return
	}

	fresh, err := h.repo.GetFreshByID(r.Context(), id)
	if err != nil {
		log.Printf("ERROR: GetFreshByID failed - id=%d, error=%v", id, err)
		if err == repository.ErrFreshNotFound {
			http.Error(w, fmt.Sprintf("Fresh item with ID %d not found", id), http.StatusNotFound)
			return
		}
		http.Error(w, "Unable to retrieve fresh item. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.FreshResponse{
		ID:           fresh.ID,
		Name:         fresh.Name,
		PreparedDate: fresh.PreparedDate,
		PurchaseDate: fresh.PurchaseDate,
		Price:        fresh.Price,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// DeleteFresh godoc
// @Summary Delete a fresh item
// @Description Delete a fresh item by ID
// @Tags fresh
// @Produce json
// @Param id path int true "Fresh ID"
// @Success 204 {object} nil
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /fresh/{id} [delete]
func (h *FreshHandler) DeleteFresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/fresh/")
	if path == "" {
		http.Error(w, "Fresh ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid fresh ID", http.StatusBadRequest)
		return
	}

	err = h.repo.DeleteFreshByID(r.Context(), id)
	if err != nil {
		log.Printf("ERROR: DeleteFreshByID failed - id=%d, error=%v", id, err)
		if err == repository.ErrFreshNotFound {
			http.Error(w, fmt.Sprintf("Fresh item with ID %d not found", id), http.StatusNotFound)
			return
		}
		http.Error(w, "Unable to delete fresh item. Please try again.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UpdateFresh godoc
// @Summary Update a fresh item
// @Description Update an existing fresh item by ID
// @Tags fresh
// @Accept json
// @Produce json
// @Param id path int true "Fresh ID"
// @Param fresh body models.UpdateFreshRequest true "Fresh item to update"
// @Success 200 {object} models.FreshResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /fresh/{id} [put]
func (h *FreshHandler) UpdateFresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/fresh/")
	if path == "" {
		http.Error(w, "Fresh ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid fresh ID", http.StatusBadRequest)
		return
	}

	var req models.UpdateFreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	updates := &models.Fresh{
		Name:         req.Name,
		PurchaseDate: req.PurchaseDate,
		PreparedDate: req.PreparedDate,
		Price:        req.Price,
	}

	updatedFresh, err := h.repo.UpdateFresh(r.Context(), id, updates)
	if err != nil {
		log.Printf("ERROR: UpdateFresh failed - id=%d, updates=%+v, error=%v", id, updates, err)
		if err == repository.ErrFreshNotFound {
			http.Error(w, fmt.Sprintf("Fresh item with ID %d not found", id), http.StatusNotFound)
			return
		}
		if err == repository.ErrNilFresh {
			http.Error(w, "Invalid fresh data", http.StatusBadRequest)
			return
		}
		http.Error(w, "Unable to update fresh item. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.FreshResponse{
		ID:           updatedFresh.ID,
		Name:         updatedFresh.Name,
		PreparedDate: updatedFresh.PreparedDate,
		PurchaseDate: updatedFresh.PurchaseDate,
		Price:        updatedFresh.Price,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GetAllFresh godoc
// @Summary Get all fresh items
// @Description Get a list of all fresh items
// @Tags fresh
// @Produce json
// @Success 200 {array} models.FreshResponse
// @Failure 500 {object} map[string]string
// @Router /fresh [get]
func (h *FreshHandler) GetAllFresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	freshItems, err := h.repo.GetAllFresh(r.Context())
	if err != nil {
		log.Printf("ERROR: GetAllFresh failed - error=%v", err)
		http.Error(w, "Unable to load fresh items. Please refresh the page.", http.StatusInternalServerError)
		return
	}

	responses := make([]models.FreshResponse, 0)
	for _, fresh := range freshItems {
		responses = append(responses, models.FreshResponse{
			ID:           fresh.ID,
			Name:         fresh.Name,
			PreparedDate: fresh.PreparedDate,
			PurchaseDate: fresh.PurchaseDate,
			Price:        fresh.Price,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(responses); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
