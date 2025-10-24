package handlers

import (
	"net/http"

	"github.com/nguyenjessev/liquor-locker/internal/types"
)

// Handler represents the business logic function that processes HTTP requests
type Handler struct {
	Name         string
	Function     http.HandlerFunc
	Dependencies []string // Required dependencies (e.g., repository, service)
}

// NewHandler creates a new handler
func NewHandler(name string, function http.HandlerFunc, dependencies ...string) Handler {
	return Handler{
		Name:         name,
		Function:     function,
		Dependencies: dependencies,
	}
}

// NewRouteGroup creates a new route group from configuration
func NewRouteGroup(config types.RouteGroupConfig) types.RouteGroup {
	return &routeGroup{
		name:       config.Name,
		prefix:     config.Prefix,
		routes:     config.Routes,
		middleware: config.Middleware,
	}
}

// routeGroup implements the RouteGroup interface
type routeGroup struct {
	name       string
	prefix     string
	routes     []types.Route
	middleware []types.MiddlewareInfo
}

func (rg *routeGroup) Name() string {
	return rg.name
}

func (rg *routeGroup) Prefix() string {
	return rg.prefix
}

func (rg *routeGroup) Routes() []types.Route {
	return rg.routes
}

func (rg *routeGroup) Middleware() []types.MiddlewareInfo {
	return rg.middleware
}
