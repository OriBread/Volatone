# 2. Single repository with backend/ and frontend/ folders

Status: accepted

## Context
The backend and frontend share a contract (the note event format) and are developed together by one person.

## Decision
One repository, two top-level application folders, one CI workflow with a job per folder.

## Consequences
A contract change and its consumers land in a single pull request. Each half still has its own dependencies and tooling, so splitting later (into 2 separate repos) is straightforward.
