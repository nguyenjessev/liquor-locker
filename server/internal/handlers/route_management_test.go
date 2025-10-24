package handlers

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRouteManagement_DynamicRegistration(t *testing.T) {
	router := NewRouter()

	// Test dynamic route registration
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("dynamic route"))
	})

	// Register route dynamically
	err := router.RegisterRoute("GET", "/dynamic", handler)
	if err != nil {
		t.Fatalf("Failed to register dynamic route: %v", err)
	}

	// Test the route
	req := httptest.NewRequest("GET", "/dynamic", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	if rr.Body.String() != "dynamic route" {
		t.Errorf("Expected body 'dynamic route', got '%s'", rr.Body.String())
	}
}

func TestRouteManagement_HTTPMethodRouting(t *testing.T) {
	router := NewRouter()

	// Create handlers for different HTTP methods
	getHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("GET response"))
	})

	postHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("POST response"))
	})

	putHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("PUT response"))
	})

	deleteHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
		w.Write([]byte("DELETE response"))
	})

	// Register routes with different methods
	routes := []struct {
		method         string
		pattern        string
		handler        http.Handler
		expectedStatus int
		expectedBody   string
	}{
		{"GET", "/resource", getHandler, http.StatusOK, "GET response"},
		{"POST", "/resource", postHandler, http.StatusCreated, "POST response"},
		{"PUT", "/resource", putHandler, http.StatusOK, "PUT response"},
		{"DELETE", "/resource", deleteHandler, http.StatusNoContent, "DELETE response"},
	}

	for _, route := range routes {
		err := router.RegisterRoute(route.method, route.pattern, route.handler)
		if err != nil {
			t.Fatalf("Failed to register route %s %s: %v", route.method, route.pattern, err)
		}
	}

	// Test each method
	for _, route := range routes {
		req := httptest.NewRequest(route.method, route.pattern, nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if rr.Code != route.expectedStatus {
			t.Errorf("Route %s %s: expected status %d, got %d", route.method, route.pattern, route.expectedStatus, rr.Code)
		}

		if rr.Body.String() != route.expectedBody {
			t.Errorf("Route %s %s: expected body '%s', got '%s'", route.method, route.pattern, route.expectedBody, rr.Body.String())
		}
	}
}

func TestRouteManagement_RouteParameterExtraction(t *testing.T) {
	router := NewRouter()

	// Test route with parameters
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract parameters from URL path
		path := r.URL.Path
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Path: " + path))
	})

	// Register route with parameter pattern
	err := router.RegisterRoute("GET", "/users/{id}", handler)
	if err != nil {
		t.Fatalf("Failed to register parameterized route: %v", err)
	}

	// Test the route with parameters
	req := httptest.NewRequest("GET", "/users/123", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	expectedBody := "Path: /users/123"
	if rr.Body.String() != expectedBody {
		t.Errorf("Expected body '%s', got '%s'", expectedBody, rr.Body.String())
	}
}

func TestRouteManagement_ConflictDetection(t *testing.T) {
	router := NewRouter()

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	// Register first route
	err := router.RegisterRoute("GET", "/conflict", handler)
	if err != nil {
		t.Fatalf("Failed to register first route: %v", err)
	}

	// Try to register conflicting route
	err = router.RegisterRoute("GET", "/conflict", handler)
	if err == nil {
		t.Fatal("Expected error for conflicting route, got nil")
	}

	// Verify only one route exists
	routes := router.GetRoutes()
	if len(routes) != 1 {
		t.Errorf("Expected 1 route, got %d", len(routes))
	}
}

func TestRouteManagement_RouteListing(t *testing.T) {
	router := NewRouter()

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	// Register multiple routes
	testRoutes := []struct {
		method  string
		pattern string
	}{
		{"GET", "/users"},
		{"POST", "/users"},
		{"GET", "/products"},
		{"PUT", "/products/{id}"},
		{"DELETE", "/products/{id}"},
	}

	for _, route := range testRoutes {
		err := router.RegisterRoute(route.method, route.pattern, handler)
		if err != nil {
			t.Fatalf("Failed to register route %s %s: %v", route.method, route.pattern, err)
		}
	}

	// Get all routes
	routes := router.GetRoutes()

	if len(routes) != len(testRoutes) {
		t.Errorf("Expected %d routes, got %d", len(testRoutes), len(routes))
	}

	// Verify route information
	for i, expected := range testRoutes {
		actual := routes[i]
		if actual.Method != expected.method {
			t.Errorf("Route %d: expected method %s, got %s", i, expected.method, actual.Method)
		}
		if actual.Pattern != expected.pattern {
			t.Errorf("Route %d: expected pattern %s, got %s", i, expected.pattern, actual.Pattern)
		}
	}
}

func TestRouteManagement_Performance(t *testing.T) {
	router := NewRouter()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Register many routes
	numRoutes := 1000
	for i := 0; i < numRoutes; i++ {
		pattern := "/route" + fmt.Sprintf("%d", i)
		err := router.RegisterRoute("GET", pattern, handler)
		if err != nil {
			t.Fatalf("Failed to register route %d: %v", i, err)
		}
	}

	// Test route matching performance
	req := httptest.NewRequest("GET", "/route0", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	// Verify route count
	routes := router.GetRoutes()
	if len(routes) != numRoutes {
		t.Errorf("Expected %d routes, got %d", numRoutes, len(routes))
	}
}
