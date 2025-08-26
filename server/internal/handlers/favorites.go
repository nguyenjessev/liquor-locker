package handlers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "github.com/nguyenjessev/liquor-locker/internal/models"
    "github.com/nguyenjessev/liquor-locker/internal/repository"
)

type FavoriteHandler struct {
    Repo *repository.Repository
}

// POST /api/favorites
func (h *FavoriteHandler) CreateFavorite(w http.ResponseWriter, r *http.Request) {
    var fav models.Favorite
    if err := json.NewDecoder(r.Body).Decode(&fav); err != nil {
        http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
        return
    }
    created, err := h.Repo.CreateFavorite(r.Context(), &fav)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(created)
}

// GET /api/favorites
func (h *FavoriteHandler) GetFavoritesByUser(w http.ResponseWriter, r *http.Request) {
    favorites, err := h.Repo.GetFavoritesByUser(r.Context())
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(favorites)
}

// PUT /api/favorites/{id}
func (h *FavoriteHandler) UpdateFavorite(w http.ResponseWriter, r *http.Request) {
    idStr := r.URL.Query().Get("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "Invalid id", http.StatusBadRequest)
        return
    }
    var fav models.Favorite
    if err := json.NewDecoder(r.Body).Decode(&fav); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    updated, err := h.Repo.UpdateFavorite(r.Context(), id, &fav)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(updated)
}

// DELETE /api/favorites/?id=123
func (h *FavoriteHandler) DeleteFavorite(w http.ResponseWriter, r *http.Request) {
    idStr := r.URL.Query().Get("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
        return
    }
    err = h.Repo.DeleteFavorite(r.Context(), id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}