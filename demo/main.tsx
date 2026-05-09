import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CountryMap, CountryMapSelect, getCountry } from '../src'
import type { CountryCode } from '../src'
import '../src/styles.css'
import './demo.css'

const INSTALL_CMD = 'npm install react-country-map-select'

function CopyInstall() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API may be blocked in non-secure contexts; fall back to a
      // legacy execCommand path so the user still gets something.
      const textarea = document.createElement('textarea')
      textarea.value = INSTALL_CMD
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <button
      type="button"
      className="demo-install"
      onClick={handleCopy}
      aria-label="Copy install command"
      data-copied={copied || undefined}
    >
      <span className="demo-install-prompt" aria-hidden>
        $
      </span>
      <code className="demo-install-cmd">{INSTALL_CMD}</code>
      <span className="demo-install-icon" aria-hidden>
        {copied ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </span>
      <span className="demo-install-status">
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  )
}

function App() {
  const [code, setCode] = useState<CountryCode | null>('in')
  const country = code ? getCountry(code) : null

  return (
    <div className="demo-shell">
      <header className="demo-header">
        <CopyInstall />
        <h1 className="demo-title">
          A country picker that<br />
          <span className="demo-title-accent">shows the map.</span>
        </h1>
        <p className="demo-subtitle">
          An accessible, searchable React combobox with the actual map shape
          rendered next to every country&rsquo;s name. All{' '}
          <strong>195 countries as per UN</strong> &mdash; lazy-loaded so the
          bundle stays tiny.
        </p>
      </header>

      <section className="demo-card">
        <div className="demo-card-row">
          <div className="demo-field">
            <label htmlFor="country" className="demo-label">
              Pick a country
            </label>
            <CountryMapSelect
              id="country"
              ariaLabel="Country"
              value={code}
              onChange={(next) => setCode(next)}
              placeholder="Search 195 countries..."
            />
            <p className="demo-hint">
              Type to filter by name or ISO code &mdash; e.g.{' '}
              <kbd>in</kbd>, <kbd>jp</kbd>, <kbd>de</kbd>.
            </p>
          </div>

          <div className="demo-preview">
            {country ? (
              <>
                <div className="demo-preview-map">
                  <CountryMap
                    code={country.code}
                    size={140}
                    title={`Map of ${country.name}`}
                  />
                </div>
                <div className="demo-preview-info">
                  <span className="demo-preview-eyebrow">Selected</span>
                  <h2 className="demo-preview-name">{country.name}</h2>
                  {country.officialName &&
                    country.officialName !== country.name && (
                      <p className="demo-preview-official">
                        {country.officialName}
                      </p>
                    )}
                  <code className="demo-preview-code">
                    {country.code.toUpperCase()}
                  </code>
                </div>
              </>
            ) : (
              <div className="demo-preview-empty">
                Select a country to see its map
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="demo-features">
        <Feature
          title="Accessible by default"
          body="ARIA combobox, full keyboard navigation, focus management, and screen-reader friendly labels — powered by downshift."
        />
        <Feature
          title="Lazy-loaded maps"
          body="Each country ships as its own JS chunk. Main bundle stays under 10 KB gzipped; consumers only pay for the maps they actually render."
        />
        <Feature
          title="Themable in pure CSS"
          body="No CSS-in-JS runtime. Theme via plain CSS custom properties or override the BEM class names. Dark mode supported out of the box."
        />
      </section>

      <section className="demo-code-card">
        <span className="demo-code-eyebrow">Drop-in usage</span>
        <pre className="demo-code">
          <code>{`import { CountryMapSelect } from 'react-country-map-select'
import 'react-country-map-select/styles.css'

<CountryMapSelect
  defaultValue="in"
  onChange={(code) => console.log(code)}
/>`}</code>
        </pre>
      </section>

      <footer className="demo-footer">
        <span>
          Map data &copy;{' '}
          <a
            href="https://simplemaps.com"
            target="_blank"
            rel="noreferrer"
          >
            simplemaps.com
          </a>{' '}
          &middot; MIT licensed
        </span>
      </footer>
    </div>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <article className="demo-feature">
      <h3 className="demo-feature-title">{title}</h3>
      <p className="demo-feature-body">{body}</p>
    </article>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
