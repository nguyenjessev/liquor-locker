# Liquor Locker
Liquor Locker is a home bar management app to track your bottles and other ingredients.

Liquor Locker also offers the ability to bring your own API key to an OpenAI-compatible LLM provider in order to get AI-powered recommendations based on your available inventory. Depending on what you have (or don't have) available, you might get some interesting spins on the classics!

<img width="2672" height="1521" alt="image" src="https://github.com/user-attachments/assets/127ff63a-f02a-4d08-8c23-977a62f3f0a5" />
<img width="2628" height="1477" alt="image" src="https://github.com/user-attachments/assets/c1c859b9-788a-443d-af83-d498565bda70" />

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
- Reverse proxy such as Caddy or Nginx (recommended for serving the client)

### Docker Compose (recommended)

1. Create a `docker-compose.yml` file with the following content:

```yaml
services:
  liquor-locker:
    image: ghcr.io/nguyenjessev/liquor-locker:latest
    ports:
      - "8080:8080" # You can change the first port if needed.
    environment:
      # This MUST be set to the URL that you will be accessing the app from, such as https://localhost:8080, https://mysubdomain.mydomain.com, etc. (I.e. the URL in your address bar when you use the app)
      - ALLOWED_ORIGINS=http://localhost:8080
    volumes:
      - ./data:/app/internal/database/data # This is where the SQLite database will be stored.
```

2. Then run:

```sh
docker compose up -d
```

3. Go to [http://localhost:8080](http://localhost:8080)
4. (Optional) Configure your reverse proxy to serve the client from a URL other than `localhost`.
5. Fill up your Liquor Locker!

## Configuration

- If you will be using a reverse proxy or otherwise serving the client from a URL other than `localhost`, you must set the `ALLOWED_ORIGINS` environment variable to the URL that your frontend will be accessed from. (E.g. `http://subdomain.my_domain.com`)
- If you want to use the AI recommendations feature, deploy the app and then visit the web client. From there, go to the settings page and enter an API URL and your API key for your chosen service.
	- The API must support the OpenAI API standard. This includes OpenAI, Anthropic, and others. OpenRouter is also supported.
	- When choosing a model in the Magic Bartender, the model must support tool-calling and structured responses.

## Planned Features
- Tracking of garnishes
- Saving recommended recipes
- Adding custom recipes
- Various Magic Bartender "personalities," including `Classic`, `Modern`, and `Experimental`

<a href='https://ko-fi.com/M4M71JWKLX' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
