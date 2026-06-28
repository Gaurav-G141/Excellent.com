import { useEffect, useState } from 'react'
import { Modal } from '../Modal'
import { CalculatorBody } from './Calculator'
import { QuadraticBody } from './QuadraticSolver'
import './MathTools.css'

interface Props {
  open: boolean
  onClose: () => void
}

type Tab = 'calculator' | 'quadratic'

/**
 * One modal that houses both math helpers behind a single calculator icon: a
 * basic arithmetic calculator and a quadratic-formula solver, switched with a
 * tab bar. Both panels stay mounted (hidden, not unmounted) so switching tabs
 * preserves whatever the learner has typed.
 */
export function MathTools({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('calculator')

  // Always reopen on the calculator tab so it's the predictable default.
  useEffect(() => {
    if (open) setTab('calculator')
  }, [open])

  return (
    <Modal open={open} title="Calculator" onClose={onClose}>
      <div className="math-tools-tabs" role="tablist" aria-label="Math tools">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'calculator'}
          className={`math-tools-tab${tab === 'calculator' ? ' math-tools-tab--active' : ''}`}
          onClick={() => setTab('calculator')}
        >
          Calculator
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'quadratic'}
          className={`math-tools-tab${tab === 'quadratic' ? ' math-tools-tab--active' : ''}`}
          onClick={() => setTab('quadratic')}
        >
          Quadratic
        </button>
      </div>

      <div className="math-tools-panel" role="tabpanel" hidden={tab !== 'calculator'}>
        <CalculatorBody active={open && tab === 'calculator'} />
      </div>
      <div className="math-tools-panel" role="tabpanel" hidden={tab !== 'quadratic'}>
        <QuadraticBody />
      </div>
    </Modal>
  )
}
