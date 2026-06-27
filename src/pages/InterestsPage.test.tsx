import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import InterestsPage from './InterestsPage'
import { MAX_INTERESTS } from '../lib/interests'

const save = vi.fn(() => Promise.resolve())
let mockInterests: string[] = []
let mockLoading = false

// The add flow screens each interest through moderateInterest; mock it so these
// UI tests are deterministic and offline (no API). Defaults to "ok" per test.
// Hoisted so the vi.mock factory can reference them safely.
const { moderateInterest, ERROR_MESSAGE } = vi.hoisted(() => ({
  moderateInterest: vi.fn(),
  ERROR_MESSAGE: 'verify-error-message',
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}))

vi.mock('../hooks/useInterests', () => ({
  useInterests: () => ({ interests: mockInterests, loading: mockLoading, save }),
}))

vi.mock('../lib/interestsModeration', () => ({
  ERROR_MESSAGE,
  moderateInterest,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <InterestsPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  save.mockClear()
  moderateInterest.mockReset()
  moderateInterest.mockResolvedValue({ status: 'ok' })
  mockInterests = []
  mockLoading = false
})

describe('InterestsPage', () => {
  it('adds an interest and saves the resulting list', async () => {
    const user = userEvent.setup()
    renderPage()

    // Nothing to save before any edits.
    expect(screen.getByRole('button', { name: /save interests/i })).toBeDisabled()

    await user.type(screen.getByLabelText(/add an interest/i), 'Basketball')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Basketball')).toBeInTheDocument()
    expect(screen.getByText(`1 / ${MAX_INTERESTS} added`)).toBeInTheDocument()
    expect(moderateInterest).toHaveBeenCalledWith('Basketball')

    const saveBtn = screen.getByRole('button', { name: /save interests/i })
    expect(saveBtn).toBeEnabled()
    await user.click(saveBtn)

    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith(['Basketball'])
  })

  it('does not add a duplicate (case-insensitive)', async () => {
    const user = userEvent.setup()
    renderPage()
    const input = screen.getByLabelText(/add an interest/i)

    await user.type(input, 'Baking')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Baking')).toBeInTheDocument()

    await user.type(input, 'baking')

    // The Add button is disabled because the (case-insensitive) value already exists.
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getAllByText(/baking/i)).toHaveLength(1)
  })

  it('blocks an inappropriate interest and does not add it', async () => {
    moderateInterest.mockResolvedValue({ status: 'blocked', reason: 'Not allowed for school problems.' })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/add an interest/i), 'cocaine')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/not allowed for school problems/i)
    // The chip is never created and nothing is queued to save.
    expect(screen.queryByText('cocaine')).not.toBeInTheDocument()
    expect(screen.getByText(`0 / ${MAX_INTERESTS} added`)).toBeInTheDocument()
  })

  it('shows a retry message and does not add when the check errors', async () => {
    moderateInterest.mockResolvedValue({ status: 'error' })
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/add an interest/i), 'basketball')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGE)
    expect(screen.queryByText('basketball')).not.toBeInTheDocument()
  })

  it('clears the error message once the learner edits the entry', async () => {
    moderateInterest.mockResolvedValueOnce({ status: 'blocked', reason: 'Nope.' })
    const user = userEvent.setup()
    renderPage()

    const input = screen.getByLabelText(/add an interest/i)
    await user.type(input, 'cocaine')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await user.type(input, ' more')
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })

  it('removes an interest', async () => {
    mockInterests = ['baking']
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText('baking')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /remove baking/i }))

    expect(screen.queryByText('baking')).not.toBeInTheDocument()
    expect(screen.getByText(`0 / ${MAX_INTERESTS} added`)).toBeInTheDocument()
  })

  it('enforces the interest cap', async () => {
    mockInterests = Array.from({ length: MAX_INTERESTS }, (_, i) => `interest ${i}`)
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText(`${MAX_INTERESTS} / ${MAX_INTERESTS} added`)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/add an interest/i), 'one more')
    // At the cap, adding is blocked even with valid text typed in.
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })
})
