# Working on Volatone

This is (intended) to be a solo project, so this is here mostly for my own reference/guidelines/good SWE practice. Good habits die hard.

## Workflow

1. `main` is always working. Never commit to it directly.
2. Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, `refactor/<short-name>`, `docs/<short-name>`, `test/<short-name>`.
3. Commit small and often, using [Conventional Commits] (https://www.conventionalcommits.org/):
    `feat: add tick ingestion`, `fix: handle websocket reconnect` `docs: add ADR for storage.
4. Open a pull request. CI must pass (lint, types, tests, build) before merging.
5. Squash-merge then delete the branch

# Before pushing
```bash
make lint
make test
```

## Decisions

If a change alters how the system is designed (a new dependency, a new component, a different approach), add a short record in `docs/decisions`, copying the existing format.
