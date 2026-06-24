# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Developer documentation set under `docs/` covering architecture, wallet integration, API integration, Soroban integration, components, state management, testing, and deployment.
- Root `CONTRIBUTING.md` with branch naming, commit conventions, and PR checklist.
- `.env.example` template listing all `NEXT_PUBLIC_*` configuration variables.
- Expanded `README.md` with quick start, environment variable table, scripts, and project structure.
- `CHANGELOG.md` following Keep a Changelog.
- Global React error boundary (`ErrorBoundary`) that catches render crashes and shows a branded recovery UI with "Try Again", "Refresh Page", and "Report Issue" buttons.
- Typed error hierarchy (`AppError`, `ApiError`, `WalletError`, `SorobanError`) in `src/lib/errors.ts` with severity levels for routing errors to the correct UX treatment.
- `useErrorToast` hook that automatically shows toast notifications for specific error types (API errors, wallet errors, Soroban contract errors).
- Sentry integration with client/server/edge configuration files for production error tracking, performance monitoring, and session replay.
- `app/global-error.tsx` for Next.js App Router global error handling with Sentry error capture.
- `app/not-found.tsx` and `app/error.tsx` pages for 404 and generic errors.
- `app/[locale]/error.tsx` localized error page with translation support.
- Error-related translation messages added to all locale files (en, ja, ko, zh).
- `https://*.sentry.io` added to CSP `connect-src` directive.

### Changed

### Fixed

## [0.1.0] - 2025-01-01

### Added
- Initial Next.js 16 application scaffold with the App Router and Tailwind CSS v4.
- Continuous integration build check on push and pull request.

<!--
Release section template, copy when cutting a new version:

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features.

### Changed
- Changes in existing functionality.

### Deprecated
- Soon-to-be removed features.

### Removed
- Removed features.

### Fixed
- Bug fixes.

### Security
- Vulnerability fixes.
-->

[Unreleased]: https://github.com/stellar-network-builders/lumina-frontend/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/stellar-network-builders/lumina-frontend/releases/tag/v0.1.0
