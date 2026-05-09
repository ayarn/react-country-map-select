#!/usr/bin/env node
/**
 * Convert raw country map SVGs into optimized React components.
 *
 * Pipeline (per file):
 *   1. Normalize HTML-form attributes (`viewbox` → `viewBox`,
 *      `baseprofile` → `baseProfile`) that SVGR's parser would otherwise
 *      drop or pass through case-sensitively.
 *   2. Run @svgr/core with svgo enabled, replacing the source fill
 *      `#6f9c76` with `currentColor` so consumers can recolor via CSS.
 *   3. Write the resulting TSX to `src/maps/generated/{code}.tsx`.
 *
 * Cached by content hash in `.svg-cache.json` so unchanged inputs skip work.
 */
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from '@svgr/core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC_DIR = join(ROOT, 'src/assets/maps')
const OUT_DIR = join(ROOT, 'src/maps/generated')
const CACHE_FILE = join(ROOT, '.svg-cache.json')

const SOURCE_FILL = '#6f9c76'

// Rename HTML-form attributes to their JSX/camelCase equivalents and drop
// the simplemaps `<g id="points">` block (city markers with numeric ids
// that SVGR would emit as `id={0}`, breaking TypeScript and adding bytes
// without visible benefit at icon sizes).
function normalizeSvgSource(svg) {
  return svg
    .replace(/\bviewbox=/gi, 'viewBox=')
    .replace(/\bbaseprofile=/gi, 'baseProfile=')
    .replace(/<g\s+id=["']points["'][\s\S]*?<\/g>/gi, '')
}

function pascalCase(code) {
  // 'in' -> 'In', 'gb' -> 'Gb'. Used as the React component name only.
  return code.charAt(0).toUpperCase() + code.slice(1)
}

const svgrConfig = {
  plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
  jsxRuntime: 'automatic',
  typescript: true,
  prettier: false,
  ref: true,
  expandProps: 'end',
  replaceAttrValues: { [SOURCE_FILL]: 'currentColor' },
  svgoConfig: {
    multipass: true,
    floatPrecision: 0,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            cleanupIds: { remove: true },
            convertPathData: {
              floatPrecision: 0,
              forceAbsolutePath: false,
              transformPrecision: 0,
            },
            mergePaths: { floatPrecision: 0, force: true },
            collapseGroups: true,
            removeUselessStrokeAndFill: true,
          },
        },
      },
      {
        name: 'removeAttrs',
        params: {
          attrs: [
            'svg:baseProfile',
            'svg:version',
            'svg:stroke-linecap',
            'svg:stroke-linejoin',
            'svg:stroke-width',
            'svg:stroke',
            'path:id',
            'path:name',
            'path:class',
            'g:id',
          ],
        },
      },
      'removeDimensions',
    ],
  },
}

function loadCache() {
  if (!existsSync(CACHE_FILE)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

async function build() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Source directory missing: ${SRC_DIR}`)
    process.exit(1)
  }

  // Reset output dir if cache is missing so a clean rebuild always produces a
  // matching index.
  if (!existsSync(CACHE_FILE) && existsSync(OUT_DIR)) {
    rmSync(OUT_DIR, { recursive: true, force: true })
  }
  mkdirSync(OUT_DIR, { recursive: true })

  const cache = loadCache()
  const svgFiles = readdirSync(SRC_DIR)
    .filter((f) => f.endsWith('.svg'))
    .sort()

  let built = 0
  let skipped = 0

  for (const file of svgFiles) {
    const code = file.replace(/\.svg$/, '').toLowerCase()
    const inputPath = join(SRC_DIR, file)
    const outputPath = join(OUT_DIR, `${code}.tsx`)

    const raw = readFileSync(inputPath, 'utf8')
    const hash = createHash('sha1').update(raw).digest('hex')

    if (cache[code] === hash && existsSync(outputPath)) {
      skipped++
      continue
    }

    const normalized = normalizeSvgSource(raw)
    const componentName = `Map${pascalCase(code)}`
    const tsx = await transform(normalized, svgrConfig, { componentName })
    writeFileSync(outputPath, tsx)
    cache[code] = hash
    built++
    if (built % 25 === 0) {
      console.log(`  built ${built}/${svgFiles.length}`)
    }
  }

  // Drop cache entries for codes whose SVGs were removed.
  for (const code of Object.keys(cache)) {
    if (!svgFiles.includes(`${code}.svg`)) {
      delete cache[code]
      const stale = join(OUT_DIR, `${code}.tsx`)
      if (existsSync(stale)) rmSync(stale)
    }
  }
  saveCache(cache)

  // Generate the barrel index. Pascal-cased exports for `import { IN }`-style
  // usage map to lowercase ISO codes.
  const codes = svgFiles.map((f) => f.replace(/\.svg$/, '').toLowerCase()).sort()
  const indexLines = [
    '// AUTO-GENERATED by scripts/build-svgs.mjs — do not edit by hand.',
    '',
    ...codes.map(
      (code) =>
        `export { default as ${code.toUpperCase()} } from './${code}'`
    ),
    '',
  ]
  writeFileSync(join(OUT_DIR, 'index.ts'), indexLines.join('\n'))

  // Generate a lookup of `React.lazy()`-wrapped components. Bundlers need
  // a static `import('./xx')` per country to split each into its own
  // chunk; a templated path with a variable cannot be code-split.
  const lazyLines = [
    '// AUTO-GENERATED by scripts/build-svgs.mjs — do not edit by hand.',
    "import { lazy, type ComponentType, type LazyExoticComponent, type SVGProps } from 'react'",
    '',
    'type MapComponent = ComponentType<SVGProps<SVGSVGElement>>',
    '',
    'export const lazyMaps: Record<string, LazyExoticComponent<MapComponent>> = {',
    ...codes.map(
      (code) => `  '${code}': lazy(() => import('./${code}')),`
    ),
    '}',
    '',
  ]
  writeFileSync(join(OUT_DIR, 'lazy.ts'), lazyLines.join('\n'))

  console.log(
    `[build-svgs] built ${built}, skipped ${skipped} (cached), total ${svgFiles.length}`
  )
}

build().catch((err) => {
  console.error('[build-svgs] failed:', err)
  process.exit(1)
})
