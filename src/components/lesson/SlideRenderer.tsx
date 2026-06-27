import type { Slide } from '../../types/lesson'
import { BoxOptimizeSlide } from '../slides/BoxOptimizeSlide'
import { BoxTransferSlide } from '../slides/BoxTransferSlide'
import { BoxVolumeDeriveSlide } from '../slides/BoxVolumeDeriveSlide'
import { ChainRuleSlide } from '../slides/ChainRuleSlide'
import { DerivativeCriticalPointsSlide } from '../slides/DerivativeCriticalPointsSlide'
import { DragMatchSlide } from '../slides/DragMatchSlide'
import { DraggableSecantSlide } from '../slides/DraggableSecantSlide'
import { ExpandingCircleSlide } from '../slides/ExpandingCircleSlide'
import {
  ExponentialTriangleQuestionSlide,
  ExponentialTriangleSlide,
} from '../slides/ExponentialTriangleSlide'
import { GreatestDerivativeSlide } from '../slides/GreatestDerivativeSlide'
import { HorizontalCriticalSlide } from '../slides/HorizontalCriticalSlide'
import { IntermediateValueTheoremSlide } from '../slides/IntermediateValueTheoremSlide'
import { IvtProblemSlide } from '../slides/IvtProblemSlide'
import { LimitSecantDemoSlide } from '../slides/LimitSecantDemoSlide'
import { MeanValueTheoremSlide } from '../slides/MeanValueTheoremSlide'
import { MotionVectorsSlide } from '../slides/MotionVectorsSlide'
import { MultipleChoiceSlide } from '../slides/MultipleChoiceSlide'
import { MvtMultiPartSlide } from '../slides/MvtMultiPartSlide'
import { NPowerXAnimationSlide } from '../slides/NPowerXAnimationSlide'
import { PaperBoxExplorerSlide } from '../slides/PaperBoxExplorerSlide'
import { PolynomialDerivativeSlide } from '../slides/PolynomialDerivativeSlide'
import { PolynomialPlaygroundSlide } from '../slides/PolynomialPlaygroundSlide'
import { PowerRuleExponentSlide } from '../slides/PowerRuleExponentSlide'
import { ProductRuleMultiPartSlide } from '../slides/ProductRuleMultiPartSlide'
import { RateOfChangeArrowSlide } from '../slides/RateOfChangeArrowSlide'
import { RelatedRatesProblemSlide } from '../slides/RelatedRatesProblemSlide'
import { SecantToTangentSlide } from '../slides/SecantToTangentSlide'
import { SecantZoomDerivativeSlide } from '../slides/SecantZoomDerivativeSlide'
import { SecondDerivativeProblemSlide } from '../slides/SecondDerivativeProblemSlide'
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

  if (slide.type === 'problem' && slide.component === 'polynomialDerivative') {
    return <PolynomialDerivativeSlide slide={slide} onCorrect={onAdvance} />
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

  if (slide.type === 'demo' && slide.component === 'expandingCircle') {
    return <ExpandingCircleSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'relatedRates') {
    return <RelatedRatesProblemSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'motionVectors') {
    return <MotionVectorsSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'secondDerivative') {
    return <SecondDerivativeProblemSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'intermediateValueTheorem') {
    return <IntermediateValueTheoremSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'ivtProblem') {
    return <IvtProblemSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'exponentialTriangle') {
    return <ExponentialTriangleSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'exponentialTriangleQuestion') {
    return <ExponentialTriangleQuestionSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'nPowerXAnimation') {
    return <NPowerXAnimationSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'polynomialPlayground') {
    return <PolynomialPlaygroundSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'productRuleMultiPart') {
    return <ProductRuleMultiPartSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'multipleChoice') {
    return <MultipleChoiceSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'demo' && slide.component === 'paperBoxExplorer') {
    return <PaperBoxExplorerSlide slide={slide} onContinue={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'boxVolumeDerive') {
    return <BoxVolumeDeriveSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'boxOptimize') {
    return <BoxOptimizeSlide slide={slide} onCorrect={onAdvance} />
  }

  if (slide.type === 'problem' && slide.component === 'boxTransfer') {
    return <BoxTransferSlide slide={slide} onCorrect={onAdvance} />
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
