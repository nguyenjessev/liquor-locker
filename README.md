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

1. Run:

```sh
docker compose up -d --build
```

2. Run this command to see the live logs of your server

```sh
docker compose logs -f
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
- "Strict Mode" for the Magic Bartender
- Various Magic Bartender "personalities," including `Classic`, `Modern`, and `Experimental`
- Ability to select specific ingredients that you would like to be used by the Magic Bartender
- Support for local Ollama(?)
- Tracking of bottle/ingredient prices
- UPC scanning

## Local Development

- There is a specially crafted docker-compose file `docker-compose.local.yml` that you can use to run the local code without having to install any dependencies on your local machine.
  - Run `docker compose -f docker-compose.local.yml up` to start the application. Add `-d` to the end to run it in the background. 
- The "server" written in GoLang has Swaggo installed which documents endpoints for easier testing. There is some special syntax that will help extend those docs. You can read about those [here](https://github.com/swaggo/swag/?tab=readme-ov-file#general-api-info).
  - Swagger docs are accessible at http://localhost:8080/swagger/index.html#/
  - You must run `swag init` after updating the godoc comments.
    - Docker environment: `docker compose -f docker-compose.local.yml exec api swag init`

<a href='https://ko-fi.com/M4M71JWKLX' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
