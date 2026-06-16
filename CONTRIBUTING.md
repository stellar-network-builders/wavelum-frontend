# Contributing to Lumina Frontend

Thanks for your interest in improving Lumina Frontend. This guide covers the workflow, conventions, and quality bar for contributions.

## Code of conduct

Be respectful and constructive. Assume good intent, keep discussions focused on the work, and help reviewers help you by keeping pull requests small and well described.

## Getting set up

1. Fork the repository and clone your fork.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and fill in values.
4. Run `npm run dev` and confirm the app loads at `http://localhost:3000`.

See the [README](README.md) for the full quick start.

## Branch naming convention

Create a branch off the latest `main`. Use the pattern `type/short-description`:

| Type | Use for |
|------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code changes that neither fix a bug nor add a feature |
| `test/` | Adding or updating tests |
| `chore/` | Tooling, dependencies, or maintenance |

Examples: `feat/vesting-schedule-form`, `fix/wallet-disconnect-state`, `docs/api-integration`.

## Commit conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Each commit message has the form:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

Examples:

```
feat(vesting): add schedule creation form
fix(wallet): reset connection state on network switch
docs(readme): document environment variables
```

Keep the subject line under 72 characters, written in the imperative mood ("add", not "added"). Reference issues in the footer, for example `Closes #15`.

## Code style

- **Language:** TypeScript with strict mode enabled (see `tsconfig.json`).
- **Linting:** ESLint with `eslint-config-next`. Run `npm run lint` before pushing.
- **Formatting:** Match the existing style. If you use Prettier locally, keep it consistent with the surrounding code and do not reformat unrelated files.
- **Imports:** Use the `@/*` path alias for absolute imports from the project root.
- **Components:** Prefer Server Components by default; add the `"use client"` directive only when a component needs browser APIs, state, or effects.

## Pull request workflow

1. Make sure your branch is up to date with `main`.
2. Run the full local check suite (see below) and confirm it passes.
3. Push your branch and open a pull request against `main`.
4. Fill in the PR description: what changed, why, and how to test it.
5. Link the issue your PR resolves with `Closes #<number>`.
6. Request review and address feedback with follow-up commits.

### Local check suite

```bash
npm run lint     # ESLint must pass with no errors
npm run build    # Production build must succeed
```

### PR checklist

Before requesting review, confirm:

- [ ] The branch name follows the convention.
- [ ] Commits follow Conventional Commits.
- [ ] `npm run lint` passes with no errors.
- [ ] `npm run build` succeeds.
- [ ] New behavior is covered by tests where applicable (see [docs/TESTING.md](docs/TESTING.md)).
- [ ] Documentation is updated for any user-facing or API change.
- [ ] The PR description explains the change and links the related issue.
- [ ] No secrets, credentials, or `.env.local` values are committed.

## Code review standards

Reviewers look for correctness, readability, and consistency with the existing codebase. As an author, keep PRs focused on a single concern, respond to comments directly, and avoid force-pushing over a review in progress unless asked. As a reviewer, be specific and suggest concrete improvements rather than vague concerns.

## Reporting issues

Open issues on the upstream repository. Include reproduction steps, expected versus actual behavior, and environment details (browser, network, Node version).
