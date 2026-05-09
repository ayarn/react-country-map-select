[![npm](https://img.shields.io/npm/v/react-country-map-select.svg)](https://www.npmjs.com/package/react-country-map-select)
[![npm downloads](https://img.shields.io/npm/dm/react-country-map-select.svg)](https://www.npmjs.com/package/react-country-map-select)

# react-country-map-select

An accessible React dropdown for picking a country, with each option showing the country's actual map shape next to its name.

- Searchable combobox (keyboard-friendly, ARIA-correct via [downshift](https://github.com/downshift-js/downshift))
- 195 sovereign country map SVGs included (193 UN member states + 2 observers)
- Each map is **lazy-loaded** &mdash; the initial bundle stays small
- Full TypeScript types: `CountryCode` is a literal union, so `defaultValue="in"` autocompletes
- Themable via plain CSS custom properties &mdash; no CSS-in-JS runtime

## Install

```bash
npm install react-country-map-select
# or
pnpm add react-country-map-select
```

`react` and `react-dom` are peer dependencies.

## Usage

```tsx
import { useState } from "react";
import { CountryMapSelect, type CountryCode } from "react-country-map-select";
import "react-country-map-select/styles.css";

export function CountryField() {
  const [code, setCode] = useState<CountryCode | null>("in");
  return (
    <CountryMapSelect
      ariaLabel="Country"
      value={code}
      onChange={(next) => setCode(next)}
      placeholder="Select a country"
    />
  );
}
```

### Render a single map (no dropdown)

```tsx
import { CountryMap } from "react-country-map-select";

<CountryMap code="in" size={48} title="Map of India" />;
```

`<CountryMap>` lazy-loads the country chunk on first render. For SSR or non-Suspense renderers, import the static eager components from the `/maps` subpath:

```tsx
import { IN } from "react-country-map-select/maps";

<IN width={48} height={48} />;
```

## Props

### `<CountryMapSelect>`

| Prop             | Type                            | Default              | Description                         |
| ---------------- | ------------------------------- | -------------------- | ----------------------------------- |
| `value`          | `CountryCode \| null`           | &mdash;              | Controlled selected code            |
| `defaultValue`   | `CountryCode \| null`           | `null`               | Initial selection (uncontrolled)    |
| `onChange`       | `(code, country) => void`       | &mdash;              | Fires when the user picks a country |
| `countries`      | `CountryCode[]`                 | all 195              | Whitelist of codes to show          |
| `exclude`        | `CountryCode[]`                 | `[]`                 | Codes to remove from the list       |
| `searchable`     | `boolean`                       | `true`               | Show a typeahead filter             |
| `placeholder`    | `string`                        | `'Select a country'` | Trigger / search placeholder        |
| `getOptionLabel` | `(country) => string`           | name                 | Override option label (i18n hook)   |
| `renderOption`   | `(country, state) => ReactNode` | &mdash;              | Replace default option rendering    |
| `mapSize`        | `number`                        | `20`                 | Pixel size of inline map icons      |
| `disabled`       | `boolean`                       | `false`              | Disable the entire component        |
| `id`             | `string`                        | &mdash;              | id applied to the input             |
| `ariaLabel`      | `string`                        | &mdash;              | Accessible name                     |
| `className`      | `string`                        | &mdash;              | Class on the root wrapper           |
| `style`          | `CSSProperties`                 | &mdash;              | Inline style on the root wrapper    |
| `menuMaxHeight`  | `number`                        | `320`                | Max height of the open menu (px)    |

### `<CountryMap>`

Accepts every standard `<svg>` prop, plus:

| Prop    | Type               | Default | Description                                                   |
| ------- | ------------------ | ------- | ------------------------------------------------------------- |
| `code`  | `CountryCode`      | &mdash; | Which country to render                                       |
| `size`  | `number \| string` | `20`    | Sets both width and height                                    |
| `title` | `string`           | &mdash; | Accessible label; if omitted the SVG is treated as decorative |

## Theming

The component fills with `currentColor`, so a parent `color` will recolor the maps:

```css
.my-picker {
  color: #2563eb;
}
```

You can also override individual tokens via CSS custom properties:

```css
.my-picker {
  --rcms-border: #cbd5e1;
  --rcms-radius: 8px;
  --rcms-bg: #ffffff;
  --rcms-bg-hover: #f1f5f9;
  --rcms-bg-selected: #dbeafe;
  --rcms-fg: #0f172a;
  --rcms-map-color: #0ea5e9;
}
```

## Accessibility

- The trigger is an `role="combobox"` with proper `aria-expanded`, `aria-controls`, and `aria-activedescendant` (via downshift).
- The menu is `role="listbox"` with `role="option"` items.
- Keyboard: `Arrow Up`/`Arrow Down` to move highlight, `Home`/`End` to jump, `Enter` to select, `Esc` to close, type to filter.
- Maps are decorative (`aria-hidden`) inside the dropdown so screen readers announce only the country name.

## SSR &amp; Next.js

`<CountryMap>` and `<CountryMapSelect>` use `React.lazy` + `Suspense`, which works in Next.js&rsquo; app router out of the box. For the pages router or other non-streaming renderers, use the static map components directly:

```tsx
import { IN, US, GB } from "react-country-map-select/maps";
```

## Bundle size

|                             | Gzipped                                      |
| --------------------------- | -------------------------------------------- |
| Main entry (no maps loaded) | ~9 KB                                        |
| Median country chunk        | ~10 KB                                       |
| Largest country chunk       | ~170 KB _(highly detailed admin boundaries)_ |

Each country&rsquo;s map is its own chunk &mdash; consumers only download the maps they actually render.

## Country coverage

The package ships with **195 sovereign nations** &mdash; all 193 UN member states plus the 2 UN observer states (Holy See / Vatican City and Palestine). Dependent territories and disputed regions are intentionally excluded so consumers always get a clean, internationally recognized list. Use the `countries` (whitelist) and `exclude` (blacklist) props to scope further if you only need a subset.

## Map data attribution

Country map shapes are sourced from [simplemaps.com](https://simplemaps.com) under their free-for-commercial-use license. See [LICENSE-DATA.md](./LICENSE-DATA.md) for the notice.

## License

[MIT](./LICENSE) for the source code. Map data is licensed separately by simplemaps.com.
