FROM golang:1.24 AS builder-backend

WORKDIR /app

RUN apt-get update && apt-get install -y gcc

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server .

RUN CGO_ENABLED=1 GOOS=linux go build -o liquor-locker main.go

FROM node:24-alpine AS builder-frontend

WORKDIR /app

COPY client/package*.json ./

RUN npm ci

COPY client/ ./client

RUN cd client && npm run build

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY server/internal/database/migrations ./internal/database/migrations

COPY --from=builder-backend /app/liquor-locker .
COPY --from=builder-frontend /app/server/dist /app/dist

RUN mkdir -p internal/database/data

EXPOSE 8080
ENV PORT=8080

CMD ["./liquor-locker"]
