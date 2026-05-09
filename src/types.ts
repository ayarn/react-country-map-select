import type { CSSProperties, ReactNode, SVGProps } from 'react'

export type { CountryCode } from './types/country-codes'
import type { CountryCode } from './types/country-codes'

export interface Country {
  /** ISO 3166-1 alpha-2 code, lowercase. */
  code: CountryCode
  /** Common English name. */
  name: string
  /** Long, formal English name. */
  officialName?: string
}

/**
 * Props shared by both the static `<CountryMap>` and the lazy variant.
 * The component accepts any standard SVG props in addition to these.
 */
export interface CountryMapProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  code: CountryCode
  /** Pixel size for both width and height. Defaults to `20`. */
  size?: number | string
  /**
   * Accessible label. If omitted, the SVG is treated as decorative
   * (`aria-hidden="true"`). Pass a string for a labelled image.
   */
  title?: string
}

export interface CountryMapSelectProps {
  /** Controlled selected country code. */
  value?: CountryCode | null
  /** Initial selection for uncontrolled usage. */
  defaultValue?: CountryCode | null
  /** Fires when the user picks a country. */
  onChange?: (code: CountryCode, country: Country) => void

  /** Whitelist; if provided, only these countries are shown. */
  countries?: readonly CountryCode[]
  /** Blacklist; codes to remove from the default list. */
  exclude?: readonly CountryCode[]

  /** Show a search input that filters by name and code. Default `true`. */
  searchable?: boolean
  /** Placeholder text for the trigger / search input. */
  placeholder?: string

  /** Override the visible label per option. Useful for i18n. */
  getOptionLabel?: (country: Country) => string
  /** Replace the default option rendering entirely. */
  renderOption?: (country: Country, state: { highlighted: boolean; selected: boolean }) => ReactNode

  /** Pixel size of the inline map icon. Default `20`. */
  mapSize?: number

  /** Disable the entire component. */
  disabled?: boolean
  /** id applied to the trigger input. */
  id?: string
  /** Accessible name for screen readers. */
  ariaLabel?: string
  /** Class applied to the root wrapper. */
  className?: string
  /** Inline style for the root wrapper. */
  style?: CSSProperties
  /** Maximum height of the open menu (in px). Default `320`. */
  menuMaxHeight?: number
}
