package handlers

import (
	"context"
	"log"
	"net/http"
	"time"
)

// Middleware represents a middleware function
type Middleware func(http.Handler) http.Handler

// Chain creates a middleware chain from multiple middleware functions
func Chain(middlewares ...Middleware) Middleware {
	return func(h http.Handler) http.Handler {
		// Apply middleware in reverse order (last middleware wraps the handler first)
		for i := len(middlewares) - 1; i >= 0; i-- {
			h = middlewares[i](h)
		}
		return h
	}
}

// LoggingMiddleware logs HTTP requests with timing information
func LoggingMiddleware() Middleware {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Create a response writer wrapper to capture status code
			wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

			// Call the next handler
			h.ServeHTTP(wrapped, r)

			// Log the request
			duration := time.Since(start)
			log.Printf("%s %s %d %v %s", r.Method, r.URL.Path, wrapped.statusCode, duration, r.RemoteAddr)
		})
	}
}

// CORSMiddleware handles Cross-Origin Resource Sharing
func CORSMiddleware(allowedOrigins []string) Middleware {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")

			// Check if origin is allowed
			if isAllowedOrigin(origin, allowedOrigins) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}

			// Set CORS headers
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			// Handle preflight requests
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			// Call the next handler
			h.ServeHTTP(w, r)
		})
	}
}

// APIKeyMiddleware validates API key for protected routes
func APIKeyMiddleware(apiKey string) Middleware {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip API key validation for health endpoint
			if r.URL.Path == "/health" {
				h.ServeHTTP(w, r)
				return
			}

			// Skip if no API key is configured
			if apiKey == "" {
				h.ServeHTTP(w, r)
				return
			}

			// Validate API key
			providedKey := r.Header.Get("X-API-Key")
			if providedKey != apiKey {
				log.Printf("SECURITY: Invalid API key from %s", r.RemoteAddr)
				http.Error(w, "Invalid or missing API key", http.StatusUnauthorized)
				return
			}

			// Call the next handler
			h.ServeHTTP(w, r)
		})
	}
}

// SecurityHeadersMiddleware adds security headers
func SecurityHeadersMiddleware() Middleware {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Add security headers
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("X-Frame-Options", "DENY")
			w.Header().Set("X-XSS-Protection", "1; mode=block")

			// Call the next handler
			h.ServeHTTP(w, r)
		})
	}
}

// RecoveryMiddleware recovers from panics and logs errors
func RecoveryMiddleware() Middleware {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					log.Printf("PANIC: %v", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				}
			}()

			h.ServeHTTP(w, r)
		})
	}
}

// ContextMiddleware adds request context
func ContextMiddleware() Middleware {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Add request ID and timestamp to context
			ctx := context.WithValue(r.Context(), "requestID", generateRequestID())
			ctx = context.WithValue(ctx, "timestamp", time.Now())

			h.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// isAllowedOrigin checks if the origin is in the allowed list
func isAllowedOrigin(origin string, allowedOrigins []string) bool {
	if origin == "" {
		return true // Allow requests without Origin header
	}

	for _, allowed := range allowedOrigins {
		if origin == allowed {
			return true
		}
	}
	return false
}

// generateRequestID generates a simple request ID
func generateRequestID() string {
	return time.Now().Format("20060102150405")
}
