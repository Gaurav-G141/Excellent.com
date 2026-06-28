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
  it('renders both tool buttons and sign out', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Quadratic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calculator' })).toBeInTheDocument()
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

  it('opens the quadratic solver modal on click', async () => {
    const user = userEvent.setup()
    renderHeader()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quadratic' }))
    expect(screen.getByRole('dialog', { name: 'Quadratic solver' })).toBeInTheDocument()
  })

  it('opens the calculator modal on click', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'Calculator' }))
    expect(screen.getByRole('dialog', { name: 'Calculator' })).toBeInTheDocument()
  })

  it('closes a modal with the Escape key', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button', { name: 'Quadratic' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
