# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-05-10

### Added

- `'use client'` directive on the main entry for Next.js App Router support. The `/maps` subpath remains server-renderable for SSR/RSC users.
- `CountryMapSelect` now forwards a `ref` to the inner `<input>`, enabling integration with `react-hook-form`, imperative `.focus()`, and other ref-based patterns.
- New `name` prop on `CountryMapSelect` — renders a hidden input so native `<form>` submissions include the selected country code.
- New `required` prop — applies HTML `required` and `aria-required` to the input.
- New `autoFocus` prop — focuses the input on mount.

### Changed

- Cleaned up `package.json` metadata (author, repository, homepage).

## [0.1.0] - 2026-04-09

### Added

- Initial release.
- `CountryMapSelect` accessible combobox with searchable filter and per-option country map shapes.
- `CountryMap` component for rendering a single country's map shape, lazy-loaded.
- Static eager components exported from `react-country-map-select/maps` for SSR / non-Suspense renderers.
- Full TypeScript types — `CountryCode` is a literal union of all 195 ISO codes.
- Themable via plain CSS custom properties; dark mode and reduced-motion support out of the box.
- 195 sovereign country SVGs (193 UN members + 2 observers).

[Unreleased]: https://github.com/ayarn/react-country-map-select/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ayarn/react-country-map-select/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ayarn/react-country-map-select/releases/tag/v0.1.0
