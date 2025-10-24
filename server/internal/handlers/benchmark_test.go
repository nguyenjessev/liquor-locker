package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nguyenjessev/liquor-locker/internal/types"
)

// BenchmarkRouteRegistration benchmarks route registration performance
func BenchmarkRouteRegistration(b *testing.B) {
	router := NewRouter()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		pattern := "/test" + string(rune('0'+(i%10)))
		router.RegisterRoute("GET", pattern, handler)
	}
}

// BenchmarkRouteMatching benchmarks route matching performance
func BenchmarkRouteMatching(b *testing.B) {
	router := NewRouter()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Register multiple routes
	for i := 0; i < 100; i++ {
		pattern := "/test" + string(rune('0'+(i%10)))
		router.RegisterRoute("GET", pattern, handler)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/test0", nil)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
	}
}

// BenchmarkMiddleware benchmarks middleware performance
func BenchmarkMiddleware(b *testing.B) {
	router := NewRouter()

	// Create middleware chain
	middleware := Chain(
		LoggingMiddleware(),
		SecurityHeadersMiddleware(),
		RecoveryMiddleware(),
	)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	router.RegisterRoute("GET", "/test", handler)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/test", nil)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
	}
}

// BenchmarkConcurrentRequests benchmarks concurrent request handling
func BenchmarkConcurrentRequests(b *testing.B) {
	router := NewRouter()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	router.RegisterRoute("GET", "/test", handler)

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			req := httptest.NewRequest("GET", "/test", nil)
			rr := httptest.NewRecorder()
			router.ServeHTTP(rr, req)
		}
	})
}

// BenchmarkRouteGroupRegistration benchmarks route group registration
func BenchmarkRouteGroupRegistration(b *testing.B) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	// Create test routes
	routes := make([]types.Route, 10)
	for i := 0; i < 10; i++ {
		routes[i] = types.NewRoute("GET", "/test"+string(rune('0'+i)), handler)
	}

	config := types.RouteGroupConfig{
		Name:       "test-group",
		Prefix:     "/api",
		Routes:     routes,
		Middleware: []types.MiddlewareInfo{},
	}
	group := NewRouteGroup(config)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		// Create a new router for each iteration to avoid conflicts
		testRouter := NewRouter()
		testRouter.RegisterGroup(group)
	}
}

// BenchmarkMemoryUsage benchmarks memory usage
func BenchmarkMemoryUsage(b *testing.B) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		router := NewRouter()
		// Register many routes to test memory usage
		for j := 0; j < 1000; j++ {
			pattern := "/test" + string(rune('0'+(j%10)))
			router.RegisterRoute("GET", pattern, handler)
		}
	}
}

// BenchmarkErrorHandling benchmarks error handling performance
func BenchmarkErrorHandling(b *testing.B) {
	router := NewRouter()

	// Handler that always returns an error
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "test error", http.StatusInternalServerError)
	})

	router.RegisterRoute("GET", "/error", handler)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/error", nil)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
	}
}
