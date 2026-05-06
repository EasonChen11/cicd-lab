# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **teaching lab** for a cloud-native course (NYCU). It is not a product — it is a Fastify + TypeScript app whose real subject is the surrounding CI/CD pipeline. Most "changes" in this repo are workflow YAML modifications, exercised locally via [`act`](https://nektosact.com/) before being pushed to GitHub Actions.

`README.md` is the lab manual (Lab-01 → Lab-04). When asked to "do Lab-N", read it for the exact steps the student is expected to perform.

## Common Commands

```bash
npm ci                # install (CI-style; preferred over npm install)
npm run dev           # tsx watch src/server.ts
npm run build         # tsc → dist/
npm run start         # node dist/server.js (requires build first)
npm run typecheck     # tsc --noEmit
npm test              # vitest run
npm run test:watch
npx vitest run test/app.test.ts -t "name"   # single test
npm run lint          # eslint . --ext .ts
npm run format        # prettier --write .
```

Run a workflow locally with gh act (config in `.actrc` pins `ubuntu-latest` to `catthehacker/ubuntu:act-latest` and `linux/amd64`):

```bash
gh act push                                    # all workflows
gh act push -W .github/workflows/ci.yaml       # one workflow
gh act push --env GITHUB_REF=refs/heads/release/1.0.0   # simulate a branch without checking out
```

## Architecture

- **App** (`src/`): `app.ts` exports `buildApp()` returning a Fastify instance with `/` and `/health` routes; `server.ts` is the entrypoint that calls `buildApp` and listens on `PORT` (default 3000). Tests in `test/` should use `buildApp` + `app.inject()` rather than starting a real listener.
- **Container**: multi-stage `Dockerfile` (builder compiles TS, runtime installs `--omit=dev` and copies `dist/`). `docker-compose.yml` consumes `IMAGE_TAG` and `APP_VERSION` env vars.
- **Workflows**: two parallel copies live in `snippets/` (canonical lab sources, students copy these into `.github/workflows/`) and `.github/workflows/` (active). Keep them in sync when editing.
  - `ci.yaml` runs on every branch + PRs, matrix `node: [22, 24]`. Computes an `image_tag`: `release-<version>` for `release/*` branches, else `sha-<short>`. Builds the Docker image only on the Node 24 leg. Calls `cd.yaml` via `workflow_call` when the ref is `refs/heads/release/*`.
  - `cd.yaml` re-derives the release tag, runs `docker compose up -d --build`, then polls `/health` for liveness.
- **Branch conventions matter**: `feature/*` branches just produce `sha-…` images; `release/<version>` branches trigger the CD path. When testing the release path locally with act, you must actually be on a `release/*` branch (or use `--env GITHUB_REF=…`) — the `if:` guards key off `github.ref` / `github.ref_name`.

## Conventions

- Node engines: `>=22 <25`. Use Node 22 or 24 locally; the CI matrix covers both.
- TypeScript strict project (`tsconfig.json`), ESLint + Prettier are wired — run `lint` and `typecheck` before declaring work done.
- Commit style follows Conventional Commits (`ci:`, `feat:`, `fix:` — see `git log`).
- The repo includes a homework write-up (`314552010_陳毅軒_CICD_作業.md`) and the assignment PDF; treat these as reference docs, not code.
