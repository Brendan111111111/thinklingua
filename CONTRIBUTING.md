# Contributing to ThinkLingua

## Pull requests

`main` is protected. All changes must land through a pull request against `main`; direct pushes, force pushes and branch deletion are blocked. Admin bypass is disabled, so maintainers follow the same rules.

1. Create a branch from the current `main`.
2. Make the change and run the checks below.
3. Open a pull request targeting `main`.
4. Wait for both required checks to pass, then merge.

No approving review is currently required. The required checks are the merge gate. For pull requests from forks, a maintainer may need to approve the workflow run before checks appear.

## Required checks

Both checks are reported by GitHub Actions and are required on `main`. A failing or missing check blocks the merge.

| Check | Workflow | What it runs |
| --- | --- | --- |
| `build-and-typecheck` | [build-and-typecheck.yml](.github/workflows/build-and-typecheck.yml) | `npm ci`, `npx tsc --noEmit`, `npm run build` |
| `tone-fixtures` | [tone-fixtures.yml](.github/workflows/tone-fixtures.yml) | `npm ci`, `npx tsc --noEmit`, Playwright Chromium install, `npm run test:tone` |

Both jobs use Node 22. The check names are the workflow job names; if a job is renamed, the required-check configuration must be updated at the same time.

## Run the checks locally

Requires Node 22 and npm; dependencies are locked in `package-lock.json`.

```bash
npm ci
npx tsc --noEmit
npm run build
npx playwright install chromium
npm run test:tone
```

`npm run test:tone` drives the development-only `/dev/tone` harness in Chromium. It reuses a server already running on `localhost:3000`, or starts one when needed; with `CI=1`, Playwright always starts its own server. Use `localhost`, not `127.0.0.1`: Next's dev server treats the latter as a cross-origin host and the page does not hydrate.

The tone test stubs `/api/tts` with the committed native clip, so it does not need a TTS key or network access. The `/dev/tone` route itself returns 404 in production.

## Workflow notes

- `build-and-typecheck` and `tone-fixtures` run on pushes and pull requests to `main`, and can be started manually from the Actions tab.
- The tone workflow uploads Playwright reports and test results when it fails.
- `main` does not require a PR branch to be up to date with `main`; only the two checks must pass.
- Branch protection requires a pull request but no approving reviews, and applies to administrators.
