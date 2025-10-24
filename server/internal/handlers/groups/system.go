package groups

import (
	"net/http"

	"github.com/nguyenjessev/liquor-locker/internal/handlers"
)

// SystemGroup represents the system/health route group
type SystemGroup struct {
	name       string
	prefix     string
	routes     []handlers.Route
	middleware []handlers.MiddlewareInfo
}

// NewSystemGroup creates a new system route group
func NewSystemGroup() handlers.RouteGroup {
	return &SystemGroup{
		name:   "system",
		prefix: "/api/system",
		routes: []handlers.Route{
			// Health and status routes
			handlers.NewRoute("GET", "/health", http.HandlerFunc(healthHandler), "health-check"),
			handlers.NewRoute("GET", "/status", http.HandlerFunc(statusHandler), "status-check"),
			handlers.NewRoute("GET", "/metrics", http.HandlerFunc(metricsHandler), "metrics"),

			// System information routes
			handlers.NewRoute("GET", "/info", http.HandlerFunc(infoHandler), "system-info"),
			handlers.NewRoute("GET", "/version", http.HandlerFunc(versionHandler), "version"),

			// Configuration routes
			handlers.NewRoute("GET", "/config", http.HandlerFunc(getConfigHandler), "get-config"),
			handlers.NewRoute("PUT", "/config", http.HandlerFunc(updateConfigHandler), "update-config"),
		},
		middleware: []handlers.MiddlewareInfo{},
	}
}

// Name returns the group identifier
func (sg *SystemGroup) Name() string {
	return sg.name
}

// Prefix returns the URL prefix for all routes in this group
func (sg *SystemGroup) Prefix() string {
	return sg.prefix
}

// Routes returns all routes in this group
func (sg *SystemGroup) Routes() []handlers.Route {
	return sg.routes
}

// Middleware returns the middleware chain for this group
func (sg *SystemGroup) Middleware() []handlers.MiddlewareInfo {
	return sg.middleware
}

// Handler functions for system routes

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "healthy", "timestamp": "2025-01-27T10:00:00Z"}`))
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "operational", "uptime": "24h", "version": "1.0.0"}`))
}

func metricsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"metrics": {"requests": 1000, "errors": 5, "response_time": "50ms"}}`))
}

func infoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"name": "Liquor Locker API", "version": "1.0.0", "environment": "development"}`))
}

func versionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"version": "1.0.0", "build": "2025-01-27", "commit": "abc123"}`))
}

func getConfigHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"config": {"debug": true, "log_level": "info"}}`))
}

func updateConfigHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Configuration updated", "timestamp": "2025-01-27T10:00:00Z"}`))
}
