package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nguyenjessev/liquor-locker/internal/types"
)

func TestRouteGroup_InventoryGroup(t *testing.T) {
	router := NewRouter()

	// Create inventory route group
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("inventory response"))
	})

	routes := []types.Route{
		types.NewRoute("GET", "/bottles", handler, "get-bottles"),
		types.NewRoute("POST", "/bottles", handler, "create-bottle"),
		types.NewRoute("PUT", "/bottles/{id}", handler, "update-bottle"),
		types.NewRoute("DELETE", "/bottles/{id}", handler, "delete-bottle"),
	}

	config := types.RouteGroupConfig{
		Name:       "inventory",
		Prefix:     "/api/inventory",
		Routes:     routes,
		Middleware: []types.MiddlewareInfo{},
	}

	group := NewRouteGroup(config)

	// Register the group
	err := router.RegisterGroup(group)
	if err != nil {
		t.Fatalf("Failed to register inventory group: %v", err)
	}

	// Test all inventory routes
	testCases := []struct {
		method         string
		path           string
		expectedStatus int
	}{
		{"GET", "/api/inventory/bottles", http.StatusOK},
		{"POST", "/api/inventory/bottles", http.StatusOK},
		{"PUT", "/api/inventory/bottles/123", http.StatusOK},
		{"DELETE", "/api/inventory/bottles/123", http.StatusOK},
	}

	for _, tc := range testCases {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if rr.Code != tc.expectedStatus {
			t.Errorf("Route %s %s: expected status %d, got %d", tc.method, tc.path, tc.expectedStatus, rr.Code)
		}
	}
}

func TestRouteGroup_AIGroup(t *testing.T) {
	router := NewRouter()

	// Create AI route group
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("AI response"))
	})

	routes := []types.Route{
		types.NewRoute("POST", "/suggest", handler, "suggest-cocktail"),
		types.NewRoute("POST", "/analyze", handler, "analyze-inventory"),
		types.NewRoute("GET", "/recommendations", handler, "get-recommendations"),
	}

	config := types.RouteGroupConfig{
		Name:       "ai",
		Prefix:     "/api/ai",
		Routes:     routes,
		Middleware: []types.MiddlewareInfo{},
	}

	group := NewRouteGroup(config)

	// Register the group
	err := router.RegisterGroup(group)
	if err != nil {
		t.Fatalf("Failed to register AI group: %v", err)
	}

	// Test AI routes
	testCases := []struct {
		method         string
		path           string
		expectedStatus int
	}{
		{"POST", "/api/ai/suggest", http.StatusOK},
		{"POST", "/api/ai/analyze", http.StatusOK},
		{"GET", "/api/ai/recommendations", http.StatusOK},
	}

	for _, tc := range testCases {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if rr.Code != tc.expectedStatus {
			t.Errorf("Route %s %s: expected status %d, got %d", tc.method, tc.path, tc.expectedStatus, rr.Code)
		}
	}
}

func TestRouteGroup_SystemGroup(t *testing.T) {
	router := NewRouter()

	// Create system route group
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("system response"))
	})

	routes := []types.Route{
		types.NewRoute("GET", "/health", handler, "health-check"),
		types.NewRoute("GET", "/status", handler, "status-check"),
		types.NewRoute("GET", "/metrics", handler, "metrics"),
	}

	config := types.RouteGroupConfig{
		Name:       "system",
		Prefix:     "/api/system",
		Routes:     routes,
		Middleware: []types.MiddlewareInfo{},
	}

	group := NewRouteGroup(config)

	// Register the group
	err := router.RegisterGroup(group)
	if err != nil {
		t.Fatalf("Failed to register system group: %v", err)
	}

	// Test system routes
	testCases := []struct {
		method         string
		path           string
		expectedStatus int
	}{
		{"GET", "/api/system/health", http.StatusOK},
		{"GET", "/api/system/status", http.StatusOK},
		{"GET", "/api/system/metrics", http.StatusOK},
	}

	for _, tc := range testCases {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if rr.Code != tc.expectedStatus {
			t.Errorf("Route %s %s: expected status %d, got %d", tc.method, tc.path, tc.expectedStatus, rr.Code)
		}
	}
}

