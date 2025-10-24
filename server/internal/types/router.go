package types

import "net/http"

// Route represents an HTTP endpoint with method, path pattern, and handler function
type Route struct {
	Method  string
	Pattern string
	Handler http.Handler
	Name    string // Optional human-readable name
}

// RouteGroup represents a collection of related routes with shared middleware
type RouteGroup interface {
	// Name returns the group identifier
	Name() string

	// Prefix returns the URL prefix for all routes in this group
	Prefix() string

	// Routes returns all routes in this group
	Routes() []Route

	// Middleware returns the middleware chain for this group
	Middleware() []MiddlewareInfo
}

// MiddlewareInfo represents cross-cutting functionality applied to routes
type MiddlewareInfo struct {
	Name     string
	Handler  http.Handler
	Priority int // Execution order (lower numbers execute first)
}

// RouteGroupConfig holds configuration for a route group
type RouteGroupConfig struct {
	Name       string
	Prefix     string
	Routes     []Route
	Middleware []MiddlewareInfo
}

// NewRoute creates a new route
func NewRoute(method, pattern string, handler http.Handler, name ...string) Route {
	route := Route{
		Method:  method,
		Pattern: pattern,
		Handler: handler,
	}

	if len(name) > 0 {
		route.Name = name[0]
	}

	return route
}

// NewMiddlewareInfo creates a new middleware info
func NewMiddlewareInfo(name string, handler http.Handler, priority int) MiddlewareInfo {
	return MiddlewareInfo{
		Name:     name,
		Handler:  handler,
		Priority: priority,
	}
}
