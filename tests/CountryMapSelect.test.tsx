import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { CountryMapSelect } from '../src/CountryMapSelect'

describe('CountryMapSelect', () => {
  it('renders an accessible combobox', () => {
    render(<CountryMapSelect ariaLabel="Country" />)
    const input = screen.getByRole('combobox', { name: 'Country' })
    expect(input).toBeInTheDocument()
  })

  it('opens the listbox on focus and shows options', async () => {
    const user = userEvent.setup()
    render(<CountryMapSelect ariaLabel="Country" />)
    await user.click(screen.getByRole('button', { name: /country list/i }))
    const listbox = await screen.findByRole('listbox')
    expect(listbox).toBeInTheDocument()
    // 206 entries — sample one we know exists.
    expect(screen.getByText('India')).toBeInTheDocument()
  })

  it('filters by name as the user types', async () => {
    const user = userEvent.setup()
    render(<CountryMapSelect ariaLabel="Country" />)
    await user.click(screen.getByRole('button', { name: /country list/i }))
    await user.keyboard('indi')
    await waitFor(() =>
      expect(screen.getByText('India')).toBeInTheDocument()
    )
    expect(screen.queryByText('France')).not.toBeInTheDocument()
  })

  it('filters by ISO code', async () => {
    const user = userEvent.setup()
    render(<CountryMapSelect ariaLabel="Country" />)
    await user.click(screen.getByRole('button', { name: /country list/i }))
    await user.keyboard('jp')
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument()
      expect(screen.queryByText('Germany')).not.toBeInTheDocument()
    })
  })

  it('calls onChange with the selected country code', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CountryMapSelect ariaLabel="Country" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /country list/i }))
    await user.keyboard('india')
    await user.click(screen.getByText('India'))
    expect(onChange).toHaveBeenCalledWith(
      'in',
      expect.objectContaining({ code: 'in', name: 'India' })
    )
  })

  it('respects the countries whitelist', async () => {
    const user = userEvent.setup()
    render(
      <CountryMapSelect ariaLabel="Country" countries={['in', 'jp', 'gb']} />
    )
    await user.click(screen.getByRole('button', { name: /country list/i }))
    expect(screen.getByText('India')).toBeInTheDocument()
    expect(screen.getByText('United Kingdom')).toBeInTheDocument()
    expect(screen.queryByText('France')).not.toBeInTheDocument()
  })

  it('shows "No matches" when filter has no results', async () => {
    const user = userEvent.setup()
    render(<CountryMapSelect ariaLabel="Country" />)
    await user.click(screen.getByRole('button', { name: /country list/i }))
    await user.keyboard('zzznotacountry')
    await waitFor(() =>
      expect(screen.getByText('No matches')).toBeInTheDocument()
    )
  })

  it('passes axe accessibility checks when closed', async () => {
    const { container } = render(
      <CountryMapSelect ariaLabel="Country" defaultValue="in" />
    )
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
