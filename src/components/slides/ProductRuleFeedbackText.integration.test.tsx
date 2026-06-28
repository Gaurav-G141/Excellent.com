import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductRuleMultiPartSlide } from './ProductRuleMultiPartSlide'
import { lessons } from '../../lessons'
import type { ProblemSlide } from '../../types/lesson'

const EXACT = "Add up the u'v and uv' terms you calculated earlier"

const productSlide = lessons['exponents-product-rule'].slides.find(
  (s) => s.component === 'productRuleMultiPart',
) as ProblemSlide

describe('product-rule wrong-feedback copy', () => {
  it('is exactly the expected string in the lesson content', () => {
    expect(productSlide.feedback.wrong).toBe(EXACT)
  })

  it('surfaces that exact message when a part is answered wrong', async () => {
    const user = userEvent.setup()
    render(<ProductRuleMultiPartSlide slide={productSlide} onCorrect={() => {}} />)

    // Enter an obviously wrong u′ (leave both builders effectively empty/wrong)
    // by submitting Part (a) without correct values.
    const uPrime = screen.getByRole('group', { name: 'u\u2032(x)' })
    await user.click(within(uPrime).getByRole('button', { name: 'digit 9' }))
    await user.click(within(uPrime).getByRole('button', { name: /add term/i }))
    await user.click(screen.getByRole('button', { name: 'Check' }))

    expect(screen.getByText(EXACT)).toBeInTheDocument()
  })
})