func TestRouteGroup_MultipleGroups(t *testing.T) {
	router := NewRouter()

	// Create multiple route groups
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("group response"))
	})

	// Inventory group
	inventoryRoutes := []types.Route{
		types.NewRoute("GET", "/bottles", handler, "get-bottles"),
		types.NewRoute("POST", "/bottles", handler, "create-bottle"),
	}

	inventoryConfig := types.RouteGroupConfig{
		Name:       "inventory",
		Prefix:     "/api/inventory",
		Routes:     inventoryRoutes,
		Middleware: []types.MiddlewareInfo{},
	}

	// AI group
	aiRoutes := []types.Route{
		types.NewRoute("POST", "/suggest", handler, "suggest-cocktail"),
		types.NewRoute("GET", "/recommendations", handler, "get-recommendations"),
	}

	aiConfig := types.RouteGroupConfig{
		Name:       "ai",
		Prefix:     "/api/ai",
		Routes:     aiRoutes,
		Middleware: []types.MiddlewareInfo{},
	}

	// Register both groups
	err := router.RegisterGroup(NewRouteGroup(inventoryConfig))
	if err != nil {
		t.Fatalf("Failed to register inventory group: %v", err)
	}

	err = router.RegisterGroup(NewRouteGroup(aiConfig))
	if err != nil {
		t.Fatalf("Failed to register AI group: %v", err)
	}

	// Test routes from both groups
	testCases := []struct {
		method         string
		path           string
		expectedStatus int
	}{
		{"GET", "/api/inventory/bottles", http.StatusOK},
		{"POST", "/api/inventory/bottles", http.StatusOK},
		{"POST", "/api/ai/suggest", http.StatusOK},
		{"GET", "/api/ai/recommendations", http.StatusOK},
	}

	for _, tc := range testCases {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if rr.Code != tc.expectedStatus {
			t.Errorf("Route %s %s: expected status %d, got %d", tc.method, tc.path, tc.expectedStatus, rr.Code)
		}
	}
}

func TestRouteGroup_GroupValidation(t *testing.T) {
	router := NewRouter()

	// Test nil group
	err := router.RegisterGroup(nil)
	if err == nil {
		t.Fatal("Expected error for nil group, got nil")
	}

	// Test duplicate group name
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	config1 := types.RouteGroupConfig{
		Name:       "test-group",
		Prefix:     "/api/test1",
		Routes:     []types.Route{types.NewRoute("GET", "/test", handler)},
		Middleware: []types.MiddlewareInfo{},
	}

	config2 := types.RouteGroupConfig{
		Name:       "test-group",
		Prefix:     "/api/test2",
		Routes:     []types.Route{types.NewRoute("GET", "/test", handler)},
		Middleware: []types.MiddlewareInfo{},
	}

	// Register first group
	err = router.RegisterGroup(NewRouteGroup(config1))
	if err != nil {
		t.Fatalf("Failed to register first group: %v", err)
	}

	// Try to register duplicate group
	err = router.RegisterGroup(NewRouteGroup(config2))
	if err == nil {
		t.Fatal("Expected error for duplicate group name, got nil")
	}
}

func TestRouteGroup_GroupInfo(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	routes := []types.Route{
		types.NewRoute("GET", "/test1", handler, "test1"),
		types.NewRoute("POST", "/test2", handler, "test2"),
	}

	config := types.RouteGroupConfig{
		Name:       "test-group",
		Prefix:     "/api/test",
		Routes:     routes,
		Middleware: []types.MiddlewareInfo{},
	}

	group := NewRouteGroup(config)

	// Test group properties
	if group.Name() != "test-group" {
		t.Errorf("Expected group name 'test-group', got '%s'", group.Name())
	}

	if group.Prefix() != "/api/test" {
		t.Errorf("Expected group prefix '/api/test', got '%s'", group.Prefix())
	}

	groupRoutes := group.Routes()
	if len(groupRoutes) != 2 {
		t.Errorf("Expected 2 routes, got %d", len(groupRoutes))
	}

	groupMiddleware := group.Middleware()
	if len(groupMiddleware) != 0 {
		t.Errorf("Expected 0 middleware, got %d", len(groupMiddleware))
	}
}
