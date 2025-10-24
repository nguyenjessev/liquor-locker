package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/nguyenjessev/liquor-locker/internal/groups"
)

func TestRouterIntegration_AllGroups(t *testing.T) {
	router := NewRouter()

	// Register all route groups
	inventoryGroup := groups.NewInventoryGroup()
	aiGroup := groups.NewAIGroup()
	systemGroup := groups.NewSystemGroup()

	// Register groups
	err := router.RegisterGroup(inventoryGroup)
	if err != nil {
		t.Fatalf("Failed to register inventory group: %v", err)
	}

	err = router.RegisterGroup(aiGroup)
	if err != nil {
		t.Fatalf("Failed to register AI group: %v", err)
	}

	err = router.RegisterGroup(systemGroup)
	if err != nil {
		t.Fatalf("Failed to register system group: %v", err)
	}

	// Test inventory routes
	inventoryTests := []struct {
		method         string
		path           string
		expectedStatus int
		expectedBody   string
	}{
		{"GET", "/api/inventory/bottles", http.StatusOK, "Get all bottles"},
		{"POST", "/api/inventory/bottles", http.StatusCreated, "Bottle created"},
		{"GET", "/api/inventory/bottles/123", http.StatusOK, "Get bottle by ID"},
		{"PUT", "/api/inventory/bottles/123", http.StatusOK, "Bottle updated"},
		{"DELETE", "/api/inventory/bottles/123", http.StatusNoContent, ""},
		{"GET", "/api/inventory/fresh", http.StatusOK, "Get all fresh ingredients"},
		{"POST", "/api/inventory/fresh", http.StatusCreated, "Fresh ingredient created"},
		{"GET", "/api/inventory/mixers", http.StatusOK, "Get all mixers"},
		{"POST", "/api/inventory/mixers", http.StatusCreated, "Mixer created"},
	}

	for _, test := range inventoryTests {
		req := httptest.NewRequest(test.method, test.path, nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if rr.Code != test.expectedStatus {
			t.Errorf("Inventory route %s %s: expected status %d, got %d", test.method, test.path, test.expectedStatus, rr.Code)
		}

		if test.expectedBody != "" && !strings.Contains(rr.Body.String(), test.expectedBody) {
			t.Errorf("Inventory route %s %s: expected body to contain '%s', got '%s'", test.method, test.path, test.expectedBody, rr.Body.String())
		}
	}

	// Test AI routes
	aiTests := []struct {
		method         string
		path           string
		expectedStatus int
		expectedBody   string
	}{
		{"POST", "/api/ai/suggest", http.StatusOK, "Cocktail suggestion generated"},
		{"GET", "/api/ai/suggest", http.StatusOK, "Get cocktail suggestions"},
		{"POST", "/api/ai/analyze", http.StatusOK, "Inventory analysis completed"},
		{"GET", "/api/ai/analyze/123", http.StatusOK, "Get inventory analysis"},
		{"GET", "/api/ai/recommendations", http.StatusOK, "Get recommendations"},
		{"POST", "/api/ai/recommendations", http.StatusCreated, "Recommendation created"},
		{"POST", "/api/ai/bartender", http.StatusOK, "Magic bartender response"},
		{"GET", "/api/ai/bartender/history", http.StatusOK, "Get bartender history"},
	}

	for _, test := range aiTests {
		req := httptest.NewRequest(test.method, test.path, nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if rr.Code != test.expectedStatus {
			t.Errorf("AI route %s %s: expected status %d, got %d", test.method, test.path, test.expectedStatus, rr.Code)
		}

		if test.expectedBody != "" && !strings.Contains(rr.Body.String(), test.expectedBody) {
			t.Errorf("AI route %s %s: expected body to contain '%s', got '%s'", test.method, test.path, test.expectedBody, rr.Body.String())
		}
	}

	// Test system routes
	systemTests := []struct {
		method         string
		path           string
		expectedStatus int
		expectedBody   string
	}{
		{"GET", "/api/system/health", http.StatusOK, "healthy"},
		{"GET", "/api/system/status", http.StatusOK, "operational"},
		{"GET", "/api/system/metrics", http.StatusOK, "metrics"},
		{"GET", "/api/system/info", http.StatusOK, "Liquor Locker API"},
		{"GET", "/api/system/version", http.StatusOK, "1.0.0"},
		{"GET", "/api/system/config", http.StatusOK, "config"},
		{"PUT", "/api/system/config", http.StatusOK, "Configuration updated"},
	}

	for _, test := range systemTests {
		req := httptest.NewRequest(test.method, test.path, nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if rr.Code != test.expectedStatus {
			t.Errorf("System route %s %s: expected status %d, got %d", test.method, test.path, test.expectedStatus, rr.Code)
		}

		if test.expectedBody != "" && !strings.Contains(rr.Body.String(), test.expectedBody) {
			t.Errorf("System route %s %s: expected body to contain '%s', got '%s'", test.method, test.path, test.expectedBody, rr.Body.String())
		}
	}
}

func TestRouterIntegration_ErrorHandling(t *testing.T) {
	router := NewRouter()

	// Test 404 for unregistered routes
	req := httptest.NewRequest("GET", "/api/nonexistent", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	// Should return 404 or fall back to ServeMux behavior
	if rr.Code != http.StatusNotFound {
		t.Errorf("Expected 404 for unregistered route, got %d", rr.Code)
	}
}

func TestRouterIntegration_MethodNotAllowed(t *testing.T) {
	router := NewRouter()

	// Register a GET route
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	err := router.RegisterRoute("GET", "/test", handler)
	if err != nil {
		t.Fatalf("Failed to register route: %v", err)
	}

	// Test with wrong method
	req := httptest.NewRequest("POST", "/test", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	// Should return 405 Method Not Allowed
	if rr.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405 Method Not Allowed, got %d", rr.Code)
	}
}
