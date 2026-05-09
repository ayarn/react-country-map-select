import { forwardRef, Suspense } from 'react'
import { lazyMaps } from './maps/generated/lazy'
import type { CountryMapProps } from './types'

/**
 * Render a single country's map shape as an inline SVG.
 *
 * Each country's map is fetched on demand via dynamic `import()`, so
 * consumers only pay the bytes for the codes they actually render.
 *
 * Color: the SVG fills with `currentColor`. Set CSS `color` on a parent
 * (or via `style={{ color: '...' }}`) to recolor.
 *
 * SSR: `React.lazy` requires a Suspense boundary above the tree. Frameworks
 * like Next.js (app router) handle this transparently. For non-Suspense
 * SSR, import the static component directly:
 * `import { IN } from 'react-country-map-select/maps'`.
 */
export const CountryMap = forwardRef<SVGSVGElement, CountryMapProps>(
  function CountryMap({ code, size = 20, title, ...rest }, ref) {
    const Component = lazyMaps[code.toLowerCase()]
    const labelled = title !== undefined
    if (!Component) {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        console.warn(`[react-country-map-select] Unknown country code: "${code}"`)
      }
      return null
    }
    return (
      <Suspense
        fallback={
          <span
            className="rcms-map-skeleton"
            aria-hidden={!labelled}
            aria-label={labelled ? title : undefined}
            role={labelled ? 'img' : undefined}
            style={{
              display: 'inline-block',
              width: size,
              height: size,
            }}
          />
        }
      >
        <Component
          ref={ref}
          width={size}
          height={size}
          role={labelled ? 'img' : undefined}
          aria-hidden={labelled ? undefined : true}
          aria-label={labelled ? title : undefined}
          focusable={false}
          {...rest}
        />
      </Suspense>
    )
  }
)
