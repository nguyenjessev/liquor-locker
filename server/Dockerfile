FROM golang:1.24 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y gcc

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -o liquor-locker-server main.go

FROM debian:bookworm-slim

WORKDIR /app

COPY internal/database/migrations ./internal/database/migrations

COPY --from=builder /app/liquor-locker-server .

RUN mkdir -p /app/internal/database/data

EXPOSE 8080
ENV PORT=8080

CMD ["./liquor-locker-server"]
