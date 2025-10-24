package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestMiddleware_LoggingMiddleware(t *testing.T) {
	// Create a test handler
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	// Apply logging middleware
	middleware := LoggingMiddleware()
	wrappedHandler := middleware(handler)

	// Test the wrapped handler
	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	if rr.Body.String() != "test response" {
		t.Errorf("Expected body 'test response', got '%s'", rr.Body.String())
	}
}

func TestMiddleware_CORSMiddleware(t *testing.T) {
	// Create a test handler
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	// Apply CORS middleware
	allowedOrigins := []string{"http://localhost:3000", "https://example.com"}
	middleware := CORSMiddleware(allowedOrigins)
	wrappedHandler := middleware(handler)

	// Test with allowed origin
	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	rr := httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	// Check CORS headers
	if rr.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Errorf("Expected CORS origin header, got '%s'", rr.Header().Get("Access-Control-Allow-Origin"))
	}

	// Test preflight request
	req = httptest.NewRequest("OPTIONS", "/test", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	rr = httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d for preflight, got %d", http.StatusOK, rr.Code)
	}
}

func TestMiddleware_APIKeyMiddleware(t *testing.T) {
	// Create a test handler
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	// Apply API key middleware
	apiKey := "test-api-key"
	middleware := APIKeyMiddleware(apiKey)
	wrappedHandler := middleware(handler)

	// Test with valid API key
	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("X-API-Key", "test-api-key")
	rr := httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	// Test with invalid API key
	req = httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("X-API-Key", "invalid-key")
	rr = httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, rr.Code)
	}

	// Test health endpoint (should bypass API key)
	req = httptest.NewRequest("GET", "/health", nil)
	rr = httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d for health endpoint, got %d", http.StatusOK, rr.Code)
	}
}

func TestMiddleware_SecurityHeadersMiddleware(t *testing.T) {
	// Create a test handler
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	// Apply security headers middleware
	middleware := SecurityHeadersMiddleware()
	wrappedHandler := middleware(handler)

	// Test the wrapped handler
	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	// Check security headers
	expectedHeaders := map[string]string{
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options":        "DENY",
		"X-XSS-Protection":       "1; mode=block",
	}

	for header, expectedValue := range expectedHeaders {
		actualValue := rr.Header().Get(header)
		if actualValue != expectedValue {
			t.Errorf("Expected header %s: %s, got %s", header, expectedValue, actualValue)
		}
	}
}

func TestMiddleware_RecoveryMiddleware(t *testing.T) {
	// Create a handler that panics
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("test panic")
	})

	// Apply recovery middleware
	middleware := RecoveryMiddleware()
	wrappedHandler := middleware(handler)

	// Test the wrapped handler
	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	// Should recover from panic and return 500
	if rr.Code != http.StatusInternalServerError {
		t.Errorf("Expected status %d, got %d", http.StatusInternalServerError, rr.Code)
	}

	expectedBody := "Internal Server Error"
	if !strings.Contains(rr.Body.String(), expectedBody) {
		t.Errorf("Expected body to contain '%s', got '%s'", expectedBody, rr.Body.String())
	}
}

func TestMiddleware_ContextMiddleware(t *testing.T) {
	// Create a test handler that checks context
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if context values are set
		requestID := r.Context().Value("requestID")
		timestamp := r.Context().Value("timestamp")

		if requestID == nil {
			t.Error("Expected requestID in context")
		}

		if timestamp == nil {
			t.Error("Expected timestamp in context")
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	// Apply context middleware
	middleware := ContextMiddleware()
	wrappedHandler := middleware(handler)

	// Test the wrapped handler
	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}
}

func TestMiddleware_Chain(t *testing.T) {
	// Create a test handler
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	// Create middleware chain
	middleware := Chain(
		LoggingMiddleware(),
		SecurityHeadersMiddleware(),
		RecoveryMiddleware(),
	)

	wrappedHandler := middleware(handler)

	// Test the wrapped handler
	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	// Check that security headers are applied
	if rr.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Error("Expected security headers to be applied")
	}
}

func TestMiddleware_ChainOrder(t *testing.T) {
	// Create a test handler that checks header order
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	// Create middleware that adds headers
	headerMiddleware1 := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("X-Test-1", "first")
			h.ServeHTTP(w, r)
		})
	}

	headerMiddleware2 := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("X-Test-2", "second")
			h.ServeHTTP(w, r)
		})
	}

	// Chain middleware
	middleware := Chain(headerMiddleware1, headerMiddleware2)
	wrappedHandler := middleware(handler)

	// Test the wrapped handler
	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	wrappedHandler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	// Check that both headers are present
	if rr.Header().Get("X-Test-1") != "first" {
		t.Error("Expected X-Test-1 header")
	}

	if rr.Header().Get("X-Test-2") != "second" {
		t.Error("Expected X-Test-2 header")
	}
}
