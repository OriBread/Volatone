.PHONY: help install dev-backend dev-frontend test lint fmt up down

help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-14s %s\n", $$1, $$2}'

install: ## Install backend and frontend dependencies
	cd backend && uv sync
	cd frontend && npm ci

dev-backend: ## Run the API with auto-reload on :8000
	cd backend && uv run uvicorn volatone.main:app --reload

dev-frontend: ## Run the Vite dev server on :5173
	cd frontend && npm run dev

test: ## Run all test
	cd backend && uv run pytest
	cd frontend && npm test

lint: ## Lint + type-check everything (same checks as CI)
	cd backend && uv run ruff check . && uv run ruff format --check . && uv run mypy
	cd frontend && npm run lint && npm run typecheck && npm run format:check

fmt: ## Auto-format everything
	cd backend && uv run ruff check --fix . && uv run ruff format .
	cd frontend && npm run format

up: ## Start database + backend in Docker
	docker compose up --build

down: ## Stop the Docker stack
	docker compose down
