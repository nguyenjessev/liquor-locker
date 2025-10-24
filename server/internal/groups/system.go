package groups

import (
	"net/http"

	"github.com/nguyenjessev/liquor-locker/internal/types"
)

// SystemGroup represents the system/health route group
type SystemGroup struct {
	name       string
	prefix     string
	routes     []types.Route
	middleware []types.MiddlewareInfo
}

// NewSystemGroup creates a new system route group
func NewSystemGroup() types.RouteGroup {
	return &SystemGroup{
		name:   "system",
		prefix: "/api/system",
		routes: []types.Route{
			// Health and status routes
			types.NewRoute("GET", "/health", http.HandlerFunc(healthHandler), "health-check"),
			types.NewRoute("GET", "/status", http.HandlerFunc(statusHandler), "status-check"),
			types.NewRoute("GET", "/metrics", http.HandlerFunc(metricsHandler), "metrics"),

			// System information routes
			types.NewRoute("GET", "/info", http.HandlerFunc(infoHandler), "system-info"),
			types.NewRoute("GET", "/version", http.HandlerFunc(versionHandler), "version"),

			// Configuration routes
			types.NewRoute("GET", "/config", http.HandlerFunc(getConfigHandler), "get-config"),
			types.NewRoute("PUT", "/config", http.HandlerFunc(updateConfigHandler), "update-config"),
		},
		middleware: []types.MiddlewareInfo{},
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
func (sg *SystemGroup) Routes() []types.Route {
	return sg.routes
}

// Middleware returns the middleware chain for this group
func (sg *SystemGroup) Middleware() []types.MiddlewareInfo {
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
