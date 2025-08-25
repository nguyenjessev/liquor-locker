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

type MixerHandler struct {
	repo *repository.Repository
}

func NewMixerHandler(repo *repository.Repository) *MixerHandler {
	return &MixerHandler{repo: repo}
}

// GetMixers godoc
// @Summary Get all mixers
// @Description Get a list of all mixers
// @Tags mixers
// @Produce json
// @Success 200 {array} models.Mixer
// @Router /mixers [get]
func (h *MixerHandler) CreateMixer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateMixerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	mixer := &models.Mixer{
		Name:         req.Name,
		Opened:       req.Opened,
		OpenDate:     req.OpenDate,
		PurchaseDate: req.PurchaseDate,
	}

	createdMixer, err := h.repo.CreateMixer(r.Context(), mixer)
	if err != nil {
		log.Printf("ERROR: CreateMixer failed - mixer=%+v, error=%v", mixer, err)
		if err == repository.ErrNilMixer {
			http.Error(w, "Invalid mixer data", http.StatusBadRequest)
			return
		}
		http.Error(w, "Unable to save mixer. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.MixerResponse{
		ID:           createdMixer.ID,
		Name:         createdMixer.Name,
		Opened:       createdMixer.Opened,
		OpenDate:     createdMixer.OpenDate,
		PurchaseDate: createdMixer.PurchaseDate,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetMixer godoc
// @Summary Get a mixer by ID
// @Description Get details of a specific mixer
// @Tags mixers
// @Produce json
// @Param id path int true "Mixer ID"
// @Success 200 {object} models.Mixer
// @Failure 404 {object} map[string]string
// @Router /mixers/{id} [get]
func (h *MixerHandler) GetMixer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/mixers/")
	if path == "" {
		http.Error(w, "Mixer ID is required", http.StatusBadRequest)
		return
	}
	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid mixer ID", http.StatusBadRequest)
		return
	}

	mixer, err := h.repo.GetMixerByID(r.Context(), id)
	if err != nil {
		log.Printf("ERROR: GetMixerByID failed - id=%d, error=%v", id, err)
		if err == repository.ErrMixerNotFound {
			http.Error(w, fmt.Sprintf("Mixer with ID %d not found", id), http.StatusNotFound)
			return
		}
		http.Error(w, "Unable to retrieve mixer. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.MixerResponse{
		ID:           mixer.ID,
		Name:         mixer.Name,
		Opened:       mixer.Opened,
		OpenDate:     mixer.OpenDate,
		PurchaseDate: mixer.PurchaseDate,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


// CreateMixer godoc
// @Summary Create a new mixer
// @Description Add a new mixer to the collection
// @Tags mixers
// @Accept json
// @Produce json
// @Param mixer body models.Mixer true "Mixer to create"
// @Success 201 {object} models.Mixer
// @Failure 400 {object} map[string]string
// @Router /mixers [post]
func (h *MixerHandler) DeleteMixer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/mixers/")
	if path == "" {
		http.Error(w, "Mixer ID is required", http.StatusBadRequest)
		return
	}
	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid mixer ID", http.StatusBadRequest)
		return
	}

	err = h.repo.DeleteMixerByID(r.Context(), id)
	if err != nil {
		log.Printf("ERROR: DeleteMixerByID failed - id=%d, error=%v", id, err)
		if err == repository.ErrMixerNotFound {
			http.Error(w, fmt.Sprintf("Mixer with ID %d not found", id), http.StatusNotFound)
			return
		}
		http.Error(w, "Unable to delete mixer. Please try again.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}


// UpdateMixer godoc
// @Summary Update a mixer
// @Description Update an existing mixer by ID
// @Tags mixers
// @Accept json
// @Produce json
// @Param id path int true "Mixer ID"
// @Param mixer body models.Mixer true "Mixer to update"
// @Success 200 {object} models.Mixer
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /mixers/{id} [put]
func (h *MixerHandler) UpdateMixer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/mixers/")
	if path == "" {
		http.Error(w, "Mixer ID is required", http.StatusBadRequest)
		return
	}
	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, "Invalid mixer ID", http.StatusBadRequest)
		return
	}

	var req models.UpdateMixerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	updates := &models.Mixer{
		Name:         req.Name,
		Opened:       req.Opened,
		OpenDate:     req.OpenDate,
		PurchaseDate: req.PurchaseDate,
	}

	updatedMixer, err := h.repo.UpdateMixer(r.Context(), id, updates)
	if err != nil {
		log.Printf("ERROR: UpdateMixer failed - id=%d, updates=%+v, error=%v", id, updates, err)
		if err == repository.ErrMixerNotFound {
			http.Error(w, fmt.Sprintf("Mixer with ID %d not found", id), http.StatusNotFound)
			return
		}
		if err == repository.ErrNilMixer {
			http.Error(w, "Invalid mixer data", http.StatusBadRequest)
			return
		}
		http.Error(w, "Unable to update mixer. Please try again.", http.StatusInternalServerError)
		return
	}

	response := models.MixerResponse{
		ID:           updatedMixer.ID,
		Name:         updatedMixer.Name,
		Opened:       updatedMixer.Opened,
		OpenDate:     updatedMixer.OpenDate,
		PurchaseDate: updatedMixer.PurchaseDate,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


// DeleteMixer godoc
// @Summary Delete a mixer
// @Description Delete a mixer by ID
// @Tags mixers
// @Produce json
// @Param id path int true "Mixer ID"
// @Success 204 {object} nil
// @Failure 404 {object} map[string]string
// @Router /mixers/{id} [delete]
func (h *MixerHandler) GetAllMixers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	mixers, err := h.repo.GetAllMixers(r.Context())
	if err != nil {
		log.Printf("ERROR: GetAllMixers failed - error=%v", err)
		http.Error(w, "Unable to load mixers. Please refresh the page.", http.StatusInternalServerError)
		return
	}

	responses := make([]models.MixerResponse, 0)
	for _, mixer := range mixers {
		responses = append(responses, models.MixerResponse{
			ID:           mixer.ID,
			Name:         mixer.Name,
			Opened:       mixer.Opened,
			OpenDate:     mixer.OpenDate,
			PurchaseDate: mixer.PurchaseDate,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}
