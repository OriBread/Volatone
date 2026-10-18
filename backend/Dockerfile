FROM python:3.12-slim

# uv: Python package + project manager (copied from its official image)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency manifests first so Docker can cache the install layer
# until dependencies actually change.
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-dev --no-install-project

# Then copy the source and install the project itself.
COPY src ./src
RUN uv sync --frozen --no-dev

EXPOSE 8000
CMD ["uv", "run", "--no-dev", "uvicorn", "volatone.main:app", "--host", "0.0.0.0", "--port", "8000"]
