# Liquor Locker
Liquor Locker is a home bar management app to track your bottles and other ingredients.

Liquor Locker also offers the ability to bring your own API key to an OpenAI-compatible LLM provider in order to get AI-powered recommendations based on your available inventory.

## Features

- Track your inventory of bottles, including their names, purchase dates, and open dates.
- Track your inventory of mixers, including their names, purchase dates, and open dates.
- Track your inventory of fresh ingredients, including their names, purchase dates, and preparation dates.
- Analyze your inventory to get AI-powered cocktail recommendations based on your available inventory.
- Dark mode

## Quick Start

### Prerequisites
- Docker
- Go >= 1.24 (for local development)
- Node.js (for local development)

### Docker Compose (recommended)

`. Create a `docker-compose.yml` file with the following content:

```yaml
services:
  liquor-locker-server:
    image: ghcr.io/nguyenjessev/liquor-locker-server:latest
    ports:
      - "8080:8080"
    environment:
      # This MUST match the URL that your frontend will be accessed from. (E.g. http://localhost:8081, http://reverse_proxy_url.com:8081, etc.)
      - ALLOWED_ORIGINS=http://localhost:8081
    volumes:
      - ./data:/app/internal/database/data # This is where the SQLite database will be stored.

  liquor-locker-client:
    image: ghcr.io/nguyenjessev/liquor-locker-client:latest
    ports:
      - "8081:8081"
```

2. Then run:

```sh
docker compose up -d
```

3. Go to [http://localhost:8081](http://localhost:8081)
4. Fill up your Liquor Locker!

## Configuration

- If you will be using a reverse proxy or otherwise serving the client from a URL other than `localhost`, you must set the `ALLOWED_ORIGINS` environment variable to the URL that your frontend will be accessed from. (E.g. `http://reverse_proxy_url.com:8081`)
- If you want to use the AI recommendations feature, deploy the app and then visit the web client. From there, go to the settings page and enter an API URL and your API key for your chosen service.
	- The API must support the OpenAI API standard. This includes OpenAI, Anthropic, and others. OpenRouter is also supported.
	- When choosing a model in the Magic Bartender, the model must support tool-calling and structured responses.

## Planned Features
- Adding custom recipes
- Saving recommended recipes
