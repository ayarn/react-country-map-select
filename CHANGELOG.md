# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release: `CountryMapSelect` accessible combobox with map icons
- Static `CountryMap` component for rendering a single country map
- 195 sovereign country map SVGs (193 UN members + 2 observers; sourced from simplemaps.com)
- Lazy-loaded map chunks via dynamic `import()`
- `eagerLoadMaps` escape hatch for SSR contexts
- Full TypeScript types including `CountryCode` literal union
- Built-in search across country name and ISO code
- Themable via CSS custom properties
