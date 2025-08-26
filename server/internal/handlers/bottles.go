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

// CreateBottle godoc
// @Summary      Create a new bottle
// @Description  Adds a new bottle to the collection
// @Tags         bottles
// @Accept       json
// @Produce      json
// @Param        bottle  body      models.CreateBottleRequest  true  "Bottle to add"
// @Success      201     {object}  models.BottleResponse
// @Failure      400     {object}  map[string]string
// @Failure      500     {object}  map[string]string
// @Router       /api/bottles [post]
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
		Name:   req.Name,
		Opened: req.Opened,
	}

	if req.OpenDate != nil {
		bottle.OpenDate = req.OpenDate
	}

	if req.PurchaseDate != nil {
		bottle.PurchaseDate = req.PurchaseDate
	}

	if req.Price != nil {
		bottle.Price = req.Price
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
		ID:           createdBottle.ID,
		Name:         createdBottle.Name,
		Opened:       createdBottle.Opened,
		OpenDate:     createdBottle.OpenDate,
		PurchaseDate: createdBottle.PurchaseDate,
		Price:        createdBottle.Price,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GetBottle godoc
// @Summary      Get a bottle by ID
// @Description  Returns a single bottle by its ID
// @Tags         bottles
// @Produce      json
// @Param        id   path      int  true  "Bottle ID"
// @Success      200  {object}  models.BottleResponse
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/bottles/{id} [get]
func (h *BottleHandler) GetBottle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/bottles/")
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
		ID:           bottle.ID,
		Name:         bottle.Name,
		Opened:       bottle.Opened,
		OpenDate:     bottle.OpenDate,
		PurchaseDate: bottle.PurchaseDate,
		Price:        bottle.Price,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// DeleteBottle godoc
// @Summary      Delete a bottle by ID
// @Description  Deletes a bottle from the collection by its ID
// @Tags         bottles
// @Param        id   path      int  true  "Bottle ID"
// @Success      204  {object}  nil
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/bottles/{id} [delete]
func (h *BottleHandler) DeleteBottle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/bottles/")
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

// UpdateBottle godoc
// @Summary      Update a bottle by ID
// @Description  Updates a bottle's information by its ID
// @Tags         bottles
// @Accept       json
// @Produce      json
// @Param        id      path      int                      true  "Bottle ID"
// @Param        bottle  body      models.UpdateBottleRequest  true  "Bottle update info"
// @Success      200     {object}  models.BottleResponse
// @Failure      400     {object}  map[string]string
// @Failure      404     {object}  map[string]string
// @Router       /api/bottles/{id} [put]
func (h *BottleHandler) UpdateBottle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/bottles/")
	if path == "" {
		http.Error(w, "Bottle ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid bottle ID", http.StatusBadRequest)
		return
	}

	var req models.UpdateBottleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	updates := &models.Bottle{
		Name:   req.Name,
		Opened: req.Opened,
	}

	if req.OpenDate != nil {
		updates.OpenDate = req.OpenDate
	}

	if req.PurchaseDate != nil {
		updates.PurchaseDate = req.PurchaseDate
	}

	if req.Price != nil {
		updates.Price = req.Price
	}

	updatedBottle, err := h.repo.UpdateBottle(r.Context(), id, updates)
	if err != nil {
		log.Printf("ERROR: UpdateBottle failed - id=%d, updates=%+v, error=%v", id, updates, err)
		if err == repository.ErrBottleNotFound {
			http.Error(w, fmt.Sprintf("Bottle with ID %d not found", id), http.StatusNotFound)
			return
		}
		if err == repository.ErrNilBottle {
			http.Error(w, "Invalid bottle data", http.StatusBadRequest)
			return
		}
		http.Error(w, "Unable to update bottle. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.BottleResponse{
		ID:           updatedBottle.ID,
		Name:         updatedBottle.Name,
		Opened:       updatedBottle.Opened,
		OpenDate:     updatedBottle.OpenDate,
		PurchaseDate: updatedBottle.PurchaseDate,
		Price:        updatedBottle.Price,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GetAllBottles godoc
// @Summary      Get all bottles
// @Description  Returns a list of all bottles
// @Tags         bottles
// @Produce      json
// @Success      200  {array}   models.BottleResponse
// @Failure      500  {object}  map[string]string
// @Router       /api/bottles [get]
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
			ID:           bottle.ID,
			Name:         bottle.Name,
			Opened:       bottle.Opened,
			OpenDate:     bottle.OpenDate,
			PurchaseDate: bottle.PurchaseDate,
			Price:        bottle.Price,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(responses); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
