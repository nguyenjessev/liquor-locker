package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nguyenjessev/liquor-locker/internal/types"
)

// TestServer represents a test HTTP server
type TestServer struct {
	Router Router
	Server *httptest.Server
}

// NewTestServer creates a new test server
func NewTestServer(router Router) *TestServer {
	server := httptest.NewServer(router)
	return &TestServer{
		Router: router,
		Server: server,
	}
}

// Close closes the test server
func (ts *TestServer) Close() {
	ts.Server.Close()
}

// MakeRequest makes an HTTP request to the test server
func (ts *TestServer) MakeRequest(method, path string, body interface{}) (*http.Response, error) {
	var reqBody []byte
	var err error

	if body != nil {
		reqBody, err = json.Marshal(body)
		if err != nil {
			return nil, err
		}
	}

	req, err := http.NewRequest(method, ts.Server.URL+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	return client.Do(req)
}

// AssertResponseStatus checks if the response has the expected status code
func AssertResponseStatus(t *testing.T, resp *http.Response, expectedStatus int) {
	if resp.StatusCode != expectedStatus {
		t.Errorf("Expected status %d, got %d", expectedStatus, resp.StatusCode)
	}
}

// AssertResponseBody checks if the response body contains the expected content
func AssertResponseBody(t *testing.T, resp *http.Response, expectedBody string) {
	buf := make([]byte, 1024)
	n, _ := resp.Body.Read(buf)
	actualBody := string(buf[:n])

	if actualBody != expectedBody {
		t.Errorf("Expected body '%s', got '%s'", expectedBody, actualBody)
	}
}

// AssertResponseJSON checks if the response body is valid JSON
func AssertResponseJSON(t *testing.T, resp *http.Response) {
	buf := make([]byte, 1024)
	n, _ := resp.Body.Read(buf)

	var jsonData interface{}
	err := json.Unmarshal(buf[:n], &jsonData)
	if err != nil {
		t.Errorf("Response body is not valid JSON: %v", err)
	}
}

// MockHandler creates a mock HTTP handler for testing
func MockHandler(statusCode int, body string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(statusCode)
		w.Write([]byte(body))
	})
}

// MockHandlerWithHeaders creates a mock HTTP handler with custom headers
func MockHandlerWithHeaders(statusCode int, body string, headers map[string]string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		for key, value := range headers {
			w.Header().Set(key, value)
		}
		w.WriteHeader(statusCode)
		w.Write([]byte(body))
	})
}

// TestRouteGroup creates a test route group
func TestRouteGroup(name, prefix string, routes []types.Route) types.RouteGroup {
	config := types.RouteGroupConfig{
		Name:       name,
		Prefix:     prefix,
		Routes:     routes,
		Middleware: []types.MiddlewareInfo{},
	}
	return NewRouteGroup(config)
}

// TestRoute creates a test route
func TestRoute(method, pattern string, handler http.Handler) types.Route {
	return types.NewRoute(method, pattern, handler, "test-route")
}

// TestMiddlewareInfo creates a test middleware info
func TestMiddlewareInfo(name string, handler http.Handler) types.MiddlewareInfo {
	return types.NewMiddlewareInfo(name, handler, 0)
}

// BenchmarkRouter benchmarks router performance
func BenchmarkRouter(b *testing.B, router Router, routes []types.Route) {
	// Register routes
	for _, route := range routes {
		router.RegisterRoute(route.Method, route.Pattern, route.Handler)
	}

	// Benchmark route matching
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/test", nil)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
	}
}

// LoadTestRouter performs load testing on the router
func LoadTestRouter(t *testing.T, router Router, concurrentRequests int, totalRequests int) {
	// Register a test route
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("load test response"))
	})

	err := router.RegisterRoute("GET", "/loadtest", handler)
	if err != nil {
		t.Fatalf("Failed to register load test route: %v", err)
	}

	// Create channels for coordination
	done := make(chan bool, concurrentRequests)
	errors := make(chan error, concurrentRequests)

	// Start concurrent requests
	for i := 0; i < concurrentRequests; i++ {
		go func() {
			for j := 0; j < totalRequests/concurrentRequests; j++ {
				req := httptest.NewRequest("GET", "/loadtest", nil)
				rr := httptest.NewRecorder()

				router.ServeHTTP(rr, req)

				if rr.Code != http.StatusOK {
					errors <- fmt.Errorf("unexpected status code: %d", rr.Code)
					return
				}
			}
			done <- true
		}()
	}

	// Wait for all requests to complete
	for i := 0; i < concurrentRequests; i++ {
		select {
		case <-done:
			// Request completed successfully
		case err := <-errors:
			t.Fatalf("Load test failed: %v", err)
		}
	}
}
