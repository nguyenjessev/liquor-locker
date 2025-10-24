package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/nguyenjessev/liquor-locker/internal/types"
)

// Router defines the interface for HTTP routing
type Router interface {
	// RegisterRoute adds a new route to the router
	RegisterRoute(method, pattern string, handler http.Handler) error

	// RegisterGroup registers a complete route group
	RegisterGroup(group types.RouteGroup) error

	// ServeHTTP implements http.Handler interface
	ServeHTTP(w http.ResponseWriter, r *http.Request)

	// GetRoutes returns all registered routes for debugging
	GetRoutes() []RouteInfo
}

// RouteInfo contains information about a registered route
type RouteInfo struct {
	Method  string
	Pattern string
	Handler string
}

// router implements the Router interface using http.ServeMux
type router struct {
	mux          *http.ServeMux
	routes       []RouteInfo
	mu           sync.RWMutex
	groups       map[string]types.RouteGroup
	methodRoutes map[string]map[string]http.Handler // method -> pattern -> handler
}

// NewRouter creates a new router instance
func NewRouter() Router {
	return &router{
		mux:          http.NewServeMux(),
		routes:       make([]RouteInfo, 0),
		groups:       make(map[string]types.RouteGroup),
		methodRoutes: make(map[string]map[string]http.Handler),
	}
}

// RegisterRoute adds a new route to the router
func (r *router) RegisterRoute(method, pattern string, handler http.Handler) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Validate inputs
	if method == "" || pattern == "" || handler == nil {
		return fmt.Errorf("invalid route parameters: method=%s, pattern=%s, handler=%v", method, pattern, handler)
	}

	// Check for conflicts
	if r.hasConflict(method, pattern) {
		return fmt.Errorf("route conflict: %s %s already registered", method, pattern)
	}

	// Store method-based route
	if r.methodRoutes[method] == nil {
		r.methodRoutes[method] = make(map[string]http.Handler)
	}
	r.methodRoutes[method][pattern] = handler

	// Register with ServeMux using a method-specific pattern
	methodPattern := "/" + method + ":" + pattern
	r.mux.Handle(methodPattern, http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		// Check if the request method matches
		if req.Method == method {
			handler.ServeHTTP(w, req)
		} else {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}))

	// Track route info
	routeInfo := RouteInfo{
		Method:  method,
		Pattern: pattern,
		Handler: fmt.Sprintf("%T", handler),
	}
	r.routes = append(r.routes, routeInfo)

	log.Printf("Registered route: %s %s", method, pattern)
	return nil
}

// RegisterGroup registers a complete route group
func (r *router) RegisterGroup(group types.RouteGroup) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Validate group
	if group == nil {
		return fmt.Errorf("group cannot be nil")
	}

	// Check for group name conflicts
	if _, exists := r.groups[group.Name()]; exists {
		return fmt.Errorf("group %s already registered", group.Name())
	}

	// Register all routes in the group
	for _, route := range group.Routes() {
		pattern := group.Prefix() + route.Pattern
		if err := r.registerRouteInternal(route.Method, pattern, route.Handler); err != nil {
			return fmt.Errorf("failed to register route %s %s: %w", route.Method, pattern, err)
		}
	}

	// Store group reference
	r.groups[group.Name()] = group

	log.Printf("Registered group: %s with %d routes", group.Name(), len(group.Routes()))
	return nil
}

// registerRouteInternal is the internal route registration without locking
func (r *router) registerRouteInternal(method, pattern string, handler http.Handler) error {
	// Store method-based route
	if r.methodRoutes[method] == nil {
		r.methodRoutes[method] = make(map[string]http.Handler)
	}
	r.methodRoutes[method][pattern] = handler

	// Register with ServeMux using a method-specific pattern
	methodPattern := "/" + method + ":" + pattern
	r.mux.Handle(methodPattern, http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		// Check if the request method matches
		if req.Method == method {
			handler.ServeHTTP(w, req)
		} else {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}))

	// Track route info
	routeInfo := RouteInfo{
		Method:  method,
		Pattern: pattern,
		Handler: fmt.Sprintf("%T", handler),
	}
	r.routes = append(r.routes, routeInfo)

	return nil
}

// hasConflict checks if a route already exists
func (r *router) hasConflict(method, pattern string) bool {
	for _, route := range r.routes {
		if route.Method == method && route.Pattern == pattern {
			return true
		}
	}
	return false
}

// ServeHTTP implements http.Handler interface
func (r *router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	// Add request context
	ctx := context.WithValue(req.Context(), "router", r)
	req = req.WithContext(ctx)

	// Check for method-based routing
	r.mu.RLock()
	methodRoutes, exists := r.methodRoutes[req.Method]
	r.mu.RUnlock()

	if exists {
		// Try to find exact pattern match first
		if handler, found := methodRoutes[req.URL.Path]; found {
			handler.ServeHTTP(w, req)
			return
		}

		// Try to find pattern match (for parameterized routes)
		for pattern, handler := range methodRoutes {
			if r.matchesPattern(req.URL.Path, pattern) {
				handler.ServeHTTP(w, req)
				return
			}
		}
	}

	// Fall back to ServeMux for non-method-based routes
	r.mux.ServeHTTP(w, req)
}

// matchesPattern checks if a path matches a pattern with parameters
func (r *router) matchesPattern(path, pattern string) bool {
	// Simple parameter matching for {param} patterns
	pathParts := strings.Split(path, "/")
	patternParts := strings.Split(pattern, "/")

	if len(pathParts) != len(patternParts) {
		return false
	}

	for i, patternPart := range patternParts {
		if strings.HasPrefix(patternPart, "{") && strings.HasSuffix(patternPart, "}") {
			// This is a parameter, match any value
			continue
		}
		if pathParts[i] != patternPart {
			return false
		}
	}

	return true
}

// GetRoutes returns all registered routes for debugging
func (r *router) GetRoutes() []RouteInfo {
	r.mu.RLock()
	defer r.mu.RUnlock()

	// Return a copy to prevent external modification
	routes := make([]RouteInfo, len(r.routes))
	copy(routes, r.routes)
	return routes
}
