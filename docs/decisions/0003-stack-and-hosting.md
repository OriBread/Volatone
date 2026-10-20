# 3. Stack and hosting

Status: accepted

## Context
Goals: demonstrate sound engineering practice, a research-heavy backend engine, a polished UI, and full-system scope (API, database, cloud). Constraints: Python and TypeScript are the working languages _(most comfortable with)_; AWS is the cloud _(free trial tier)_; a single small EC2 instance; no real user load.

## Decision
- Backend: FastAPI (async, native WebSocket support, typed models via Pydantic).
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL with the TimescaleDB extension (time-series fit for tick data).
- Packaging: Docker Compose for backend + database; frontend as a static build on S3 + CloudFront.
- Automation: GitHub Actions for CI and, later, deployment.
- _Deliberately not used: Kubernetes, GraphQL, user authentication etc. None justified at this scale atm_

## Consequences
The stack is mainstream and easy to defend. I'll have a 1GB instance which'll be tight for Postgres plus the APi, so memory use needs watching. The engine is isolated so it can be replaced by a faster implementation later.
