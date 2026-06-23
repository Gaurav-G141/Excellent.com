import type { Slide } from '../../types/lesson'
import { ChainRuleSlide } from '../slides/ChainRuleSlide'
import { DerivativeCriticalPointsSlide } from '../slides/DerivativeCriticalPointsSlide'
import { DragMatchSlide } from '../slides/DragMatchSlide'
import { DraggableSecantSlide } from '../slides/DraggableSecantSlide'
import { GreatestDerivativeSlide } from '../slides/GreatestDerivativeSlide'
import { HorizontalCriticalSlide } from '../slides/HorizontalCriticalSlide'
import { LimitSecantDemoSlide } from '../slides/LimitSecantDemoSlide'
import { MeanValueTheoremSlide } from '../slides/MeanValueTheoremSlide'
import { MvtMultiPartSlide } from '../slides/MvtMultiPartSlide'
import { PowerRuleExponentSlide } from '../slides/PowerRuleExponentSlide'
import { RateOfChangeArrowSlide } from '../slides/RateOfChangeArrowSlide'
import { SecantToTangentSlide } from '../slides/SecantToTangentSlide'
import { SecantZoomDerivativeSlide } from '../slides/SecantZoomDerivativeSlide'
import { SumRuleSlide } from '../slides/SumRuleSlide'
import { TypeInDerivativeSlide } from '../slides/TypeInDerivativeSlide'

interface Props {
  slide: Slide
  onAdvance: () => void
}

export function SlideRenderer({ slide, onAdvance }: Props) {
  if (slide.type === 'demo' && slide.component === 'rateOfChangeArrow') {
    return <RateOfChangeArrowSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'greatestDerivative') {
    return <GreatestDerivativeSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'draggableSecant') {
    return <DraggableSecantSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'secantZoomDerivative') {
    return <SecantZoomDerivativeSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'limitSecantDemo') {
    return <LimitSecantDemoSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'secantToTangent') {
    return <SecantToTangentSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'horizontalCritical') {
    return <HorizontalCriticalSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'derivativeCriticalPoints') {
    return <DerivativeCriticalPointsSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'powerRuleExponent') {
    return <PowerRuleExponentSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'dragMatch') {
    return <DragMatchSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'sumRule') {
    return <SumRuleSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'typeInDerivative') {
    return <TypeInDerivativeSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'chainRule') {
    return <ChainRuleSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'meanValueTheorem') {
    return <MeanValueTheoremSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'mvtMultiPart') {
    return <MvtMultiPartSlide slide={slide} onCorrect={onAdvance} />
  }

  return (
    <div className="slide-copy">
      <p>Unknown slide: {slide.component}</p>
      <button type="button" className="slide-cta" onClick={onAdvance}>
        Continue
      </button>
    </div>
  )
}
