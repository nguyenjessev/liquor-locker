package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nguyenjessev/liquor-locker/internal/types"
)

func TestRouter_RegisterRoute(t *testing.T) {
	router := NewRouter()

	// Test successful route registration
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	err := router.RegisterRoute("GET", "/test", handler)
	if err != nil {
		t.Fatalf("Failed to register route: %v", err)
	}

	// Test route conflict
	err = router.RegisterRoute("GET", "/test", handler)
	if err == nil {
		t.Fatal("Expected error for duplicate route, got nil")
	}

	// Test invalid parameters
	err = router.RegisterRoute("", "/test2", handler)
	if err == nil {
		t.Fatal("Expected error for empty method, got nil")
	}

	err = router.RegisterRoute("GET", "", handler)
	if err == nil {
		t.Fatal("Expected error for empty pattern, got nil")
	}

	err = router.RegisterRoute("GET", "/test3", nil)
	if err == nil {
		t.Fatal("Expected error for nil handler, got nil")
	}
}

func TestRouter_ServeHTTP(t *testing.T) {
	router := NewRouter()

	// Register a test route
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	err := router.RegisterRoute("GET", "/test", handler)
	if err != nil {
		t.Fatalf("Failed to register route: %v", err)
	}

	// Test the route
	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	if rr.Body.String() != "test response" {
		t.Errorf("Expected body 'test response', got '%s'", rr.Body.String())
	}
}

func TestRouter_GetRoutes(t *testing.T) {
	router := NewRouter()

	// Register multiple routes
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	routes := []struct {
		method  string
		pattern string
	}{
		{"GET", "/test1"},
		{"POST", "/test2"},
		{"PUT", "/test3"},
	}

	for _, route := range routes {
		err := router.RegisterRoute(route.method, route.pattern, handler)
		if err != nil {
			t.Fatalf("Failed to register route %s %s: %v", route.method, route.pattern, err)
		}
	}

	// Get routes
	registeredRoutes := router.GetRoutes()

	if len(registeredRoutes) != len(routes) {
		t.Errorf("Expected %d routes, got %d", len(routes), len(registeredRoutes))
	}

	// Verify route information
	for i, expected := range routes {
		actual := registeredRoutes[i]
		if actual.Method != expected.method {
			t.Errorf("Route %d: expected method %s, got %s", i, expected.method, actual.Method)
		}
		if actual.Pattern != expected.pattern {
			t.Errorf("Route %d: expected pattern %s, got %s", i, expected.pattern, actual.Pattern)
		}
	}
}

func TestRouter_RegisterGroup(t *testing.T) {
	router := NewRouter()

	// Create a test route group
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	config := types.RouteGroupConfig{
		Name:   "test-group",
		Prefix: "/api",
		Routes: []types.Route{
			types.NewRoute("GET", "/test", handler, "test-route"),
		},
		Middleware: []types.MiddlewareInfo{},
	}

	group := NewRouteGroup(config)

	// Register the group
	err := router.RegisterGroup(group)
	if err != nil {
		t.Fatalf("Failed to register group: %v", err)
	}

	// Test group route
	req := httptest.NewRequest("GET", "/api/test", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	// Test duplicate group registration
	err = router.RegisterGroup(group)
	if err == nil {
		t.Fatal("Expected error for duplicate group, got nil")
	}

	// Test nil group
	err = router.RegisterGroup(nil)
	if err == nil {
		t.Fatal("Expected error for nil group, got nil")
	}
}

func TestRouter_ConcurrentAccess(t *testing.T) {
	router := NewRouter()

	// Test concurrent route registration
	done := make(chan bool, 10)

	for i := 0; i < 10; i++ {
		go func(index int) {
			handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})
			pattern := "/test" + string(rune('0'+index))
			err := router.RegisterRoute("GET", pattern, handler)
			if err != nil {
				t.Errorf("Failed to register route %s: %v", pattern, err)
			}
			done <- true
		}(i)
	}

	// Wait for all goroutines to complete
	for i := 0; i < 10; i++ {
		<-done
	}

	// Verify all routes were registered
	routes := router.GetRoutes()
	if len(routes) != 10 {
		t.Errorf("Expected 10 routes, got %d", len(routes))
	}
}
