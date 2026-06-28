import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppHeader } from './AppHeader'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}))

function renderHeader(props?: { primaryLink?: 'interests' | 'home' }) {
  return render(
    <MemoryRouter>
      <AppHeader {...props} />
    </MemoryRouter>,
  )
}

describe('AppHeader', () => {
  it('renders the single calculator tool button and sign out', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Calculator' })).toBeInTheDocument()
    // The two tools were combined behind one icon button.
    expect(screen.queryByRole('button', { name: 'Quadratic' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('defaults the primary link to Interests', () => {
    renderHeader()
    const link = screen.getByRole('link', { name: 'Interests' })
    expect(link).toHaveAttribute('href', '/interests')
  })

  it('shows the Home variant when primaryLink is "home"', () => {
    renderHeader({ primaryLink: 'home' })
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toHaveAttribute('href', '/')
    expect(screen.queryByRole('link', { name: 'Interests' })).not.toBeInTheDocument()
  })

  it('opens the combined math-tools modal on the calculator button, defaulting to the calculator tab', async () => {
    const user = userEvent.setup()
    renderHeader()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Calculator' }))
    expect(screen.getByRole('dialog', { name: 'Calculator' })).toBeInTheDocument()
    // Both tools are reachable as tabs inside the one modal.
    expect(screen.getByRole('tab', { name: 'Calculator' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Quadratic' })).toBeInTheDocument()
  })

  it('switches to the quadratic tab inside the modal', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'Calculator' }))
    await user.click(screen.getByRole('tab', { name: 'Quadratic' }))
    expect(screen.getByRole('tab', { name: 'Quadratic' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    // The quadratic solver's Solve action is now visible.
    expect(screen.getByRole('button', { name: 'Solve' })).toBeInTheDocument()
  })

  it('closes the modal with the Escape key', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'Calculator' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
