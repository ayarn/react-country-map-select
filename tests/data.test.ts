import { readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { countries, getCountry, countryCodes } from '../src/countries'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = resolve(__dirname, '../src/assets/maps')

describe('country data', () => {
  const fileCodes = readdirSync(ASSETS_DIR)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.replace(/\.svg$/, '').toLowerCase())
    .sort()

  it('has one entry per SVG asset', () => {
    expect(countryCodes.slice().sort()).toEqual(fileCodes)
  })

  it('every code is unique and lowercase ISO-2', () => {
    const codes = countries.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of codes) {
      expect(c).toMatch(/^[a-z]{2}$/)
    }
  })

  it('every country has a non-empty name', () => {
    for (const c of countries) {
      expect(c.name.length).toBeGreaterThan(0)
    }
  })

  it('getCountry resolves codes case-insensitively', () => {
    expect(getCountry('in')?.name).toBe('India')
    expect(getCountry('IN')?.name).toBe('India')
    expect(getCountry('zz')).toBeUndefined()
  })
})
